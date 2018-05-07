const path = require('path')
const Generator = require('./generator')
const debug = require('./plugins/debug')
const frontmatter = require('./plugins/frontmatter')
const markdown = require('./plugins/markdown')
const handlebars = require('./plugins/handlebars')
const languages = require('./plugins/languages')
const permalinks = require('./plugins/permalinks')

const generator = new Generator()

generator.use(debug())
generator.use(languages({
  locales: ['en', 'es'],
  defaultLocale: 'en'
}))
generator.use(frontmatter())
generator.use(markdown())
generator.use(handlebars())
generator.use(permalinks())

generator.build(() => console.log('Done!'))