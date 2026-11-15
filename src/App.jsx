
import { useState } from 'react'
import './App.css'
const API_BASE_URL = 'http://192.168.102.57:8000'

function App() {
  const [result, setResult] = useState('')
  const [analysisData, setAnalysisData] = useState(null)
  const [activePage, setActivePage] = useState('Dashboard')
  const [history, setHistory] = useState([])
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

async function analyzeURL() {
  if (url.trim() === '') {
    setResult('Please enter a URL first!')
    return
  }

  setLoading(true)
  setAnalysisData(null)
  setResult('Analyzing URL...')

  try {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: url.trim(),
        scan_type: 'url'
      })
    })

    if (!response.ok) {
      throw new Error('Analysis failed')
    }

    const data = await response.json()

    setAnalysisData(data)
    setResult('')

    setHistory((oldHistory) => [
      ...oldHistory,
      {
        type: 'URL',
        value: url,
        date: new Date().toLocaleString()
      }
    ])
  } catch (error) {
    setResult('Could not connect to the backend. Please try again.')
  } finally {
    setLoading(false)
  }
}

async function analyzeMessage() {
  if (message.trim() === '') {
    setResult('Please enter a message first!')
    return
  }

  setLoading(true)
  setAnalysisData(null)
  setResult('Analyzing message...')

  try {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: message.trim(),
        scan_type: 'text'
      })
    })

    if (!response.ok) {
      throw new Error('Analysis failed')
    }

    const data = await response.json()

    setAnalysisData(data)
    setResult('')

    setHistory((oldHistory) => [
      ...oldHistory,
      {
        type: 'Message',
        value: message,
        date: new Date().toLocaleString()
      }
    ])
  } catch (error) {
    setResult('Could not connect to the backend. Please try again.')
  } finally {
    setLoading(false)
  }
}
const totalAnalyses = history.length

const urlAnalyses = history.filter(
  (item) => item.type === 'URL'
).length

const messageAnalyses = history.filter(
  (item) => item.type === 'Message'
).length

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🛡️ CyberShield</h2>
        <nav>
          <p
            className={activePage === 'Dashboard' ? 'active' : ''}
            onClick={() => setActivePage('Dashboard')}
          >
            Dashboard
          </p>

          <p
            className={activePage === 'Scan & Analyze' ? 'active' : ''}
            onClick={() => setActivePage('Scan & Analyze')}
          >
            Scan & Analyze
          </p>

          <p
            className={activePage === 'Threat History' ? 'active' : ''}
            onClick={() => setActivePage('Threat History')}
          >
            Threat History
          </p>

          <p
            className={activePage === 'Statistics' ? 'active' : ''}
            onClick={() => setActivePage('Statistics')}
          >
            Statistics
          </p>

          <p
            className={activePage === 'About' ? 'active' : ''}
            onClick={() => setActivePage('About')}
          >
            About
          </p>
        </nav>
      </aside>
      <main className="main-content">
        {activePage === 'Dashboard' ? (
          <div>
            <h1>Welcome to AI CyberShield</h1>
            <p className="description">
              Your AI-powered security assistant.
            </p>

            <div className="dashboard-cards">
              <div className="scan-card">
                <h2>Total Analyses</h2>
                <p>{totalAnalyses}</p>
              </div>

              <div className="scan-card">
                <h2>URL Scans</h2>
                <p>{urlAnalyses}</p>
              </div>

              <div className="scan-card">
                <h2>Message Scans</h2>
                <p>{messageAnalyses}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activePage === 'Scan & Analyze' ? (
              <h1>Scan & Analyze</h1>
            ) : activePage === 'Threat History' ? (
              <h1>Threat History</h1>
            ) : activePage === 'Statistics' ? (
              <h1>Statistics</h1>
            ) : activePage === 'About' ? (
              <h1>About</h1>
            ) : (
              <h1>Welcome to AI CyberShield</h1>
            )}
          
            <p className="description">
              {activePage === 'Scan & Analyze'
                ? 'Analyze suspicious URLs and messages.'
                : activePage === 'Threat History'
                ? 'View your previous security analyses.'
                : activePage === 'Statistics'
                ? 'View your security analysis statistics.'
                : activePage === 'About'
                ? 'Learn more about AI CyberShield.'
                : 'Your AI-powered security assistant.'}
            </p>
            {activePage === 'Threat History' && (
              <div className="history-list">
                <h2>Previous Analyses</h2>

                {history.length === 0 ? (
                  <p>No analyses yet.</p>
                ) : (
                  history.map((item, index) => (
                    <div className="scan-card" key={index}>
                      <h3>{item.type}</h3>
                      <p>{item.value}</p>
                      <small>{item.date}</small>
                    </div>
                  ))
                )}
              </div>
            )}
            {activePage === 'Statistics' && (
              <div className="dashboard-cards">
                <div className="scan-card">
                  <h2>Total Analyses</h2>
                  <p>{totalAnalyses}</p>
                </div>

                <div className="scan-card">
                  <h2>URL Analyses</h2>
                  <p>{urlAnalyses}</p>
                </div>

                <div className="scan-card">
                  <h2>Message Analyses</h2>
                  <p>{messageAnalyses}</p>
                </div>
              </div>
            )}
            {activePage === 'About' && (
              <div className="scan-card">
                <h2>About AI CyberShield 🛡️</h2>

                <p>
                  AI CyberShield is an intelligent security platform
                  designed to detect potential cyber threats.
                </p>

                <h3>Our Mission</h3>
                <p>
                  Our mission is to help users stay safe online by
                  identifying suspicious links and phishing messages.
                </p>

                <h3>Key Features</h3>
                <ul>
                  <li>Suspicious URL Detection</li>
                  <li>Phishing Message Analysis</li>
                  <li>Threat History Tracking</li>
                  <li>Security Statistics</li>
                </ul>
              </div>
            )}
            {activePage === 'Scan & Analyze' ? (
              <div>
                <div className="dashboard-cards">
                  <div className="scan-card">
                    <h2>🔗 URL Scanner</h2>
                    <p>Check suspicious links for potential threats.</p>
                    <input
                      type="text"
                      placeholder="Enter URL..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <button onClick={analyzeURL} disabled={loading}>
  {loading ? 'Analyzing...' : 'Analyze URL'}
</button>
                  </div>

              <div className="scan-card">
                <h2>✉️ Message Analyzer</h2>
                <p>Detect phishing messages using AI.</p>
                <textarea
                  placeholder="Paste your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button onClick={analyzeMessage} disabled={loading}>
  {loading ? 'Analyzing...' : 'Analyze Message'}
</button>
              </div>
            </div>
            <div className="result-panel">
              <h2>Analysis Result</h2>

              {analysisData ? (
                <>
                    <span className={`result-status ${analysisData.status}`}>
                      {analysisData.status.toUpperCase()}
                    </span>

                    <div className="risk-score">
                      Risk Score: {analysisData.risk_score}%
                    </div>

                    <p className="ai-explanation">
                      {analysisData.ai_analysis}
                    </p>
                  </>
                ) : (
                  <p>{result || 'Your analysis results will appear here.'}</p>
                )}
              </div>
          </div>
          ) : null}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
