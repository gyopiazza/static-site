const fs = require('fs')
const path = require('path')
let counter = 0

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
        template: default.html
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
  const filePath = 'tests/MOCK_DATA.json'
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

    let destEN = 'contents/products/en/' + item.brand + '/' + fileName
    let destES = 'contents/products/es/' + item.brand + '/' + fileName

    ensureDirectoryExistence(destEN)
    ensureDirectoryExistence(destES)

    fs.writeFileSync(destEN, content)
    fs.writeFileSync(destES, content)
    ++counter
    ++counter
  })
}

console.log('Creating dummy files...')
importMockData()
importMockData()
importMockData()
console.log(counter + ' files created!')