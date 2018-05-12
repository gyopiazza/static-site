const path = require('path')
const Generator = require('./generator')
const debug = require('./plugins/debug')
const frontmatter = require('./plugins/frontmatter')
const markdown = require('./plugins/markdown')
const handlebars = require('./plugins/handlebars')
const languages = require('./plugins/languages')
const permalinks = require('./plugins/permalinks')
const slug = require('./plugins/slug')
const collections = require('./plugins/collections')
const query = require('./plugins/query')

const generator = new Generator()

generator.use(debug())
generator.use(languages({
  locales: ['en', 'es'],
  defaultLocale: 'en'
}))
generator.use(collections({
  posts: {
    match: 'posts/**/*.md'
  }
}))
generator.use(frontmatter())
generator.use(slug())
generator.use(markdown())
generator.use(handlebars())
generator.use(permalinks({
  match: '*.md',
  routes: [
    {
      pattern: '{locale}/{slug}'
    },
    {
      match: [{ collection: 'products', locale: 'en' }],
      pattern: '{locale}/products/{slug}'
    },
    {
      match: [{ collection: 'products', locale: 'es' }],
      pattern: '{locale}/productos/{slug}'
    },
    {
      match: [{ collection: 'posts', locale: 'en' }],
      pattern: '{locale}/posts/{slug}'
    },
    {
      match: [{ collection: 'posts', locale: 'es' }],
      pattern: '{locale}/articulos/{slug}'
    }
  ]
}))
// generator.use(query())

generator.build(() => console.log('Done!'))

// console.log('one', get(test, 'one'))
// console.log('two.id', get(test, 'two.id'))
// console.log('three.0.id',get(test, 'three.0.id'))

// const checkProps = (obj, props) => {
//   let match = false

//   props.forEach(prop => {
//     let keys = Object.keys(prop)
//     let values = Object.values(prop)
//     let matches = 0

//     keys.forEach((key, index) => {
//       if (obj[key] && obj[key] === values[index]) {
//         ++matches
//       }
//     })

//     // Make sure that the all the keys rules are met
//     match = matches === keys.length
//   })

//   return match
// }

// let routes = [{
//   match: [{ collection: 'products' }], // match any property and value
//   pattern: '{locale}/posts/{slug}'
// }]

// let file = {
//   name: 'filename.md',
//   collection: 'products'
// }

// routes.forEach(route => {
//   // console.log(match)
//   // let match = route.match.filter(checkProps)

//   // route.match

//   // console.log(match.length > 0)

//   if (checkProps(file, route.match)) {
//     console.log('Match!')
//   } else {
//     console.log('No match...')
//   }
// })