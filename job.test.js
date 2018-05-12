const executeJob = require('./job')

const tasks = [
  'file1.md',
  'file2.md',
  'file3.md'
]

function processor(job) {
  console.log('Processing', job)
}

executeJob(tasks, processor)