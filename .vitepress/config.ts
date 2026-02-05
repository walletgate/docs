import { defineConfig } from 'vitepress';

export default defineConfig({
  // Keep the site title short so the header stays responsive on mobile.
  // Long titles here render inside the navbar and can cause horizontal overflow.
  title: 'WalletGate Docs',
  // Use a template for the browser tab title instead of a long site title
  // to avoid making the navbar too wide on small screens.
  titleTemplate: ':title — WalletGate Docs',
  description: 'Complete developer documentation for EU Digital Identity Wallet (EUDI) verification. Learn how to integrate OpenID4VP, ISO 18013-5, and eIDAS 2.0 compliant identity verification in your application.',

  lang: 'en-US',

  ignoreDeadLinks: true,

  // Exclude internal files from site
  srcExclude: [
    '**/DEPLOYMENT.md',
    '**/SUMMARY.md',
    '**/README.md',
  ],

  head: [
    // Favicons
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],

    // SEO Meta Tags
    ['meta', { name: 'keywords', content: 'EUDI, EUDI wallet, EU Digital Identity, eIDAS 2.0, OpenID4VP, ISO 18013-5, digital identity API, EU wallet API, identity verification, European digital identity documentation, EUDI integration guide, mDL verification, mobile driving license' }],
    ['meta', { name: 'author', content: 'WalletGate' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['link', { rel: 'canonical', href: 'https://docs.walletgate.app/' }],

    // Google Search Console Verification
    ['meta', { name: 'google-site-verification', content: 'cm1lSkQ6nOGu6C5EOuDqqa-UmMoH_1ZRrbD1HZcIAlg' }],

    // Theme
    ['meta', { name: 'theme-color', content: '#1e293b' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'WalletGate Documentation' }],
    ['meta', { property: 'og:title', content: 'EUDI Wallet Verification API Documentation — WalletGate' }],
    ['meta', { property: 'og:description', content: 'Complete guide to integrating EU Digital Identity Wallet (EUDI) verification. OpenID4VP, ISO 18013-5, eIDAS 2.0 compliant. Real code examples and API reference.' }],
    ['meta', { property: 'og:url', content: 'https://docs.walletgate.app/' }],
    ['meta', { property: 'og:image', content: 'https://docs.walletgate.app/og-docs.png' }],
    ['meta', { property: 'og:locale', content: 'en_EU' }],

    // Twitter
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@walletgate' }],
    ['meta', { name: 'twitter:title', content: 'EUDI Wallet Verification API Documentation — WalletGate' }],
    ['meta', { name: 'twitter:description', content: 'Complete guide to integrating EU Digital Identity Wallet (EUDI) verification. OpenID4VP, ISO 18013-5, eIDAS 2.0 compliant.' }],
    ['meta', { name: 'twitter:image', content: 'https://docs.walletgate.app/og-docs.png' }],
  ],

  themeConfig: {
    // Force a concise site title in the navbar; avoids wrapping/overflow
    // on narrow screens while keeping the full logo.
    siteTitle: 'WalletGate Docs',
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'SDK', link: '/sdk/installation' },
      { text: 'Dashboard', link: 'https://walletgate.app/admin' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is WalletGate?', link: '/guide/what-is-walletgate' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Test vs Live', link: '/guide/test-vs-live' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Verification Flow', link: '/guide/verification-flow' },
            { text: 'Authentication', link: '/guide/authentication' },
            { text: 'Webhooks', link: '/guide/webhooks' },
            { text: 'Security Center', link: '/guide/security-center' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Interactive API', link: '/api/interactive' },
          ],
        },
      ],
      '/sdk/': [
        {
          text: 'TypeScript SDK',
          items: [
            { text: 'Installation', link: '/sdk/installation' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/walletgate/docs' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/company/walletgate' },
    ],

    footer: {
      message: 'Developer-first EU Digital Identity verification',
      copyright: 'Copyright © 2024 WalletGate',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/walletgate/docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
