const {delimiter, emptyAsNull, escape, fixedLength, header, maybe, noFixedLength, noSkipHeader, quote, skipHeader, skipNull, trimWhitespaces} = require('../../shared/opts')

const headerPrefix = ({defaultValues}) => ({
  key:   'headerPrefix',
  types: ['string'],
  args:  ['-p', '--header-prefix'],
  ...maybe('defaultValues', defaultValues),
  desc:  'If more values are given than headers, the prefix is used to generate header names.'
})

const skipEmptyValues = () => ({
  key:   'skipEmptyValues',
  types: [],
  args:  ['-E', '--skip-empty-values'],
  desc:  'Post-processing #2: Skip empty strings.'
})

const noSkipEmptyValues = () => ({
  ...skipEmptyValues(),
  args:          ['-E', '--no-skip-empty-values'],
  defaultValues: [-1],
  reverse:       true,
  descDefault:   '',
  desc:          'Post-processing #2: Do not skip empty strings.'
})

const noTrimWhitespaces = () => ({
  ...trimWhitespaces('Post-processing #3')(),
  args:          ['-w', '--no-trim-whitespaces'],
  defaultValues: [-1],
  reverse:       true,
  descDefault:   '',
  desc:          'Post-processing #3: Do not trim whitespaces from values.'
})

const missingAsNull = () => ({
  key:   'missingAsNull',
  types: [],
  args:  ['-m', '--missing-as-null'],
  desc:  'Post-processing #6: Fill missing fields with null.'
})

module.exports = {
  delimiter,
  quote,
  escape,
  header,
  headerPrefix,
  skipHeader,
  noSkipHeader,
  fixedLength: fixedLength('Post-processing #1'),
  noFixedLength: noFixedLength('Post-processing #1'),
  skipEmptyValues,
  noSkipEmptyValues,
  trimWhitespaces: trimWhitespaces('Post-processing #3'),
  noTrimWhitespaces,
  emptyAsNull: emptyAsNull('Post-processing #4'),
  skipNull: skipNull('Post-processing #5'),
  missingAsNull
}