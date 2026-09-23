import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles, Copy, Check, FileText, Download } from 'lucide-react';
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const markdownRef = useRef(null);

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

  const getDocumentTitle = () => {
    if (!result) return 'PRD-Dokumen';
    const quotedMatch = result.match(/aplikasi\s+["*]+([^"*\n\r]+)["*]+/i);
    if (quotedMatch && quotedMatch[1]?.trim()) {
      return `PRD-${quotedMatch[1].trim().replace(/[\\/:*?"<>|\s]+/g, '_')}`;
    }
    const nameMatch = result.match(/Nama(?:\s+Aplikasi)?\s*:\s*([^\n\r]+)/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      return `PRD-${nameMatch[1].trim().replace(/[\\/:*?"<>|*\s]+/g, '_')}`;
    }
    if (idea && idea.trim()) {
      const cleanIdea = idea.trim().slice(0, 25).replace(/[\\/:*?"<>|\s]+/g, '_');
      return `PRD-${cleanIdea}`;
    }
    return 'PRD-Dokumen';
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const fileName = `${getDocumentTitle()}.md`;
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!result || !markdownRef.current) return;
    setIsGeneratingPdf(true);
    const fileName = `${getDocumentTitle()}.pdf`;

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const sourceElement = markdownRef.current;
      const container = document.createElement('div');
      container.className = 'pdf-export-wrapper';

      const headerEl = document.createElement('div');
      headerEl.style.borderBottom = '2px solid #3b82f6';
      headerEl.style.paddingBottom = '12px';
      headerEl.style.marginBottom = '20px';
      headerEl.innerHTML = `
        <h1 style="color: #1e3a8a; font-size: 22px; margin: 0 0 6px 0; font-family: sans-serif;">Product Requirements Document (PRD)</h1>
        <p style="color: #64748b; font-size: 11px; margin: 0; font-family: sans-serif;">Dokumen Standar Industri 12 Bab</p>
      `;
      container.appendChild(headerEl);

      const contentClone = sourceElement.cloneNode(true);
      container.appendChild(contentClone);

      const opt = {
        margin: [12, 12, 12, 12],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(container).save();
    } catch (err) {
      console.error('Gagal generate PDF dengan html2pdf, menggunakan print dialog:', err);
      const originalTitle = document.title;
      document.title = fileName.replace('.pdf', '');
      window.print();
      document.title = originalTitle;
    } finally {
      setIsGeneratingPdf(false);
    }
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
        <div className="glass-panel prd-result-panel" style={{ padding: '2rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h2 style={{ margin: 0 }}>Hasil PRD</h2>
            <div className="prd-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={copyToClipboard} title="Salin seluruh teks PRD">
                {copied ? <><Check size={18} color="var(--success)" /> Tersalin</> : <><Copy size={18} /> Salin</>}
              </button>
              <button className="btn" onClick={downloadMarkdown} title="Download file Markdown (.md) untuk Cursor, Claude, atau Obsidian">
                <FileText size={18} /> Download .MD
              </button>
              <button className="btn btn-primary" onClick={downloadPDF} disabled={isGeneratingPdf} title="Download dokumen PDF profesional">
                {isGeneratingPdf ? (
                  <><Loader2 className="spinner" size={18} /> Menyiapkan PDF...</>
                ) : (
                  <><Download size={18} /> Download PDF</>
                )}
              </button>
            </div>
          </div>
          
          <div className="markdown-body" ref={markdownRef}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
