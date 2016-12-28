
// Run with mocha
// e.g. 
if (typeof assert === 'undefined') {
    assert = require('assert');
}
if (typeof pivot === 'undefined') {
    pivot = require('../src/pivot.js');
}

describe('pivot', function() {

  it('should be loaded here', function() {
    console.log(pivot, typeof(pivot));
    assert.equal(typeof(pivot), 'function');
  });

  it('should handle lists of input values', function() {
    var mydata = {'monday':['apples','pears'], 'tuesday':['pears']};
    var output = pivot(mydata, "day -> fruit[]", "fruit -> day");
    console.log(output);
    assert.equal(output['apples'], 'monday');
  });

  it('should pluck', function() {
     var input = {'Mark':'Hammill', 'Harrison':'Ford'};
     var output = pivot(input, 'fn -> sn', 'sn');
     console.log(output);
     assert.equal(output[0], 'Hammill');
     assert.equal(output[1], 'Ford');
  });

  it('should handle array inputs', function() {
     var input = [{'Mark':'Hammill'}, {'Harrison':'Ford'}];
     var output = pivot(input, 'i -> fn -> sn', 'fn -> sn');
     assert.equal(output['Mark'], 'Hammill');
  });

  it('should support array outputs', function() {
     var input = [{'Mark':'Hammill'}, {'Harrison':'Ford'}];
     var output = pivot(input, 'i -> fn -> sn', 'i -> fn');
     assert.equal(output[0], 'Mark');
  });

  it('should handle object values', function() {
      var input = {'star-wars': {'jedi':{'sn':'Skywalker', 'fn':'Luke'}, 'smuggler':{'sn':'Solo', 'fn':'Hans'}}};
      var output = pivot(input, 'film -> role -> person', 'film -> person');
      var peeps = output['star-wars'];
      assert.equal(peeps.length, 2);
      assert.equal(peeps[0].fn, 'Luke');
      assert.equal(peeps[1].fn, 'Hans');
  });

  it('should reverse key->value to value->key', function() {
    var input = {'Mark':'Hammill', 'Harrison':'Ford'};
    var output = pivot(input, 'n -> sn', 'sn -> n');
    assert.equal(output['Ford'], 'Harrison');
    assert.equal(output['Hammill'], 'Mark');
  });

  it('should handle complex map re-arranging', function() {
    var input = {'jedi':{'Skywalker':'Luke'}, 'smuggler':{'Solo':'Hans'}};
    var output = pivot(input, 'role -> sn -> n', 'n -> role');
    assert.equal(output['Luke'], 'jedi');
    assert.equal(output['Hans'], 'smuggler');
    output = pivot(input, 'role -> sn -> n', 'n -> sn -> role');
    assert.equal(output['Luke']['Skywalker'], 'jedi');
  });

  it('should handle number keys', function() {
    var input = {0:{'Skywalker':'Luke'}, 1:{'Solo':'Hans'}, 2:{'Vader':'Darth'}};
    var output = pivot(input, 'num -> sn -> n', 'num -> n');
    assert.equal(output[0], 'Luke');
    assert.equal(output[1], 'Hans');
    output = pivot(input, 'num -> sn -> n', 'sn -> num -> n');
    assert.equal(output['Skywalker'][0], 'Luke');
    assert.equal(output['Vader'][2], 'Darth');
    output = pivot(input, 'num -> sn -> n', 'n -> num');
    assert.equal(output['Darth'], 2);
  });

  it('should sum overlapping number values', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, 'store -> fruit -> n', 'fruit -> n');
    console.log(output);
    assert.equal(output['apples'], 303);
    assert.equal(output['pears'], 50);
  });

  it('should list (not sum) number values if mode=array', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, 'store -> fruit -> n', 'fruit -> n', {mode:'array'});
    console.log(output);
    assert.equal(output['pears'][0], 50);
    assert.equal(output['apples'][0], 100);
    assert.equal(output['apples'][1], 200);
  });

  it('mode=array vs mode=set', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3,'mango':2}};
    var fruits = pivot(input, 'store -> fruit -> n', 'fruit', {mode:'array'});
    var fruits2 = pivot(input, 'store -> fruit -> n', 'fruit', {mode:'set'});
    assert.equal(fruits.length, 5);
    assert.equal(fruits2.length, 3);
    console.log("ARRAY", fruits);
    console.log("SET", fruits2);
  });

  it('should lookup "quoted" properties', function() {
    var input = {jedi:{name:'Luke'}, smuggler:{name:'Hans'}};
    var output = pivot(input, "role -> 'name' -> n", 'n -> role');
    console.log(output);
    assert.equal(output['Luke'], 'jedi');
  });

  it('should set "quoted" properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "role -> n", 'role -> "name" -> n');
    console.log(output);
    assert.equal(output['jedi']['name'], 'Luke');
  });

  it('should handle unset properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "role -> name", 'role -> actor -> name');
    console.log(output);
    assert.equal(output['jedi']['unset'], 'Luke');
  });

// TODO
  // it('should handle sibling properties using {}s', function() {
  //   var input = {jedi:{name:'Luke', weapon:'light saber'}, smuggler:{name:'Hans'}};
  //   var output = pivot(input, "role -> {'name' -> n, 'weapon' -> w}", 'n -> w');
  //   console.log(output);
  //   assert.equal(output['Luke'], 'light saber');
  // });

  it('TODO should decipher records', function() {
    var mydata = [
      {day:'monday', fruit:'apples', n:1},
      {day:'tuesday', fruit:'apples', n:1},
      {day:'tuesday', fruit:'pears', n:3}
    ];

    var fruits = pivot(mydata, null, 'fruit -> n');
    assert.equal(fruits['apples'], 2);
    assert.equal(fruits['pears'], 3);
  });

  it('should run the readme examples!', function() {
    var mydata = {
      monday: {apples:1},
      tuesday: {apples:2, pears:1}
    }

    // Reverse the map: What days did I buy apples?
    // Multiple values will become an array, single values will be left as-is.
    var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day');
    // output is {apples:['monday','tuesday'], pears:'tuesday'}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'],'tuesday');

    // Suppose we always want arrays, even if there's only one value.
    // Use mode('list') like this:
    daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day', {mode:'array'});
    // output is {apples:['monday','tuesday'], pears:['tuesday']}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'][0],'tuesday');
    assert.equal(daysByFruit['pears'].length, 1);

    // forget the day (this will sum over the days)
    var totalPerFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> n');
    // output is {apples:3, pears:1}
    assert.equal(totalPerFruit['apples'], 3);
    assert.equal(totalPerFruit['pears'], 1);
  });
});
