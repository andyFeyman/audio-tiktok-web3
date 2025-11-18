# AudioTik Web3 - TikTok-style Audio Feed (Web3 + Mobile)

MERN + Prisma + Vite + wagmi + SIWE + Cloudflare R2

## 特性
- 垂直滑动 / 键盘上下键切换音频（类似 TikTok）
- 完全随机 feed（支持 style / language 过滤，默认英文随机）
- Web3 登录（支持 MetaMask、Rainbow、Coinbase、WalletConnect、Ledger 等所有主流钱包 + 任意 EVM 链）
- 管理员上传音频（POST /api/audios，仅 isAdmin）
- 评论、收藏、分享
- 浏览历史（服务器存储，支持上下滑动回看）
- 响应式：PC 键盘 + 移动滑动
- 完全 ESM + 现代化技术栈（2025 最新实践）

## 快速启动（pnpm 推荐）

1. 克隆：`git clone <your-repo> && cd audio-tiktok-web3`
2. 安装：`pnpm install`
3. 环境：复制 `server/.env.example` 到 `server/.env`，填 DATABASE_URL (MongoDB) + JWT_SECRET
4. 数据库：`pnpm --filter server prisma:push`
5. 开发：`pnpm dev`（server:5000, client:5173）
6. 测试：浏览器打开 localhost:5173，连接 MetaMask 登录，滑动浏览。

## 添加测试数据
- 用 Prisma Studio：`pnpm --filter server prisma:studio`
- 创建 Audio：{ url: "https://example.com/audio.mp3", style: "pop", language: "en", transcript: "Sample text" }

## 依赖
- Backend: Node 20+, MongoDB, Prisma
- Frontend: React 18, Vite, wagmi v2, viem

Enjoy! 🚀