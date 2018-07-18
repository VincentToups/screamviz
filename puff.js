var open = {value:"the-open-token"}

/** compose functions
 *  return a new function which applies the last argument to compose
 *  to the values passed in and then applies each previous function
 *  to the previous result.  The final result is returned.
 */
function compose(){
    var fs = Array.prototype.slice.call(arguments, 0, arguments.length);
    return function(){
	var inArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	var i = fs.length-1;
	var res = fs[i].apply(null, inArgs);
	i = i - 1;
	for(; i>=0; i = i - 1){
	    
	    res = fs[i](res);
	}
	return res;
    };
}

/** reverse compose 
 * as in compose, but functions are applied first to last instead of last to first
 */
function rCompose(){
    var fs = Array.prototype.slice.call(arguments, 0, arguments.length);
    return function(){
	var inArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	var i = 0;
	var res = fs[i].apply(null, inArgs);
	i = i + 1;
	var n = fs.length;
	for(; i<n; i = i + 1){
	    res = fs[i](res);
	}
	return res;
    }
}



/** apply the composition of the 1..n arguments to the 0th argumenxst.
*
*/
function rComposeOn(){
    var initialValue = arguments[0];
    var rest = Array.prototype.slice.call(arguments, 1, arguments.length);
    return rCompose.apply(null, rest)(initialValue);
}

/** partially fix arguments to f (on the right)
 *
 */
function partialRight(f /*... fixedArgs */){
    var fixedArgs = Array.prototype.slice.call(arguments, 1, arguments.length);
    var out = function(/*... unfixedArgs */){
	var unfixedArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	return f.apply(null,unfixedArgs.concat(fixedArgs));
    }
    out.toString = function(){
	return "partialRight("+f.toString()+","+fixedArgs.join(",")+")";
    }
    return out;
}

/** given a function f, return g, which is f curried on the right 
 *  g will be a function which takes arguments (a), returns h which takes further arguments (b)
 *  and returns f.apply(b.concat(a));
 */
function curryRight(f){
    return function(){
	return partialRight.apply(null, [f].concat(Array.prototype.slice.call(arguments, 0, arguments.length)));
    }
}

/** partially fix arguments to f (on the left)
 *
 */
function partialLeft(f /*... fixedArgs */){
    var fixedArgs = Array.prototype.slice.call(arguments, 1, arguments.length);
    var out = function(/*... unfixedArgs */){
	var unfixedArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	return f.apply(null,fixedArgs.concat(unfixedArgs));
    }
    out.toString = function(){
	return "partialLeft("+f.toString()+","+fixedArgs.join(",")+")";
    }
    return out;
}

/** given a function f, return g, which is f curried on the left
 *  g will be a function which takes arguments (a), returns h which takes further arguments (b)
 *  and returns f.apply(a.concat(b));
 */
function curryLeft(f){
    return function(){
	return partialLeft.apply(null, [f].call(Array.prototype.slice.call(arguments, 0, arguments.length)));
    }
}

/** return a new function with its arguments in order, zero based indexing
 */
function permute(f,order){
    return function(){
        var args = Array.prototype.slice.call(arguments,0,arguments.length);
        return f.apply(this,order.map(function(i){
            return args[i];
        }));
    };
}

/** index into o, an object or array
 * if multiple indices are provided, each is applied to the result of indexing the previous
 */
function index(o /* ... indexes */){
    var indexes = Array.prototype.slice.call(arguments, 1, arguments.length);
    var indexCount = indexes.length;
    if(indexCount === 1){
	return o[indexes[0]];
    } else {
	for(var i = 0; i < indexCount; i = i + 1){
	    o = o[indexes[i]];
	}
	return o;
    }	
}

/** bind bind f to an instance t.
 *
 */
function bind(f,t){
    return r.bind(t);
}

/** reduce seq a with f and optional initial value init.
 *
 */
function reduce(f, a, init){
    if(typeof init === 'undefined'){
	return a.reduce(f);
    } else {
	return a.reduce(f, init);
    }
}

/** return the length of a
 */
function length(a){
    return a.length;
}

function largestLength(as){
    return as.reduce(function(largestSoFar, a){
	if(a.length>largestSoFar){
	    return a.length;
	} else {
	    return largestSoFar;
	}
    }, -Infinity);
}

