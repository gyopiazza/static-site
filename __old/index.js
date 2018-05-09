const Metalsmith = require('metalsmith')
const metalsmith = Metalsmith(__dirname)
const collections = require('metalsmith-collections')
const localizeCollection = require('metalsmith-localize-collection')
const archives = require('metalsmith-collections-archive')
const markdown = require('metalsmith-markdown')
const layouts = require('metalsmith-layouts')
const permalinks = require('metalsmith-permalinks')
const slug = require('metalsmith-slug')
const languages = require('metalsmith-multi-language')
const i18n = require('metalsmith-i18n')
const browserSync = require('metalsmith-browser-sync')


function myPlugin(opts) {

  // return the function to be given to the `.use` call.
  return function (files, metalsmith, done) {

    for (let file in files) {
      console.log(file, files[file])
    }

    // ...do something with `files` here...

    done()
  }
}

console.time('build');

// Environment
let watch = false;
let prod = false;
process.argv.forEach(function (val) {
  if (val === '--serve') {
    watch = true;
  }
  if (val === '--prod') {
    prod = true;
  }
});

// Config
const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'es']
const DIR = {
  base: __dirname + '/',
  //   lib: __dirname + '/lib/',
  source: __dirname + '/content/',
  dest: __dirname + '/build/'
}

// Watch for file changes and hot-reload in development mode
if (watch) {
  metalsmith.use(browserSync({
    server: "build",
    startPath: "/index.html",
    files: ["content/**/*", "layouts/**/*.html", "partials/**/*.html"],
    reloadDelay: 100
  }))
}

// Initialize the build
metalsmith
  // Metadata globally available in the templates
  .metadata({
    title: "My Static Site & Blog",
    description: "It's about saying »Hello« to the World.",
    url: "http://www.mywebsite.io/"
  })
  .source(DIR.source)
  .destination(DIR.dest)
  .clean(true)
  .use(languages({
    default: DEFAULT_LOCALE,
    locales: LOCALES
  }))
  .use(i18n({
    default: DEFAULT_LOCALE,
    locales: LOCALES,
    directory: 'locales'
  }))
  // .use(collections({
  //   posts: {
  //     pattern: 'posts/*/!(index).md',
  //     sortBy: 'date',
  //     reverse: true
  //   }
  // }))
  // .use(localizeCollection('posts'))
  .use(collections({
    posts_en: 'posts/en/*.md',
    posts_es: 'posts/es/*.md',
    products_en: 'products/en/*.md',
    products_es: 'products/es/*.md'
  }))
  // .use(myPlugin())
  // .use(archives({
  //   layout: 'archive.html',
  //   metadata: false,
  //   rootLevel: false
  // }))
  .use(slug({
    property: 'title',
    patterns: ['*.md'] // Defaults to all files
  }))
  .use(markdown())
  .use(permalinks({
    relative: false,
    pattern: ':locale/:slug/',
    linksets: [
      {
        match: { collection: 'posts_en' },
        pattern: ':locale/posts/:slug/'
      },
      {
        match: { collection: 'posts_es' },
        pattern: ':locale/articulos/:slug/'
      },
      {
        match: { collection: 'products_en' },
        pattern: ':locale/products/:slug/'
      },
      {
        match: { collection: 'products_es' },
        pattern: ':locale/productos/:slug/'
      }
    ]
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: 'layouts'
  }))
  .build(function(err, files) {
    console.timeEnd('build')
    if (err) { throw err }
  })
