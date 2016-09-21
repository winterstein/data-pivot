
// TODO organise into tests

var assert = require('assert');
var pivot = require('../src/pivot.js');
describe('pivot', function() {

  it('should be loaded here', function() {
    console.log(pivot, typeof(pivot));
    assert.equal(typeof(pivot), 'function');
  });

  it('should reverse key->value to value->key', function() {
    var input = {'Mark':'Hammill', 'Harrison':'Ford'};
    var output = pivot(input, 'n -> sn', 'sn -> n').run();
    assert.equal(output['Ford'], 'Harrison');
    assert.equal(output['Hammill'], 'Mark');
  });

  it('should handle complex map re-arranging', function() {
    var input = {'jedi':{'Skywalker':'Luke'}, 'smuggler':{'Solo':'Hans'}};
    var output = pivot(input, 'role -> sn -> n', 'n -> role').run();
    assert.equal(output['Luke'], 'jedi');
    assert.equal(output['Hans'], 'smuggler');
    console.log(output);
    output = pivot(input, 'role -> sn -> n', 'n -> sn -> role').run();
    assert.equal(output['Luke']['Skywalker'], 'jedi');
    console.log(output);
  });

  it('should handle number keys', function() {
    var input = {0:{'Skywalker':'Luke'}, 1:{'Solo':'Hans'}, 2:{'Vader':'Darth'}};
    var output = pivot(input, 'num -> sn -> n', 'num -> n').run();
    assert.equal(output[0], 'Luke');
    assert.equal(output[1], 'Hans');
    console.log(output);
    output = pivot(input, 'num -> sn -> n', 'sn -> num -> n').run();
    assert.equal(output['Skywalker'][0], 'Luke');
    assert.equal(output['Vader'][2], 'Darth');
    output = pivot(input, 'num -> sn -> n', 'n -> num').run();
    assert.equal(output['Darth'], 2);
  });

  it('should sum overlapping number values', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, 'store -> fruit -> n', 'fruit -> n').run();
    console.log(output);
    assert.equal(output['apples'], 303);
    assert.equal(output['pears'], 50);
  });

  it('should list (not sum) number values if mode=array', function() {
    var input = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
    var output = pivot(input, 'store -> fruit -> n', 'fruit -> n')
                  .mode('array')
                  .run();
    console.log(output);
    assert.equal(output['pears'][0], 50);
    assert.equal(output['apples'][0], 100);
    assert.equal(output['apples'][1], 200);
  });

  it('should lookup "quoted" properties', function() {
    var input = {jedi:{name:'Luke'}, smuggler:{name:'Hans'}};
    var output = pivot(input, "role -> 'name' -> n", 'n -> role').run();
    console.log(output);
    assert.equal(output['Luke'], 'jedi');
  });

  it('should set "quoted" properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "role -> n", 'role -> "name" -> n').run();
    console.log(output);
    assert.equal(output['jedi']['name'], 'Luke');
  });

  it('should handle unset properties', function() {
    var input = {jedi:'Luke', smuggler:'Hans'};
    var output = pivot(input, "role -> name", 'role -> actor -> name').run();
    console.log(output);
    assert.equal(output['jedi']['unset'], 'Luke');
  });

// TODO
  // it('should handle sibling properties using {}s', function() {
  //   var input = {jedi:{name:'Luke', weapon:'light saber'}, smuggler:{name:'Hans'}};
  //   var output = pivot(input, "role -> {'name' -> n, 'weapon' -> w}", 'n -> w').run();
  //   console.log(output);
  //   assert.equal(output['Luke'], 'light saber');
  // });

  it('should run the readme examples!', function() {
    var mydata = {
      monday: {apples:1},
      tuesday: {apples:2, pears:1}
    }

    // Reverse the map: What days did I buy apples?
    // Multiple values will become an array, single values will be left as-is.
    var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').run();
    // output is {apples:['monday','tuesday'], pears:'tuesday'}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'],'tuesday');

    // Suppose we always want arrays, even if there's only one value.
    // Use mode('list') like this:
    daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').mode('array').run();
    // output is {apples:['monday','tuesday'], pears:['tuesday']}
    assert.equal(daysByFruit['apples'][0],'monday');
    assert.equal(daysByFruit['apples'][1],'tuesday');
    assert.equal(daysByFruit['pears'][0],'tuesday');
    assert.equal(daysByFruit['pears'].length, 1);

    // forget the day (this will sum over the days)
    var totalPerFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> n').run();
    // output is {apples:3, pears:1}
    assert.equal(totalPerFruit['apples'], 3);
    assert.equal(totalPerFruit['pears'], 1);
  });
});
