# Data Pivot (pivot.js)

Status: early scratch!

pivot makes it easy to rearrange JSON objects (or other objects).
It takes 3 arguments:

  pivot(data, inputSchema, outputSchema)

Where the schemas are in the format e.g. "top-key -> middle-key -> value"
You can call the keys anything you like - they get matched between inputSchema and outputSchema.

pivot can sum numbers and collect multiple values into arrays (this and other settings can be configured).

Let's see a few examples:

  var mydata = {
    monday: {apples:1},
    tuesday: {apples:2, pears:1}
  }

  // Reverse the map: What days did I buy apples?
  // Multiple values will become an array, single values will be left as-is.
  var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').run();  
  // output is {apples:['monday','tuesday'], pears:'tuesday'}

  // Suppose we always want arrays, even if there's only one value.
  // Use mode('list') like this:
  var daysByFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> day').mode('list').run();  
  // output is {apples:['monday','tuesday'], pears:['tuesday']}

  // forget the day (this will sum over the days)
  var totalPerFruit = pivot(mydata,'day -> fruit -> n', 'fruit -> n').run();  
  // output is {apples:3, pears:1}

TODO
