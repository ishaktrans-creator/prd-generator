import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { generatePRDStream, fetchAvailableModels } from '../utils/ai';

export default function PrdGenerator({ apiKey }) {
  const [idea, setIdea] = useState('');
  const [techStack, setTechStack] = useState('React, Next.js, Node.js, Tailwind CSS');
  const [aiModel, setAiModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setIsLoadingModels(true);
      fetchAvailableModels(apiKey).then(models => {
        setAvailableModels(models);
        if (models.length > 0) {
          // Set default ke gemini-1.5-pro atau flash atau yang pertama
          const defaultModel = models.find(m => m.includes('1.5-pro')) || 
                               models.find(m => m.includes('1.5-flash')) || 
                               models[0];
          setAiModel(defaultModel);
        }
      }).finally(() => setIsLoadingModels(false));
    } else {
      setAvailableModels([]);
    }
  }, [apiKey]);

  const predefinedTechStacks = [
    "React, Next.js, Node.js, Tailwind CSS",
    "React, Vite, Node.js, Vanilla CSS",
    "Vue.js, Nuxt, Node.js, Tailwind CSS",
    "Python, Django, PostgreSQL, Bootstrap",
    "Python, FastAPI, React, Tailwind CSS",
    "Flutter, Dart, Firebase",
    "Kotlin, Android Native, Firebase",
  ];

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Silakan masukkan API Key di pengaturan terlebih dahulu.');
      return;
    }
    if (!idea.trim()) {
      setError('Silakan deskripsikan ide aplikasi Anda.');
      return;
    }

    setIsGenerating(true);
    setResult('');
    setError('');

    try {
      await generatePRDStream(apiKey, idea, techStack, aiModel, (newText) => {
        setResult(newText);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--primary)" /> 
          Deskripsikan Ide Anda
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Ide Aplikasi (Ceritakan secara singkat apa yang ingin Anda buat)
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Contoh: Saya ingin membuat aplikasi marketplace untuk barang antik dengan fitur lelang real-time dan pembayaran menggunakan virtual account..."
            rows={5}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Preferensi Tech Stack (Opsional)
            </label>
            <select 
              value={techStack} 
              onChange={(e) => setTechStack(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            >
              {predefinedTechStacks.map((stack, idx) => (
                <option key={idx} value={stack}>{stack}</option>
              ))}
              <option value="custom">-- Custom (Tulis sendiri) --</option>
            </select>
            
            {techStack === 'custom' && (
              <input 
                type="text" 
                placeholder="Contoh: SvelteKit, Supabase, Tailwind"
                onChange={(e) => setTechStack(e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Model AI (Gemini)
            </label>
            <select 
              value={aiModel} 
              onChange={(e) => setAiModel(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
              disabled={isLoadingModels}
            >
              {isLoadingModels ? (
                <option>Memuat model...</option>
              ) : availableModels.length > 0 ? (
                availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))
              ) : (
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              )}
              <option value="custom">-- Custom (Tulis sendiri) --</option>
            </select>

            {aiModel === 'custom' && (
              <input 
                type="text" 
                placeholder="Contoh: gemini-1.5-pro"
                onChange={(e) => setAiModel(e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <button 
          className="btn btn-primary" 
          onClick={handleGenerate} 
          disabled={isGenerating || !idea.trim()}
          style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="spinner" /> Generating PRD...
            </>
          ) : (
            <>
              <Sparkles size={20} /> Generate PRD Sekarang
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Hasil PRD</h2>
            <button className="btn" onClick={copyToClipboard}>
              {copied ? <><Check size={18} color="var(--success)" /> Tersalin</> : <><Copy size={18} /> Salin PRD</>}
            </button>
          </div>
          
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
