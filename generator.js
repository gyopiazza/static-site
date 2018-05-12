/**
 * Generator
 *
 * Plugins are a simple function that accepts 3 arguments:
 * - file: the current file
 * - files: a reference array with all the files
 * - generator: the Generator instance
 *
 * Plugins can extend 2 layers (so we can run the relevant plugins when querying the data):
 * - The 'meta' layer (example: frontmatter)
 * - The 'content' layer (example: vanilla html, markdown, handlebars, jade...)
 *
 */
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const async = require('async')
const Queue = require('better-queue')
const micromatch = require('micromatch')
const utils = require('./utils')

/**
 * Generator for large-scale static sites
 *
 * @param {object} config
 */
function Generator(config) {
  if (!(this instanceof Generator)) return new Generator(config)

  let root = path.dirname(require.main.filename)

  this.config = Object.assign({}, {
    match: '**/*.md',
    content: root + '/contents/',
    output: root + '/build/',
    cache: root + '/cache/',
    ignore: ['.', '..', '.DS_Store'],
    layouts: root + '/layouts/',
    defaultLayout: 'default.html',
    concurrency: 100,
    plugins: [],
    encoding: 'utf8'
  }, config)

  this.globals = {}
  this.files = []

  /**
   * Prepare the queue processing
   * Each element added to the queue will be processed here
   *
   */
  this.queue = async.queue((filePath, done) => {
    // Load filePath from the cache if it's already saved
    // Otherwise read from file
    // Pass the file object to the tranform function
    // await this.buildFile(filePath)
    // return done()
    this.transform(filePath, transformedFile => {
      return done()
    })
  }, this.config.concurrency)

  // Set up the queue
  this.queue2 = new Queue((batch, done) => {
    let batchCount = batch.length
    console.log('PROCESSING BATCH')
    batch.forEach(filePath => {
      // this.transform(filePath, transformedFile => {
      //   --batchCount
      //   if (batchCount <= 0) {
      //     console.log(batch.length, '???????????????????????')
      //     done()
      //   }
      // })

      let files = batch.map(filePath => this.transform(filePath))
      Promise.all(files).then(transformedFiles => done(transformedFiles))
    })

    if (batchCount <= 0) {
      done()
    }
  }, { batchSize: 1000 })
}


/**
 * Add a plugin to the transform pipeline
 *
 * @param {object} plugin
 */
Generator.prototype.use = function (plugin) {
  this.config.plugins.push(plugin)
  return this
}

/**
 * Get the plugin object from the installed plugins
 * It allows to use other plugins from within a plugin
 *
 * generator.plugin('plugin-name').someFunction()
 *
 * @param {string} plugin The requested plugin name
 * @return {object} The plugin object or undefined
 */
Generator.prototype.plugin = function (plugin) {
  return this.config.plugins.find(p => p.name === plugin)
}

/**
 * Read, transform and write a file
 *
 * @param {*} filePath
 * @param {*} done
 */
Generator.prototype.transform = async function (filePath, done) {
  // Skip the file if it matches the 'ignore' array
  // TODO: change for a more sofisticated pattern matching (minimatch)
  if (this.config.ignore.indexOf(path.basename(filePath)) > -1) {
    return done()
  }

  // If the file was previously built, load it from the cache
  // if (this.config.cache) {

  // }

  // Process the file
  fs.readFile(filePath, this.config.encoding, async (err, content) => {
    if (err) throw err
    // The current file being processed
    let file = {
      src: path.relative(this.config.content, filePath),
      name: path.basename(filePath, path.extname(filePath)),
      uri: path.dirname(filePath.replace(this.config.content, '')),
      ext: 'html',
      content
    }

    if (file.uri === '.') {
      file.uri = ''
    }

    // The current file is passed to all the registered plugins
    for (let plugin of this.config.plugins) {
      if (plugin && plugin.run) {
        try {
          file = await plugin.run(file, this.files, this.globals, this)
        } catch (e) {
          console.log('-------------------')
          console.log('Error with the file:', file.src)
          console.log('Error with the plugin:', plugin.name)
          console.trace(e)
        }
      }
    }

    // Compose the destination path
    file.output = path.join(this.config.output, file.uri, file.name + '.' + file.ext)

    // Create the destination folder if it doesn't exist
    utils.ensureDirectoryExistence(file.output)

    // Write the file content to the destination folder
    fs.writeFile(file.output, file.content, this.config.encoding, (err) => {
      if (err) throw err
      return done(file)
    })
  })
}

/**
 * Run the build process
 */
Generator.prototype.build = function (callback) {
  // Clear the destination folder
  utils.emptyDir(this.config.output, false)

  // The end of the queue
  // this.queue.drain = async () => {
  //   // Call the end() method of the registered plugins
  //   for (let plugin of this.config.plugins) {
  //     plugin && plugin.end && await plugin.end(this.files, this.globals, this)
  //   }
  //   callback && callback()
  // }

  this.queue2.on('finish', async (result) => {
    console.log('ok!')
    // Call the end() method of the registered plugins
    for (let plugin of this.config.plugins) {
      plugin && plugin.end && await plugin.end(this.files, this.globals, this)
    }
    callback && callback()
  })
  // this.queue2.on('task_failed', function (taskId, errorMessage) {
  //   // Handle error
  // })
  // this.queue2.on('task_progress', function (taskId, completed, total) {
  //   // Handle task progress
  // })

  // Find all files in the content folder and queue them for processing
  utils.walk(this.config.content, async (err, files) => {
    if (err) throw err
    files = files || []
    this.files = files

    // Initialize the registered plugins
    for (let plugin of this.config.plugins) {
      plugin && plugin.init && await plugin.init(this.files, this.globals, this)
    }

    // Enqueue the files
    this.files.forEach(filePath => {
      // this.queue.push(filePath, (err) => {
      //   if (err) throw err
      // })
      this.queue2.push(filePath)
    })
  })
}

/**
 * Build a single file
 */
Generator.prototype.buildFile = function (filePath, callback) {
}

/**
 * Get the plugin object from the installed plugins
 * It allows to use other plugins from within a plugin
 *
 * generator.plugin('plugin-name').someFunction()
 *
 * @param {string|array} value The
 * @return {object} The plugin object or undefined
 */
Generator.prototype.match = function(value, pattern) {
  value = typeof value === 'string' ? [value] : value
  return micromatch.match(value, pattern)
}

/**
 * Access to the micromatch object
 *
 * @return {object} The micromatch matcher object
 */
Generator.prototype.matcher = micromatch

module.exports = Generator
