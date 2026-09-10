# Role Reactor Documentation

<div align="center">

<img src="public/logo.png" alt="Role Reactor Logo" width="140" height="auto" />

[![Website](https://img.shields.io/badge/Website-rolereactor.xyz-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://rolereactor.xyz)
[![Documentation](https://img.shields.io/badge/Documentation-Docs-5865F2?style=for-the-badge&logo=book&logoColor=white)](https://rolereactor.xyz/docs)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

[![OpenGraph Preview](public/og.png)](https://rolereactor.xyz)

---

</div>

Official documentation website for the Role Reactor Discord bot. Comprehensive guides, command references, and troubleshooting resources.

## ✨ Features

- **📚 Complete Documentation**: Guides for setup, commands, and advanced features
- **🔍 Fast Search**: Instant content search across all pages
- **📱 Responsive**: Optimized for desktop, tablet, and mobile
- **⚡ Fast**: Static generation with Next.js App Router
- **📖 MDX**: Rich content with React components

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm

### Installation

```bash
git clone https://github.com/rolereactor/website.git
cd website
pnpm install
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080).

### Commands

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
pnpm type-check   # TypeScript checks
```

## 🌐 Deployment

### Vercel (Recommended)

1. Import repository on [Vercel](https://vercel.com)
2. Add environment variables (see `.env.example`)
3. Deploy — automatic on every push

### Environment Variables

```bash
cp .env.example .env.local
```

Required:
- `DISCORD_CLIENT_ID` — Discord OAuth client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth client secret
- `AUTH_SECRET` — NextAuth encryption key
- `BOT_API_URL` — Bot API endpoint
- `INTERNAL_API_KEY` — Shared API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run checks (`pnpm lint && pnpm type-check && pnpm test`)
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push and create a Pull Request

## 📄 License

MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

[![Website](https://img.shields.io/badge/Website-rolereactor.xyz-5865F2?style=flat-square&logo=discord&logoColor=white)](https://rolereactor.xyz)
[![Discord Support](https://img.shields.io/badge/Discord-Support-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/D8tYkU75Ry)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/rolereactor/website)

**Made with ❤️ by [Role Reactor](https://github.com/rolereactor)**

[Report Bug](https://github.com/rolereactor/website/issues) · [Request Feature](https://github.com/rolereactor/website/issues) · [View Bot Repository](https://github.com/rolereactor/bot)

</div>
