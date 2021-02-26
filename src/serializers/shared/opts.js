const {delimiter, emptyAsNull, escape, fixedLength, header, maybe, noFixedLength, noSkipHeader, quote, skipHeader, skipNull, trimWhitespaces} = require('../../shared/opts')

const recordSeparator = ({defaultValues, descDefault, required}) => ({
  key:   'recordSeparator',
  types: ['char'],
  args:  ['-r', '--record-separator'],
  ...maybe('defaultValues', defaultValues),
  ...maybe('descDefault', descDefault),
  ...maybe('required', required),
  desc:  'Character used to separate records.'
})

const allowListValues = () => ({
  key:   'allowListValues',
  types: [],
  args:  ['-l', '--allow-list-values'],
  desc:  'If this flag is set, lists and objects are allowed in csv values. They are encoded as JSON.'
})

const missingAs = () => ({
  key:   'missingAs',
  types: ['string'],
  args:  ['-m', '--missing-as'],
  desc:  'Pre-processing #5: Fill missing fields with this.'
})

module.exports = {
  delimiter,
  quote,
  escape,
  header,
  recordSeparator,
  skipHeader,
  noSkipHeader,
  allowListValues,
  fixedLength: fixedLength('Pre-processing #1'),
  noFixedLength: noFixedLength('Pre-processing #1'),
  trimWhitespaces: trimWhitespaces('Pre-processing #2'),
  emptyAsNull: emptyAsNull('Pre-processing #3'),
  skipNull: skipNull('Pre-processing #4'),
  missingAs
}