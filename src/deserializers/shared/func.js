const func = argv => {
  const {
    verbose,
    delimiter,
    quote,
    escape,
    header,
    headerPrefix,
    skipHeader,
    fixedLength,
    skipEmptyValues,
    trimWhitespaces,
    emptyAsNull,
    skipNull,
    missingAsNull
  } = argv

  let keys               = header
  if (typeof keys === 'string') keys = JSON.parse(keys)
  let keysLength         = keys.length

  // skipHeader | header || return type | keys            | data header   || headerIsSet | ignoreDataHeader | returnTypeObject
  // true       | [...]  || JSON object | provided header | ignore        || true        | true             | true
  // true       | []     || JSON array  | none            | ignore        || true        | true             | false
  // false      | [...]  || JSON object | provided header | treat as data || true        | false            | true
  // false      | []     || JSON object | data header     | treat as keys || false       | false            | true

  let headerIsSet        =  skipHeader || keysLength > 0
  let ignoreDataHeader   =  skipHeader
  const returnTypeObject = !skipHeader || keysLength > 0

  const postprocessingFs = []
  if (fixedLength)     postprocessingFs.push(controlFixedLength)
  if (skipEmptyValues) postprocessingFs.push(removeEmptyValues)
  if (trimWhitespaces) postprocessingFs.push(removeWhitespaces)
  if (emptyAsNull)     postprocessingFs.push(emptyToNull)
  if (skipNull)        postprocessingFs.push(removeNulls)
  if (missingAsNull)   postprocessingFs.push(missingToNull)

  const postprocessingF = (values, line) => {
    let err     = []
    let values2 = values

    for (let i = 0; i < postprocessingFs.length; i++) {
      const f   = postprocessingFs[i]
      const res = f(values2, line)
      if (res.err.length > 0) err = err.concat(res.err)
      values2   = res.values
    }

    return {err, values: values2}
  }

  return (chunks, lines) => {
    let err       = []
    const jsons   = []

    const start   = ignoreDataHeader ? 1 : 0

    for (let i = start; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      let values  = []
      let from    = 0

      let inQuote          = false
      let mayBeEscaped     = false
      let isEscaped        = false
      let valueFound       = false
      let hasQuotes        = false
      let hasEscapedQuotes = false

      for (let at = 0; at < (chunk || '').length; at++) {
        const ch  = chunk.charAt(at)

        if (inQuote) {
                                      hasQuotes        = true
          if (quote === escape) {
            if (mayBeEscaped) {
                                      mayBeEscaped     = false
              if (ch === quote)      hasEscapedQuotes = true
              else                   inQuote          = false
              if (ch === delimiter)  valueFound       = true
            } else {
              if (ch === escape)     mayBeEscaped     = true
              else if (ch === quote) inQuote          = false
            }
          } else {
            if (isEscaped) {
                                      isEscaped        = false
              if (ch === quote)      hasEscapedQuotes = true
            } else {
              if (ch === escape)     isEscaped        = true
              else if (ch === quote) inQuote          = false
            }
          }
        } else {
          if (ch === quote)          inQuote          = true
          else if (ch === delimiter) valueFound       = true
        }

        if (valueFound || at === chunk.length - 1) {
          let value  = chunk.slice(from, valueFound ? at : at + 1)
          valueFound = false
          from       = at + 1

          if (hasQuotes)        value = removeQuotes(value)
          if (hasEscapedQuotes) value = removeEscapedQuotes(value)

          values.push(value)
        }

        if (at === chunk.length - 1 && ch === delimiter) {
          values.push('')
        }
      }

      if (chunk === '') values.push(chunk)

      if (keysLength === 0 && !returnTypeObject) {
        keysLength = values.length
      }

      const line = verbose > 0 ? lines[i] : undefined
      const res  = postprocessingF(values, line)
      if (res.err.length > 0) err = err.concat(res.err)
      values     = res.values

      if (values.length > 0) {
        if (!headerIsSet) {
          keys             = values
          keysLength       = keys.length
          headerIsSet      = true
          ignoreDataHeader = false
        } else if (returnTypeObject) {
          const json     = {}
          
          const until    = Math.max(keysLength, values.length)

          for (let j = 0; j < until; j++) {
            const key    = keys[j]
            const value  = values[j]
            const key2   = typeof key   !== 'undefined' ? key   : headerPrefix + (j + 1)
            const value2 = typeof value !== 'undefined' ? value : null
            json[key2]   = value2
          }

          jsons.push(json)
        } else {
          jsons.push(values)
        }
      }
    }

    return {err, jsons}
  }

  function removeQuotes (value) {
    let value2 = value
    const len  = value.length
    if (len > 0 && value[0] === quote && value[len - 1] === quote) {
      value2   = value.slice(1, len - 1)
    }
    return value2
  }

  function removeEscapedQuotes (value) {
    let lastCh  = ''
    let value2  = ''
    for (let at = 0; at < value.length; at++) {
      const ch  = value[at]
      if (lastCh === '') {
        lastCh  = ch
      } else if (lastCh === escape && ch === quote) {
        value2 += ch
        lastCh  = ''
      } else {
        value2 += lastCh
        lastCh  = ch
      }
    }
    value2     += lastCh
    return value2
  }

  function controlFixedLength (values, lineNo) {
    if (headerIsSet && keysLength !== values.length) {
      const msg  = {msg: 'Number of values does not match number of headers'}
      const line = verbose > 0 ? {line: lineNo}                                                         : {}
      const info = verbose > 1 ? {info: `values [${values.join(',')}] and headers [${keys.join(',')}]`} : {}
      return {err: [Object.assign(msg, line, info)], values: []}
    } else {
      return {err: [], values}
    }
  }
  
  function removeWhitespaces (values) {
    let values2    = []
    for (let i = 0; i < values.length; i++) {
      const value  = values[i]
      const value2 = value.replace(/^\s+|\s+$/g, '')
      values2.push(value2)
    }
    return {err: [], values: values2}
  }

  function removeEmptyValues (values) {
    const values2 = []
    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      if (value !== '') values2.push(value)
    }
    return {err: [], values: values2}
  }
  
  function emptyToNull (values) {
    const values2 = []
    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      values2.push(value === '' ? null : value)
    }
    return {err: [], values: values2}
  }

  function removeNulls (values) {
    const values2 = []
    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      if (value !== null) values2.push(value)
    }
    return {err: [], values: values2}
  }
  
  function missingToNull (values) {
    if (headerIsSet) {
      const len     = values.length
      const values2 = []
      for (let i = 0; i < keysLength; i++) {
        const value = i < len ? values[i] : null
        values2.push(value)
      }
      return {err: [], values: values2}
    } else {
      return {err: [], values}
    }
  }
}

module.exports = {
  func
}