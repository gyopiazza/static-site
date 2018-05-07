const path = require('path')
const frontmatter = require('gray-matter')

module.exports = (config) => {
    config = Object.assign({}, {
        match: '.md'
    }, config)

    return {
        async run(file, files, globals, generator) {
            if (path.extname(file.src) !== '.md') {
                return file
            }

            let fm = frontmatter(file.content)
            // file.meta = fm.data
            // file.content = fm.content

            file = Object.assign({}, file, fm.data, { content: fm.content })

            return file
        }
    }
}