const {func} = require('./shared/func')
const {allowListValues, delimiter, emptyAsNull, escape, noFixedLength, header, missingAs, quote, recordSeparator, skipHeader, skipNull, trimWhitespaces} = require('./shared/opts')

module.exports = {
  name: 'tsv',
  desc: 'Serializes as tab-separated values.',
  opts: [
    delimiter({defaultValues: ['\t'], descDefault: '\\t'}),
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