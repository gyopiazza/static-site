const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')

module.exports = (config) => {
  config = Object.assign({}, {
    match: '.html'
  }, config)

  return {
    name: 'generator-handlebars',
    async run(file, files, globals, generator) {
      let layoutFile = generator.config.layouts + (file.layout || generator.config.defaultLayout)
      let layoutContent = fs.readFileSync(layoutFile, 'utf8')
      let layout = handlebars.compile(layoutContent)

      // console.log(generator.globals)

      // The variables that will be available in the template
      let layoutData = Object.assign({}, generator.globals, {
        meta: file.meta,
        content: file.content
      })


      // Render the content using the layout and the data
      file.content = layout(layoutData)

      return file
    }
  }
}
