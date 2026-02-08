// server/src/controllers/authController.js
import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { JWT_SECRET } from '../config.js';

export const login = async (req, res) => {
  try {
    const { message: messageStr, signature } = req.body;

    if (!messageStr || !signature) {
      return res.status(400).json({ error: 'Missing message or signature' });
    }

    const siweMessage = new SiweMessage(messageStr);

    const fields = await siweMessage.verify({
      signature,
      domain: 'localhost',
      // 不传 domain，让它用 message 里的 'localhost'
    });
    //console.log("whole fields:", fields);

    if (!fields.success || !fields.data?.address) {
      throw new Error('Invalid SIWE verification');
    }
    const address = fields.data.address.toLowerCase();



    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: address,
          username: `User_${address.slice(2, 8)}`,
          isAdmin: (await prisma.user.count()) === 0,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, address: user.walletAddress, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '4d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        isAdmin: user.isAdmin,
        favorites: user.favorites || [],
      },
    });
  } catch (err) {
    console.error('Auth error details:', err);
    res.status(422).json({
      error: 'SIWE verification failed',
      details: err.message || 'Unknown error'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    // authMiddleware 已经帮我们从数据库查到了最新的 user 对象并挂在 req.user 上
    res.json({
      user: {
        id: req.user.id,
        walletAddress: req.user.walletAddress,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
        favorites: req.user.favorites || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};