function sort(a,crit){
    if(arguments.length===1){
	if(typeof a === 'function'){
	    return function(actualArray){
		return actualArray.map(id).sort(a);
	    }
	} else if(typeof a === 'string' || typeof a === 'number'){
	    return function (actualArray){
		return actualArray.map(id).sort(function(r,s){
							   r = r[a];
							   s = s[a];
							   if(r<s) return -1;
							   if(r>s) return 1;
							   return 0;
							   })
	    };
	} else {
	    return function(actualCrit){
		if(typeof actualCrit==='function'){
		    return a.map(id).sort(actualCrit);
		} else {
		    return a.map(id).sort(function(r,s){
			r = r[actualCrit];
			s = s[actualCrit];
			if(r<s) return -1;
			if(r>s) return 1;
			return 0;
		    });
		}
	    }
	}
    } else {
	return a.map(id).sort(typeof crit === 'function' ? crit :
			      function(r,s){
				  return a.sort(function(r,s){
				      r = r[crit];
				      s = s[crit];
				      if(r<s) return -1;
				      if(r>s) return 1;
				      return 0;
				  });
			      });
    }
}

function initArray(count, init){
    var a = [];
    for(var i = 0; i < count; i = i + 1){
	if(typeof init === "function"){
	    a.push(init(i));
	} else {
	    a.push(init);
	}
    }
    return a;
}

function shuffle(a){
    return r(map(function(a){return [Math.random(),a]}),
	     sort(0),
	     map(second))(a);
}

function randomElement(a){
    return a[Math.floor(Math.random()*a.length)];
}

function nextCellIndex(a, indexes){
    var indexes = indexes.map(id);
    var delta = indexes.length-1;
    var subIndex = indexes.slice(0,delta);
    var indexedArray = index.apply(null, [a].concat(subIndex));
    var done = indexes[delta]+1 < indexedArray.length;
    while(!done){
	delta = delta -1;
	if(delta<0){
	    return null;
	} else {
	    indexedArray = index.apply(null, [a].concat(indexes.slice(0,delta)));
	    done = indexes[delta]+1 < indexedArray.length;
	    
	}
    }
    indexes[delta] = indexes[delta]+1;
    for(var i = delta+1; i<indexes.length; i = i + 1){
	indexes[i] = 0;
    }
    return indexes;
}

function guessRank(a){
    var rank = 0;
    var done = false;
    while(!done){
	if(typeof a['length'] === 'number'){
	    rank = rank + 1;
	    a = a[0];
        } else {
            done = true;
        }
    }
    return rank;
}

function cells(n, a){
    if(!isFinite(n)){
	return a;
    }
    if(n<0){
	var nn = -n;
	var out = [];
	var indexes = initArray(nn,0);
	while(indexes){
	    out.push(index.apply(null, [a].concat(indexes)));
	    indexes = nextCellIndex(a,indexes)
	}
	return out;
    } else {
	var rank = n-guessRank(a);
	return cells(rank, a);
    }
}

function rank(f){
    var ranks = Array.prototype.slice.call(arguments,1,arguments.length);
    return function(){
	return map.apply(null,[f].concat(map(cells, 					     
					     ranks,
					     Array.prototype.slice.call(arguments,0,arguments.length))));
    };
}

/** apply f to each key of o
* f is called with the key and value of at that key.
*/
function eachKey(f,o){
    return each(function(k){
        f(k,o[k]);
    }, Object.keys(o));
}

/** apply f to each key of o (and o[k])
* and return a list of results.
*/
function mapKey(f,o){
    return Object.keys(o).sort().map(function(k){
        return f(k,o[k]);
    });
}

/** reduce init via f(k,v,init) over
* the keys and values of o
*/
function reduceKey(f,o,init){
    eachKey(function(k,v){
        init = f(k,v,init);
    },o);
    return init;
}

/** apply f over arrays if multiple arrays are provided, the f is
 * applied only to items from the length of the shortest and f is
 * applied to as many elements as there are arrays, each drawn from
 * one of the input arrays.
 * 
 * if no arrays are applied, return each partially applied on the left with f
 *
 * if no function is provided, return each partially applied with arrays on the right.
 */
