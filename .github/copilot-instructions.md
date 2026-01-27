# POSBuzz - AI Coding Instructions

## Project Overview

POSBuzz is a Point of Sale (POS) system with a monorepo structure using npm workspaces:

- **backend/**: NestJS API with Prisma ORM (PostgreSQL)
- **frontend/**: React + Vite + TypeScript SPA

## Quick Commands

```bash
# From root - run both frontend and backend
npm run dev

# Individual workspaces
npm run dev:frontend    # Vite dev server
npm run dev:backend     # NestJS watch mode

# Backend-specific (run from backend/)
npx prisma migrate dev --name <migration_name>  # After schema changes
npx prisma generate                              # Regenerate client
npm run test                                     # Jest unit tests
npm run test:e2e                                 # E2E tests
```

## Architecture Patterns

### Backend Module Structure

Each feature follows NestJS module pattern in `backend/src/<feature>/`:

```
<feature>/
├── <feature>.module.ts      # Module definition
├── <feature>.controller.ts  # HTTP endpoints
├── <feature>.service.ts     # Business logic
├── dto/                     # Request validation DTOs
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
└── <feature>.*.spec.ts      # Test files
```

### Database Access

- **Prisma client** generated to `backend/generated/prisma/` (not `node_modules`)
- **PrismaService** (`backend/src/prisma/prisma.service.ts`) is `@Global()` - inject directly without importing PrismaModule
- Uses `@prisma/adapter-pg` driver adapter with connection string from `DATABASE_URL` env var

### Authentication

- **JWT-based** with `@nestjs/jwt` (7-day expiry)
- **Password hashing**: argon2 (not bcrypt)
- **Auth guard**: `AuthGuard` in `backend/src/auth/auth.guard.ts` - use `@UseGuards(AuthGuard)` on protected routes
- JWT payload: `{ sub: userId, email: userEmail }`

### DTO Validation

DTOs use `class-validator` decorators with global `ValidationPipe` configured:

```typescript
// Automatically strips unknown properties, transforms types
@IsEmail() @IsNotEmpty() email: string;
@IsString() @MinLength(6) password: string;
```

## Key Conventions

### Import Paths

Use `src/` prefix for cross-module imports:

```typescript
import { UsersService } from "src/users/users.service";
import { PrismaService } from "src/prisma/prisma.service";
```

### Prisma Client Import

```typescript
import { PrismaClient } from "../../generated/prisma/client";
```

### Error Handling

Use NestJS built-in exceptions:

```typescript
throw new UnauthorizedException("Invalid credentials");
throw new ConflictException("User already exists");
throw new NotFoundException("Resource not found");
```

## Data Model

Core entities in `backend/prisma/schema.prisma`:

- **User**: Authentication (email/password)
- **Product**: Inventory with SKU, price, stockQuantity
- **Sale**: Transaction header with totalAmount
- **SaleItem**: Line items linking Sale to Product

## Environment Variables

Backend requires `DATABASE_URL` for PostgreSQL connection (configured in `backend/prisma.config.ts`).
