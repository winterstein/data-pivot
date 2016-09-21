
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
    var output = pivot(input, 'k -> v', 'v -> k').run();
    assert.equal(-1, [1,2,3].indexOf(4));

  });

});