function each(f /*... arrays */){
    var arrays = Array.prototype.slice.call(arguments, 1, arguments.length);
    if(typeof f === 'function' && arrays.length === 0){
	return function(){
	    var arrays = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return each.apply(null, [f].concat(arrays));
	};
    } else if (typeof f !== 'function') {
	return function(g){
	    return each.apply(null, [g,f].concat(arrays));
	};
    } else {
	var arrayCount = arrays.length;
	if(arrayCount === 1){
	    return arrays[0].forEach(function(el){
		return f(el);
	    });
	} else {
	    var maxLen = largestLength(arrays);
	    var argHolder = initArray(arrayCount, undefined);
	    for(var i = 0; i < maxLen; i = i + 1){
		for(var j = 0; j < arrayCount; j = j + 1){
		    argHolder[j] = arrays[j][i];
		}
		f.apply(null, argHolder);
	    }
	    return undefined;
	}
    }
}

/** map f over arrays
 * if multiple arrays are provided, the result is the length of the shortest
 * and f is applied to as many elements as there are arrays, each drawn from 
 * one of the input arrays.
 * 
 * if no arrays are applied, return map partially applied on the left with f
 *
 * if no function is provided, return map partially applied with arrays on the right.
 */
function map(f /*... arrays */){
    var arrays = Array.prototype.slice.call(arguments, 1, arguments.length);
    if(typeof f === 'function' && arrays.length === 0){
	return function(){
	    var arrays = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return map.apply(null, [f].concat(arrays));
	};
    } else if (typeof f !== 'function') {
	return function(g){
	    return map.apply(null, [g,f].concat(arrays));
	};
    } else {
	var arrayCount = arrays.length;
	if(arrayCount === 1){
	    return arrays[0].map(function(el){
		return f(el);
	    });
	} else {
	    var maxLen = largestLength(arrays);
	    var out = [];
	    var argHolder = initArray(arrayCount, undefined);
	    for(var i = 0; i < maxLen; i = i + 1){
		for(var j = 0; j < arrayCount; j = j + 1){
		    argHolder[j] = arrays[j][i];
		}
		out.push(f.apply(null, argHolder));
	    }
	    return out;
	}
    }
}

function mapFilterHelper(test,f,lsts){
    var n = reduce(function(a,b){
        if(a.length<b.length) return a;
        if(b.length<a.length) return b;
        return a;
    },lsts).length;
    var nL = lsts.length;
    var out = [];
    var args = new Array(nL);
    var i,j;
    for(i=0;i<n;i++){
        for(j=0;j<nL;j++){
            args[j] = lsts[i][j];
        }
        if(!test.apply(this,args)) out.push(f.apply(this,args));        
    }
    return out;
}


function unique(elements, hash){
    var hash = typeof hash === "undefined" ? id : hash;
    var outTable = {};
    var n = elements.length;
    for(var i = 0; i < n; i = i + 1){
	outTable[hash(elements[i])] = elements[i];
    }
    return Object.keys(outTable).map(function(k){
	return outTable[k];
    });
}

function groupBy(elements, hash){
    var outTable = {};
    var n = elements.length;
    var k = undefined;
    var col = undefined;
    for(var i = 0; i < n; i = i + 1){
	k = hash(elements[i]);
	col = outTable[k] || [];
	outTable[k] = col;
	col.push(elements[i]);
    }
    return outTable;
}

function ungroupArray(a){
    var an = a.length;
    var out = [];
    for(var ai = 0; ai < an; ai = ai + 1){
	var s = a[ai];
	var sn = s.length;
	for(var si = 0; si < sn; si = si + 1){
	    out.push(s[si]);
	}
    }
    return out;
}

function ungroup(o){
    if(o instanceof Array){
	return ungroupArray(o);
    }
    var n = reduce(function(ac,it){
	return ac+o[it].length;
    },Object.keys(o),0);
    var out = new Array(n);
    var oi = 0;
    Object.keys(o).forEach(function(k){
	var subo = o[k];
	var subn = subo.length;
	var i = 0;
	for(i=0;i<subn;i=i+1){
	    out[oi]=subo[i];
	    oi++;
	}
    });
    return out;
}

function filter(f,a){
    if(arguments.length===1){
	if(typeof f === 'function'){
	    return function(a){
		return a.filter(f);
	    }
	} else {
	    var realA = f;
	    return function(f){
		return realA.filter(f);
	    }
	}
    } else {
	return a.filter(f);
    }
}

function threadAlong1(f,position){
    return function(){
	var args = Array.prototype.slice.call(arguments, 0, arguments.length);
	var threaded = args[position];
	var n = threaded.length;
	var out = [];
	for(var i = 0; i < n; i = i + 1){
	    args[position] = threaded[i];
	    out.push(f.apply(null, args));
	}
	return out;
    }
}

