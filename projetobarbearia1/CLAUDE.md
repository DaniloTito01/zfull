# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run preview` - Preview production build

## Project Architecture

This is a **barbershop management system** built with React, TypeScript, and Vite. The application supports multi-tenancy with barbershop selection and role-based access control.

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state, React Context for global state
- **Routing**: React Router v6 with nested routes
- **Forms**: React Hook Form with Zod validation

### Key Architecture Patterns

**Multi-Tenant Structure**: The app uses a `BarbershopContext` (src/contexts/BarbershopContext.tsx) to manage:
- Current barbershop selection
- User's barbershops list
- User role within each barbershop (`admin`, `barbeiro`, `atendente`)
- Barbershop switching functionality

**Route Organization**:
- Public routes: Landing page (`/`) and auth
- Barbershop selection: `/select-barbershop`
- Super admin: `/super-admin` and `/admin/barbershop`
- Protected routes: Wrapped in `Layout` component with sidebar navigation
- Main app routes: `/dashboard`, `/appointments`, `/clients`, `/pdv`, `/barbers`, `/services`, `/products`, `/sales`

**Component Structure**:
- `src/components/ui/` - shadcn/ui primitive components
- `src/components/` - Custom application components
- `src/components/super-admin/` - Super admin specific components
- `src/pages/` - Route-level page components
- `src/pages/super-admin/` - Super admin pages

**Import Aliases** (configured in vite.config.ts and components.json):
- `@/` maps to `src/`
- `@/components` for components
- `@/lib` for utilities
- `@/hooks` for custom hooks

### Key Files

- `src/App.tsx` - Main app component with routing and providers
- `src/contexts/BarbershopContext.tsx` - Multi-tenant barbershop state management
- `src/components/Layout.tsx` - Main layout wrapper for protected routes
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind configuration with custom design system including sidebar theme

### Development Notes

- Uses Bun as package manager (bun.lockb present)
- ESLint configured with React hooks rules, unused vars disabled
- Server runs on port 8080 (configured in vite.config.ts)
- Project includes Lovable-specific tooling (lovable-tagger)
- Dark mode support configured in Tailwind
- Custom CSS variables for consistent theming