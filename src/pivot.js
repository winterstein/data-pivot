// data-pivot
// A tool for re-arranging data
// Copyright 2016 Daniel Winterstein

/** Create a new pivot. Call run() to process the data. */
function pivot(data, inputSchema, outputSchema) {
    return new Pivotter(data, inputSchema, outputSchema);
}

if (typeof module !== 'undefined') {
  module.exports = pivot;
}

function Pivotter(data, inputSchema, outputSchema) {
  this.data = data;
  this.inputSchema = inputSchema.split(/\s*->\s*/);
  this.outputSchema = outputSchema.split(/\s*->\s*/);
  // What property-name to use if a property is unset.
  // E.g. if you pivot "a -> b" to "a -> c -> b" 
  this.unset = {'unset':'unset'};
}

isArray = function(obj) {
  // Is there a nicer way to test this??
  return obj && (typeof obj !== 'string') && (typeof obj.length === 'number');
}

Pivotter.prototype.mode = function(m) {
  if (m && ! m in ['sum','list']) throw Error("Unrecognised mode "+m);
  this.mode = m;
  return this;
};

Pivotter.prototype.run = function() {
  var output = {};
  this.run2(this.data, 0, {}, output);
  return output;
};
Pivotter.prototype.run2 = function(dataobj, depth, path, outputobj) {
  console.log("run2", dataobj, depth, JSON.stringify(path), JSON.stringify(outputobj));
  var kName = this.inputSchema[depth];
  // a fixed property, indicated by quotes?
  if (kName[0] === "'" || kName[0]==='"') {
    var k = kName.substr(1,kName.length-2);
    // derefernce dataobj
    var v = dataobj[k];
    console.log("deref",kName,k,v,dataobj);
    if ( ! v) return;
    this.run2(v, depth+1, path, outputobj);
    return;
  }
  // literal?
  if (typeof dataobj === 'number' || typeof dataobj === 'string') {
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
    var path2 = path; // TODO copy!
    path2[kName] = k;
    var v = dataobj[k];
    if ( ! v ) continue;
    this.run2(v, depth+1, path2, outputobj);
  }
}

Pivotter.prototype.set = function(outputobj, path) {
  console.log('set', path);
  var o = outputobj;
  var prevk;
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
      if (this.mode === 'list') {
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
      // sum? NB: mode != list
      if (typeof old === 'number') {
        o[prevk] = old + k;
      } else {
        // convert to list
        if ( ! isArray(old)) old = [old];
        old.push(k);
        o[prevk] = old;
      }
      return;
    }
    if ( ! k) k = this.unset.unset;
    if ( ! k) return; // skip this
    // almost the leaf node -- we don't need another object
    if (ki === this.outputSchema.length-2) {
      prevk = k;
      continue;
    }
    // get/make an object
    newo = o[k];
    if ( ! newo) {
      newo = {};
      o[k] = newo;
    }
    o = newo;
  }
};
