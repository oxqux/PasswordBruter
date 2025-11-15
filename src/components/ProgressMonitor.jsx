function ProgressMonitor({ progress, isRunning }) {
  const formatTime = (seconds) => {
    if (!seconds) return 'Calculating...'
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  if (!isRunning && progress.checked === 0) return null

  return (
    <div className="progress-monitor">
      <h4>Recovery Progress</h4>
      
      <div className="progress-stats">
        <div className="stat">
          <span className="stat-label">Current:</span>
          <code className="current-password">{progress.current}</code>
        </div>
        
        <div className="stat-row">
          <div className="stat">
            <span className="stat-label">Checked:</span>
            <span>{progress.checked.toLocaleString()} / {progress.total.toLocaleString()}</span>
          </div>
          
          <div className="stat">
            <span className="stat-label">Speed:</span>
            <span>{progress.speed.toLocaleString()}/sec</span>
          </div>
          
          <div className="stat">
            <span className="stat-label">ETA:</span>
            <span>{formatTime(progress.estimatedTime)}</span>
          </div>
        </div>
      </div>

      <progress 
        value={progress.checked} 
        max={progress.total}
        className="progress-bar"
      />
    </div>
  )
}

export default ProgressMonitor