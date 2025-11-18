import { useState, useEffect } from 'react';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { SiweMessage } from '@siwe/siwe';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { login } from '../api.js';

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID }),
    coinbaseWallet({ appName: 'AudioTik' }),
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

  const signIn = async () => {
    if (isConnected) return handleSignIn();
    // 默认连接第一个可用 connector (MetaMask 等)
    const connector = connectors[0];
    connect({ connector });
  };

  const handleSignIn = async () => {
    if (!address || !chain) return;

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      chainId: chain.id,
      uri: window.location.origin,
      version: '1',
      statement: 'Sign in to AudioTik Web3',
      nonce: Math.random().toString(36).substring(7),
      issuedAt: new Date().toISOString(),
    });

    const preparedMessage = await message.prepareMessage();
    const signature = await signMessageAsync({ message: preparedMessage });

    try {
      const { data } = await login({ message: preparedMessage, signature });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  useEffect(() => {
    if (isConnected && address && !user) {
      handleSignIn();
    }
  }, [isConnected, address]);

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    disconnect();
  };

  return { user, signIn, signOut, isLoading, error, pendingConnector };
};