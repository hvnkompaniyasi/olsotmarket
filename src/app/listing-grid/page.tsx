  async redirects() {
    return [
      {
        source: "/add-listing",
        destination: "/listings/create",
        permanent: true,
      },
      {
        source: "/listing-grid",
        destination: "/listings",
        permanent: true, // 308 (Doimiy yo'naltirish) SEO uchun yaxshiroq
      },
    ];
  },