module.exports = (collections) => {
  collections = collections || {}

  return {
    name: 'collections',
    async run(file, files, globals, x) {

			for (const collectionName in collections) {
				let match = collections[collectionName].match
					? x.match(file.relsrc, collections[collectionName].match)
					: true

					// console.log(match ? 'MATCH!' : 'NO MATCH...', collections[collectionName].match, file.relsrc)
			}

      return file
    }
  }
}
