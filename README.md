# Data Pivot (pivot.js)

Status: early version!

pivot makes it easy to rearrange JSON objects (or other objects).
It takes 3 arguments:

  pivot(data, inputSchema, outputSchema)

The schemas use a simple string format: `.` to mark object structure, and `$` to mark variables.    
Arrays can be represented either by a variable index, e.g. `$i.$item`, or by `[]`, e.g. `[]$item`.     
As a convenient shorthand, `{a: $a}` can be written as `{a}`.   

For example: "$top-key . $middle-key . $value"

You can call the keys anything you like - they get matched between inputSchema and outputSchema.   
Whitespace between keys is trimmed.

pivot can sum numbers and collect multiple values into arrays (this and other settings can be configured).

Let's see a few examples:

    var mydata = {
      monday: {apples:1},
      tuesday: {apples:2, pears:1}
    }

    // Reverse the map: What day did I buy pears?  
    var daysByFruit = pivot(mydata, '$day.$fruit.$n', '$fruit.$day');  
    // Multiple values become an array, single values are left as-is.
    // So the output is {apples:['monday','tuesday'], pears:'tuesday'}

    // Suppose we always want arrays, even if there's only one value.
    // Use mode('array') like this:
    var daysByFruit = pivot(mydata, '$day.$fruit.$n', '$fruit.$day').mode('array');  
    // output is {apples:['monday','tuesday'], pears:['tuesday']}

    // Forget the day (this will sum over the days)
    var totalPerFruit = pivot(mydata,'$day . $fruit . $n', '$fruit . $n');  
    // output is {apples:3, pears:1}

## Installation: No dependencies, just one small file

**In html?** Download pivot.js, then use: `<script src='pivot.js'></script>`

**In node?** `npm install data-pivot`
