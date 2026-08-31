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
}

/** Guards against a settings field that exists but was saved empty or blank. */
function configured(id?: string): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export function AnalyticsScripts({
  googleAnalyticsId,
  facebookPixelId,
  gtmContainerId,
}: AnalyticsScriptsProps) {
  const ga = configured(googleAnalyticsId) ? googleAnalyticsId.trim() : null;
  const gtm = configured(gtmContainerId) ? gtmContainerId.trim() : null;
  const pixel = configured(facebookPixelId) ? facebookPixelId.trim() : null;

  if (!ga && !gtm && !pixel) return null;

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

      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
