/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // VPS (Docker) ga joylashtirish uchun eng muhim sozlama
  output: 'standalone',
  
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '**.ufs.io' },
      { protocol: 'https', hostname: '**.ufslive.com' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Build vaqtida faqat kerakli modullarni yuklash orqali tezlikni oshirish
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react', '@sentry/nextjs'],
  },

  // MapLibre uchun Webpack Terser muammosini to'liq va xavfsiz hal qilish
  webpack(config) {
    if (config.optimization.minimizer) {
      const workerExclude = /maplibre-gl-worker(?:\.[^/]+)?\.mjs$/;

      config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
        if (plugin.constructor.name === 'TerserPlugin' && plugin.options) {
          const currentExclude = plugin.options.exclude;
          plugin.options.exclude = currentExclude
            ? Array.isArray(currentExclude)
              ? [...currentExclude, workerExclude]
              : [currentExclude, workerExclude]
            : workerExclude;
        }
        return plugin;
      });

      config.plugins.push({
        apply(compiler) {
          compiler.hooks.compilation.tap('ExcludeMapLibreWorkerFromTerser', (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: 'ExcludeMapLibreWorkerFromTerser',
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE - 1,
              },
              () => {
                for (const filename of Object.keys(compilation.assets)) {
                  if (workerExclude.test(filename)) {
                    const asset = compilation.getAsset(filename);
                    if (asset) {
                      compilation.updateAsset(filename, asset.source, {
                        ...asset.info,
                        minimized: true, // Terserni chetlab o'tish
                      });
                    }
                  }
                }
              }
            );
          });
        },
      });
    }
    return config;
  },

  async redirects() {
    return [
      {
        source: '/add-listing',
        destination: '/listings/create',
        permanent: true,
      },
    ];
  },
};

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: 'olsot-market',
  project: 'javascript-nextjs',
  silent: true, 
  hideSourceMaps: true,
  
  // Build vaqtini tejash uchun sourcemaplarni yuklashni o'chirish
  widenClientFileUpload: false,

  // Faqat Production muhitida (Vercel'da) sourcemaplarni yuklash
  sourcemaps: {
    disable: process.env.VERCEL_ENV !== 'production',
  },

  // Reklama blokirovkalarini chetlab o'tish uchun Sentry so'rovlarini Next.js orqali o'tkazish
  tunnelRoute: '/monitoring',

  // Vercel Cron monitoringni o'chirib qo'yish (Build vaqtini tejaydi)
  automaticVercelMonitors: false,

  webpack: {
    // Bundle hajmini kamaytirish uchun Sentry debug loglarini o'chirish
    treeshake: {
      removeDebugLogging: true,
    },
  },
});