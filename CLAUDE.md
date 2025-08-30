# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ReactLynx application built with rspeedy - a framework for building React applications that run on the Lynx runtime. The project uses TypeScript and is designed to be previewed using the LynxExplorer mobile app.

## Commands

**Development:**
```bash
pnpm run dev  # Start development server with QR code for mobile preview
```

**Build:**
```bash
pnpm run build  # Build the application using rspeedy
```

**Testing:**
```bash
pnpm run test  # Run tests using Vitest
```

**Preview:**
```bash
pnpm run preview  # Preview the built application
```

## Architecture

### Core Framework
- **ReactLynx** (`@lynx-js/react`): React implementation for the Lynx runtime
- **Rspeedy** (`@lynx-js/rspeedy`): Build tool and dev server
- Uses custom JSX elements like `<view>`, `<text>`, and `<image>` instead of standard HTML elements
- JSX import source is configured as `@lynx-js/react` in tsconfig.json

### Key Configuration Files
- `lynx.config.ts`: Rspeedy configuration with plugins for QR code generation, ReactLynx support, and TypeScript type checking
- `vitest.config.ts`: Test configuration using ReactLynx testing utilities
- TypeScript is configured with strict mode and module resolution for Node16/18

### Application Structure
- Entry point: `src/index.tsx` - Sets up ReactLynx root rendering with hot module replacement
- Main component: `src/App.tsx` - Uses Lynx-specific components and event handlers (e.g., `bindtap` instead of `onClick`)
- Tests use `@lynx-js/react/testing-library` with custom matchers for Lynx elements

### Development Notes
- The app runs in fullscreen mode on LynxExplorer (configured in `lynx.config.ts`)
- Components use Lynx-specific event handlers like `bindtap` for user interactions
- Tests validate against Lynx element tree structure using snapshots