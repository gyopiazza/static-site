module.exports = (collections) => {
  collections = collections || {}

  return {
    name: 'collections',
    async run(file, files, globals, x) {

			for (const collection in collections) {
				let match = collections[collection].match
					? x.match(file.src, collections[collection].match)
					: true

					// console.log(match ? 'MATCH!' : 'NO MATCH...', collections[collection].match, file.src)
			}

      return file
    },
    async end(files, globals, x) {

    }
  }
}
