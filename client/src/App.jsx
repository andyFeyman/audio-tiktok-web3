import { useState } from 'react';
import { useWeb3Auth } from './hooks/useWeb3Auth';
import Feed from './pages/Feed';

function App() {
  const { user, signIn, signOut, isLoading } = useWeb3Auth();
  const [viewHistory, setViewHistory] = useState(false);

  if (isLoading) return <div>Loading wallet...</div>;
  if (!user) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to AudioTik Web3</h1>
      <button onClick={signIn}>Connect Wallet & Sign In</button>
    </div>
  );

  return (
    <div>
      <header style={{ padding: '1rem', background: '#000', color: '#fff', textAlign: 'center' }}>
        <h1>AudioTik</h1>
        <p>Hi, {user.username} ({user.walletAddress.slice(0, 6)}...)</p>
        <button onClick={signOut}>Sign Out</button>
        <button onClick={() => setViewHistory(!viewHistory)}>
          {viewHistory ? 'Main Feed' : 'View History'}
        </button>
      </header>
      <main style={{ height: 'calc(100vh - 100px)' }}>
        <Feed isHistoryMode={viewHistory} />
      </main>
    </div>
  );
}

export default App;