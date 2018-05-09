'use strict'

const path = require('path')
const metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const assets = require('metalsmith-assets')
const layouts = require('metalsmith-layouts')
const inplace = require('metalsmith-in-place')
const multiLanguage = require('metalsmith-multi-language')
const permalinks = require('metalsmith-permalinks')
const i18n = require('metalsmith-i18n')
const collections = require('metalsmith-collections')

// CONFIG

const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'es']

const dir = {
  base: __dirname + '/',
//   lib: __dirname + '/lib/',
  source: './content/',
  dest: './build/'
}

const layoutsConfig = {
//   engine: 'handlebars',
  directory: dir.source + 'layouts/',
  partials: dir.source + 'layouts/partials/',
  default: 'page.hbs'
}

const assetsConfig = {
    source: 'assets'
}

// END CONFIG

metalsmith(__dirname)
    .source(dir.source)
    .destination(dir.dest)
    .use(collections({
        'recipes_en': 'recipes/*_en.md',
        'recipes_es': 'recipes/*_es.md'
    }))
    .use(multiLanguage({
        default: DEFAULT_LOCALE,
        locales: LOCALES
    }))
    .use(i18n({
        default: DEFAULT_LOCALE,
        locales: LOCALES,
        directory: 'locales'
    }))
    .use(markdown())
    .use(permalinks({
        relative: false,
        pattern: ':locale/:title/',
        linksets: [{
            match: { collection: 'recipes_en' },
            pattern: ':locale/recipes/:title/'
        }, {
            match: { collection: 'recipes_es' },
            pattern: ':locale/recetas/:title/'
        }]
    }))
    .use(layouts(layoutsConfig))
    .use(assets(assetsConfig))
    .build(function (err) {
        if (err) { console.error(err) }
    })
