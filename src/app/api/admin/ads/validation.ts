type AdProvider = "manual" | "adsense" | "thirdParty";
type AdStatus = "draft" | "active" | "scheduled" | "paused";

export type AdInventoryRecord = {
  id?: string;
  name?: string;
  provider?: AdProvider;
  status?: AdStatus;
  placementIds?: string[];
  requiresConsent?: boolean;
  priority?: number;
  startAt?: string;
  endAt?: string;
  creative?: {
    title?: string;
    body?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
    adsenseSlot?: string;
    thirdPartyUrl?: string;
  };
};

export type ProviderCredentialsRecord = {
  adsenseClientId?: string;
  thirdPartyScriptUrl?: string;
};

export type PlacementRecord = {
  id?: string;
  label?: string;
  enabled?: boolean;
  reservedHeight?: number;
};

export type PublishValidation = {
  isPublishable: boolean;
  issues: string[];
};

export function defaultPlacements(): PlacementRecord[] {
  return [
    { id: "home.hero.after", label: "Home Hero After", enabled: true, reservedHeight: 250 },
    { id: "home.inline.1", label: "Home Inline 1", enabled: true, reservedHeight: 120 },
    { id: "home.inline.2", label: "Home Inline 2", enabled: true, reservedHeight: 120 },
    { id: "listing.inline", label: "Listing Inline", enabled: true, reservedHeight: 120 },
    { id: "listing.sidebar.top", label: "Listing Sidebar Top", enabled: true, reservedHeight: 250 },
    { id: "detail.inline", label: "Detail Inline", enabled: true, reservedHeight: 120 },
    { id: "content.sidebar.top", label: "Content Sidebar Top", enabled: true, reservedHeight: 250 },
    { id: "footer.pre", label: "Footer Pre", enabled: true, reservedHeight: 120 },
    { id: "search.inline", label: "Search Inline", enabled: true, reservedHeight: 120 },
    { id: "promotions.inline", label: "Promotions Inline", enabled: true, reservedHeight: 120 },
  ];
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isHttpsUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function trimOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeProviderCredentials(
  credentials: ProviderCredentialsRecord | Record<string, unknown> | undefined,
): ProviderCredentialsRecord {
  return {
    adsenseClientId: trimOrUndefined(String(credentials?.adsenseClientId || "")),
    thirdPartyScriptUrl: trimOrUndefined(String(credentials?.thirdPartyScriptUrl || "")),
  };
}

export function getProviderCredentialIssues(
  credentials: ProviderCredentialsRecord,
): string[] {
  const issues: string[] = [];

  if (
    credentials.adsenseClientId &&
    !/^ca-pub-[0-9]{10,20}$/.test(credentials.adsenseClientId)
  ) {
    issues.push("AdSense client id must match format ca-pub-XXXXXXXXXX");
  }

  if (credentials.thirdPartyScriptUrl && !isHttpsUrl(credentials.thirdPartyScriptUrl)) {
    issues.push("Third-party script URL must be a valid https URL");
  }

  return issues;
}

export function getProviderCredentialStatus(credentials: ProviderCredentialsRecord) {
  const issues = getProviderCredentialIssues(credentials);
  return {
    hasAdsenseClientId: Boolean(credentials.adsenseClientId),
    hasThirdPartyScriptUrl: Boolean(credentials.thirdPartyScriptUrl),
    issues,
  };
}

export function getPublishValidation(
  item: AdInventoryRecord,
  placements: PlacementRecord[],
  credentials: ProviderCredentialsRecord,
): PublishValidation {
  const issues: string[] = [];
  const now = Date.now();

  const placementIds = Array.isArray(item.placementIds) ? item.placementIds : [];
  const knownPlacements = new Set(placements.map((placement) => String(placement.id || "")));
  const enabledPlacements = new Set(
    placements
      .filter((placement) => placement.enabled !== false)
      .map((placement) => String(placement.id || "")),
  );

  if (placementIds.length === 0) {
    issues.push("Select at least one placement");
  }

  const unknownPlacements = placementIds.filter((placementId) => !knownPlacements.has(placementId));
  if (unknownPlacements.length > 0) {
    issues.push(`Unknown placements: ${unknownPlacements.join(", ")}`);
  }

  const disabledPlacements = placementIds.filter((placementId) => !enabledPlacements.has(placementId));
  if (disabledPlacements.length > 0) {
    issues.push(`Selected placements are disabled: ${disabledPlacements.join(", ")}`);
  }

  const startAt = parseIsoDate(item.startAt);
  const endAt = parseIsoDate(item.endAt);

  if (item.startAt && !startAt) {
    issues.push("Start date must be a valid ISO timestamp");
  }
  if (item.endAt && !endAt) {
    issues.push("End date must be a valid ISO timestamp");
  }

  if (startAt && endAt && endAt.getTime() <= startAt.getTime()) {
    issues.push("End date must be after start date");
  }

  if (item.status === "scheduled") {
    if (!startAt) {
      issues.push("Scheduled ads require a valid start date");
    } else if (startAt.getTime() <= now) {
      issues.push("Scheduled ads must start in the future");
    }
  }

  if (item.status === "active") {
    if (startAt && startAt.getTime() > now) {
      issues.push("Active ads cannot have a future start date");
    }
    if (endAt && endAt.getTime() <= now) {
      issues.push("Active ads cannot have an end date in the past");
    }
  }

  const provider = item.provider;
  const creative = item.creative ?? {};

  if (provider === "manual") {
    if (!creative.title && !creative.body && !creative.imageUrl && !creative.ctaHref) {
      issues.push("Manual ads need at least one creative field (title, body, image, or CTA URL)");
    }
  }

  if (provider === "adsense") {
    if (!creative.adsenseSlot?.trim()) {
      issues.push("AdSense ads require an AdSense slot id");
    }
    if (!credentials.adsenseClientId) {
      issues.push("AdSense provider credentials are missing in ad settings");
    }
  }

  if (provider === "thirdParty") {
    if (!creative.thirdPartyUrl?.trim()) {
      issues.push("Third-party ads require a third-party URL");
    } else if (!isHttpsUrl(creative.thirdPartyUrl)) {
      issues.push("Third-party ad URL must be a valid https URL");
    }
    if (!credentials.thirdPartyScriptUrl) {
      issues.push("Third-party provider script URL is missing in ad settings");
    }
  }

  return {
    isPublishable: issues.length === 0,
    issues,
  };
}
