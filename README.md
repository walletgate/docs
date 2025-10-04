# WalletGate Documentation

Official documentation for WalletGate - the developer-first EU Digital Identity verification platform.

## About

This repository contains the source code for WalletGate's public documentation, including:

- 📖 Getting started guides
- 🔌 API reference
- 💻 SDK documentation
- 💡 Integration examples
- 🎯 Best practices

## Built With

- **[VitePress](https://vitepress.dev/)** - Fast, modern static site generator
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Swagger UI** - Interactive API explorer

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The docs will be available at `http://localhost:5173`

## Project Structure

```
docs-site/
├── .vitepress/          # VitePress configuration
│   ├── config.ts        # Site config (nav, sidebar, etc.)
│   └── theme/           # Custom theme
├── public/              # Static assets
│   └── openapi.yaml     # API specification
├── guide/               # Getting started guides
├── api/                 # API reference docs
├── sdk/                 # SDK documentation
└── index.md             # Homepage
```

## Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues

Found a typo or error? [Open an issue](https://github.com/walletgate/docs/issues/new)

### Submitting Changes

1. Fork this repository
2. Create a feature branch (`git checkout -b docs/improve-getting-started`)
3. Make your changes
4. Commit with clear message (`git commit -m "docs: improve getting started guide"`)
5. Push to your fork (`git push origin docs/improve-getting-started`)
6. Open a Pull Request

### Writing Guidelines

- **Be concise**: Short, clear sentences
- **Use code examples**: Show, don't just tell
- **Test your code**: Ensure examples actually work
- **Check formatting**: Run `npm run format` before committing
- **Update navigation**: Add new pages to `.vitepress/config.ts` sidebar

## License

This documentation is licensed under [MIT License](LICENSE).

## Links

- **Main Website**: [walletgate.app](https://walletgate.app)
- **Dashboard**: [walletgate.app/admin](https://walletgate.app/admin)
- **TypeScript SDK**: [@walletgate/eudi](https://www.npmjs.com/package/@walletgate/eudi) (npm)
- **API**: [api.walletgate.app](https://api.walletgate.app)
- **GitHub**: [github.com/walletgate](https://github.com/walletgate)

## Support

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 🔒 Security: [security@walletgate.app](mailto:security@walletgate.app)
- 💼 Business: [hello@walletgate.app](mailto:hello@walletgate.app)

---

Built with ❤️ by the WalletGate team
### Code style

- This docs repo primarily contains Markdown and VitePress configuration. We keep formatting simple and use Prettier defaults.
- For SDK and backend code in other repos, we follow:
  - TypeScript strict mode
  - ESLint with `@typescript-eslint` and `import/order` enabled as warnings (imports alphabetized, newlines between groups)
  - Prettier for formatting

If you’d like to run code quality tools locally, install Prettier and run:

```
npm run format
```
