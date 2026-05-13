/**
 * Lightweight fetch helper with cookie jar + JSON assertions.
 * Each role gets its own jar so we can switch contexts between suites.
 */

import { BASE_URL, ROLES } from "./_fixtures.mjs";

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  ingest(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : String(setCookieHeader).split(/,(?=\s*[A-Za-z0-9_-]+=)/);
    for (const c of cookies) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      if (eq < 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name) this.cookies.set(name, value);
    }
  }
  header() {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

export function makeJar() {
  return new CookieJar();
}

export async function request(method, path, { jar, json, headers = {} } = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const init = {
    method,
    headers: { ...headers },
    redirect: "follow",
  };
  if (json !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(json);
  }
  if (jar) {
    const cookieHeader = jar.header();
    if (cookieHeader) init.headers["Cookie"] = cookieHeader;
  }
  const started = Date.now();
  const res = await fetch(url, init);
  const elapsedMs = Date.now() - started;
  if (jar) jar.ingest(res.headers.getSetCookie?.() ?? res.headers.get("set-cookie"));
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers, elapsedMs };
}

const _sessionCache = new Map();

export async function login(role) {
  if (_sessionCache.has(role)) return _sessionCache.get(role);
  const cfg = ROLES[role];
  if (!cfg) throw new Error(`Unknown role: ${role}`);
  const jar = makeJar();
  const res = await request("POST", "/api/auth/login", {
    jar,
    json: { email: cfg.email, password: cfg.password },
  });
  if (res.status !== 200) {
    throw new Error(
      `Login failed for ${role} (${cfg.email}): ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`,
    );
  }
  const session = { jar, user: res.body?.user ?? res.body?.data, raw: res };
  _sessionCache.set(role, session);
  return session;
}

export function clearSessionCache() {
  _sessionCache.clear();
}

export function expect(condition, label, details = {}) {
  if (condition) return { ok: true, label, details };
  return { ok: false, label, details };
}