function threadAlong(f, nArgs){
    for(var i = 0; i < nArgs; i = i + 1){
	f = threadAlong1(f,i);
    }
    return f;
}

function crossMap(f){
    var argLists = Array.prototype.slice.call(arguments, 1, arguments.length);
    if(typeof f !== 'function'){
	var realArgList = [f].concat(argLists);
	return function(realF){
	    return threadAlong(realF, realArgList.length).apply(null, realArgList);
	}
    } else if (typeof f === 'function' && argLists.length === 0){
	return function(){
	    var realArgList = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return threadAlong(f, realArgList.length).apply(null, realArgList);
	}
    } else {
	return threadAlong(f,argLists.length).apply(null, argLists);
    }
}

function cat(){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);    
    return Array.prototype.concat.apply([], args);
}

function mapcat(f){
    var arrays = Array.prototype.slice.call(arguments, 1, arguments.length);
    if(typeof f === 'function' && arrays.length === 0){
	return function(){
	    var arrays = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return mapcat.apply(null, [f].concat(arrays));
	}
    } else if (typeof f !== 'function') {
	return function(g){
	    return mapcat.apply(null, [g,f].concat(arrays));
	}
    } else {
	var arrayCount = arrays.length;
	if(arrayCount === 1){
	    return cat.apply(null, arrays[0].map(function(el){
		return f(el);
	    }));
	} else {
	    var maxLen = largestLength(arrays);
	    var out = [];
	    var argHolder = initArray(arrayCount, undefined);
	    for(var i = 0; i < maxLen; i = i + 1){
		for(var j = 0; j < arrayCount; j = j + 1){
		    argHolder[j] = arrays[j][i];
		}
		out.push(f.apply(null, argHolder));
	    }
	    return cat.apply(null, out);
	}
    }
}

function plus(){
    var s = 0;
    var n = arguments.length;
    for(var i = 0; i < n; i = i + 1){
	s = s + arguments[i];
    }
    return s;
}

function minus(){
    var s = arguments[0];
    var n = arguments.length;
    if(n==1){
	return -s;
    } else {
	for(var i = 1; i < n; i = i + 1){
	    s = s - arguments[i];
	}
	return s;
    }
}


function times(){
    var s = 1;
    var n = arguments.length;
    for(var i = 0; i < n; i = i + 1){
	s = s * arguments[i];
    }
    return s;
}

function div(){
    var s = arguments[0];
    var n = arguments.length;
    for(var i = 1; i < n; i = i + 1){
	s = s / arguments[i];
    }
    return s;
}

function min(){
    return (Array.prototype.slice.call(arguments, 0, arguments.length)).reduce(min2, Infinity);
    function min2(prev, curr){
	if(prev<curr){
	    return prev;
	} else {
	    return curr;
	}
    }
}

function max(){
    return (Array.prototype.slice.call(arguments, 0, arguments.length)).reduce(min2, -Infinity);
    function min2(prev, curr){
	if(prev>curr){
	    return prev;
	} else {
	    return curr;
	}
    }
}

function always(v){
    return function(){
	return v;
    }
}

function array(){
    return Array.prototype.slice.call(arguments, 0, arguments.length);
}

/** 
 * given an object, attach all of puff's exported functions to it.
 * most often used to pollute the global scope with puff's functions.	
 */
function pollute(where){
    var where = where || global || window;
    Object.keys(puff).forEach(function(k){
	where[k] = puff[k];
    });
}

function square(a){
    return a*a;
}

function quad(a){
    return a*a*a*a;
}

function raiseTo(a, powv){
    return Math.pow(a, powv);
}

function apply(f, a){
    return f.apply(null, a);
}

function call(f){
    return f.apply(null, Array.prototype.slice.call(arguments, 1, arguments.length));
}

function min2(a,b){
    return a < b ? a : b;
}

function max2(a,b){
    return a > b ? a : b;
}

function plus2(a,b){
    return a+b;
}
function minus2(a,b){
    return a-b;
}
function times2(a,b){
    return a*b;
}
function div2(a,b){
    return a/b;
}

/** return a new function which takes exactly two arguments and applies them to 
 * f, returning the result.
 */
function twoArgs(f){
    return function(a,b){
	return f(a,b);
    }
}

