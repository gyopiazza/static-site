const fs = require('fs')
const totalFiles = 9000

for (let i = 0; i < totalFiles; i++) {
    let fileName = new Date().getTime() + '-' + Math.round(((Math.random() * 9999) + 1000)) + '.md'

    let content = `
        ---
        title: ${fileName}
        template: home.hbt
        ---
        Content: ${fileName}
    `

    fs.writeFile('src/content/test/' + fileName, content, function (err) {
        if (err) {
            return console.log(err)
        }
    })

}

console.log(totalFiles, 'files have been saved!')

