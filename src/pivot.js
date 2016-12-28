// data-pivot
// A tool for re-arranging data
// Copyright 2016 Daniel Winterstein
/*

EXAMPLE

fruitEating = {
  monday: {apple:2, pear:1},
  tuesday: {apple:1, banana:1},
};

pivot(fruitEating, 'day -> fruit -> num', 'fruit -> num');

returns: {apple: 3, pear:1, banana: 1}

*/

/** Create a new pivot.
    Call run() to process the data.
*/
function pivot(data, inputSchema, outputSchema, options) {
    return new Pivotter(data, inputSchema, outputSchema, options).run();
}

if (typeof module !== 'undefined') {
  module.exports = pivot;
}

// string constants for mode
pivot.ARRAY = 'array';
pivot.SUM = 'sum';
pivot.FIRST = 'first';

function Pivotter(data, inputSchema, outputSchema, options) {
  this.data = data;
  // Hack: to get e.g. fruit[] to work, convert it into index -> fruit
  inputSchema = inputSchema.replace(/(\w+)\[\]/g, function(m,g1,i) {return "_index"+i+" -> "+g1;});
  this.inputSchema = inputSchema.split(/\s*->\s*/);
  this.outputSchema = outputSchema.split(/\s*->\s*/);
  this.options = options || {};
  // Set defaults
  // What property-name to use if a property is unset.
  // E.g. if you pivot "a -> b" to "a -> c -> b"
  if ( ! this.options.unset) this.options.unset = 'unset';
  if ( ! this.options.mode) this.options.mode = pivot.SUM;
}

const isArray = function(obj) {
  // Is there a nicer way to test this??
  return obj && (typeof obj !== 'string') && (typeof obj.length === 'number');
}

Pivotter.prototype.run = function() {
  let output = {};
  this.run2(this.data, 0, {}, output);
  // pluck?
  if (this.outputSchema.length==1) {
    output = output[this.options.unset];
  }
  return output;
};

Pivotter.prototype.run2 = function(dataobj, depth, path, outputobj) {
  // console.log("run2", dataobj, depth, JSON.stringify(path), JSON.stringify(outputobj));
  var kName = this.inputSchema[depth];
  // a fixed property, indicated by quotes?
  if (kName[0] === "'" || kName[0]==='"') {
    var k = kName.substr(1,kName.length-2);
    // derefernce dataobj
    var v = dataobj[k];
    // console.log("deref",kName,k,v,dataobj);
    if ( ! v) return;
    this.run2(v, depth+1, path, outputobj);
    return;
  }
  // literal or end-of-the-line?
  if (typeof dataobj === 'number' || typeof dataobj === 'string'
        || depth === this.inputSchema.length-1)
  {
    path[kName] = dataobj;
    // Now set the output
    this.set(outputobj, path);
    return;
  } // ./literal
  // Array?
  if (isArray(dataobj)) {

  }
  for (var k in dataobj) {
    if ( ! dataobj.hasOwnProperty(k)) continue;
    var path2 = {}; // shallow copy path
    for(let p in path) {
      path2[p] = path[p];
    }
    // and add k
    path2[kName] = k;
    var v = dataobj[k];
    if ( ! v ) continue;
    this.run2(v, depth+1, path2, outputobj);
  }
}; // /run2()

Pivotter.prototype.set = function(outputobj, path) {
  // console.log('set', path);
  var o = outputobj;
  var prevk = this.options.unset; // usually this gets set, except if the output is just a pluck
  for(var ki=0; ki<this.outputSchema.length; ki++) {
    var kNamei = this.outputSchema[ki];
    var k;
    // a fixed property, indicated by quotes?
    if (kNamei[0] === "'" || kNamei[0]==='"') {
      k = kNamei.substr(1,kNamei.length-2);
    } else {
      // normal case: lookup the key from the path we built
      k = path[kNamei];
    }
    if (ki === this.outputSchema.length-1) {
      // output leaf node -- set the value
      var old = o[prevk];
      // Always output lists?
      if (this.options.mode === pivot.ARRAY) {
        if ( ! old) {
          old = [];
          o[prevk] = old;
        }
        old.push(k);
        return;
      }
      // normal case
      if ( ! old) {
        o[prevk] = k;
        return;
      }
      // first value wins?
      if (this.options.mode===pivot.FIRST) {
        return;
      }
      // sum? NB: mode != array
      if (typeof old === 'number') {
        o[prevk] = old + k;
      } else {
        // convert to list
        if ( ! isArray(old)) old = [old];
        old.push(k);
        o[prevk] = old;
      }
      return;
    } // ./ if output leaf
    if ( ! k) k = this.options.unset;
    if ( ! k) return; // skip this
    // almost the leaf node -- we don't need another object
    if (ki === this.outputSchema.length-2) {
      prevk = k;
      continue;
    }
    // get/make an object
    var newo = o[k];
    if ( ! newo) {
      newo = {};
      o[k] = newo;
    }
    o = newo;
  }
}; // ./set()
