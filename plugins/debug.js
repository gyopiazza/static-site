const path = require('path')

module.exports = (config) => {
    config = Object.assign({}, {
    }, config)
    let counter = 0

    console.time('Build time')

    return {
        async init(files, globals, generator) {
            console.log('Files found:', files.length)
        },
        async run(file, files, globals, generator) {
            counter++
            return file
        },
        async end(files, globals, generator) {
            console.log('Files processed:', counter)
            console.timeEnd('Build time')
        }
    }
}