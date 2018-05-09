const fs = require('fs')
const oboe = require('oboe')

console.time('Time')



// oboe(fs.createReadStream('MOCK_DATA_BIG.json'))
//   // Return all the results that have a brand and model
//   .node('{brand model}', function (car) {

//     // Drop the current result if it doesn't match our search
//     if (car.brand !== 'Mercury') {
//       oboe.drop
//       return
//     }

//     // console.log('Buy a', car.model);
//   })
//   // .node('badThings.*', function (badThing) {
//   //   console.log('Stay away from', badThing.name);
//   // })
//   .done(function (things) {
//     console.log(things.length)
//     console.timeEnd('Time')
//   });


var makeSource = require("stream-json");
var source = makeSource();

var objectCounter = 0;
source.on("startObject", function(){
  ++objectCounter;
});
source.on("data", function(chunk){
  console.log(chunk)
});
source.on("end", function(){
    console.log("Found ", objectCounter, " objects.");
});

fs.createReadStream("MOCK_DATA_LIGHT.json").pipe(source.input);