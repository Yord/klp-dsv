const delimiter = ({defaultValues, descDefault, required}) => ({
  key:   'delimiter',
  types: ['char'],
  args:  ['-d', '--delimiter'],
  ...maybe('defaultValues', defaultValues),
  ...maybe('descDefault', descDefault),
  ...maybe('required', required),
  desc:  'Delimiter used to separate values.'
})

const quote = ({defaultValues, descDefault, required}) => ({
  key:   'quote',
  types: ['char'],
  args:  ['-q', '--quote'],
  ...maybe('defaultValues', defaultValues),
  ...maybe('descDefault', descDefault),
  ...maybe('required', required),
  desc:  'Character used to quote strings.'
})

const escape = ({defaultValues, descDefault, required}) => ({
  key:   'escape',
  types: ['char'],
  args:  ['-e', '--escape'],
  ...maybe('defaultValues', defaultValues),
  ...maybe('descDefault', descDefault),
  ...maybe('required', required),
  desc:  'Character used to escape quotes.'
})

const header = ({defaultValues, descDefault, required}) => ({
  key:   'header',
  types: ['json'],
  args:  ['-h', '--header'],
  ...maybe('defaultValues', defaultValues),
  ...maybe('descDefault', descDefault),
  ...maybe('required', required),
  desc:  'Provide a custom header.'
})

const skipHeader = () => ({
  key:   'skipHeader',
  types: [],
  args:  ['-H', '--skip-header'],
  desc:  'Do not interpret first line as header.'
})

const noSkipHeader = () => ({
  ...skipHeader(),
  args:          ['-H', '--no-skip-header'],
  defaultValues: [-1],
  reverse:       true,
  descDefault:   '',
  desc:          'Interpret first line as header.'
})

const fixedLength = prefix => () => ({
  key:   'fixedLength',
  types: [],
  args:  ['-f', '--fixed-length'],
  desc:  `${prefix}: Controls, whether each line has the same number of values. Ignores all deviating lines while reporting errors.`
})

const noFixedLength = prefix => () => ({
  ...fixedLength(prefix)(),
  args:          ['-f', '--no-fixed-length'],
  defaultValues: [-1],
  reverse:       true,
  descDefault:   ''
})

const trimWhitespaces = prefix => () => ({
  key:   'trimWhitespaces',
  types: [],
  args:  ['-w', '--trim-whitespaces'],
  desc:  `${prefix}: Trim whitespaces from values.`
})

const emptyAsNull = prefix => () => ({
  key:   'emptyAsNull',
  types: [],
  args:  ['-n', '--empty-as-null'],
  desc:  `${prefix}: Treat empty fields as null.`
})

const skipNull = prefix => () => ({
  key:   'skipNull',
  types: [],
  args:  ['-N', '--skip-null'],
  desc:  `${prefix}: Skip values that are null.`
})

module.exports = {
  delimiter,
  quote,
  escape,
  header,
  skipHeader,
  noSkipHeader,
  fixedLength,
  noFixedLength,
  trimWhitespaces,
  emptyAsNull,
  skipNull,
  maybe
}

function maybe (key, value) {
  return typeof value === 'undefined' ? {} : {[key]: value}
}