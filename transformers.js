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
