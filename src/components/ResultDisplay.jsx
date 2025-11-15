function ResultDisplay({ result }) {
  if (!result) return null

  const isSuccess = result.includes('found')
  
  return (
    <div className={`result-display ${isSuccess ? 'success' : 'error'}`}>
      <h3>{isSuccess ? 'Password Recovered!' : 'Search Complete'}</h3>
      <p className="result-text">{result}</p>
    </div>
  )
}

export default ResultDisplay