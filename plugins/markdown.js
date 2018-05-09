const path = require('path')
const markdown = require('markdown').markdown

module.exports = (config) => {
    config = Object.assign({}, {
        match: '.md'
    }, config)

    return {
        name: 'markdown',
        async run(file, files, state, generator) {
            if (path.extname(file.src) !== '.md') {
                return file
            }

            file.content = markdown.toHTML(file.content)
            return file
        }
    }
}