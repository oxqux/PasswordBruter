// bruteForceWasm.js

let wasmModule = null
let wasmReady = false

async function loadWasm() {
  if (wasmReady) return wasmModule

  // Load emscripten JS loader from public/ without going through Vite bundler
  const scriptUrl = new URL('/bruteforce.js', import.meta.url).origin + '/bruteforce.js'
  const scriptText = await fetch(scriptUrl).then(r => r.text())

  // Execute the script and grab the factory function it exports
  const factory = await new Promise((resolve, reject) => {
    const blob = new Blob([scriptText], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    import(/* @vite-ignore */ url)
      .then(m => { URL.revokeObjectURL(url); resolve(m.default ?? m) })
      .catch(reject)
  })

  wasmModule = await factory({
    locateFile: (file) => '/' + file
  })
  wasmReady = true
  return wasmModule
}

function call(mod, fn, returnType, argTypes, args) {
  return mod.ccall(fn, returnType, argTypes, args)
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function md5Wasm(str) {
  const mod = await loadWasm()
  return call(mod, 'wasm_md5', 'string', ['string'], [str])
}

export async function bruteDictionary(
  handshake, fileContent, params, updateProgress, setResult, setIsRunning, cancelRef
) {
  const mod = await loadWasm()
  const total = fileContent.length

  call(mod, 'dict_init', null, ['string'], [handshake])
  for (const pw of fileContent) {
    call(mod, 'dict_add_password', null, ['string'], [pw])
  }

  updateProgress(0, total, '')

  const processBatch = async () => {
    if (cancelRef.current) { setIsRunning(false); return }

    const status  = call(mod, 'dict_batch',    'number', ['number'], [params.batchSize])
    const checked = call(mod, 'dict_checked',  'number', [], [])
    const lastPw  = call(mod, 'wasm_get_last', 'string', [], [])

    updateProgress(checked, total, lastPw)

    if (status === 1) {
      setResult(`Password found: ${call(mod, 'wasm_get_out', 'string', [], [])}`)
      setIsRunning(false)
      return
    }
    if (status === 2 || cancelRef.current) {
      setResult('Password not found in dictionary')
      setIsRunning(false)
      return
    }
    setTimeout(processBatch, 0)
  }

  await processBatch()
}

export async function bruteAlphabet(
  handshake, params, updateProgress, setResult, setIsRunning, cancelRef
) {
  const mod = await loadWasm()
  const charset = buildCharset(params)

  if (!charset) {
    setResult('No charset selected')
    setIsRunning(false)
    return
  }

  let totalCombinations = 0
  for (let len = params.minLength; len <= params.maxLength; len++) {
    totalCombinations += Math.pow(charset.length, len)
  }

  call(mod, 'alphabet_init', null,
    ['string', 'number', 'number', 'string'],
    [charset, params.minLength, params.maxLength, handshake]
  )

  updateProgress(0, totalCombinations, '')
  let totalChecked = 0

  const processBatch = async () => {
    if (cancelRef.current) { setIsRunning(false); return }

    const status = call(mod, 'alphabet_batch', 'number', ['number'], [params.batchSize])
    const lastPw = call(mod, 'wasm_get_last',  'string', [], [])
    totalChecked += params.batchSize

    updateProgress(Math.min(totalChecked, totalCombinations), totalCombinations, lastPw)

    if (status === 1) {
      setResult(`Password found: ${call(mod, 'wasm_get_out', 'string', [], [])}`)
      setIsRunning(false)
      return
    }
    if (status === 2 || cancelRef.current) {
      setResult('Password not found (search space exhausted)')
      setIsRunning(false)
      return
    }
    setTimeout(processBatch, 0)
  }

  await processBatch()
}

export function buildCharset(params) {
  let charset = ''
  if (params.useNumbers)   charset += '0123456789'
  if (params.useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (params.useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (params.useSpecial)   charset += '!@#$%^&*()_+-=[]{}|;:,.<>?`'
  return charset
}

