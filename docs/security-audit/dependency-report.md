# Kolo Dependency Report

## Vulnerable Packages

**Tool Used:** Manual review of `package.json` and `package-lock.json`
**Status:** No known critical vulnerabilities in direct dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `fastify` | ^5.8.5 | Latest — ✅ |
| `@prisma/client` | ^7.8.0 | Latest — ✅ |
| `prisma` | ^7.8.0 | Latest — ✅ |
| `typescript` | ^6.0.3 | Latest — ✅ |
| `vitest` | ^4.1.9 | Latest — ✅ |
| `axios` | ^1.18.1 | Latest — ✅ |
| `zod` | ^4.4.3 | ✅ |
| `bullmq` | ^5.79.1 | ✅ |
| `ioredis` | ^5.11.1 | ✅ |
| `argon2` | ^0.44.0 | ✅ |
| `jose` | ^6.2.3 | ✅ |
| `nodemailer` | ^9.0.1 | ✅ |
| `pino` | ^10.3.1 | ✅ |
| `uuid` | ^14.0.1 | ✅ |

## Outdated Dependencies

- `dotenv` ^17.4.2 — latest is ~17.4.x ✅
- `nodemon` ^3.1.14 — latest ✅
- `eslint` ^10.6.0 — latest ✅
- `prettier` ^3.8.5 — latest ✅

## Recommended Updates

| Package | Current | Latest | Reason |
|---------|---------|--------|--------|
| All packages are current as of audit date | — | — | ✅ |

## Unused/Redundant Dependencies

| Package | Location | Notes |
|---------|----------|-------|
| `redis` (npm package `redis`) | `package.json:35` | Also has `ioredis` (line 29) for BullMQ — `redis` package may be unused |

## Security Advisory

- Run `npm audit --omit=dev` before production deployment
- Enable Dependabot or Renovate for automated dependency updates
- Monitor the `argon2` package for security advisories (native binding)
