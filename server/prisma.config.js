// server/prisma.config.js
import { defineConfig } from '@prisma/config';
import { MongoDBAdapter } from '@prisma/adapter-mongodb'; // 如果你用的是 MongoDB

export default defineConfig({
  datasource: {
    // 这里依然可以从环境变量读取，但逻辑移到了代码层
    url: process.env.DATABASE_URL,
  },
});