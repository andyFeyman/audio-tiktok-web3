import { useState, useEffect } from 'react';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { login, getMe } from '../api.js';

// 生成符合 EIP-4361 的 8-byte 随机 nonce（必须）
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors: [
    injected({ target: 'metaMask' }),
    //walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID }),
    //coinbaseWallet({ appName: 'AudioTik' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

export const useWeb3Auth = () => {

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // 新增初始化状态

  // --- 关键：刷新页面时的会话恢复 ---
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        // 1. 发起 getMe 请求，利用 API 拦截器里注入的 Token 校验身份
        const { data } = await getMe();

        // 2. 如果请求成功，后端返回了用户信息，说明 Token 有效
        setUser(data.user);
      } catch (err) {
        // 3. 如果请求失败（401 等），API 拦截器会自动清理 token
        console.error("Auto-login failed:", err);
      } finally {
        // 无论成功失败，都结束初始化状态
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async () => {
    if (isConnected) return handleSignIn();
    // 默认连接第一个可用 connector (MetaMask 等)
    const connector = connectors[0];
    connect({ connector });
  };

  const handleSignIn = async () => {
    if (!address || !chain) {
      console.warn('[useWeb3Auth] Missing address or chain, skipping sign-in');
      return;
    }

    try {
      const nonce = generateNonce();

      const message = new SiweMessage({
        domain: window.location.hostname,
        address,
        chainId: chain.id,
        uri: window.location.origin,
        version: '1',
        statement: 'Sign in to AudioTik Web3',
        nonce,
        issuedAt: new Date().toISOString(),
      });

      const preparedMessage = await message.prepareMessage();

      // signMessageAsync can fail if the connector is not ready or user rejects
      const signature = await signMessageAsync({ message: preparedMessage });

      const { data } = await login({ message: preparedMessage, signature });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      console.error('[useWeb3Auth] Sign-in failed:', err);
      // If sign-in fails, we might want to disconnect to prevent an infinite loop of auto-signin
      // signOut(); 
    }
  };

  useEffect(() => {
    // Only auto-signin if we are connected but don't have a user yet
    // and we are NOT initializing (meaning we already checked localStorage for an existing session)
    if (isConnected && address && chain && !user && !isInitializing) {
      handleSignIn();
    }
  }, [isConnected, address, chain, user, isInitializing]);

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    disconnect();
  };

  return { user, signIn, signOut, isInitializing, isLoading, error, pendingConnector };
};