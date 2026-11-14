import { useState } from 'react';
import './App.css';

function App() {
  const [scanType, setScanType] = useState('url');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!target.trim()) {
      setError('Analiz üçün hədəf URL və ya mətn daxil edin.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, scan_type: scanType }),
      });

      if (!response.ok) throw new Error('Server xətası');

      const data = await response.json();
      setResult(data);

      // Tarixçəyə əlavə et (son 4 yoxlama)
      setHistory((prev) => [
        {
          id: Date.now(),
          target: target.length > 35 ? target.slice(0, 35) + '...' : target,
          type: scanType.toUpperCase(),
          score: data.risk_score,
          status: data.status,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 3),
      ]);
    } catch (err) {
      setError('Backend nüvəsi ilə əlaqə kəsildi (Port 8000 aktiv deyil).');
    } finally {
      setLoading(false);
    }
  };

  const getTheme = (status) => {
    if (status === 'malicious')
      return { label: 'CRITICAL THREAT', az: 'YÜKSƏK TƏHLÜKƏ', color: '#ff2a5f', glow: 'rgba(255, 42, 95, 0.35)' };
    if (status === 'suspicious')
      return { label: 'SUSPICIOUS ACTIVITY', az: 'ŞÜBHƏLİ FƏALİYYƏT', color: '#ffb703', glow: 'rgba(255, 183, 3, 0.35)' };
    return { label: 'SYSTEM SECURE', az: 'TƏHLÜKƏSİZ', color: '#00f5d4', glow: 'rgba(0, 245, 212, 0.35)' };
  };

  // SVG dairəvi spidometr hesablaması
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (result.risk_score / 100) * circumference : circumference;

  return (
    <div className="cyber-wrapper">
      <div className="cyber-grid-bg"></div>

      <div className="hud-container">
        {/* Üst Status Paneli */}
        <div className="top-bar">
          <div className="sys-status">
            <span className="pulse-dot"></span>
            <span>CORE ENGINE: ONLINE</span>
          </div>
          <div className="sys-version">v2.4 // NEURAL SHIELD</div>
        </div>

        <header className="hero">
          <h1 className="glitch-title" data-text="AI CYBERSHIELD">
            AI CYBERSHIELD
          </h1>
          <p className="hero-sub">Avtonom Fişinq və Zərərli Məzmun Aşkarlama Sistemi</p>
        </header>

        {/* Əsas Skaner Paneli */}
        <div className={`scanner-box ${loading ? 'scanning-active' : ''}`}>
          {loading && <div className="laser-beam"></div>}

          <div className="mode-switch">
            <button
              type="button"
              className={`mode-btn ${scanType === 'url' ? 'active' : ''}`}
              onClick={() => { setScanType('url'); setTarget(''); setResult(null); }}
            >
              <span className="icon">🌐</span> URL / DOMEN SKANERİ
            </button>
            <button
              type="button"
              className={`mode-btn ${scanType === 'text' ? 'active' : ''}`}
              onClick={() => { setScanType('text'); setTarget(''); setResult(null); }}
            >
              <span className="icon">📡</span> SMS / E-POÇT ANALİZİ
            </button>
          </div>

          <form onSubmit={handleScan} className="cyber-form">
            <div className="input-wrapper">
              {scanType === 'url' ? (
                <input
                  type="text"
                  placeholder="https://yoxlanilacaq-hedef-link.com..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="cyber-input"
                />
              ) : (
                <textarea
                  rows="3"
                  placeholder="Şübhəli mesajı və ya e-poçt mətnini bura daxil edin..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="cyber-textarea"
                />
              )}
            </div>

            <div className="action-row">
              <div className="quick-samples">
                <span>Nümunə test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setScanType('url');
                    setTarget('http://free-bank-login-verify.com');
                  }}
                >
                  Fişinq Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanType('url');
                    setTarget('https://github.com');
                  }}
                >
                  Təhlükəsiz Link
                </button>
              </div>

              <button type="submit" className="execute-btn" disabled={loading}>
                {loading ? 'SKAN EDİLİR...' : '⚡ ANALİZİ BAŞLAT'}
              </button>
            </div>
          </form>

          {error && <div className="cyber-alert">✖ {error}</div>}
        </div>

        {/* Nəticə Ekranı */}
        {result && (
          <div
            className="telemetry-panel"
            style={{
              borderColor: getTheme(result.status).color,
              boxShadow: `0 0 30px ${getTheme(result.status).glow}`,
            }}
          >
            <div className="telemetry-header">
              <div>
                <div
                  className="threat-tag"
                  style={{ color: getTheme(result.status).color, borderColor: getTheme(result.status).color }}
                >
                  ● {getTheme(result.status).label}
                </div>
                <h2 className="verdict-title" style={{ color: getTheme(result.status).color }}>
                  {getTheme(result.status).az}
                </h2>
                <p className="verdict-desc">Hesablanmış ümumi təhlükə indeksi və texniki telemetriya</p>
              </div>

              {/* SVG Animasiyalı Spidometr */}
              <div className="gauge-box">
                <svg className="gauge-svg" width="130" height="130">
                  <circle className="gauge-bg" cx="65" cy="65" r={radius} />
                  <circle
                    className="gauge-progress"
                    cx="65"
                    cy="65"
                    r={radius}
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset,
                      stroke: getTheme(result.status).color,
                    }}
                  />
                </svg>
                <div className="gauge-text">
                  <span className="gauge-num" style={{ color: getTheme(result.status).color }}>
                    {result.risk_score}
                  </span>
                  <span className="gauge-label">RİSK BAL</span>
                </div>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="card-title">📊 TEXNİKİ İNDEKSLƏR</div>
                <div className="metric-row">
                  <span>SSL / HTTPS Protokolu</span>
                  <span className={result.technical_details.has_https ? 'ok' : 'bad'}>
                    {result.technical_details.has_https ? 'AKTİV [OK]' : 'YOXDUR [RİSK]'}
                  </span>
                </div>
                <div className="metric-row">
                  <span>Birbaşa IP Maskalanması</span>
                  <span className={!result.technical_details.is_ip_address ? 'ok' : 'bad'}>
                    {result.technical_details.is_ip_address ? 'AŞKARLANDI' : 'TƏMİZ'}
                  </span>
                </div>
                <div className="metric-row">
                  <span>Simvol Uzunluğu</span>
                  <span className="neutral">{result.technical_details.domain_length} bayt</span>
                </div>
                <div className="metric-row col">
                  <span>Tətikləyici Açar Sözlər:</span>
                  <div className="tag-cloud">
                    {result.technical_details.suspicious_keywords.length > 0 ? (
                      result.technical_details.suspicious_keywords.map((k, idx) => (
                        <span key={idx} className="danger-chip">
                          #{k}
                        </span>
                      ))
                    ) : (
                      <span className="safe-chip">Şübhəli söz tapılmadı</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="metric-card ai-terminal">
                <div className="card-title">🧠 NEURAL AI ANALİZİ</div>
                <p className="terminal-text"> {result.ai_analysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Canlı Skan Tarixçəsi */}
        {history.length > 0 && (
          <div className="history-panel">
            <div className="history-title">🕒 SON SKAN JURNALI (LIVE LOG)</div>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="h-time">[{item.time}]</span>
                  <span className="h-type">{item.type}</span>
                  <span className="h-target">{item.target}</span>
                  <span className="h-score" style={{ color: getTheme(item.status).color }}>
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;