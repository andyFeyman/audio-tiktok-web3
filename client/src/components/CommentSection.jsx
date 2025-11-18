import { useState, useEffect } from 'react';
import { addComment, getComments } from '../api';

const CommentSection = ({ audioId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    getComments(audioId).then(({ data }) => setComments(data));
  }, [audioId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await addComment({ audioId, content: newComment });
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Add comment failed:', err);
    }
  };

  return (
    <div style={{ maxWidth: '300px' }}>
      <input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add comment..."
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleSubmit} style={{ width: '100%' }}>Post</button>
      <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {comments.map((c) => (
          <li key={c.id} style={{ margin: '5px 0', borderBottom: '1px solid #eee' }}>
            <strong>{c.user.username}:</strong> {c.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;