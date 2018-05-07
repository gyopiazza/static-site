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

function replace(str, data) {
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
    match: '.md',
    routes: [],
  }, config)

  return {
    name: 'permalink',
    async run(file, files, globals, generator) {

      if (path.extname(file.src) !== config.match) {
        return file
      }

      file.slug = file.slug || file.name

      // Loop through the routes, the last one that matches is used for the file route
      config.routes.forEach(route => {
        if (propsMatch(file, route.match)) {
          file.uri = replace(route.pattern, file)
          file.name = 'index'
        }
      })

      return file
    }
  }
}
