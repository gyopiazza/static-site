const fs = require('fs')
const path = require('path')

const ensureDirectoryExistence = function (filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

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
  const filePath = 'MOCK_DATA.json'
  let data = fs.readFileSync(filePath, 'utf8')
  data = JSON.parse(data)

  data.forEach(item => {
    let fileName = new Date().getTime() + '-' + Math.round(((Math.random() * 9999) + 1000)) + '.md'

    let content = `---
title: ${item.brand} - ${item.model}
slug: ${item.brand.replace(' ', '')}-${item.model.replace(' ', '')}
collection: products
price: ${item.price}
brand: ${item.brand}
model: ${item.model}
year: ${item.year}
color: ${item.color}
layout: default.html
---
This is some content... ${item.brand} - ${item.model}
`

    let destEN = 'content/products/en/' + item.brand + '/' + fileName
    let destES = 'content/products/es/' + item.brand + '/' + fileName

    ensureDirectoryExistence(destEN)
    ensureDirectoryExistence(destES)

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
importMockData()
importMockData()
