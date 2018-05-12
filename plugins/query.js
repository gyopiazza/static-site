const path = require('path')
const Queue = require('better-queue')
let db = require('diskdb')

module.exports = (config) => {
    config = Object.assign({}, {
        match: '*.md',
        path: './db/',
        tables: ['cache']
    }, config)

    // Load the database tables
    db = db.connect(config.path, config.tables)

    // Set up the queue
    const queue = new Queue(function (batch, cb) {
        db.cache.save(batch)
        cb();
      }, { batchSize: 3000 })

    return {
        name: 'query',
        async run(file, files, globals, x) {
            if (!x.match(file.src, config.match)) {
                return file
            }

            queue.push(file)

            return file
        },
        async end(files, globals, x) {
            console.log(db.cache.count(), 'items have been stored in the database')
        }
    }
}