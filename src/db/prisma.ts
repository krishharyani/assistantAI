// Prisma client singleton
// Prevents multiple instances in development (Next.js hot reload).
// TODO: Install @prisma/client and prisma, then run `npx prisma generate`

// Uncomment once Prisma is installed:
// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
//
// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Placeholder export so other files can import without error
export const prisma = null as unknown;
