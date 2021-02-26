const {array, assert, base64, boolean, constant, integer, oneof, property} = require('fast-check')
const unicodeStringJsonObjectListFixedLength = require('../../shared/unicodeStringJsonObjectListFixedLength')
const whitespace = require('../../shared/whitespace')
const {func: serializerFactory} = require('./func')

const recordSeparators = ['\n', '\r\n', '|', '@'].map(constant)
const delimiters       = [',', ';', '.', '/', '-', '+', '$', '#', '!'].map(constant)
const quoteOrEscape    = ["'", '"', '`', '\\'].map(constant)

test('serializes a dsv file without provided header', () => {
  const err          = []

  const jsonsStrArgv = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
                const str = (
                  [Object.keys(jsons[0]).join(delimiter)]
                  .concat(jsons.map(json => Object.values(json).join(delimiter)))
                  .join(recordSeparator) + recordSeparator
                )

                return {
                  jsons,
                  str,
                  argv: {
                    verbose: 0,
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header: '[]',
                    fixedLength
                  }
                }
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgv, ({jsons, str, argv}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with provided header', () => {
  const err          = []

  const jsonsStrArgv = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons => {
                const len = Object.keys(jsons[0]).length

                return array(base64(), len, len).map(keys => {
                  const headers = keys.map(key =>
                    key.indexOf(delimiter) > -1 ? quote + key + quote : key
                  )

                  const _jsons  = jsons.map(json =>
                    Object.values(json).reduce((acc, value, i) => ({...acc, [keys[i]+i]: value}), {})
                  )
                  const str = (
                    [headers.join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  )
                  const header = '[' + keys.map(key => '"' + key + '"').join(',') + ']'
      
                  return {
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose: 0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header,
                      fixedLength
                    }
                  }
                })
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgv, ({jsons, str, argv}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with provided header and skipHeader', () => {
  const err          = []

  const jsonsStrArgv = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons => {
                const len = Object.keys(jsons[0]).length

                return array(base64(), len, len).map(keys => {
                  const _jsons = jsons.map(json =>
                    Object.values(json).reduce((acc, value, i) => ({...acc, [keys[i]+i]: value}), {})
                  )
                  const str = (
                    _jsons.map(json => Object.values(json).join(delimiter))
                    .join(recordSeparator) + recordSeparator
                  )
                  const header = '[' + keys.map(key => '"' + key + '"').join(',') + ']'
      
                  return {
                    jsons: _jsons,
                    str,
                    argv: {
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header,
                      skipHeader: true,
                      fixedLength
                    }
                  }
                })
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgv, ({jsons, str, argv}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file without provided header and skipHeader', () => {
  const err          = []

  const jsonsStrArgv = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).map(jsons => {
                const _jsons  = jsons.map(json => Object.values(json))
                const str = (
                  _jsons.map(json => Object.values(json).join(delimiter))
                  .join(recordSeparator) + recordSeparator
                )
    
                return {
                  jsons: _jsons,
                  str,
                  argv: {
                    verbose: 0,
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header:     '[]',
                    skipHeader: true,
                    fixedLength
                  }
                }
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgv, ({jsons, str, argv}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with variable values lengths and the fixed length option', () => {
  const jsonsStrArgvErr = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 3).chain(jsons => 
              integer(0, jsons.length - 1).map(noOfDeletes => {
                const _jsons = (
                  [jsons[0]]
                  .concat(
                    jsons.slice(1, noOfDeletes + 1).map(json => {
                      const keys = Object.keys(json)
                      return (
                        keys
                        .slice(0, -1)
                        .reduce((acc, key, i) => ({...acc, [key+i]: Object.values(json)[i]}), {})
                      )
                    })
                  ).concat(
                    jsons.slice(noOfDeletes + 1)
                  )
                )
                
                const str = noOfDeletes === 0 ? (
                  [Object.keys(_jsons[0]).join(delimiter)]
                  .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                  .join(recordSeparator) + recordSeparator
                ) : (
                  [Object.keys(_jsons[0]).join(delimiter)]
                  .concat(Object.values(_jsons[0]).join(delimiter))
                  .concat(
                    _jsons.slice(noOfDeletes + 1).map(json => Object.values(json).join(delimiter))
                  ).join(recordSeparator) + recordSeparator
                )

                const err = []
                for (let i = 0; i < noOfDeletes; i++) {
                  const msg = {msg: 'Number of values does not match number of headers'}
                  err.push(msg)
                }
    
                return {
                  noOfDeletes,
                  err,
                  jsons: _jsons,
                  str,
                  argv: {
                    verbose:         0,
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    fixedLength:     true
                  }
                }
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with variable values lengths and the fixed length option with lines', () => {
  const jsonsStrArgvErr = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 3).chain(jsons => 
              integer(0, jsons.length - 1).map(noOfDeletes => {
                const _jsons = (
                  [jsons[0]]
                  .concat(
                    jsons.slice(1, noOfDeletes + 1).map(json => {
                      const keys = Object.keys(json)
                      return (
                        keys
                        .slice(0, -1)
                        .reduce((acc, key, i) => ({...acc, [key+i]: Object.values(json)[i]}), {})
                      )
                    })
                  ).concat(
                    jsons.slice(noOfDeletes + 1)
                  )
                )
                
                const str = noOfDeletes === 0 ? (
                  [Object.keys(_jsons[0]).join(delimiter)]
                  .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                  .join(recordSeparator) + recordSeparator
                ) : (
                  [Object.keys(_jsons[0]).join(delimiter)]
                  .concat(Object.values(_jsons[0]).join(delimiter))
                  .concat(
                    _jsons.slice(noOfDeletes + 1).map(json => Object.values(json).join(delimiter))
                  ).join(recordSeparator) + recordSeparator
                )

                const err = []
                for (let i = 0; i < noOfDeletes; i++) {
                  const msg = {msg: 'Number of values does not match number of headers', line: -1}
                  err.push(msg)
                }
    
                return {
                  noOfDeletes,
                  err,
                  jsons: _jsons,
                  str,
                  argv: {
                    verbose:         1,
                    recordSeparator,
                    delimiter,
                    quote,
                    escape,
                    header:          '[]',
                    fixedLength:     true
                  }
                }
              })
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('deserializes a dsv file and trim whitespaces', () => {
  const err                 = []

  const jsonsStrArgv = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape]).chain(jsons =>
                whitespace().map(ws => {
                  const _jsons = jsons.map(json => {
                    return Object.keys(json).reduce(
                      (acc, key) => ({
                        ...acc,
                        [ws + key.replace(/^\s+|\s+$/g, '') + ws]: ws + json[key].replace(/^\s+|\s+$/g, '') + ws
                      }),
                      {}
                    )
                  })

                  const str = (
                    [Object.keys(_jsons[0]).map(key => key.replace(/^\s+|\s+$/g, '')).join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).map(value => value.replace(/^\s+|\s+$/g, '')).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  )

                  return {
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:         0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:          '[]',
                      fixedLength,
                      trimWhitespaces: true
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgv, ({jsons, str, argv}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file and convert empty values to nulls', () => {
  const jsonsChunksArgvErr = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
                integer(0, jsons.length - 1).map(noOfNulls => {
                  const err = []

                  const _jsons = noOfNulls === 0 ? (
                    jsons
                  ) : (
                    jsons
                    .slice(0, noOfNulls)
                    .map(json =>
                      Object.keys(json)
                      .reduce((acc, key, id) => ({...acc, [key+id]: ''}), {})
                    )
                    .concat(jsons.slice(noOfNulls))
                  )

                  const str = noOfNulls === 0 ? (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  ) : (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(
                      _jsons.slice(0, noOfNulls).map(json => Object.values(json).map(() => 'null').join(delimiter))
                    )
                    .concat(
                      _jsons.slice(noOfNulls).map(json => Object.values(json).join(delimiter))
                    )
                    .join(recordSeparator) + recordSeparator
                  )
                  
                  return {
                    noOfNulls,
                    err,
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:     0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:      '[]',
                      fixedLength,
                      emptyAsNull: true
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsChunksArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file and skip null and undefined values', () => {
  const jsonsStrArgvErr = (
    oneof(...[null, undefined].map(constant)).chain(n =>
      oneof(...recordSeparators).chain(recordSeparator =>
        oneof(...delimiters).chain(delimiter =>
          oneof(...quoteOrEscape).chain(quote =>
            oneof(...quoteOrEscape).chain(escape =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 3).chain(jsons => 
                integer(0, Object.keys(jsons[0]).length - 1).map(noOfNulls => {
                  const err = []

                  const _jsons = (
                    [jsons[0]]
                    .concat(
                      jsons.slice(1).map(json => {
                        const keys = Object.keys(json)
                        return keys.reduce(
                          (acc, key, i) => ({
                            ...acc,
                            [key]: i < keys.length - noOfNulls ? json[key] : n
                          }),
                          {}
                        )
                      })
                    )
                  )

                  const str = noOfNulls === 0 ? (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  ) : (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(Object.values(_jsons[0]).join(delimiter))
                    .concat(
                      _jsons.slice(1).map(json =>
                        Object.values(json).slice(0, Object.keys(json).length - noOfNulls).join(delimiter)
                      )
                    )
                    .join(recordSeparator) + recordSeparator
                  )
                  
                  return {
                    noOfNulls,
                    err,
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:  0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:   '[]',
                      skipNull: true
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsStrArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file and fill missing values with a filling string', () => {
  const jsonsStrArgvErr = (
    base64().chain(nullAs =>
      oneof(...recordSeparators).chain(recordSeparator =>
        oneof(...delimiters).chain(delimiter =>
          oneof(...quoteOrEscape).chain(quote =>
            oneof(...quoteOrEscape).chain(escape =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 3).chain(jsons =>
                integer(0, Object.keys(jsons[0]).length - 1).map(noOfNulls => {
                  let _nullAs   = ''
                  let addQuotes = false
                  for (let at = 0; at < nullAs.length; at++) {
                    const ch = nullAs[at]
                    if (ch === delimiter) {
                      addQuotes = true
                      _nullAs  += delimiter
                    }
                    else if(ch === quote) {
                      addQuotes = true
                      _nullAs  += escape + quote
                    } else _nullAs += ch
                  }
                  if (addQuotes) _nullAs = quote + _nullAs + quote

                  const err = []

                  const _jsons = (
                    [jsons[0]]
                    .concat(
                      jsons.slice(1).map(json => {
                        const keys = Object.keys(json)
                        return keys.reduce(
                          (acc, key, i) => i < keys.length - noOfNulls ? {...acc, [key]: json[key]} : acc,
                          {}
                        )
                      })
                    )
                  )

                  const str = noOfNulls === 0 ? (
                    [Object.keys(jsons[0]).join(delimiter)]
                    .concat(jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  ) : (
                    [Object.keys(jsons[0]).join(delimiter)]
                    .concat(Object.values(jsons[0]).join(delimiter))
                    .concat(
                      jsons.slice(1).map(json =>
                        Object.values(json).slice(0, Object.keys(json).length - noOfNulls)
                        .concat(Object.values(json).slice(Object.keys(json).length - noOfNulls).map(() => _nullAs))
                        .join(delimiter)
                      )
                    )
                    .join(recordSeparator) + recordSeparator
                  )

                  return {
                    noOfNulls,
                    err,
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:   0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:    '[]',
                      nullAs
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )

  assert(
    property(jsonsStrArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with delimiters embedded in values', () => {
  const jsonsChunksArgvErr = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
                integer(0, jsons.length - 1).map(noOfDelimiterLines => {
                  const err = []

                  const _jsons = noOfDelimiterLines === 0 ? (
                    jsons
                  ) : (
                    jsons
                    .slice(0, noOfDelimiterLines)
                    .map(json =>
                      Object.keys(json)
                      .reduce((acc, key, id) => ({...acc, [key+id]: json[key] + delimiter + json[key]}), {})
                    )
                    .concat(jsons.slice(noOfDelimiterLines))
                  )

                  const str = noOfDelimiterLines === 0 ? (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  ) : (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(
                      _jsons.slice(0, noOfDelimiterLines)
                      .map(json => Object.values(json).map(value => quote + value + quote).join(delimiter))
                    )
                    .concat(
                      _jsons.slice(noOfDelimiterLines).map(json => Object.values(json).join(delimiter))
                    )
                    .join(recordSeparator) + recordSeparator
                  )
                  
                  return {
                    noOfNulls: noOfDelimiterLines,
                    err,
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:     0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:      '[]',
                      fixedLength,
                      emptyAsNull: true
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsChunksArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})

test('serializes a dsv file with quotes embedded in values', () => {
  const jsonsChunksArgvErr = (
    oneof(...recordSeparators).chain(recordSeparator =>
      oneof(...delimiters).chain(delimiter =>
        oneof(...quoteOrEscape).chain(quote =>
          oneof(...quoteOrEscape).chain(escape =>
            boolean().chain(fixedLength =>
              unicodeStringJsonObjectListFixedLength([delimiter, quote, escape], 2).chain(jsons => 
                integer(0, jsons.length - 1).map(noOfQuoteLines => {
                  const err = []

                  const _jsons = noOfQuoteLines === 0 ? (
                    jsons
                  ) : (
                    jsons
                    .slice(0, noOfQuoteLines)
                    .map(json =>
                      Object.keys(json)
                      .reduce((acc, key, id) => ({...acc, [key+id]: json[key] + quote + json[key]}), {})
                    )
                    .concat(jsons.slice(noOfQuoteLines))
                  )

                  const str = noOfQuoteLines === 0 ? (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(_jsons.map(json => Object.values(json).join(delimiter)))
                    .join(recordSeparator) + recordSeparator
                  ) : (
                    [Object.keys(_jsons[0]).join(delimiter)]
                    .concat(
                      _jsons.slice(0, noOfQuoteLines)
                      .map(json =>
                        Object.values(json)
                        .map(value =>
                          quote +
                          value.split('').reduce(
                            (str, ch) => str + (ch === quote ? escape + ch : ch),
                            ""
                          ) +
                          quote
                        )
                        .join(delimiter)
                      )
                    )
                    .concat(
                      _jsons.slice(noOfQuoteLines).map(json => Object.values(json).join(delimiter))
                    )
                    .join(recordSeparator) + recordSeparator
                  )
                  
                  return {
                    noOfNulls: noOfQuoteLines,
                    err,
                    jsons: _jsons,
                    str,
                    argv: {
                      verbose:     0,
                      recordSeparator,
                      delimiter,
                      quote,
                      escape,
                      header:      '[]',
                      fixedLength,
                      emptyAsNull: true
                    }
                  }
                })
              )
            )
          )
        )
      )
    )
  )
  
  assert(
    property(jsonsChunksArgvErr, ({jsons, str, argv, err}) =>
      expect(
        serializerFactory(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      )
    )
  )
})