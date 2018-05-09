const mock = require('./mock.json')
const permalinks = require('../plugins/permalinks')({ routes: mock.routes })

test('Index EN', async () => {
  let file = await permalinks.run(mock.files[0])
  expect(file.uri).toBe('')
  expect(file.name).toBe('index')
  expect(file.locale).toBe('en')
})

test('Index ES', async () => {
  let file = await permalinks.run(mock.files[1])
  expect(file.uri).toBe('es/')
  expect(file.name).toBe('index')
  expect(file.locale).toBe('es')
})

test('Post EN', async () => {
  let file = await permalinks.run(mock.files[2])
  expect(file.uri).toBe('en/posts/my-first-post')
  expect(file.name).toBe('index')
  expect(file.locale).toBe('en')
})

test('Post ES', async () => {
  let file = await permalinks.run(mock.files[3])
  expect(file.uri).toBe('es/articulos/mi-primer-articulo')
  expect(file.name).toBe('index')
  expect(file.locale).toBe('es')
})