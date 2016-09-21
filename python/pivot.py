import re

# data-pivot
# A tool for re-arranging data
# Copyright 2016 Daniel Winterstein

def pivot(data, inputSchema, outputSchema, mode=None):
    pivotter = Pivotter(data, inputSchema, outputSchema, mode)
    output = {}
    pivotter.pivot2(data, 0, {}, output)
    return output

# string constants for mode()
ARRAY = 'array';
SUM = 'sum';
FIRST = 'first';

def isArray(obj):
    return isinstance(obj, (list, tuple))

def isNumber(x):
    try:
        float(x)
        return True
    except:
        return False

class Pivotter(object):
    def __init__(self, data, inputSchema, outputSchema, mode):
        self.data = data
        self.inputSchema = re.split("\s*->\s*", inputSchema);
        self.outputSchema = re.split("\s*->\s*", outputSchema);
        # What property-name to use if a property is unset.
        # E.g. if you pivot "a -> b" to "a -> c -> b"
        self.unset = {'unset':'unset'}
        self.mode = mode;
        if mode and not mode in [SUM, ARRAY, FIRST]:
            raise ValueError("Unrecognised mode " + mode);

    def pivot2(self, dataobj, depth, path, outputobj):
        kName = self.inputSchema[depth];
        # a fixed property, indicated by quotes?
        if (kName[0] == "'" or kName[0] == '"'):
            k = kName.substr(1, kName.length - 2);
            # derefernce dataobj
            v = dataobj.get(k,None);
            if v is None: return;
            self.pivot2(v, depth + 1, path, outputobj);
            return;
        # literal?
        dtype = type(dataobj)
        if dtype in [str, unicode, float, int, bool]:
            path[kName] = dataobj
            # Now set the output
            self.set(outputobj, path)
            return
        # ./literal
        # Array?
        #       if (isArray(dataobj)) {
        #
        #       }
        for k in dataobj:
            path2 = path;  # TODO copy!
            path2[kName] = k;
            v = dataobj.get(k,None);
            if v is None: continue;
            self.pivot2(v, depth + 1, path2, outputobj);
        # done pivot2


    def set(self, outputobj, path):
        o = outputobj;
        prevk = None;
        for ki in range(len(self.outputSchema)):
            kNamei = self.outputSchema[ki];
            # a fixed property, indicated by quotes?
            if kNamei[0] == "'" or kNamei[0] == '"':
                k = kNamei[1 : -2];
            else:
                # normal case: lookup the key from the path we built
                k = path.get(kNamei,None);
            if ki == len(self.outputSchema) - 1:
                # output leaf node -- set the value
                old = o.get(prevk,None);
                # Always output lists?
                if self.mode == ARRAY:
                    if old is None:
                        old = [];
                        o[prevk] = old;
                    old.append(k);
                    return;
                # normal case
                if old is None:
                    o[prevk] = k;
                    return;
                # first value wins?
                if self.mode == FIRST:
                    return;
                # sum? NB: mode != array
                if isNumber(old):
                    o[prevk] = old + k;
                else:
                    # convert to list
                    if not isArray(old):
                        old = [old];
                    old.append(k);
                    o[prevk] = old;
                return;

            if k is None: k = self.unset['unset'];
            if k is None:
                return;  # skip this
            # almost the leaf node -- we don't need another object
            if ki == len(self.outputSchema) - 2:
                prevk = k;
                continue;
            # get/make an object
            newo = o.get(k,None);
            if newo is None:
                newo = {};
                o[k] = newo;

            o = newo;
