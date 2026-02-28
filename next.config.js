/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Convex files are type-checked by their own tsconfig with Bundler resolution.
    // Next.js forces moduleResolution: "node" which can't resolve some convex-auth imports.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
