import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { JWT_SECRET } from '../config.js';

export const login = async (req, res) => {
  try {
    const { message, signature } = req.body;
    if (!message || !signature) return res.status(400).json({ error: 'Missing message or signature' });

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    let user = await prisma.user.findUnique({
      where: { walletAddress: fields.address.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: fields.address.toLowerCase(),
          username: `User_${fields.address.toLowerCase().slice(2, 8)}`,
          isAdmin: (await prisma.user.count()) === 0, // 首用户为 admin
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, address: user.walletAddress, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, walletAddress: user.walletAddress, username: user.username, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(422).json({ error: err.message || 'SIWE verification failed' });
  }
};