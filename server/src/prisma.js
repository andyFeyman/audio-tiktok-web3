// server/src/prisma.js
import { PrismaClient } from './generated/client/index.js';

const globalForPrisma = globalThis;

// 在实例化时，手动传入 datasource 配置
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;