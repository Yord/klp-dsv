const {func} = require('./shared/func')
const {allowListValues, delimiter, emptyAsNull, escape, fixedLength, header, missingAs, quote, recordSeparator, noSkipHeader, skipNull, trimWhitespaces} = require('./shared/opts')

module.exports = {
  name: 'ssv',
  desc: 'Serializes as space-separated values.',
  opts: [
    delimiter({defaultValues: [' '], descDefault: '\\s'}),
    quote({defaultValues: ['"']}),
    escape({defaultValues: ['"']}),
    header({defaultValues: ['[]'], descDefault: '[]'}),
    recordSeparator({defaultValues: ['\n'], descDefault: '\\n'}),
    noSkipHeader(),
    allowListValues(),
    fixedLength(),
    trimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAs()
  ],
  func
}