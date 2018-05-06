module.exports = (context, defaults) => {
    let html = `<!DOCTYPE html>
        <html lang="${context.lang || defaults.lang}">
        <head>
            <title>${context.title || defaults.title}</title>
            <meta charset="${context.charset || defaults.charset}">
            <meta name="description" content="${context.description || defaults.description}">
            <meta name="keywords" content="${context.keywords || defaults.keywords}">
            <meta name="author" content="${context.author || defaults.author}">
            ${
            context.hasOwnProperty('extra')
                ? context.extra.length
                ? context.extra.map(value => `<meta ${value}>`)
                : ''
                : ''
            }
            <meta name="description" content="${context.description || defaults.description}">
            ${
            context.hasOwnProperty('stylesheets')
                ? context.stylesheets.length
                ? context.stylesheets.map(value => `<link rel="stylesheet" href="${value}">`)
                : ''
                : defaults.stylesheets.map(value => `<link rel="stylesheet" href="${value}">`)
            }
            ${
            context.hasOwnProperty('scripts')
                ?context.scripts.length
                ?context.scripts.map(value => `<script src="${value}"></script>`)
                :''
                :defaults.scripts.map(value => `<script src="${value}"></script>`)
            }
            <link rel="icon" type="image/png" href="${context.favicon || defaults.favicon}">
        </head>
        <body>
            ${md.render(pageContent)}
        </body>
        </html>
    `
    return html
}