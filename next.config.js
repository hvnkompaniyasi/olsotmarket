/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "**.ufs.io" },
      { protocol: "https", hostname: "**.ufslive.com" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  webpack(config) {
    if (config.optimization.minimizer) {
      const workerExclude = /maplibre-gl-worker(?:\.[^/]+)?\.mjs$/

      config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
        if (plugin.constructor.name === "TerserPlugin" && plugin.options) {
          const currentExclude = plugin.options.exclude
          plugin.options.exclude = currentExclude
            ? Array.isArray(currentExclude)
              ? [...currentExclude, workerExclude]
              : [currentExclude, workerExclude]
            : workerExclude
        }
        return plugin
      })

      config.plugins.push({
        apply(compiler) {
          compiler.hooks.compilation.tap("ExcludeMapLibreWorkerFromTerser", (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: "ExcludeMapLibreWorkerFromTerser",
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,
              },
              () => {
                for (const filename of Object.keys(compilation.assets)) {
                  if (workerExclude.test(filename)) {
                    const asset = compilation.getAsset(filename)
                    if (asset) {
                      compilation.updateAsset(filename, asset.source, {
                        ...asset.info,
                        minimized: true,
                      })
                    }
                  }
                }
              }
            )
          })
        },
      })
    }
    return config
  },
  async redirects() {
    return [
      {
        source: "/add-listing",
        destination: "/listings/create",
        permanent: true,
      },
    ]
  },
}

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "olsot-market",
  project: "javascript-nextjs",

  silent: true,
  hideSourceMaps: true,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: false,

  // Faqat production'da source maps upload (build tezligi uchun)
  sourcemaps: {
    disable: process.env.VERCEL_ENV !== "production",
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
