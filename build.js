const Metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const templates = require('metalsmith-templates')
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
    .use(templates({
        engine: 'handlebars',
        partials: {
            header: 'partials/header',
            footer: 'partials/footer'
        }
    }))
    .destination('./build')
    .build(function (err) { if (err) console.log(err) })