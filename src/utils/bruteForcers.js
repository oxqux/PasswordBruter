import md5 from 'blueimp-md5'
import { passwordGenerator } from './passwordGenerator'

export async function bruteDictionary(handshake, fileContent, params, updateProgress, setResult, setIsRunning, cancelRef) {
  const total = fileContent.length
  let checked = 0

  updateProgress(0, total, '')

  const processBatch = async () => {
    if (cancelRef.current) {
      setIsRunning(false)
      return
    }

    const batchSize = Math.min(params.batchSize, total - checked)
    const batch = fileContent.slice(checked, checked + batchSize)

    for (let i = 0; i < batch.length; i++) {
      if (cancelRef.current) break
      
      const password = batch[i]
      if (md5(password) === handshake) {
        setResult(`Password found: ${password}`)
        setIsRunning(false)
        return
      }
    }

    checked += batch.length
    updateProgress(checked, total, batch[0])

    if (checked < total && !cancelRef.current) {
      setTimeout(processBatch, 0)
    } else {
      setResult("Password not found in dictionary")
      setIsRunning(false)
    }
  }

  await processBatch()
}

export async function bruteAlphabet(handshake, params, updateProgress, setResult, setIsRunning, cancelRef) {
  const generator = passwordGenerator(params)
  let totalChecked = 0
  let totalCombinations = 0

  for (let len = params.minLength; len <= params.maxLength; len++) {
    totalCombinations += Math.pow(buildCharset(params).length, len)
  }

  updateProgress(0, totalCombinations, '')

  const processBatch = async () => {
    if (cancelRef.current) {
      setIsRunning(false)
      return
    }

    const batch = []
    for (let i = 0; i < params.batchSize; i++) {
      const { value, done } = generator.next()
      if (done) break
      batch.push(value)
    }

    if (batch.length === 0) {
      setResult("Password not found (search space exhausted)")
      setIsRunning(false)
      return
    }

    for (const password of batch) {
      if (cancelRef.current) break
      
      if (md5(password) === handshake) {
        setResult(`Password found: ${password}`)
        setIsRunning(false)
        return
      }
    }

    totalChecked += batch.length
    updateProgress(totalChecked, totalCombinations, batch[0])

    if (!cancelRef.current) {
      setTimeout(processBatch, 0)
    }
  }

  await processBatch()
}

export function buildCharset(params) {
  let charset = ''
  if (params.useNumbers) charset += '0123456789'
  if (params.useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (params.useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (params.useSpecial) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?`'
  return charset
}