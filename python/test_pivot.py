import pivot;
import unittest

class TestPivot(unittest.TestCase):

    def setUp(self):
        pass

    def test_reverse_lists(self):
        mydata = {'monday':['apples','pears'], 'tuesday':['pears']}
        output = pivot.pivot(mydata, "day -> fruit[]", "fruit -> day")
        print(output)
        assert output['apples'] == 'monday'

    def test_pivot_simple(self):
        mydata = {'monday':'apples', 'tuesday':'pears'}
        output = pivot.pivot(mydata, "day -> fruit", "fruit -> day")
        print(output)
        assert output['apples'] == 'monday'

    def test_rearrange(self):
        datain = {'jedi':{'Skywalker':'Luke'}, 'smuggler':{'Solo':'Hans'}};
        output = pivot.pivot(datain, 'role -> sn -> n', 'n -> role')
        assert output['Luke'] == 'jedi';
        assert output['Hans']== 'smuggler'
        print(output);
        output = pivot.pivot(datain, 'role -> sn -> n', 'n -> sn -> role')
        assert output['Luke']['Skywalker'] == 'jedi'
        print(output);

    def test_zero_key(self):
        datain = {0:'foo'};
        output = pivot.pivot(datain, 'num -> f', 'f -> num')
        print(output);
        assert output['foo'] == 0, output

        datain = {0:{'Skywalker':'Luke'}};
        output = pivot.pivot(datain, 'num -> sn -> n', 'num -> n')
        print(output);
        assert output[0] == 'Luke', output

    def test_number_keys(self):
        datain = {0:{'Skywalker':'Luke'}, 1:{'Solo':'Hans'}, 2:{'Vader':'Darth'}};
        output = pivot.pivot(datain, 'num -> sn -> n', 'num -> n')
        print(output);
        assert output[0] == 'Luke', output
        assert output[1] == 'Hans'
        output = pivot.pivot(datain, 'num -> sn -> n', 'sn -> num -> n')
        assert output['Skywalker'][0] == 'Luke'
        assert  output['Vader'][2] == 'Darth'
        output = pivot.pivot(datain, 'num -> sn -> n', 'n -> num')
        assert output['Darth'] == 2

    def test_sum(self):
        datain = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
        output = pivot.pivot(datain, 'store -> fruit -> n', 'fruit -> n')
        print(output);
        assert output['apples'] == 303
        assert output['pears']== 50

    def test_list(self):
        datain = {'tesco': {'apples':100,'pears':50}, 'coop': {'apples':200}, 'm&s':{'apples':3}};
        output = pivot.pivot(datain, 'store -> fruit -> n', 'fruit -> n', mode='array')
        print(output);
        assert output['pears'][0] == 50
        assert 100 in output['apples'], output['apples']
        assert 200 in output['apples']
        assert 3 in output['apples']

#
#   it('should lookup "quoted" properties', function() {
#     datain = {jedi:{name:'Luke'}, smuggler:{name:'Hans'}};
#     output = pivot.pivot(datain, "role -> 'name' -> n", 'n -> role')
#     print(output);
#     assert output['Luke'] == 'jedi'
#
#
#   it('should set "quoted" properties', function() {
#     datain = {jedi:'Luke', smuggler:'Hans'};
#     output = pivot.pivot(datain, "role -> n", 'role -> "name" -> n')
#     print(output);
#     assert output['jedi']['name'] == 'Luke'
#
#
    def test_unset(self):
        datain = {'jedi':'Luke', 'smuggler':'Hans'}
        output = pivot.pivot(datain, "role -> name", 'role -> actor -> name')
        print(output);
        assert output['jedi']['unset'] == 'Luke'

    def test_readme_examples(self):
        mydata = {
          'monday': {'apples':1},
          'tuesday': {'apples':2, 'pears':1}
        }

        # Reverse the map: What days did I buy apples?
        # Multiple values will become an array, single values will be left as-is.
        daysByFruit = pivot.pivot(mydata,'day -> fruit -> n', 'fruit -> day')
        # output is {apples:['monday','tuesday'], pears:'tuesday'}
        assert 'monday' in daysByFruit['apples']
        assert 'tuesday' in daysByFruit['apples']
        assert daysByFruit['pears'] =='tuesday'

        # Suppose we always want arrays, even if there's only one value.
        # Use mode('list') like this:
        daysByFruit = pivot.pivot(mydata,'day -> fruit -> n', 'fruit -> day', mode='array')
        # output is {apples:['monday','tuesday'], pears:['tuesday']}
        assert 'monday' in daysByFruit['apples']
        assert 'tuesday' in daysByFruit['apples']
        assert daysByFruit['pears'][0] =='tuesday'
        assert len(daysByFruit['pears']) == 1

        # forget the day (this will sum over the days)
        totalPerFruit = pivot.pivot(mydata,'day -> fruit -> n', 'fruit -> n')
        # output is {apples:3, pears:1}
        assert totalPerFruit['apples'] == 3
        assert totalPerFruit['pears'] == 1



if __name__ == '__main__':
    unittest.main()
