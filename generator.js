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
    content: root + '/content/',
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
  this.queue = async.queue((file, done) => {
    this.transform(file, transformedFile => {
      return done()
    })
  }, this.config.concurrency)

  /**
   * Add a plugin to the transform pipeline
   *
   * @param {object} plugin
   */
  this.use = (plugin) => {
    this.config.plugins.push(plugin)
    return this
  }

  /**
   * Read, transform and write a file
   *
   * @param {*} filePath
   * @param {*} done
   */
  this.transform = async (filePath, done) => {
    // Skip the file if it matches the 'ignore' array
    // TODO: change for a more sofisticated pattern matching (minimatch)
    if (this.config.ignore.indexOf(path.basename(filePath)) > -1) {
      return done()
    }

    // If the file was previously built, load it from the cache
    if (this.config.cache) {

    }

    // Process the file
    fs.readFile(filePath, this.config.encoding, async (err, content) => {
      if (err) throw err
      // The current file being processed
      let file = {
        src: filePath,
        relsrc: path.relative(this.config.content, filePath),
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
          } catch(e) {
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
  this.plugin = function (plugin) {
    return this.config.plugins.find(p => p.name === plugin)
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
  this.match = function (value, pattern) {
    value = typeof value === 'string' ? [value] : value
    return micromatch.match(value, pattern)
  }

  /**
   * Access to the micromatch object
   *
   * @return {object} The micromatch matcher object
   */
  this.matcher = micromatch

  /**
   * Run the build process
   */
  this.build = function (callback) {
    // Clear the destination folder
    utils.emptyDir(this.config.output, false)

    // The end of the queue
    this.queue.drain = async () => {
      // Call the end() method of the registered plugins
      for (let plugin of this.config.plugins) {
        plugin && plugin.end && await plugin.end(this.files, this.globals, this)
      }
      callback && callback()
    }

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
      this.files.forEach(file => {
        this.queue.push(file, (err) => {
          if (err) throw err
        })
      })
    })
  }
}

module.exports = Generator