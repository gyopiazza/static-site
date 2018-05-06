const fs = require('fs')
const path = require('path')

function generateRandomFiles() {
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
}

function importMockData() {
  const filePath = 'MOCK_DATA_LIGHT.json'
  let data = fs.readFileSync(filePath, 'utf8')
  data = JSON.parse(data)

  data.forEach(item => {
    let fileName = new Date().getTime() + '-' + Math.round(((Math.random() * 9999) + 1000)) + '.md'

    let content = `---
title: ${item.brand} - ${item.model}
slug: ${item.brand}-${item.model}
price: ${item.price}
brand: ${item.brand}
model: ${item.model}
year: ${item.year}
color: ${item.color}
layout: post.html
---
This is some content... ${item.brand} - ${item.model}
`

    let destEN = 'content/products/en/' + item.brand + '/' + fileName
    let destES = 'content/products/es/' + item.brand + '/' + fileName

    if (!fs.existsSync(path.dirname(destEN))) {
      fs.mkdirSync(path.dirname(destEN))
    }

    if (!fs.existsSync(path.dirname(destES))) {
      fs.mkdirSync(path.dirname(destES))
    }

    fs.writeFile(destEN, content, function (err) {
      if (err) {
        return console.log(err)
      }
    })

    fs.writeFile(destES, content, function (err) {
      if (err) {
        return console.log(err)
      }
    })
  })
}


importMockData()
// importMockData()
// importMockData()
