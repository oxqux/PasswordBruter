import { buildCharset } from './bruteForcers'

export function* passwordGenerator(params) {
  const charset = buildCharset(params)
  
  if (params.usePatterns && charset.length > 0) {
    yield* generateWithPatterns(params, charset)
  } else {
    yield* generateStandard(params, charset)
  }
}

function* generateStandard(params, charset) {
  for (let len = params.minLength; len <= params.maxLength; len++) {
    const indices = new Array(len).fill(0)
    
    while (true) {
      const password = indices.map(i => charset[i]).join('')
      yield password
      
      let i = len - 1
      while (i >= 0) {
        indices[i]++
        if (indices[i] < charset.length) break
        indices[i] = 0
        i--
      }
      if (i < 0) break
    }
  }
}

function* generateWithPatterns(params, charset) {
  const letters = charset.replace(/[0-9]/g, '')
  const numbers = charset.replace(/[a-zA-Z]/g, '')
  
  for (let len = params.minLength; len <= params.maxLength; len++) {
    yield* generateForPattern(len, letters, 'letters')
    yield* generateForPattern(len, numbers, 'numbers')
    
    if (letters && numbers) {
      for (let letterLen = 1; letterLen < len; letterLen++) {
        const numberLen = len - letterLen
        yield* generateMixed(letters, numbers, letterLen, numberLen, 'left')
        yield* generateMixed(numbers, letters, numberLen, letterLen, 'right')
      }
    }
  }
}

function* generateForPattern(len, charset) {
  if (charset.length === 0) return
  
  const indices = new Array(len).fill(0)
  
  while (true) {
    const password = indices.map(i => charset[i]).join('')
    yield password
    
    let i = len - 1
    while (i >= 0) {
      indices[i]++
      if (indices[i] < charset.length) break
      indices[i] = 0
      i--
    }
    if (i < 0) break
  }
}

function* generateMixed(set1, set2, len1, len2) {
  const gen1 = generateForPattern(len1, set1)
  for (const part1 of gen1) {
    const gen2 = generateForPattern(len2, set2)
    for (const part2 of gen2) {
      yield part1 + part2
    }
  }
}