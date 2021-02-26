const {func} = require('./shared/func')
const {delimiter, quote, escape, header, headerPrefix, skipHeader, fixedLength, skipEmptyValues, trimWhitespaces, emptyAsNull, skipNull, missingAsNull} = require('./shared/opts')

module.exports = {
  name: 'dsv',
  desc: 'Deserializes delimiter-separated values.',
  opts: [
    delimiter({required: true}),
    quote({required: true}),
    escape({required: true}),
    header({required: true}),
    headerPrefix({defaultValues: ['_']}),
    skipHeader(),
    fixedLength(),
    skipEmptyValues(),
    trimWhitespaces(),
    emptyAsNull(),
    skipNull(),
    missingAsNull()
  ],
  func
}