/** Apply f repeatedly to a (and then the result of the application) n times. */
function repeat(f,n,a){
    for(var i = 0; i < n; i = i + 1){
	a = f(a);
    }
    return a;
}

function repeatAccumulate(f,n,a){
    var out = [a];
    for(var i = 0; i < n; i = i + 1){
	a = f(a);
	out.push(a);
    }
    return out;
}

function cleave(v /*... fs*/){
    var fs = Array.prototype.slice.call(arguments, 1, arguments.length);
    return fs.map(function(f){
	return f(v);
    });
}

function cleave_(/*... fs*/){
    var fs = Array.prototype.slice.call(arguments, 0, arguments.length);
    return function(v){
	return fs.map(function(f){
	    return f(v);
	});
    };
}

function cleaveObject(v, o){
    var out = {};
    Object.keys(o).forEach(function(k){
	out[k] = o[k](v);
    });
    return out;
}

function cleaveObject_(o){
    return function(v){
	var out = {};
	Object.keys(o).forEach(function(k){
	    out[k] = o[k](v);
	});
	return out;
    };
}

/** Call the method METHOD of object OBJ with additional arguments. */
function callMethod(obj,method /*args*/){
    return obj[method].apply(obj,Array.prototype.slice.call(arguments,2,arguments.length));
}

/** given a function f and a additional functions gs
 *  return a new function h which applies each g
 *  to its single argument and then applies f to the 
 *  resulting list of values 
 */
function augment(f /*... gs*/){
    var gs = Array.prototype.slice.call(arguments, 1, arguments.length);
    var out = function(a){
	return f.apply(null, gs.map(function(g){
	    return g(a);
	}));
    }
    out.toString = function(){
	return "augment("+f.toString()+","+gs.map(toString).join(", ")+")";
    }
    return out;
}

function unkey(o){
    var keys = Object.keys(o);
    var out = new Array(keys.length);
    keys.forEach(function(k,i){
	out[i] = o[k];
    });
    return out;
}

function toString(o){
    return o.toString();
}

function augmentRight(f /*... augmentations */){
    var augmentations = Array.prototype.slice.call(arguments, 1 , arguments.length);
    return function(v){
	var augmentedArgs = augmentations.map(function(f){
	    return f(v);
	});
	return function(){
	    var unfixedArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return f.apply(null, unfixedArgs.concat(augmentedArgs));
	}
    }
}

function augmentLeft(f /*... augmentations */){
    var augmentations = Array.prototype.slice.call(arguments, 1 , arguments.length);
    return function(v){
	var augmentedArgs = augmentations.map(function(f){
	    return f(v);
	});
	return function(){
	    var unfixedArgs = Array.prototype.slice.call(arguments, 0, arguments.length);
	    return f.apply(null, augmentedArgs.concat(unfixedArgs));
	}
    }
}


function id(x){
    return x;
}

function first(o){
    return o[0];
}

function second(o){
    return o[1];
}

function third(o){
    return o[2];
}

function fourth(o){
    return o[3];
}

function ixc(i){
    return function(o){
	return o[i];
    }
}

function log(){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);
    console.log.apply(console, args);
    return args[0];
}

function str(){
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);
    return args.map(function(a){
	if(typeof a === 'number' || typeof a === 'string'){
	    return a+"";
	} else {
	    return a.toString();
	}
    }).join("");
}

function trim(a){
    return a.trim();
}

function slice(a,i,j){
    return a.slice(i,j);
}

function split(s,deli){
    if(typeof deli === 'undefined'){
	var actualDeli = s;
	return function(s){
	    return s.split(actualDeli);
	}
    } else {
	return s.split(deli);
    }
}

function splitJoin(){
    if(arguments.length === 3){
	return arguments[0].split(arguments[1]).join(arguments[2]);
    } else {
	var args = Array.prototype.slice.call(arguments, 0, arguments.length);
	return function(s){
	    return s.split(args[0]).join(args[1]);
	}
    }
}

function oneArg(f){
    return function(a){
	return f(a);
    }
}

function twoArgs(f){
    return function(a,b){
	return f(a,b);
    }
}

function threeArgs(f){
    return function(a,b,c){
	return f(a,b,c);
    }
}

function join(a, w){
    if(typeof w === 'undefined'){
	var actualW = a;
	return function(a){
	    return a.join(actualW);
	}
    } else {
	return a.join(w);
    }
}

