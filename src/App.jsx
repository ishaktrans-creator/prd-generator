import { useState } from 'react';
import Settings from './components/Settings';
import PrdGenerator from './components/PrdGenerator';

function App() {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="app-container">
      <header>
        <h1>PRD Generator</h1>
      </header>

      <main>
        <Settings onApiKeySave={setApiKey} />
        <PrdGenerator apiKey={apiKey} />
      </main>
      
      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>Aplikasi ini menghasilkan PRD profesional dalam 12 Bab berstandar industri.</p>
      </footer>
    </div>
  );
}

export default App;
