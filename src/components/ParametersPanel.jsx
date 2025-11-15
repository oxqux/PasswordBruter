function ParametersPanel({ params, setParams, onFileChange, disabled }) {
  const handleParamChange = (event) => {
    const { name, value, type, checked } = event.target
    setParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value,
    }))
  }

  const handleFileInput = (event) => {
    const file = event.target.files[0]
    if (file) onFileChange(file)
  }

  return (
    <div className="parameters-panel">
      <h3>Search Parameters</h3>
      
      <div className="length-controls">
        <div className="input-group">
          <label>Min Length</label>
          <input 
            type="number" 
            name="minLength"
            value={params.minLength}
            onChange={handleParamChange}
            min="1"
            max="20"
            disabled={disabled}
          />
        </div>
        <div className="input-group">
          <label>Max Length</label>
          <input 
            type="number" 
            name="maxLength"
            value={params.maxLength}
            onChange={handleParamChange}
            min="1"
            max="20"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="character-sets">
        <label>Character Sets</label>
        <div className="checkbox-grid">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="useNumbers" 
              checked={params.useNumbers} 
              onChange={handleParamChange}
              disabled={disabled}
            />
            <span>Numbers</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="useLowercase" 
              checked={params.useLowercase} 
              onChange={handleParamChange}
              disabled={disabled}
            />
            <span>Lowercase</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="useUppercase" 
              checked={params.useUppercase} 
              onChange={handleParamChange}
              disabled={disabled}
            />
            <span>Uppercase</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="useSpecial" 
              checked={params.useSpecial} 
              onChange={handleParamChange}
              disabled={disabled}
            />
            <span>Special</span>
          </label>
        </div>
      </div>

      {/* Добавляем поле для Batch Size */}
      <div className="batch-size-control">
        <div className="input-group">
          <label>Batch Size</label>
          <input 
            type="number" 
            name="batchSize"
            value={params.batchSize}
            onChange={handleParamChange}
            min="1000"
            max="100000"
            step="1000"
            disabled={disabled}
          />
        </div>
        <div className="help-text">
          Higher values = faster but more memory usage
        </div>
      </div>

      <div className="advanced-options">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="usePatterns" 
            checked={params.usePatterns} 
            onChange={handleParamChange}
            disabled={disabled}
          />
          <span>Smart Patterns</span>
        </label>
        
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="useDictionary" 
            checked={params.useDictionary} 
            onChange={handleParamChange}
            disabled={disabled}
          />
          <span>Dictionary Attack</span>
        </label>
        
        {params.useDictionary && (
          <div className="file-input-group">
            <input 
              type="file" 
              onChange={handleFileInput}
              disabled={disabled}
              accept=".txt,.lst,.dict"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ParametersPanel