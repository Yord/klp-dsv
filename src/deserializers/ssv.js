const {func} = require('./shared/func')
const {delimiter, quote, escape, header, headerPrefix, noSkipHeader, fixedLength, noSkipEmptyValues, noTrimWhitespaces, emptyAsNull, skipNull, missingAsNull} = require('./shared/opts')

module.exports = {
  name: 'ssv',
  desc: 'Deserializes space-separated values.',
  opts: [
    delimiter({defaultValues: [' '], descDefault: '\\s'}),
    quote({defaultValues: ['"']}),
    escape({defaultValues: ['"']}),
    header({defaultValues: ['[]'], descDefault: '[]'}),
    headerPrefix({defaultValues: ['_']}),
    noSkipHeader(),
    fixedLength(),
    noSkipEmptyValues(),
    noTrimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAsNull()
  ],
  func
}