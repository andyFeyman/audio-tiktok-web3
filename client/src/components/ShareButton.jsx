import { share } from '../api';

const ShareButton = ({ audioId }) => {
  const handleShare = async () => {
    try {
      const { data } = await share(audioId);
      navigator.clipboard.writeText(data.shareUrl);
      alert(`Copied: ${data.shareUrl}`);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return <button onClick={handleShare}>📤 Share</button>;
};

export default ShareButton;