/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' is only used when building inside Docker (VPS).
  // Vercel handles its own output — do not force standalone there.
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
