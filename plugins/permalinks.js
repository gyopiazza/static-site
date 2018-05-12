const path = require('path')

/**
 * Get the params from a `pattern` string.
 *
 * @param {String} pattern
 * @return {Array}
 */

function params(pattern) {
  var matcher = /:(\w+)/g
  var ret = []
  var m
  while (m = matcher.exec(pattern)) ret.push(m[1])
  return ret
}

function pattern(str, data) {
  for (let key in data) {
    return str.replace(/({([^}]+)})/g, function (i) {
      let key = i.replace(/{/, '').replace(/}/, '')
      if (!data[key]) {
        return i
      }

      return data[key]
    })
  }

  return false
}

const propsMatch = (obj, props) => {
  // If no match rules are given, pass
  if (!props) {
    return false
  }

  let match = false

  props.forEach(prop => {
    let keys = Object.keys(prop)
    let values = Object.values(prop)
    let matches = 0

    keys.forEach((key, index) => {
      if (obj[key] && obj[key] === values[index]) {
        matches++
      }
    })

    // Make sure that the all the keys rules are met
    match = matches === keys.length
  })

  return match
}

module.exports = (config) => {
  config = Object.assign({}, {
    match: '*.md',
    index: 'index',
    routes: [],
  }, config)

  return {
    name: 'permalinks',
    async run(file, files, globals, x) {
      // if (path.extname(file.src) !== config.match) {
      if (!x.match(file.src, config.match)) {
        return file
      }

      // Loop through the routes, the last one that matches is used for the file route
      let uri = ''

      // console.log('--------')
      config.routes.forEach(route => {
        if (!route.match || propsMatch(file, route.match)) {
          // if (file.name !== config.index) {
          //   // if (file.name === 'index') {
          //   //   console.log(file)
          //   // }
          //   uri = pattern(route.pattern, file)
          //   console.log('NOT INDEX', route.pattern, file.src, file.uri, '...', uri)
          // } else {

          //   console.log('INDEX', route.pattern, file.src, file.uri, '...', uri)
          // }

          // if (file.uri !== '') {
            uri = pattern(route.pattern, file)
          // }

          // if (file.name === config.index) {
            // console.log(route.pattern, file.src, file.uri, '...', uri)
          // }
        }
      })

      // Set the uri to the last pattern that matched
      file.uri = uri

      // Remove 'index' from the uri
      // if (file.name === 'index') {
      //   file.uri = file.uri.substring(0, file.uri.length - 5)
      // }



      // Set the file name to index for
      file.name = config.index

      return file
    }
  }
}