function rest(a){
    return a.slice(1);
}

function last(a){
    return a[a.length-1];
}

function args(n){
    if(typeof n !== 'number'){
	throw new Error('args requires a numerical argument, got ', n);
    }
    return function(){
	return Array.prototype.slice.call(arguments, 0, n);
    }
}

function lambda(argCount){
    return r.apply(null, [args(argCount)].concat(Array.prototype.slice.call(arguments, 1, arguments.length)));
}

function cascadeIntoOutput(/*args*/){
  var objects = Array.prototype.slice.call(arguments, 0, arguments.length);
  var n = objects.length;
    return function(k){
        if(typeof k === "undefined"){
            return listKeys();
        } else if (typeof k === "function") {
            if(arguments.length === 2){
                return forEachFiltered(arguments[0], arguments[1]);
            } else {
                return forEach(arguments[0]);
            }
            return undefined;
        }
        else {
            return index(k);
        }
    };
    function index(k){
        var done = false;
        var i = 0;    
        while(!done && i < n){
            if(k in objects[i]){
                return objects[i][k];
            }
            i++;
        }
        return undefined;
    }
    function listKeys(){
        var keys = {};
        var o = undefined;
        for(var i = 0; i<objects.length;i++){
            o = objects[i];
            Object.keys(o).forEach(function(k){
                keys[k] = true;
            });
        }
        return Object.keys(keys).sort();
    }
    function forEachFiltered(filter, op){
        var keys = listKeys();
        keys.forEach(function(k){
            var val = index(k);
            if(filter(k,val)){
                op(k,val);
            }
        });
    }
    function forEach(op){
        forEachFiltered(always(true), op);
    }
}

function n0(a){ return a[0]; }
function n00(a){ return a[0][0]; }
function n000(a){ return a[0][0][0]; }
function n001(a){ return a[0][0][1]; }
function n002(a){ return a[0][0][2]; }
function n01(a){ return a[0][1]; }
function n010(a){ return a[0][1][0]; }
function n011(a){ return a[0][1][1]; }
function n012(a){ return a[0][1][2]; }
function n02(a){ return a[0][2]; }
function n020(a){ return a[0][2][0]; }
function n021(a){ return a[0][2][1]; }
function n022(a){ return a[0][2][2]; }
function n1(a){ return a[1]; }
function n10(a){ return a[1][0]; }
function n100(a){ return a[1][0][0]; }
function n101(a){ return a[1][0][1]; }
function n102(a){ return a[1][0][2]; }
function n11(a){ return a[1][1]; }
function n110(a){ return a[1][1][0]; }
function n111(a){ return a[1][1][1]; }
function n112(a){ return a[1][1][2]; }
function n12(a){ return a[1][2]; }
function n120(a){ return a[1][2][0]; }
function n121(a){ return a[1][2][1]; }
function n122(a){ return a[1][2][2]; }
function n2(a){ return a[2]; }
function n20(a){ return a[2][0]; }
function n200(a){ return a[2][0][0]; }
function n201(a){ return a[2][0][1]; }
function n202(a){ return a[2][0][2]; }
function n21(a){ return a[2][1]; }
function n210(a){ return a[2][1][0]; }
function n211(a){ return a[2][1][1]; }
function n212(a){ return a[2][1][2]; }
function n22(a){ return a[2][2]; }
function n220(a){ return a[2][2][0]; }
function n221(a){ return a[2][2][1]; }
function n222(a){ return a[2][2][2]; }

function generateImportSnippet(puffObjectName,expressionDelimeter,justThese){
  expressionDelimeter = expressionDelimeter || " ";
  var names = Object.keys(puffNames);
  var valueNames = names.map(function(name){ return puffNames[name]});
  justThese = justThese || valueNames;  
  var expressions = [];
  names.forEach(function(name,i){
      var valueName = valueNames[i];
      if(!(-1 === justThese.indexOf(valueName))){
        expressions.push("var "+name+" = "+puffObjectName+"."+valueName+";");
      }
    });
  return expressions.join(expressionDelimeter);
}

