import type { NextConfig } from 'next'

/**
 * Product imagery is served by the Payload backend, which is a different origin
 * from the storefront. next/image refuses remote hosts unless they are named
 * here, so the backend's host is allowed through. Images live on the backend's
 * own disk (a Railway volume in production) and are served from /api/media.
 */
const payloadURL = new URL(process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000')

const nextConfig: NextConfig = {
  /**
   * Proxy the Payload API through the storefront's own origin.
   *
   * The ecommerce provider builds cart and session URLs relative to wherever
   * the page is served — it accepts a `serverURL` but does not use it — so
   * without this every cart request would hit the storefront and get HTML
   * back. Proxying also makes those requests same-origin, so the auth cookie
   * is sent normally and there is no CORS preflight on every mutation.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${payloadURL.origin}/api/:path*`,
      },
    ]
  },
  images: {
    // Next 16 refuses to optimise images whose host resolves to a private IP,
    // as an SSRF guard. In development the backend is localhost, so the guard
    // would block every product photo. Scoped to dev only — in production the
    // backend is a public domain and the guard should stand.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: payloadURL.protocol.replace(':', '') as 'http' | 'https',
        hostname: payloadURL.hostname,
        port: payloadURL.port,
        pathname: '/api/media/**',
      },
    ],
  },
}

export default nextConfig
