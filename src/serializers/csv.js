const {func} = require('./shared/func')
const {allowListValues, delimiter, emptyAsNull, escape, noFixedLength, header, missingAs, quote, recordSeparator, skipHeader, skipNull, trimWhitespaces} = require('./shared/opts')

module.exports = {
  name: 'csv',
  desc: 'Serializes as comma-separated values.',
  opts: [
    delimiter({defaultValues: [',']}),
    quote({defaultValues: ['"']}),
    escape({defaultValues: ['"']}),
    header({defaultValues: ['[]'], descDefault: '[]'}),
    recordSeparator({defaultValues: ['\n'], descDefault: '\\n'}),
    skipHeader(),
    allowListValues(),
    noFixedLength(),
    trimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAs()
  ],
  func
}