var puffNames = {
    generateImportSnippet:"generateImportSnippet",
    cascadeIntoOutput:"cascadeIntoOutput",
    cio:"cascadeIntoOutput",
    sort:"sort",
    s:"sort",
    rest:"rest",
    split:"split",
    join:"join",
    trim:"trim",
    str:"str",
    log:"log",
    nth:"ixc",
    n:"ixc",
    ixc:"ixc", 
    nthc:"ixc",
    first:"first",
    second:"second",
    third:"third",
    fourth:"fourth",
    id:"id",
    cleave:"cleave",
    cl:"cleave",
    cleave_:"cleave_",
    cl_:"cleave_",
    cleaveObject:"cleaveObject",
    clo:"cleaveObject",
    cleaveObject_:"cleaveObject_",
    clo_:"cleaveObject_",
    repeat:"repeat",
    rep:"repeat",
    repeatAccumulate:"repeatAccumulate",
    repAc:"repeatAccumulate",
    twoArgs:"twoArgs",
    plus2:"plus2",
    minus2:"minus2",
    times2:"times2",
    div2:"div2",
    min2:"min2",
    max2:"max2",
    apply:"apply",
    ap:"apply",
    call:"call",
    ca:"call",
    square:"square",
    xx:"square",
    initArray:"initArray",
    ia:"initArray",
    quad:"quad",
    raiseTo:"raiseTo",
    e:"raiseTo",
    pollute:"pollute",
    compose:"compose",
    c:"compose",
    rCompose:"rCompose",
    r:"rCompose",
    rComposeOn:"rComposeOn",
    rOn:"rComposeOn",
    partialLeft:"partialLeft",
    _p:"partialLeft",
    partialRight:"partialRight",
    p_:"partialRight",
    curryLeft:"curryLeft",
    _c:"curryLeft",
    curryRight:"curryRight",
    c_:"curryRight",
    permute:"permute",
    pmt:"permute",
    index:"index",
    ix:"index",
    bind:"bind",
    b:"bind",
    length:"length",
    l:"length",
    shuffle:"shuffle",
    sh:"shuffle",
    randomElement:"randomElement",
    re:"randomElement",
    map:"map",
    eachKey:"eachKey",
    mapKey:"mapKey",
    ehk:"eachKey",
    mpk:"mapKey",
    reduceKey:"reduceKey",
    rdk:"reduceKey",
    each:"each",
    eh:"each",
    filter:"filter",
    fi:"filter",
    m:"map",
    rank:"rank",
    ra:"rank",
    crossMap:"crossMap",
    x:"crossMap",
    cells:"cells",
    reduce:"reduce",
    rd:"reduce",
    plus:"plus",
    minus:"minus",
    times:"times",
    div:"div",
    min:"min",
    max:"max",
    array:"array",
    a:"array",
    always:"always",
    al:"always",
    augment:"augment",
    augmentLeft:"augmentLeft",
    _au:"augmentLeft",
    augmentRight:"augmentRight",
    au_:"augmentRight",
    au:"augment",
    slice:"slice",
    sl:"slice",
    toString:"toString",
    last:"last",
    args:"args",
    lambda:"lambda",
    f:"lambda",
    splitJoin:"splitJoin",
    cat:"cat",
    mapcat:"mapcat",
    nextCellIndex:"nextCellIndex",
    guessRank:"guessRank",
    n0:"n0",
    n00:"n00",
    n000:"n000",
    n001:"n001",
    n002:"n002",
    n01:"n01",
    n010:"n010",
    n011:"n011",
    n012:"n012",
    n02:"n02",
    n020:"n020",
    n021:"n021",
    n022:"n022",
    n1:"n1",
    n10:"n10",
    n100:"n100",
    n101:"n101",
    n102:"n102",
    n11:"n11",
    n110:"n110",
    n111:"n111",
    n112:"n112",
    n12:"n12",
    n120:"n120",
    n121:"n121",
    n122:"n122",
    n2:"n2",
    n20:"n20",
    n200:"n200",
    n201:"n201",
    n202:"n202",
    n21:"n21",
    n210:"n210",
    n211:"n211",
    n212:"n212",
    n22:"n22",
    n220:"n220",
    n221:"n221",
    n222:"n222",
    initArray:"initArray",
    ia:"initArray",
    oneArg:"oneArg",
    f1:"oneArg",
    twoArgs:"twoArgs",
    f2:"twoArgs",
    threeArgs:"threeArgs",
    f3:"threeArgs",
    callMethod:"callMethod",
    md:"callMethod",
    unique:"unique",
    uniq:"unique",
    groupBy:"groupBy",
    gb:"groupBy",
    ungroup:"ungroup",
    ug:"ungroup",
    unkey:"unkey",
    uk:"unkey",
};


