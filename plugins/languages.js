const path = require('path')

const getLocale = function (file, locales, filePattern, pathPattern) {
    // Locale in the path.
    if (pathPattern.test(file)) {
        return file.match(pathPattern)[0].replace(
          RegExp('(/?)('+ locales.join('|') +')(/)'),
          '$2'
        )
    }

    // Locale in the filename.
    let match = file.match(filePattern)
    return match && match[1] ? match[1] : false
}

const getAltFilename = function (file, fromLocale, toLocale, pathPattern) {
    var ext = path.extname(file);

    // Locale in the path.
    if (pathPattern.test(file)) {
      var replacementString = file.match(pathPattern)[0].replace(fromLocale, toLocale);
      return file.replace(pathPattern, replacementString);
    }

    // Locale in the filename.
    return file.replace('_'+ fromLocale + ext, '_'+ toLocale + ext);
}

module.exports = (config) => {
    config = Object.assign({}, {
        locales: ['en'],
        defaultLocale: 'en',
        filePattern: RegExp('.*_('+ config.locales.join('|') +')(?:\..*)?$'),
        pathPattern: RegExp('(^(' + config.locales.join('|') +')/|/(' + config.locales.join('|') +')/)')
    }, config)

    return {
        name: 'languages',
        async init(files, globals, generator) {
            generator.globals.locales = config.locales
            generator.globals.defaultLocale = config.defaultLocale
        },
        async run(file, files, globals, generator) {
            if (path.extname(file.src) !== '.md') {
                return file
            }

            file.locale =  generator.globals.defaultLocale
            file.locale = getLocale(file.src, generator.globals.locales, config.filePattern, config.pathPattern)

            // Link the translations
            file.translations = {}

            generator.globals.locales.forEach(function (locale) {
                if (locale != file.locale) {
                    file.translations[locale] = files[getAltFilename(file.src, file.locale, locale, config.pathPattern)];
                } else {
                    file.translations[file.locale] = file.src
                }
            })

            // Adding a helper function to the globals, to be used in the layouts
            generator.globals.__ = (str) => str.toUpperCase()
            return file
        }
    }
}