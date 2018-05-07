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
    if (typeof str === 'string' && (data instanceof Array)) {
        return str.replace(/({\d})/g, function(i) {
            return data[i.replace(/{/, '').replace(/}/, '')]
        })
    } else if (typeof str === 'string' && (data instanceof Object)) {
        for (let key in data) {
            return str.replace(/({([^}]+)})/g, function(i) {
                let key = i.replace(/{/, '').replace(/}/, '')
                if (!data[key]) {
                    return i
                }

                return data[key]
            })
        }
    } else {
        return false
    }
}

const get = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

module.exports = (config) => {
    config = Object.assign({}, {
        match: '.md',
        routes: [{
            match: [{ collection: 'products' }], // match any property and value
            pattern: '{locale}/posts/{slug}'
        }],
    }, config)

    return {
        name: 'permalink',
        async run(file, files, globals, generator) {

            if (path.extname(file.src) !== '.md') {
                return file
            }

            // Loop through the ruoutes, the first one that matches the 'match' properties
            // is used for the file route
            // console.log(file.locale, file.slug || file.title, file.src)
            // if (!file.slug) {
            //     console.log(file)
            // }

            // console.log(replace(config.routes[0].pattern, file))

            // let params = params(config.routes[0].pattern)

            // p.forEach(param => {

            // })

            // file.uri = path.join(file.uri, )

            return file
        }
    }
}