import type { NextConfig } from "next";

const READONLY_BRANCHES = ['integrate', 'redesign'];
const crmReadonly =
  process.env.NEXT_PUBLIC_CRM_READONLY ??
  (READONLY_BRANCHES.includes(process.env.VERCEL_GIT_COMMIT_REF ?? '') ? '1' : '0');

const nextConfig: NextConfig = {
  // The in-app preview browser reaches the dev server as 127.0.0.1, not localhost.
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_CRM_READONLY: crmReadonly,
    // Inlined so client components (the menu) know which install this is.
    // This repository is the KeyForCars CRM: the install defaults to keyforcars.
    CRM_INSTALL: process.env.CRM_INSTALL || 'keyforcars',
    // Same for the UI switch (src/config/install.ts STUDIO_UI): decided per deployment at build time.
    CRM_UI: process.env.CRM_UI ?? '',
    CRM_WAREHOUSE: process.env.CRM_WAREHOUSE ?? '',
    // KeyForCars workshop calendar + agent switch (src/config/install.ts WORKSHOP).
    KFC_WORKSHOP: process.env.KFC_WORKSHOP ?? '',
  },
  /*
   * pdf-parse pulls in @napi-rs/canvas, a native compiled binary — the class
   * of dependency Next's bundler cannot package into a serverless function
   * correctly. Left un-configured, the invoice route builds fine, deploys
   * fine, and then silently returns empty text on every real request: the
   * failure is caught (route.ts) and logged as a warning, not thrown, so it
   * never shows up as an error, only as "0 regel(s)" on every invoice. This
   * tells Next to require these straight from node_modules in the deployed
   * function instead of bundling them, which is where the platform's own
   * install step already put the correct native binary.
   *
   * sharp is the same class of dependency, same failure, but louder: unlike
   * the invoice route, /api/upload imports it unconditionally at the top of
   * the file, so a bundled-instead-of-required sharp doesn't degrade one
   * feature quietly — it throws at module load and the whole route 500s on
   * every request, HEIC or not. Moving it from devDependencies to
   * dependencies (see package.json) was necessary but not sufficient: the
   * bundler still needs to be told not to touch it, same as the four
   * packages above.
   */
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas', 'xlsx', 'sharp'],
  /*
   * The third layer of the same problem. pdfjs-dist loads its worker script
   * with a dynamically computed path — "Setting up fake worker failed:
   * Cannot find module '/var/task/node_modules/pdfjs-dist/legacy/build/
   * pdf.worker.mjs'" — and Vercel's own file-tracing step (separate from
   * Next's bundler, and unaffected by serverExternalPackages) only copies
   * node_modules files it can see referenced by a static import. A
   * dynamically-built path is invisible to it, so the worker file — needed
   * only at runtime, never imported by name anywhere in this codebase —
   * never made it into the deployed function. This forces it in regardless
   * of what the tracer's static analysis finds.
   */
  outputFileTracingIncludes: {
    '/api/admin/invoice': ['./node_modules/pdfjs-dist/**/*.mjs', './node_modules/pdf-parse/dist/**/*'],
    /*
     * Product profiles: read with readFileSync at runtime
     * (src/lib/productProfiles.ts), so the tracer sees no static import. Both
     * installs' sources are listed because which one is read is decided by
     * CRM_INSTALL at build time — KeyForCars's built profile file, or, on
     * Autosleutel24, the key catalogue the profiles are derived from
     * (src/lib/stockCatalog.ts).
     */
    '/api/admin/voorraad-local': ['./src/data/keyforcars-profiles.json', './src/lib/catalog.json'],
    '/api/admin/product-names': ['./src/data/keyforcars-profiles.json', './src/lib/catalog.json'],
    '/admin/voorraad/**': ['./src/data/keyforcars-profiles.json', './src/lib/catalog.json'],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          /*
           * A Content-Security-Policy was added here (23 Oct) and reverted
           * the same day: it blocked GA4 (region1.google-analytics.com —
           * the real collection host, not www.google-analytics.com),
           * Clarity (s.clarity.ms — not the host guessed), and most of
           * Google Ads' conversion/remarketing pixels
           * (pagead2.googlesyndication.com, ad.doubleclick.net,
           * www.google.com/ccm, www.google.com/rmkt), for hours, silently
           * — confirmed via real console CSP violations, not suspected.
           * These vendors spread collection across more hosts, some
           * regional/rotating, than a one-pass manual allowlist safely
           * covers. Re-add only as Content-Security-Policy-Report-Only
           * first, watched against real traffic for a few days with
           * nothing actually blocked, before ever switching it to enforcing
           * again.
           */
        ],
      },
      {
        // The stock screens scan barcodes with the phone camera; everywhere else it stays off.
        source: '/admin/voorraad/:path*',
        headers: [{ key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), payment=(self)' }],
      },
      {
        source: '/admin/voorraad',
        headers: [{ key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), payment=(self)' }],
      },
      ...((process.env.KFC_DEMO_MODE === '1' || (process.env.NODE_ENV === 'development' && process.env.KFC_SHIPPING_TEST === '1')) ? [{
        source: '/api/admin/shipping-test/label',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      }] : []),
    ];
  },
};

export default nextConfig;