var puff = {
    generateImportSnippet:generateImportSnippet,
    cascadeIntoOutput:cascadeIntoOutput,
    cio:cascadeIntoOutput,
    sort:sort,
    s:sort,
    rest:rest,
    split:split,
    join:join,
    trim:trim,
    str:str,
    log:log,
    nth:ixc,
    n:ixc,
    ixc:ixc, 
    nthc:ixc,
    first:first,
    second:second,
    third:third,
    fourth:fourth,
    id:id,
    cleave:cleave,
    cl:cleave,
    cleave_:cleave_,
    cl_:cleave_,
    cleaveObject:cleaveObject,
    clo:cleaveObject,
    cleaveObject_:cleaveObject_,
    clo_:cleaveObject_,
    repeat:repeat,
    rep:repeat,
    repeatAccumulate:repeatAccumulate,
    repAc:repeatAccumulate,
    twoArgs:twoArgs,
    plus2:plus2,
    minus2:minus2,
    times2:times2,
    div2:div2,
    min2:min2,
    max2:max2,
    apply:apply,
    ap:apply,
    call:call,
    ca:call,
    square:square,
    xx:square,
    initArray:initArray,
    ia:initArray,
    quad:quad,
    raiseTo:raiseTo,
    e:raiseTo,
    pollute:pollute,
    compose:compose,
    c:compose,
    rCompose:rCompose,
    r:rCompose,
    rComposeOn:rComposeOn,
    rOn:rComposeOn,
    partialLeft:partialLeft,
    _p:partialLeft,
    partialRight:partialRight,
    p_:partialRight,
    curryLeft:curryLeft,
    _c:curryLeft,
    curryRight:curryRight,
    c_:curryRight,
    permute:permute,
    pmt:permute,
    index:index,
    ix:index,
    bind:bind,
    b:bind,
    length:length,
    l:length,
    shuffle:shuffle,
    sh:shuffle,
    randomElement:randomElement,
    re:randomElement,
    map:map,
    each:each,
    eh:each,
    eachKey:eachKey,
    mapKey:mapKey,
    mpk:mapKey,
    ehk:eachKey,
    reduceKey:reduceKey,
    rdk:reduceKey,
    filter:filter,
    fi:filter,
    m:map,
    rank:rank,
    ra:rank,
    crossMap:crossMap,
    x:crossMap,
    cells:cells,
    reduce:reduce,
    rd:reduce,
    plus:plus,
    minus:minus,
    times:times,
    div:div,
    min:min,
    max:max,
    array:array,
    a:array,
    always:always,
    al:always,
    augment:augment,
    augmentLeft:augmentLeft,
    _au:augmentLeft,
    augmentRight:augmentRight,
    au_:augmentRight,
    au:augment,
    slice:slice,
    sl:slice,
    toString:toString,
    last:last,
    args:args,
    lambda:lambda,
    f:lambda,
    splitJoin:splitJoin,
    cat:cat,
    mapcat:mapcat,
    nextCellIndex:nextCellIndex,
    guessRank:guessRank,
    n0:n0,
    n00:n00,
    n000:n000,
    n001:n001,
    n002:n002,
    n01:n01,
    n010:n010,
    n011:n011,
    n012:n012,
    n02:n02,
    n020:n020,
    n021:n021,
    n022:n022,
    n1:n1,
    n10:n10,
    n100:n100,
    n101:n101,
    n102:n102,
    n11:n11,
    n110:n110,
    n111:n111,
    n112:n112,
    n12:n12,
    n120:n120,
    n121:n121,
    n122:n122,
    n2:n2,
    n20:n20,
    n200:n200,
    n201:n201,
    n202:n202,
    n21:n21,
    n210:n210,
    n211:n211,
    n212:n212,
    n22:n22,
    n220:n220,
    n221:n221,
    n222:n222,
    initArray:initArray,
    ia:initArray,
    oneArg:oneArg,
    f1:oneArg,
    twoArgs:twoArgs,
    f2:twoArgs,
    threeArgs:threeArgs,
    f3:threeArgs,
    callMethod:callMethod,
    md:callMethod,
    unique:unique,
    uniq:unique,
    groupBy:groupBy,
    gb:groupBy,
    ungroup:ungroup,
    ug:ungroup,
    unkey:unkey,
    uk:unkey
};

module.exports = puff;
