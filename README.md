# Data Pivot (pivot.js)

Status: early version!

pivot makes it easy to rearrange JSON objects (or other objects).
It takes 3 arguments, then you call run():

  pivot(data, inputSchema, outputSchema).run()

The schemas use a simple string format like this: "top-key -> middle-key -> value".
You can call the keys anything you like - they get matched between inputSchema and outputSchema.

pivot can sum numbers and collect multiple values into arrays (this and other settings can be configured).

Let's see a few examples:

## Installation: No dependencies, just one small file

**In html?** Download pivot.js, then use: `<script src='pivot.js'></script>`

**In node?** `npm install data-pivot`

## Javascript (pivot.js)

    var mydata = {
      monday: {apples:1},
      tuesday: {apples:2, pears:1}
    }

    // Reverse the map: What day did I buy pears?  
    var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').run();  
    // Multiple values become an array, single values are left as-is.
    // So the output is {apples:['monday','tuesday'], pears:'tuesday'}

    // Suppose we always want arrays, even if there's only one value.
    // Use mode('array') like this:
    var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').mode('array').run();  
    // output is {apples:['monday','tuesday'], pears:['tuesday']}

    // Forget the day (this will sum over the days)
    var totalPerFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> n').run();  
    // output is {apples:3, pears:1}

## Python (pivot.py)

Also available in Python! The Python version is included here -- see pivot.py
