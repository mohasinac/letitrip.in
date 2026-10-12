/*
 * WHY: `siteSettings.integrations` has held `googleAnalyticsId`,
 *      `facebookPixelId` and `gtmContainerId` for a long time. The admin panel
 *      reads them, writes them, and validates them; the PATCH allow-list
 *      accepts them. **Nothing has ever read them.** `next/script` had zero
 *      imports in the entire repository, while `src/app/layout.tsx` already
 *      emitted `<link rel="preconnect" href="https://www.googletagmanager.com">`
 *      for a script that never loaded.
 *
 *      That is the shape this whole plan exists to close: a setting an admin
 *      can change that changes nothing.
 *
 * WHAT: The one consumer of those three IDs.
 *
 * ## Each tag is independent, and absent means absent
 *
 * A tag renders only when its own ID is configured. With none set — the state
 * of a fresh install and of this project today — this component emits nothing
 * at all, so wiring it up does not by itself start tracking anyone. Setting an
 * ID in Site Settings → Integrations is the act that turns it on, which is what
 * makes that screen honest.
 *
 * ## `afterInteractive`, not `beforeInteractive`
 *
 * Analytics is never on the critical path. `beforeInteractive` would block
 * hydration on a third-party request, trading a real Core Web Vital for a
 * measurement of it.
 *
 * ## Server component, on purpose
 *
 * `next/script` works in a Server Component, and the IDs come from the locale
 * layout's already-loaded `siteSettings` — so this costs no extra Firestore
 * read and ships no client JavaScript of its own beyond the tags themselves.
 *
 * EXPORTS: AnalyticsScripts, AnalyticsScriptsProps
 *
 * @tag domain:analytics
 * @tag layer:component
 * @tag pattern:none
 * @tag access:server
 * @tag consumers:app/[locale]/layout
 * @tag sideEffects:loads third-party analytics tags when configured
 */

import Script from "next/script";

export interface AnalyticsScriptsProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  gtmContainerId?: string;
  /** D7b — Microsoft Clarity. See the masking note at its render below. */
  clarityProjectId?: string;
}

/** Guards against a settings field that exists but was saved empty or blank. */
function configured(id?: string): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export function AnalyticsScripts({
  googleAnalyticsId,
  facebookPixelId,
  gtmContainerId,
  clarityProjectId,
}: AnalyticsScriptsProps) {
  const ga = configured(googleAnalyticsId) ? googleAnalyticsId.trim() : null;
  const gtm = configured(gtmContainerId) ? gtmContainerId.trim() : null;
  const pixel = configured(facebookPixelId) ? facebookPixelId.trim() : null;
  const clarity = configured(clarityProjectId) ? clarityProjectId.trim() : null;

  if (!ga && !gtm && !pixel && !clarity) return null;

  return (
    <>
      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {ga && (
        <>
          <Script
            id="ga-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}

      {clarity && (
        /*
         * ── 🛑 STRICT MASKING, AND IT IS NOT OPTIONAL HERE ─────────────────
         *
         * Clarity replays sessions. `content: false` tells it to mask ALL text
         * and input values rather than only the fields marked sensitive —
         * which is the right default on a site that has **no consent gate of
         * any kind** (verified: zero consent/banner modules anywhere, and
         * `AnalyticsScripts` renders unconditionally once an id is set, as do
         * GA, GTM and Pixel).
         *
         * Unmasked replay would mean recording a buyer's address form and the
         * checkout OTP field. The heatmaps and the rage-click signal — which
         * are what D7b is actually for — survive masking intact.
         *
         * 🛑 `window.clarity` is also deliberately NOT called anywhere else.
         * A custom identify/tag call would re-introduce the PII this masking
         * removes, through a door the masking does not watch.
         */
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};c[a]('consent',false);c[a]('set','content',false);t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}

      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
