import { useState, useEffect } from 'react';
import { KeyRound, Check, X } from 'lucide-react';

export default function Settings({ onApiKeySave }) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
      onApiKeySave(savedKey);
    }
  }, [onApiKeySave]);

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsSaved(true);
      onApiKeySave(apiKey.trim());
    }
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsSaved(false);
    onApiKeySave('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <KeyRound size={20} color="var(--primary)" />
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Pengaturan API Key</h2>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Aplikasi ini membutuhkan Google Gemini API Key untuk menghasilkan PRD. Key Anda hanya disimpan secara lokal di browser ini.
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <input
              type={isVisible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Masukkan Gemini API Key Anda..."
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {isVisible ? "Sembunyikan" : "Lihat"}
            </button>
          </div>
          {isSaved && <div className="success-message">API Key berhasil disimpan!</div>}
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={!apiKey.trim() || isSaved}>
          <Check size={18} /> Simpan
        </button>
        
        {isSaved && (
          <button type="button" className="btn" onClick={handleClear} style={{ color: 'var(--error)' }}>
            <X size={18} /> Hapus
          </button>
        )}
      </form>
    </div>
  );
}
