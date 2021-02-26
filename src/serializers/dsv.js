const {func} = require('./shared/func')
const {allowListValues, delimiter, emptyAsNull, escape, fixedLength, header, missingAs, quote, recordSeparator, skipHeader, skipNull, trimWhitespaces} = require('./shared/opts')

module.exports = {
  name: 'dsv',
  desc: 'Serializes as delimiter-separated values.',
  opts: [
    delimiter({required: true}),
    quote({required: true}),
    escape({required: true}),
    header({required: true}),
    recordSeparator({required: true}),
    skipHeader(),
    allowListValues(),
    fixedLength(),
    trimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAs()
  ],
  func
}