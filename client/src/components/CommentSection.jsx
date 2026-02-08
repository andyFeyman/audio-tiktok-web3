import { useState, useEffect } from 'react';
import { addComment, getComments } from '../api';

const CommentSection = ({ audioId, onShowToast }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    getComments(audioId).then(({ data }) => setComments(data));
  }, [audioId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      // 修复之前提到的参数传递 Bug
      const { data } = await addComment({ audioId, content: newComment });
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      if (err.response?.status === 401) {
        onShowToast("Please connect wallet first ");
      } else {
        onShowToast("add Comments failed");
      }

    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 评论列表 */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
        {comments.map((c) => (
          <div key={c.id} style={commentItemStyle}>
            <div style={avatarMini}>{c.user.username[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={usernameStyle}>{c.user.username}</div>
              <div style={contentStyle}>{c.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 输入区域 - 放在最底部 */}
      <div style={inputWrapper}>
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />
        <button onClick={handleSubmit} style={postButtonStyle}>Post</button>
      </div>
    </div>
  );
};

// --- 适配抽屉的高级感样式 ---
const commentItemStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
  alignItems: 'flex-start'
};

const avatarMini = {
  width: '32px', height: '32px', borderRadius: '50%',
  background: '#333', display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'
};

const usernameStyle = { fontSize: '0.8rem', opacity: 0.5, marginBottom: '4px' };
const contentStyle = { fontSize: '0.95rem', lineHeight: '1.4', color: '#eee' };

const inputWrapper = {
  display: 'flex',
  background: '#1a1a1a',
  borderRadius: '25px',
  padding: '4px 16px',
  alignItems: 'center',
  border: '1px solid #333'
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: '#fff',
  padding: '12px 0',
  outline: 'none',
  fontSize: '0.9rem'
};

const postButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#3498db',
  fontWeight: 'bold',
  cursor: 'pointer',
  paddingLeft: '10px'
};

export default CommentSection;