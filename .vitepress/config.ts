import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'WalletGate Docs',
  description: 'Developer documentation for EU Digital Identity verification',

  ignoreDeadLinks: true,

  // Exclude internal files from site
  srcExclude: [
    '**/DEPLOYMENT.md',
    '**/SUMMARY.md',
    '**/README.md',
  ],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'WalletGate Documentation' }],
    ['meta', { property: 'og:description', content: 'Developer-first API for EU Digital Identity verification' }],
  ],

  themeConfig: {
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
