# Contributing to Role Reactor Website

First off, thanks for taking the time to contribute! This project is open source and we welcome improvements, bug fixes, and suggestions.

The following is a set of guidelines for contributing to the Role Reactor Website and Dashboard.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Project Architecture](#project-architecture)
3. [Local Development](#local-development)
4. [Pull Request Process](#pull-request-process)
5. [Code Style & Standards](#code-style--standards)

---

## Code of Conduct

By participating in this project, you are expected to uphold a welcoming and inclusive environment. Treat everyone with respect, and prioritize constructive feedback.

## Project Architecture

This project is structured as a **Turborepo** monorepo using **pnpm**.

Key technologies used:

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 & Shadcn UI
- **State Management**: Zustand
- **Docs**: Fumadocs

The main website application is located in `apps/website/`.

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v8 or higher)

### Setup Instructions

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/rolereactor/website.git
   cd website
   ```

2. **Install dependencies:**
   We use `pnpm` workspaces, so install from the root:

   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy `.env.example` to `.env.local` in `apps/website/` and fill in the required values (like Discord Client IDs).

4. **Run the development server:**
   ```bash
   pnpm dev
   ```
   This spins up the website at `http://localhost:3000`.

## Pull Request Process

1. **Check the [TODO.md](./TODO.md) or Issues**
   Make sure nobody else is already actively working on the feature or bug you want to tackle. If there is no open issue for your fix/feature, please open an issue first to discuss it.

2. **Create a branch**
   Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Commit your changes**
   We use **Conventional Commits**. We have Husky and commitlint set up, so your commit messages must follow this format:
   - `build:`, `chore:`, `ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`, `style:`, `test:`

   Example: `feat(dashboard): add new analytics chart`

4. **Ensure tests and linting pass**
   Run the following commands before submitting your PR to ensure quality:

   ```bash
   pnpm type-check
   pnpm lint
   pnpm format:check
   pnpm test
   ```

5. **Open a Pull Request**
   Push your branch to your fork and open a PR against the `main` branch of this repository. Provide a clear description of what the PR solves or adds.

## Code Style & Standards

- **React / Next.js**: We use React Server Components where possible. Mark client components with `"use client"` only when necessary (e.g., when using hooks or browser APIs).
- **Styling**: Use Tailwind CSS utility classes. If writing custom, complex UI configurations, follow the Shadcn UI patterns established in the project.
- **Formatting**: We use Prettier. Please don't bypass formatting rules. Run `pnpm format` if you need to auto-format files.
- **Testing**: We use Playwright for End-to-End testing. If adding major features, please consider adding an E2E test in the `e2e/` folder.

---

_Thank you for helping make Role Reactor better!_
