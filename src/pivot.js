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

/** 
 * Do a pivot!
*/
function pivot(data, inputSchema, outputSchema, options) {
	const pivotter = new Pivotter(data, inputSchema, outputSchema, options);
    return pivotter.run();
}

// if (typeof module !== 'undefined') {
//   module.exports = pivot;
// }
export default pivot;

// string constants for mode
pivot.ARRAY = 'array';
pivot.SET = 'set';
/** sum: sum numbers, for non-numbers eg strings etc collect them into sets */
pivot.SUM = 'sum'; 
pivot.FIRST = 'first';

const isArray = function(obj) {
  // Is there a nicer way to test this??
  return obj && (typeof obj !== 'string') && (typeof obj.length === 'number');
}

const parseSchema = (schemaString) => {
	let path = [];
	parseSchema2(schemaString, path, 0);
	return path;
}

/**
 * Test for the first "matching" index i 
 * @returns true if i is the lowest value != -1
 */
const isFirst = (i, ...others) => {
	if (i===-1) return false;
	for(let oi=0; oi<others.length; oi++) {
		if (others[oi] !== -1 && others[oi] < i) return false;
	}
	return true;
};

/**
 * 
 * @param {*} schemaString 
 * @param {*} leaf
 * @returns unparsed
 */
const parseSchema2 = (schemaString, leaf, bracketDepth) => {
	console.log("parseSchema2", schemaString, leaf, bracketDepth);
	schemaString = schemaString.trim();
	if (schemaString === '') return '';
	let bi = schemaString.indexOf('{');	
	let bic = schemaString.indexOf('}');
	let ai = schemaString.indexOf('->');
	let ci = schemaString.indexOf(',');	
	// pop a bracket?
	if (isFirst(bic, bi, ai, ci)) {
		leaf.push(schemaString.substr(0, bic));
		return schemaString.substr(bic); // leave the closing } in for the loop belwo to spot
	}
	if (bi==-1 && ai==-1 && ci==-1) {
		// done	
		leaf.push(schemaString);
		return '';
	}
	// a -> stuff
	if (isFirst(ai, bi, ci)) {
		let bit = schemaString.substr(0, ai);
		leaf.push(bit.trim());
		let unparsed = parseSchema2(schemaString.substr(ai+2), leaf, bracketDepth);
		return unparsed;
	}
	// , other-stuff
	if (isFirst(ci, bi)) {
		let bit = schemaString.substr(0, ci).trim();
		if (bit !== '') leaf.push(bit);
		let otherSchemaString = schemaString.substr(ci+1);
		return otherSchemaString;
	}
	// {sub-tree-1, sub-tree-2}
	let bit = schemaString.substr(0, bi);
	// bit must be a blank string!
	let subSchemaString = schemaString.substr(bi+1);
	for(var d=0; d<100; d++)	 {
		let subleaf = [];
		leaf.push(subleaf);
		let unparsed = parseSchema2(subSchemaString, subleaf, bracketDepth + 1).trim();
		if (unparsed[0] === '}') {
			return unparsed.substr(1);
		}		
		subSchemaString = unparsed;
	}
	throw new Error("Too deep! No closing } found - aborting parse of schema at: "+schemaString);
}; // ./parseSchema
// for debug
window.parseSchema = parseSchema;

class Pivotter {
	constructor(data, inputSchema, outputSchema, options) {
		this.data = data;
		// Hack: to get e.g. fruit[] to work, convert it into index -> fruit
		inputSchema = inputSchema.replace(/(\w+)\[\]/g, function(m,g1,i) {return "_index"+i+" -> "+g1;});
		/**
		 * Object[] the schema tree, each element is either a String, or a sub-tree.
		 * Sub-trees are created by {} brackets.
		 */
		this.inputSchema = parseSchema(inputSchema); // inputSchema.split(/\s*->\s*/);
		this.outputSchema = parseSchema(outputSchema); // .split(/\s*->\s*/);
		this.options = options || {};
		// Set defaults
		// What property-name to use if a property is unset.
		// E.g. if you pivot "a -> b" to "a -> c -> b"
		if ( ! this.options.unset) this.options.unset = 'unset';
		if ( ! this.options.mode) this.options.mode = pivot.SUM;
	}

	run() {
		let output = {};
		this.run2(this.data, 0, {}, output);
		// pluck?
		if (this.outputSchema.length==1) {
			output = output[this.options.unset];
		}
		return output;
	}

	run2(dataobj, depth, path, outputobj) {
		// console.log("run2", dataobj, depth, JSON.stringify(path), JSON.stringify(outputobj));
		var kName = this.inputSchema[depth];
		// TODO support sub-trees
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
	} // /run2()

	set(outputobj, path) {
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
			if (this.options.mode === pivot.ARRAY || this.options.mode === pivot.SET) {
				if ( ! old) {
				old = [];
				o[prevk] = old;
				}
				if (this.options.mode === pivot.ARRAY || old.indexOf(k)==-1) {
				old.push(k);
				}
				return;
			} // ./ array or set
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
				// sets (no duplicates) by default
				if (old.indexOf(k)==-1) {
				old.push(k);
				}
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
	} // ./set()

} // ./Pivotter

export {
	parseSchema
}
