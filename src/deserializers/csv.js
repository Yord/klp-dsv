const {func} = require('./shared/func')
const {delimiter, quote, escape, header, headerPrefix, skipHeader, noFixedLength, skipEmptyValues, trimWhitespaces, emptyAsNull, skipNull, missingAsNull} = require('./shared/opts')

module.exports = {
  name: 'csv',
  desc: 'Deserializes comma-separated values.',
  opts: [
    delimiter({defaultValues: [',']}),
    quote({defaultValues: ['"']}),
    escape({defaultValues: ['"']}),
    header({defaultValues: ['[]'], descDefault: '[]'}),
    headerPrefix({defaultValues: ['_']}),
    skipHeader(),
    noFixedLength(),
    skipEmptyValues(),
    trimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAsNull()
  ],
  func
}