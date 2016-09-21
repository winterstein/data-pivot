
mymap = {
  'daniel':'winterstein'
  // 'roscoe':'mcinerney'
};

mydata = {
  'winterstein': {
    'first':'Daniel',
    'job':'CTO'
  },
  'appel': {
    'first':'Daniel',
    'job':'sys-admin'
  }
};

p1 = pivot(mymap, "n -> sn", "sn -> n");
f1 = p1.run();


// p = pivot(mydata, "sn -> prop -> v", "prop -> v -> sn");
// flipped = p.run();
