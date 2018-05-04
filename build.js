const Metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const layouts = require('metalsmith-layouts')
const collections = require('metalsmith-collections')
const permalinks = require('metalsmith-permalinks')

Metalsmith(__dirname)
    .use(collections({
        // pages: {
        //     pattern: 'pages/*.md'
        // },
        articles: {
            pattern: 'articles/*.md',
            sortBy: 'date'
        }
    }))
    .use(markdown())
    .use(permalinks({
        pattern: ':collections/:title'
    }))
    .use(layouts({
        engine: 'handlebars',
        directory: 'layouts'
    }))
    .destination('./build')
    .build(function (err) { if (err) console.log(err) })