import { useState, useRef } from 'react'
import ParametersPanel from './components/ParametersPanel.jsx'
import ProgressMonitor from './components/ProgressMonitor.jsx'
import ResultDisplay from './components/ResultDisplay.jsx'
import { bruteDictionary, bruteAlphabet } from './utils/bruteForcers.js'
import './App.css'

function App() {
  const [handshake, setHandshake] = useState("")
  const [result, setResult] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState({ 
    current: '', 
    total: 0, 
    checked: 0,
    speed: 0,
    estimatedTime: 0
  })
  const [fileContent, setFileContent] = useState([])
  const [params, setParams] = useState({
    minLength: 1,
    maxLength: 6,
    useNumbers: true,
    useLowercase: true,
    useUppercase: false,
    useSpecial: false,
    useDictionary: false,
    usePatterns: true,
    batchSize: 10000
  })
  
  const cancelRef = useRef(false)
  const startTimeRef = useRef(0)
  const checkedCountRef = useRef(0)
  const lastUpdateRef = useRef(0)

  const handleBruteForce = async () => {
    if (!validateInput()) return
    
    cancelRef.current = false
    setIsRunning(true)
    setResult("")
    checkedCountRef.current = 0
    startTimeRef.current = Date.now()
    lastUpdateRef.current = Date.now()
    
    if (params.useDictionary) {
      await bruteDictionary(handshake, fileContent, params, updateProgress, setResult, setIsRunning, cancelRef)
    } else {
      await bruteAlphabet(handshake, params, updateProgress, setResult, setIsRunning, cancelRef)
    }
  }

  const validateInput = () => {
    if (!handshake) {
      alert("Please enter a handshake")
      return false
    }
    
    if (params.useDictionary && fileContent.length === 0) {
      alert("Please select a dictionary file")
      return false
    }
    
    const charset = buildCharset(params)
    if (!params.useDictionary && charset.length === 0) {
      alert("Please select at least one character type")
      return false
    }
    
    return true
  }

  const updateProgress = (checked, total, currentPassword) => {
    const now = Date.now()
    const timeDiff = now - lastUpdateRef.current
    
    if (timeDiff > 500) {
      const elapsed = (now - startTimeRef.current) / 1000
      const speed = elapsed > 0 ? Math.round(checked / elapsed) : 0
      const remaining = speed > 0 ? Math.round((total - checked) / speed) : 0
      
      setProgress({
        current: currentPassword || '',
        total,
        checked,
        speed,
        estimatedTime: remaining
      })
      
      lastUpdateRef.current = now
    }
  }

  const stopBrute = () => {
    cancelRef.current = true
    setIsRunning(false)
  }

  const handleFileChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      setFileContent(lines)
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hash Cracker</h1>
        <p>Advanced password recovery tool</p>
      </header>

      <div className="input-section">
        <label className="input-label">Target MD5 Hash</label>
        <input 
          className="hash-input"
          onChange={(e) => setHandshake(e.target.value)} 
          value={handshake}
          placeholder="Enter MD5 hash to crack"
          disabled={isRunning}
        />
      </div>

      <ParametersPanel 
        params={params}
        setParams={setParams}
        onFileChange={handleFileChange}
        disabled={isRunning}
      />

      <div className="action-section">
        {isRunning ? (
          <button className="btn btn-stop" onClick={stopBrute}>
            Stop Process
          </button>
        ) : (
          <button className="btn btn-start" onClick={handleBruteForce}>
            Start Recovery
          </button>
        )}
      </div>

      <ProgressMonitor progress={progress} isRunning={isRunning} />
      <ResultDisplay result={result} />
    </div>
  )
}

// Добавляем функцию buildCharset прямо в App.jsx
function buildCharset(params) {
  let charset = ''
  if (params.useNumbers) charset += '0123456789'
  if (params.useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (params.useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (params.useSpecial) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?`'
  return charset
}

export default App