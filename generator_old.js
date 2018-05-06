/**
* Generator
*
* Plugins are a simple function that accepts 3 arguments:
* - file: the current file
* - files: a reference array with all the files
* - generator: the Generator instance
*
* Plugins can extend 2 layers (so we can run the relevant transformers when querying the data):
* - The 'meta' layer (example: frontmatter)
* - The 'content' layer (example: vanilla html, markdown, handlebars, jade...)
*
*/
const fs = require('fs')
const path = require('path')
const glob = require("glob")
const async = require('async')
const frontmatter = require('gray-matter')
const markdown = require('markdown').markdown
const handlebars = require('handlebars')
const workerpool = require('workerpool')
const pool = workerpool.pool()
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

const config = {
    src: './content/products/',
    match: '**/*.md',
    dest: './build/',
    layouts: './layouts/',
    defaultLayout: 'default.html',
    concurrency: 50,
    transformers: []
}

const replaceExt = function (npath, ext) {
    if (typeof npath !== 'string') {
        return npath;
    }

    if (npath.length === 0) {
        return npath;
    }

    var nFileName = path.basename(npath, path.extname(npath)) + ext;
    return path.join(path.dirname(npath), nFileName);
}

const ensureDirectoryExistence = function (filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

/**
* Removes all the files and folders from a directory
*
* @param {string} dirPath
* @param {boolean} removeSelf
*/
const emptyDir = function (dirPath, removeSelf) {
    if (removeSelf === undefined)
    removeSelf = true;
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
        var filePath = path.join(dirPath, files[i]);
        if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
        else
        emptyDir(filePath);
    }
    if (removeSelf)
    fs.rmdirSync(dirPath);
}

var counter = 0

/**
* Transformers modify single files one by one
* TODO: Change the transformers to array to use for..of and await for each transformer (in case they're async)
*/
const transformers = {
    frontmatter(file, files, generator) {
        let fm = frontmatter(file.content)
        file.meta = fm.data
        file.content = fm.content
        // console.log('File parsed by frontmatter', file)
        return file
    },
    markdown(file, files, generator) {
        file.content = markdown.toHTML(file.content)
        // console.log('File parsed by markdown', file)
        return file
    },
    handlebars(file, files, generator) {
        let layoutFile = config.layouts + (file.layout || config.defaultLayout)
        let layoutContent = fs.readFileSync(layoutFile, 'utf8')
        let layout = handlebars.compile(layoutContent)
        // file.meta.__ = (str) => str.toUpperCase() // Pass a function __() to the layout

        // Pass the meta along with the content and a function _() to be used in the layout
        file.content = layout(Object.assign({}, file.meta, {
            '__': (str) => str.toUpperCase(),
            content: file.content
        }))

        return file
    }
}

/**
* Processors are executed after all the files have been transformed
*
* @param {array} files The files
*/
const processors = {
    archives(files) {}
}

function transformer(file, done) {
    // console.log('Processing ' + task.file)
    fs.readFile(file, 'utf8', (err, content) => {
        if (err) throw err

        // Set the destination folder and change the file extension to .html
        let dest = config.dest + file.replace(config.src, '') + replaceExt(path.basename(file), '.html')

        // The current file being processed
        let current = {
            src: file,
            dest,
            content,
            meta: {}
        }

        // The current file is passed to all the configured transformers (plugins) which can modify it
        // TODO: Change the transformers to array to use for..of and await for each transformer (in case they're async)
        for (let p in transformers) {
            current = transformers[p](current)
        }

        // Create the destination folder if it doesn't exist
        ensureDirectoryExistence(current.dest)

        // Write the file content to the destination folder
        fs.writeFile(current.dest, current.content, 'utf8', (err) => {
            if (err) throw err
            counter++
            done(current)
        })
    })
}

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

console.time('build')

// last working version
function build() {
    emptyDir(config.dest, false)

    const queue = async.queue((file, done) => {
        transformer(file, (transformedFile) => {
            done()
        })

    }, config.concurrency)

    // assign a callback
    queue.drain = () => {
        console.log(counter, 'items have been processed')
        console.timeEnd('build')
    }

    // walk('./content/products', (err, files) => {
    glob(config.src + config.match, {}, function (err, files) {
        if (err) throw err
        files = files || []

        console.log(files.length, 'items to process')

        files.forEach(file => {
            queue.push(file, (err) => {
                if (err) throw err
                // console.log('Finished processing', file)
            })
        })
    })
}

build()

const generator = {}
