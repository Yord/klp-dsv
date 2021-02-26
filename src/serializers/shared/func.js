const func = argv => {
  const {
    verbose,
    recordSeparator,
    delimiter,
    quote,
    escape,
    header,
    skipHeader,
    allowListValues,
    fixedLength,
    trimWhitespaces,
    emptyAsNull,
    skipNull,
    nullAs
  } = argv

  let keys                = JSON.parse(header)

  // skipHeader | header || addProvidedHeader | headerIsSet | ignoreDataHeader
  // true       | [...]  || false             | true        | true
  // true       | []     || false             | true        | true
  // false      | [...]  || true              | false       | false
  // false      | []     || false             | false       | false

  const addProvidedHeader = !skipHeader && keys.length > 0
  let headerIsSet         = skipHeader
  const fillMissingValues = typeof nullAs !== 'undefined'

  const preprocessingFs   = []
  if (trimWhitespaces)  preprocessingFs.push(removeWhitespaces)
  if (emptyAsNull)      preprocessingFs.push(emptyToNull)
  if (skipNull)         preprocessingFs.push(removeNulls)
  if (fillMissingValues) preprocessingFs.push(replaceNulls)

  const preprocessingF = record => {
    let record2 = record
    for (let i = 0; i < preprocessingFs.length; i++) {
      const f   = preprocessingFs[i]
      record2   = f(record2)
    }
    return record2
  }

  return jsons => {
    let err     = []
    let records = []

    if (!headerIsSet && addProvidedHeader) {
      records.push(keys)
      headerIsSet = true
    }

    if (!headerIsSet) {
      if (jsons.length > 0) {
        const json = jsons[0]

        if (Array.isArray(json)) keys = json
        else if (json === null)  keys = []
        else if (typeof json === 'object') {
          keys                        = Object.keys(json)
          records.push(keys)
        } else keys                   = []
      }
      headerIsSet = true
    }

    let res = jsonsToRecords(jsons)
    if (res.err.length > 0) err = err.concat(res.err)
    records = records.concat(res.records)

    if (fixedLength) {
      res     = controlFixedLength(records)
      if (res.err.length > 0) err = err.concat(res.err)
      records = res.records
    }
    
    let str = ''

    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      record     = preprocessingF(record)

      str += maybeWithQuotes(record[0])
      for (let i = 1; i < record.length; i++) str += delimiter + maybeWithQuotes(record[i])
      str += recordSeparator
    }

    return ({err, str})
  }

  function maybeWithQuotes (value) {
    let value2    = value
    let addQuotes = false

    if (value !== null && value.indexOf(delimiter) > -1) {
      addQuotes   = true
    }
    if (value !== null) {
      let quoteIndex = value.indexOf(quote)
      while (quoteIndex > -1) {
        addQuotes    = true
        value2       = value2.slice(0, quoteIndex) + escape + value2.slice(quoteIndex)
        quoteIndex   = value.indexOf(quote, quoteIndex + 1)
      }
    }

    return addQuotes ? quote + value2 + quote : value2
  }

  function jsonsToRecords (jsons) {
    const err     = []
    const records = []
    
    for (let i = 0; i < jsons.length; i++) {
      const json = jsons[i]

      let record = []

      if (Array.isArray(json)) record = json
      else if (typeof json === 'object' && json !== null) {
        const keys = Object.keys(json)

        for (let j = 0; j < keys.length; j++) {
          const key   = keys[j]
          const value = json[key]
          record.push(value)
        }
      }

      const record2 = []

      for (let j = 0; j < record.length; j++) {
        const field = record[j]

        if (typeof field === 'string') {
          record2.push(field)
        } else if (typeof field === 'number') {
          if (Number.isNaN(field)) {
            record2.push(null)
          } else {
            record2.push(field.toString())
          }
        } else if (typeof field === 'boolean') {
          record2.push(field.toString())
        } else if (typeof field === 'undefined') {
          record2.push(null)
        } else if (field === null) {
          record2.push(null)
        } else if (Array.isArray(field)) {
          if (allowListValues) {
            record2.push(JSON.stringify(field))
          } else {
            const msg  = {msg: 'Arrays are not allowed as fields'}
            const line = verbose > 0 ? {line: -1}                    : {}
            const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
            err.push(Object.assign(msg, line, info))
            record2.push(null)
          }
        } else if (typeof field === 'object') {
          if (allowListValues) {
            record2.push(JSON.stringify(field))
          } else {
            const msg  = {msg: 'Objects are not allowed as fields'}
            const line = verbose > 0 ? {line: -1}                    : {}
            const info = verbose > 1 ? {info: JSON.stringify(field)} : {}
            err.push(Object.assign(msg, line, info))
            record2.push(null)
          }
        } else {
          const msg  = {msg: 'Type not allowed as field'}
          const line = verbose > 0 ? {line: -1}                                      : {}
          const info = verbose > 1 ? {info: `${field.toString()} (${typeof field})`} : {}
          err.push(Object.assign(msg, line, info))
        }
      }

      records.push(record2)
    }

    return {err: [], records}
  }

  function controlFixedLength (records) {
    const err      = []
    const records2 = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]

      if (keys.length === 0) keys = record

      if (headerIsSet && keys.length !== record.length) {
        const msg  = {msg: 'Number of values does not match number of headers'}
        const line = verbose > 0 ? {line: -1}                                                             : {}
        const info = verbose > 1 ? {info: `values [${record.join(',')}] and headers [${keys.join(',')}]`} : {}
        
        err.push(Object.assign(msg, line, info))
      } else {
        records2.push(record)
      }
    }

    return {err, records: records2}
  }

  function removeWhitespaces (record) {
    const record2 = []
    for (let i = 0; i < record.length; i++) {
      const value  = record[i]
      const value2 = value.replace(/^\s+|\s+$/g, '')
      record2.push(value2)
    }
    return record2
  }

  function emptyToNull (record) {
    const record2 = []
    for (let i = 0; i < record.length; i++) {
      const value  = record[i]
      const value2 = value === '' ? null : value
      record2.push(value2)
    }
    return record2
  }

  function removeNulls (record) {
    const record2 = []
    for (let i = 0; i < record.length; i++) {
      const value = record[i]
      if (value !== null && typeof value !== 'undefined') record2.push(value)
    }
    return record2
  }

  function replaceNulls (record) {
    if (headerIsSet) {
      const record2 = []
      for (let i = 0; i < keys.length; i++) {
        const value = record[i]
        if (value === null || typeof value === 'undefined') record2.push(nullAs)
        else record2.push(value)
      }
      return record2
    }
    return record
  }
}

module.exports = {
  func
}