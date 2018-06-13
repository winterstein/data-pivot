
// Run with mocha
// e.g. 
if (typeof assert === 'undefined') {
    assert = require('assert');
}
if (typeof pivot === 'undefined') {
    pivot = require('../src/pivot.js');
}

describe('pivot', function() {

	it('should parse simple schemas', function() {
		let schema = pivot.parseSchema('$day.$fruit.$num')
		// console.warn("xydata", xydata);
		assert.equal(JSON.stringify(schema), JSON.stringify(['$day','$fruit','$num']));
	});
	it('should parse simple schemas with fixed keys', function() {
		let schema = pivot.parseSchema('monday.$fruit.$num')
		// console.warn("xydata", xydata);
		assert.equal(JSON.stringify(schema), JSON.stringify(['monday','$fruit','$num']));
	});
	it('should parse ignoring padding', function() {
		let schema = pivot.parseSchema( 'monday . $fruit . $num')
		// console.warn("xydata", xydata);
		assert.equal(JSON.stringify(schema), JSON.stringify(['monday','$fruit','$num']));
	});
	it('should parse ES key/value buckets', function() {
		let schema = pivot.parseSchema("$u.{k, v}");
		// console.warn("xydata", xydata);
		assert.equal(JSON.stringify(schema), JSON.stringify(['$u', ['k', '$k'], ['v', '$v']]));
	});

	it('should handle one ES bucket', function() {
		let data = {"key_as_string":"mykey","doc_count":7};
		console.log("one ES data", data);
		let cdata = pivot(data, "{doc_count.$dc, key_as_string.$kas}", 
								"$kas.$dc", {mode: pivot.FIRST, unset: false});		
		console.log("simple ES data out", cdata);
		// TODO allow {a} as shorthand for {'a'.a}
		// let cdata2 = pivot(data, "'buckets'.bi.{'doc_count', 'key_as_string'}", 
		// 						"doc_count.key_as_string");
		assert.equal(cdata["mykey"], 7);
	});	

	it('should handle simple ES outputs', function() {
		let data = {"buckets":[{"key_as_string":"2017","doc_count":1},{"key_as_string":"2016","doc_count":2}]};
		console.log("simple ES data", data);
		let cdata = pivot(data, "buckets.$bi.{doc_count.$dc, key_as_string.$kas}", 
								"$kas.$dc");		
		console.log("simple ES data out", cdata);
		assert.equal(cdata["2017"], 1);
		assert.equal(cdata["2016"], 2);
		// TODO allow {a} as shorthand for {'a'.a}
		// let cdata2 = pivot(data, "'buckets'.bi.{'doc_count', 'key_as_string'}", 
		// 						"doc_count.key_as_string");
	});	

	it('should handle ES key/value buckets', function() {
		let cdata = {alice: {k:'jan', v:7} }
		let xydata = pivot(cdata, "$u.{$k, $v}", "$k.$v");
		// console.warn("xydata", xydata);
		assert.equal(xydata.jan, 7);
	});
	
	it('should create records', function() {
		let cdata = {alice: [ {k:'jan', v:7, huh:-4}, {k:'feb', v:8, huh:10}] }
		let xydata = pivot(cdata, "$key.$i.{$k, $v}", "$key.$i.{x.$k, y.$v}");
		console.warn("xydata", xydata);
		assert.equal(xydata.alice[0].y, 7);
		assert.equal(xydata.alice[0].x, 'jan');		
	});

	it('should handle ES outputs', function() {
		let data = {"byEvent":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"doc_count":4,"events_over_time":{"buckets":[{"key_as_string":"2017-06-22T18:00:00.000Z","doc_count":1,"key":1498154400000},{"key_as_string":"2017-06-22T19:00:00.000Z","doc_count":0,"key":1498158000000},{"key_as_string":"2017-06-22T20:00:00.000Z","doc_count":0,"key":1498161600000},{"key_as_string":"2017-06-22T21:00:00.000Z","doc_count":0,"key":1498165200000},{"key_as_string":"2017-06-22T22:00:00.000Z","doc_count":0,"key":1498168800000},{"key_as_string":"2017-06-22T23:00:00.000Z","doc_count":0,"key":1498172400000},{"key_as_string":"2017-06-23T00:00:00.000Z","doc_count":0,"key":1498176000000},{"key_as_string":"2017-06-23T01:00:00.000Z","doc_count":0,"key":1498179600000},{"key_as_string":"2017-06-23T02:00:00.000Z","doc_count":0,"key":1498183200000},{"key_as_string":"2017-06-23T03:00:00.000Z","doc_count":0,"key":1498186800000},{"key_as_string":"2017-06-23T04:00:00.000Z","doc_count":0,"key":1498190400000},{"key_as_string":"2017-06-23T05:00:00.000Z","doc_count":0,"key":1498194000000},{"key_as_string":"2017-06-23T06:00:00.000Z","doc_count":0,"key":1498197600000},{"key_as_string":"2017-06-23T07:00:00.000Z","doc_count":0,"key":1498201200000},{"key_as_string":"2017-06-23T08:00:00.000Z","doc_count":0,"key":1498204800000},{"key_as_string":"2017-06-23T09:00:00.000Z","doc_count":0,"key":1498208400000},{"key_as_string":"2017-06-23T10:00:00.000Z","doc_count":0,"key":1498212000000},{"key_as_string":"2017-06-23T11:00:00.000Z","doc_count":0,"key":1498215600000},{"key_as_string":"2017-06-23T12:00:00.000Z","doc_count":0,"key":1498219200000},{"key_as_string":"2017-06-23T13:00:00.000Z","doc_count":0,"key":1498222800000},{"key_as_string":"2017-06-23T14:00:00.000Z","doc_count":3,"key":1498226400000}]},"key":"visible"},{"doc_count":3,"events_over_time":{"buckets":[{"key_as_string":"2017-06-22T17:00:00.000Z","doc_count":1,"key":1498150800000},{"key_as_string":"2017-06-22T18:00:00.000Z","doc_count":0,"key":1498154400000},{"key_as_string":"2017-06-22T19:00:00.000Z","doc_count":0,"key":1498158000000},{"key_as_string":"2017-06-22T20:00:00.000Z","doc_count":0,"key":1498161600000},{"key_as_string":"2017-06-22T21:00:00.000Z","doc_count":0,"key":1498165200000},{"key_as_string":"2017-06-22T22:00:00.000Z","doc_count":0,"key":1498168800000},{"key_as_string":"2017-06-22T23:00:00.000Z","doc_count":0,"key":1498172400000},{"key_as_string":"2017-06-23T00:00:00.000Z","doc_count":0,"key":1498176000000},{"key_as_string":"2017-06-23T01:00:00.000Z","doc_count":0,"key":1498179600000},{"key_as_string":"2017-06-23T02:00:00.000Z","doc_count":0,"key":1498183200000},{"key_as_string":"2017-06-23T03:00:00.000Z","doc_count":0,"key":1498186800000},{"key_as_string":"2017-06-23T04:00:00.000Z","doc_count":0,"key":1498190400000},{"key_as_string":"2017-06-23T05:00:00.000Z","doc_count":0,"key":1498194000000},{"key_as_string":"2017-06-23T06:00:00.000Z","doc_count":0,"key":1498197600000},{"key_as_string":"2017-06-23T07:00:00.000Z","doc_count":0,"key":1498201200000},{"key_as_string":"2017-06-23T08:00:00.000Z","doc_count":0,"key":1498204800000},{"key_as_string":"2017-06-23T09:00:00.000Z","doc_count":0,"key":1498208400000},{"key_as_string":"2017-06-23T10:00:00.000Z","doc_count":0,"key":1498212000000},{"key_as_string":"2017-06-23T11:00:00.000Z","doc_count":0,"key":1498215600000},{"key_as_string":"2017-06-23T12:00:00.000Z","doc_count":0,"key":1498219200000},{"key_as_string":"2017-06-23T13:00:00.000Z","doc_count":0,"key":1498222800000},{"key_as_string":"2017-06-23T14:00:00.000Z","doc_count":2,"key":1498226400000}]},"key":"close"},{"doc_count":3,"events_over_time":{"buckets":[{"key_as_string":"2017-06-22T18:00:00.000Z","doc_count":1,"key":1498154400000},{"key_as_string":"2017-06-22T19:00:00.000Z","doc_count":0,"key":1498158000000},{"key_as_string":"2017-06-22T20:00:00.000Z","doc_count":0,"key":1498161600000},{"key_as_string":"2017-06-22T21:00:00.000Z","doc_count":0,"key":1498165200000},{"key_as_string":"2017-06-22T22:00:00.000Z","doc_count":0,"key":1498168800000},{"key_as_string":"2017-06-22T23:00:00.000Z","doc_count":0,"key":1498172400000},{"key_as_string":"2017-06-23T00:00:00.000Z","doc_count":0,"key":1498176000000},{"key_as_string":"2017-06-23T01:00:00.000Z","doc_count":0,"key":1498179600000},{"key_as_string":"2017-06-23T02:00:00.000Z","doc_count":0,"key":1498183200000},{"key_as_string":"2017-06-23T03:00:00.000Z","doc_count":0,"key":1498186800000},{"key_as_string":"2017-06-23T04:00:00.000Z","doc_count":0,"key":1498190400000},{"key_as_string":"2017-06-23T05:00:00.000Z","doc_count":0,"key":1498194000000},{"key_as_string":"2017-06-23T06:00:00.000Z","doc_count":0,"key":1498197600000},{"key_as_string":"2017-06-23T07:00:00.000Z","doc_count":0,"key":1498201200000},{"key_as_string":"2017-06-23T08:00:00.000Z","doc_count":0,"key":1498204800000},{"key_as_string":"2017-06-23T09:00:00.000Z","doc_count":0,"key":1498208400000},{"key_as_string":"2017-06-23T10:00:00.000Z","doc_count":0,"key":1498212000000},{"key_as_string":"2017-06-23T11:00:00.000Z","doc_count":0,"key":1498215600000},{"key_as_string":"2017-06-23T12:00:00.000Z","doc_count":0,"key":1498219200000},{"key_as_string":"2017-06-23T13:00:00.000Z","doc_count":0,"key":1498222800000},{"key_as_string":"2017-06-23T14:00:00.000Z","doc_count":2,"key":1498226400000}]},"key":"mouseover"},{"doc_count":3,"events_over_time":{"buckets":[{"key_as_string":"2017-06-23T14:00:00.000Z","doc_count":3,"key":1498226400000}]},"key":"opened"},{"doc_count":2,"events_over_time":{"buckets":[{"key_as_string":"2017-06-23T14:00:00.000Z","doc_count":2,"key":1498226400000}]},"key":"open"}]},"ecount":{"min":1,"avg":1,"max":1,"count":15,"sum":15}};
		console.log("byEvent data", data);
		let cdata = pivot(data, "byEvent.buckets.$bi.{key, events_over_time.buckets.$bi2.{doc_count, key_as_string}}", 
								"$key.$key_as_string.$doc_count");
	});

	if (false) {
		it('TODO should decipher records: null inputSchema => work it out', function() {
			var mydata = [
			{day:'monday', fruit:'apples', n:1},
			{day:'tuesday', fruit:'apples', n:1},
			{day:'tuesday', fruit:'pears', n:3}
			];

			var fruits = pivot(mydata, null, '$fruit.$n');
			assert.equal(fruits['apples'], 2);
			assert.equal(fruits['pears'], 3);
		});
	}

  it('should handle sibling properties using {}s', function() {
    var input = {jedi:{name:'Luke', weapon:'light saber'}, smuggler:{name:'Hans'}};
    var output = pivot(input, "$role.{name.$n, weapon.$w}", "$n.$w");
    console.log(output);
    assert.equal(output['Luke'], 'light saber');
  });

	it('should handle {a, b} shorthand', function() {
		var input = {jedi:{name:'Luke', weapon:'light saber'}, smuggler:{name:'Hans'}};
		var output = pivot(input, "$role.{name, weapon}", "$name.$weapon");
		console.log(output);
		assert.equal(output['Luke'], 'light saber');
	});


  it('should be loaded here', function() {
    console.log(pivot, typeof(pivot));
    assert.equal(typeof(pivot), 'function');
  });

  it('should handle lists of input values', function() {
    var mydata = {'monday':['apples','pears'], 'tuesday':['pears']};
    var output = pivot(mydata, "$day.$fruit[]", "$fruit.$day");
    console.log(output);
    assert.equal(output['apples'], 'monday');
  });

  it('should pluck', function() {
     var input = {'Mark':'Hammill', 'Harrison':'Ford'};
     var output = pivot(input, '$fn.$sn', '$sn');
     console.log(output);
     assert.equal(output[0], 'Hammill');
     assert.equal(output[1], 'Ford');
  });

  it('should handle array inputs', function() {
     var input = [{'Mark':'Hammill'}, {'Harrison':'Ford'}];
     var output = pivot(input, '$i.$fn.$sn', '$fn.$sn');
     assert.equal(output['Mark'], 'Hammill');
  });

  it('should support array outputs', function() {
     var input = [{'Mark':'Hammill'}, {'Harrison':'Ford'}];
     var output = pivot(input, '$i.$fn.$sn', '$i.$fn');
     assert.equal(output[0], 'Mark');
  });

  it('should handle object values', function() {
      var input = {'star-wars': {'jedi':{'sn':'Skywalker', 'fn':'Luke'}, 'smuggler':{'sn':'Solo', 'fn':'Hans'}}};
      var output = pivot(input, '$film.$role.$person', '$film.$person');
	  console.log('should handle object values', output);
      var peeps = output['star-wars'];
      assert.equal(peeps.length, 2);
      assert.equal(peeps[0].fn, 'Luke');
      assert.equal(peeps[1].fn, 'Hans');
  });

  it('should reverse key->value to value->key', function() {
    var input = {'Mark':'Hammill', 'Harrison':'Ford'};
    var output = pivot(input, '$n.$sn', '$sn.$n');
    assert.equal(output['Ford'], 'Harrison');
    assert.equal(output['Hammill'], 'Mark');
  });

  it('should handle complex map re-arranging', function() {
    var input = {'jedi':{'Skywalker':'Luke'}, 'smuggler':{'Solo':'Hans'}};
    var output = pivot(input, '$role.$sn.$n', '$n.$role');
    assert.equal(output['Luke'], 'jedi');
    assert.equal(output['Hans'], 'smuggler');

    output = pivot(input, '$role.$sn.$n', '$n.$sn.$role');
    assert.equal(output['Luke']['Skywalker'], 'jedi');
  });

  it('should handle number keys', function() {
    var input = {0:{'Skywalker':'Luke'}, 1:{'Solo':'Hans'}, 2:{'Vader':'Darth'}};
    var output = pivot(input, '$num.$sn.$n', '$num.$n');
    assert.equal(output[0], 'Luke');
    assert.equal(output[1], 'Hans');

    output = pivot(input, '$num.$sn.$n', '$sn.$num.$n');
    assert.equal(output['Skywalker'][0], 'Luke');
    assert.equal(output['Vader'][2], 'Darth');
    
	output = pivot(input, '$num.$sn.$n', '$n.$num');
    assert.equal(output['Darth'], 2);
  });

  it('should sum overlapping number values', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, '$store.$fruit.$n', '$fruit.$n');
    console.log(output);
    assert.equal(output['apples'], 303);
    assert.equal(output['pears'], 50);
  });

  it('should list (not sum) number values if mode=array', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, '$store.$fruit.$n', '$fruit.$n', {mode:'array'});
    console.log(output);
    assert.equal(output['pears'][0], 50);
    assert.equal(output['apples'][0], 100);
    assert.equal(output['apples'][1], 200);
  });

  it('mode=array vs mode=set', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3,'mango':2}};
    var fruits = pivot(input, '$store.$fruit.$n', '$fruit', {mode:'array'});
    var fruits2 = pivot(input, '$store.$fruit.$n', '$fruit', {mode:'set'});
    assert.equal(fruits.length, 5);
    assert.equal(fruits2.length, 3);
    console.log("ARRAY", fruits);
    console.log("SET", fruits2);
  });

  it('should lookup "quoted" properties', function() {
    var input = {jedi:{name:'Luke'}, smuggler:{name:'Hans'}};
    var output = pivot(input, "$role.name.$n", '$n.$role');
    console.log(output);
    assert.equal(output['Luke'], 'jedi');
  });

  it('should set fixed properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "$role.$n", '$role.name.$n');
    console.log(output);
    assert.equal(output['jedi']['name'], 'Luke');
  });

  it('should handle unset properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "$role.$name", '$role.$actor.$name');
    console.log(output);
    assert.equal(output['jedi']['unset'], 'Luke');
  });

  it('should run the readme examples!', function() {
    var mydata = {
      monday: {apples:1},
      tuesday: {apples:2, pears:1}
    }

    // Reverse the map: What days did I buy apples?
    // Multiple values will become an array, single values will be left as-is.
    var daysByFruit = pivot(mydata,'$day.$fruit.$n', '$fruit.$day');
    // output is {apples:['monday','tuesday'], pears:'tuesday'}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'],'tuesday');

    // Suppose we always want arrays, even if there's only one value.
    // Use mode('list') like this:
    daysByFruit = pivot(mydata,'$day.$fruit.$n', '$fruit.$day', {mode:'array'});
    // output is {apples:['monday','tuesday'], pears:['tuesday']}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'][0],'tuesday');
    assert.equal(daysByFruit['pears'].length, 1);

    // forget the day (this will sum over the days)
    var totalPerFruit = pivot(mydata,'$day.$fruit.$n', '$fruit.$n');
    // output is {apples:3, pears:1}
    assert.equal(totalPerFruit['apples'], 3);
    assert.equal(totalPerFruit['pears'], 1);
  });
});
