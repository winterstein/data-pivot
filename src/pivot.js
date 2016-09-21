// data-pivot
// A tool for re-arranging data
// Copyright 2016 Daniel Winterstein

function Pivotter(data, inputSchema, outputSchema) {
  this.data = data;
  this.inputSchema = inputSchema.split(/\s*->\s*/);
  this.outputSchema = outputSchema.split(/\s*->\s*/);
}

Pivotter.prototype.run = function() {
  var output = {};
  run2(this.data, [], output);
  return output;
};
Pivotter.prototype.run2 = function(dataobj, path, outputobj) {
  // Array?
  if (dataobj.length) {

  }
  // literal?
  if (typeof dataobj === 'number') {

  }
}

function pivot(data, inputSchema, o"utputSchema) {
    return new Pivotter(data, inputSchema, outputSchema);
}

if (typeof module !== 'undefined') {
  module.exports = pivot;
}
