import { useState } from 'react';
import axios from 'axios';
import { getSignedUrl, createAudio } from '../api';

const AdminUpload = ({ user }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [transcripts, setTranscripts] = useState({}); // { 0: 'srt content', 1: '...' }
  const [uploading, setUploading] = useState(false);
  const [style, setStyle] = useState('wealth');
  const [language, setLanguage] = useState('en');
  const [setName, setSetName] = useState('');
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setResults([]);
    // 初始化 transcript
    const initialTranscripts = {};
    files.forEach((_, i) => initialTranscripts[i] = '');
    setTranscripts(initialTranscripts);
  };

  const handleTranscriptChange = (index, value) => {
    setTranscripts(prev => ({ ...prev, [index]: value }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert('Please select files first');

    setUploading(true);
    const newResults = selectedFiles.map(f => ({ name: f.name, status: 'pending', progress: 0 }));
    setResults(newResults);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const transcriptText = (transcripts[i] || "").trim();

      // 客户端校验
      if (transcriptText.length > 5000) {
        updateFileStatus(i, { status: 'error', error: 'Transcript exceeds 5000 characters' });
        continue;
      }

      updateFileStatus(i, { status: 'uploading' });

      try {
        const { data } = await getSignedUrl(file.name, file.type);

        await axios.put(data.signedUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / e.total);
            updateFileStatus(i, { progress });
          },
        });

        await createAudio({
          url: data.publicUrl,
          style,
          language,
          transcript: transcriptText || file.name, // Fallback to name if empty, but user should paste SRT
          setName: setName || undefined,
        });

        updateFileStatus(i, { status: 'success', progress: 100, publicUrl: data.publicUrl });
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        updateFileStatus(i, { status: 'error', error: err.response?.data?.error || err.message });
      }
    }

    setUploading(false);
  };

  const updateFileStatus = (index, updates) => {
    setResults(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  if (!user?.isAdmin) {
    return (
      <div style={styles.centerBox}>
        <div style={styles.card}>Access Denied. Admin only.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Batch Audio Upload</h2>
        <p style={styles.subtitle}>Upload content & Sync to Feed with Transcripts</p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Select Audio Files</label>
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={styles.fileInput}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div style={styles.fileConfigList}>
            <label style={styles.label}>Add transcripts for each file (SRT format)</label>
            {selectedFiles.map((file, i) => (
              <div key={i} style={styles.fileConfigItem}>
                <div style={styles.fileNameSmall}>{file.name}</div>
                <textarea
                  style={styles.transcriptArea}
                  placeholder="Paste SRT content here (00:00:00,000 --> ...)"
                  value={transcripts[i]}
                  onChange={(e) => handleTranscriptChange(i, e.target.value)}
                  disabled={uploading}
                />
              </div>
            ))}
          </div>
        )}

        <div style={styles.row}>
          <div style={styles.flex1}>
            <label style={styles.label}>Set Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Morning Affirmations"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              style={styles.textInput}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.flex1}>
            <label style={styles.label}>Style</label>
            <select style={styles.select} value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="wealth">Wealth</option>
              <option value="health">Health</option>
              <option value="peace">Peace</option>
            </select>
          </div>
          <div style={styles.flex1}>
            <label style={styles.label}>Language</label>
            <select style={styles.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English (US)</option>
              <option value="zh">Chinese (CN)</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          style={{
            ...styles.uploadBtn,
            opacity: (uploading || selectedFiles.length === 0) ? 0.5 : 1
          }}
        >
          {uploading ? 'Processing Batch...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Files`}
        </button>

        {results.length > 0 && (
          <div style={styles.resultsList}>
            {results.map((res, idx) => (
              <div key={idx} style={styles.resultItem}>
                <div style={styles.resultMain}>
                  <div style={styles.resultInfo}>
                    <span style={styles.fileName}>{res.name}</span>
                    {res.publicUrl && (
                      <a href={res.publicUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        Link
                      </a>
                    )}
                  </div>
                  <span style={{
                    ...styles.statusTag,
                    color: res.status === 'success' ? '#4caf50' : res.status === 'error' ? '#ff5252' : '#aaa'
                  }}>
                    {res.status.toUpperCase()}
                  </span>
                </div>
                {res.status === 'uploading' && (
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${res.progress}%` }} />
                  </div>
                )}
                {res.error && <div style={styles.errorText}>{res.error}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', display: 'flex', justifyContent: 'center', background: '#000', minHeight: 'calc(100vh - 80px)' },
  centerBox: { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' },
  card: { width: '100%', maxWidth: '600px', background: '#111', borderRadius: '16px', padding: '30px', border: '1px solid #222', color: '#fff' },
  title: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' },
  subtitle: { fontSize: '0.9rem', opacity: 0.5, marginBottom: '25px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px', fontWeight: '600' },
  fileInput: { width: '100%', padding: '10px', background: '#1a1a1a', border: '1px dashed #333', borderRadius: '8px', color: '#888' },
  fileConfigList: { marginBottom: '25px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' },
  fileConfigItem: { marginBottom: '15px', padding: '12px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #222' },
  fileNameSmall: { fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px' },
  transcriptArea: { width: '100%', height: '80px', background: '#0a0a0a', color: '#fff', border: '1px solid #333', borderRadius: '6px', padding: '8px', fontSize: '0.8rem', outline: 'none', resize: 'vertical' },
  row: { display: 'flex', gap: '15px', marginBottom: '25px' },
  flex1: { flex: 1 },
  select: { width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '12px', outline: 'none' },
  textInput: { width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '12px', outline: 'none', fontSize: '0.9rem' },
  uploadBtn: { width: '100%', padding: '14px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },

  resultsList: { marginTop: '25px', borderTop: '1px solid #222', paddingTop: '20px' },
  resultItem: { marginBottom: '15px' },
  resultMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  resultInfo: { display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '75%' },
  fileName: { fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  link: { fontSize: '0.75rem', color: '#3498db', textDecoration: 'none', background: 'rgba(52, 152, 219, 0.1)', padding: '2px 6px', borderRadius: '4px' },
  statusTag: { fontSize: '0.7rem', fontWeight: 'bold' },
  progressBar: { height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#fff', transition: 'width 0.2s linear' },
  errorText: { fontSize: '0.75rem', color: '#ff5252', marginTop: '4px' }
};

export default AdminUpload;