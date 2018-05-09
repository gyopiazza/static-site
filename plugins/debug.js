const path = require('path')

module.exports = (config) => {
    config = Object.assign({}, {
    }, config)
    let counter = 0

    console.time('Build time')

    return {
        name: 'debug',
        async init(files, globals, generator) {
            console.log('Concurrency:', generator.config.concurrency)
            console.log('Files found:', files.length)
            console.log('Processing the files...')
        },
        async run(file, files, globals, generator) {
            ++counter
            return file
        },
        async end(files, globals, generator) {
            console.log('Files processed:', counter)
            console.timeEnd('Build time')
        }
    }
}