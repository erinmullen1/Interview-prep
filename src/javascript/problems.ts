export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface JSProblem {
  slug: string
  title: string
  difficulty: Difficulty
  /** The problem statement, including the function signature. */
  prompt: string
  /** A short usage example showing input and output. */
  example?: string
  /** A starting point with the right signature, to write the solution into. */
  starterCode: string
  /** A correct, idiomatic solution. */
  solutionCode: string
  /** Why the solution works, and what it is really testing. */
  explanation: string
}

export interface JSCategory {
  name: string
  /** Shown under the category name. */
  description: string
  problems: JSProblem[]
}

export const jsCategories: JSCategory[] = [
  {
    name: 'Closures',
    description: 'A function that remembers variables from where it was created, even after that scope has finished.',
    problems: [
      {
        slug: 'create-hello-world-function',
        title: 'Create Hello World Function',
        difficulty: 'Easy',
        prompt: 'Write a function `createHelloWorld` that returns a new function. That returned function, when called with any arguments, always returns "Hello World".',
        example: `const greet = createHelloWorld()
greet() // "Hello World"
greet(1, 2, 3) // "Hello World", arguments are ignored`,
        starterCode: `var createHelloWorld = function() {
  // return a function here
};`,
        solutionCode: `var createHelloWorld = function() {
  return function(...args) {
    return "Hello World";
  };
};`,
        explanation:
          'The simplest possible closure: the outer function\'s only job is to hand back an inner function. That inner function ignores whatever it is called with and always returns the same string, which is enough to prove the returned function is a real, independent function value.',
      },
      {
        slug: 'counter',
        title: 'Counter',
        difficulty: 'Easy',
        prompt: 'Write a function `createCounter(init)` that returns a function. Each time the returned function is called, it should return the current count, then increase it by one, starting from `init`.',
        example: `const counter = createCounter(10)
counter() // 10
counter() // 11
counter() // 12`,
        starterCode: `var createCounter = function(init) {
  // return a function here
};`,
        solutionCode: `var createCounter = function(init) {
  let count = init;
  return function() {
    return count++;
  };
};`,
        explanation:
          '`count` lives in the outer function\'s scope, and the returned function closes over it. Because `count++` returns the value before incrementing, the first call returns exactly `init`, and every call after that returns one more than the last, all backed by the same private variable.',
      },
      {
        slug: 'to-be-or-not-to-be',
        title: 'To Be Or Not To Be',
        difficulty: 'Easy',
        prompt: 'Write a function `expect(val)` that returns an object with two methods: `toBe(val2)`, which throws an `Error("Not Equal")` if `val !== val2` and otherwise returns `true`, and `notToBe(val2)`, which throws `Error("Equal")` if `val === val2` and otherwise returns `true`.',
        example: `expect(5).toBe(5) // true
expect(5).notToBe(6) // true
expect(5).toBe(6) // throws "Not Equal"`,
        starterCode: `var expect = function(val) {
  return {
    toBe: (val2) => {},
    notToBe: (val2) => {},
  };
};`,
        solutionCode: `var expect = function(val) {
  return {
    toBe: (val2) => {
      if (val !== val2) throw new Error("Not Equal");
      return true;
    },
    notToBe: (val2) => {
      if (val === val2) throw new Error("Equal");
      return true;
    },
  };
};`,
        explanation:
          'Both inner methods close over `val`, the value `expect` was first called with, so each one can compare it against whatever is passed to `toBe`/`notToBe` later. This is a tiny hand-rolled version of what a real assertion library like Jest\'s `expect` does under the hood.',
      },
      {
        slug: 'counter-ii',
        title: 'Counter II',
        difficulty: 'Easy',
        prompt: 'Write a function `createCounter(init)` that returns a function `counter`. Calling `counter()` returns the current value without changing it. `counter.increment()` increases the value by one and returns it. `counter.decrement()` decreases it by one and returns it. `counter.reset()` sets the value back to `init` and returns it.',
        example: `const counter = createCounter(5)
counter() // 5
counter.increment() // 6
counter.increment() // 7
counter.decrement() // 6
counter.reset() // 5`,
        starterCode: `var createCounter = function(init) {
  // attach increment, decrement and reset to the returned function
};`,
        solutionCode: `var createCounter = function(init) {
  let count = init;
  function counter() {
    return count;
  }
  counter.increment = () => ++count;
  counter.decrement = () => --count;
  counter.reset = () => (count = init);
  return counter;
};`,
        explanation:
          'Functions are objects in JavaScript, so you can attach extra properties directly to `counter` itself. All four, the function body and the three attached methods, close over the same `count` variable, which is how calling `.increment()` is reflected the next time `counter()` is called.',
      },
    ],
  },
  {
    name: 'Basic Array Transformations',
    description: 'Rebuilding map, filter and reduce from scratch to understand what they actually do.',
    problems: [
      {
        slug: 'apply-transform-over-each-element',
        title: 'Apply Transform Over Each Element in Array',
        difficulty: 'Easy',
        prompt: 'Write your own version of `Array.prototype.map`: a function `map(arr, fn)` that returns a new array where each element is the result of calling `fn(element, index)` on the corresponding element of `arr`.',
        example: `map([1, 2, 3], (n) => n * 2) // [2, 4, 6]
map([1, 2, 3], (n, i) => n + i) // [1, 3, 5]`,
        starterCode: `var map = function(arr, fn) {
  // return a new, transformed array
};`,
        solutionCode: `var map = function(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
};`,
        explanation:
          'This is exactly what the built-in `map` does: build a brand new array, and for every index call the supplied function with the element and its index, collecting the results. The original `arr` is never mutated.',
      },
      {
        slug: 'filter-elements-from-array',
        title: 'Filter Elements from Array',
        difficulty: 'Easy',
        prompt: 'Write your own version of `Array.prototype.filter`: a function `filter(arr, fn)` that returns a new array containing only the elements for which `fn(element, index)` returns a truthy value.',
        example: `filter([1, 2, 3, 4], (n) => n % 2 === 0) // [2, 4]`,
        starterCode: `var filter = function(arr, fn) {
  // return a new array with only the matching elements
};`,
        solutionCode: `var filter = function(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i)) result.push(arr[i]);
  }
  return result;
};`,
        explanation:
          'A single pass over the array, keeping an element only when the predicate returns something truthy for it. Like `map`, it produces a new array and index positions shift, since removed elements leave no gap.',
      },
      {
        slug: 'array-reduce-transformation',
        title: 'Array Reduce Transformation',
        difficulty: 'Easy',
        prompt: 'Write your own version of `Array.prototype.reduce`: a function `reduce(nums, fn, init)` that applies `fn(accumulator, currentValue, currentIndex)` across the array, starting the accumulator at `init`, and returns the final accumulator value.',
        example: `reduce([1, 2, 3, 4], (acc, n) => acc + n, 0) // 10
reduce([1, 2, 3, 4], (acc, n) => acc + n, 100) // 110`,
        starterCode: `var reduce = function(nums, fn, init) {
  // fold the array down to a single value
};`,
        solutionCode: `var reduce = function(nums, fn, init) {
  let acc = init;
  for (let i = 0; i < nums.length; i++) {
    acc = fn(acc, nums[i], i);
  }
  return acc;
};`,
        explanation:
          'Every other array method can be built on top of `reduce`: it is the most general form of "walk the array, carrying a running value forward". Unlike the native version, this one requires an explicit `init`, which sidesteps the native method\'s awkward "no initial value on an empty array" edge case.',
      },
    ],
  },
  {
    name: 'Function Transformations',
    description: 'Functions that take other functions and change how, or how often, they run.',
    problems: [
      {
        slug: 'function-composition',
        title: 'Function Composition',
        difficulty: 'Easy',
        prompt: 'Write `compose(functions)` that takes an array of functions and returns a single function. Calling that function with `x` should apply the functions from right to left: the last function in the array runs first, and its result feeds into the previous one, and so on.',
        example: `const double = (x) => x * 2
const triple = (x) => x * 3
const fn = compose([double, triple])
fn(4) // double(triple(4)) = double(12) = 24`,
        starterCode: `var compose = function(functions) {
  // return a single function
};`,
        solutionCode: `var compose = function(functions) {
  return function(x) {
    return functions.reduceRight((acc, fn) => fn(acc), x);
  };
};`,
        explanation:
          '`reduceRight` walks the array from the last element to the first, which is exactly the right-to-left order composition requires. Each function\'s output becomes the next function\'s input, with `x` as the starting accumulator.',
      },
      {
        slug: 'return-length-of-arguments-passed',
        title: 'Return Length of Arguments Passed',
        difficulty: 'Easy',
        prompt: 'Write a function `argumentsLength` that accepts any number of arguments and returns how many were passed.',
        example: `argumentsLength(1, 2, 3) // 3
argumentsLength() // 0`,
        starterCode: `var argumentsLength = function(...args) {
  // return the count
};`,
        solutionCode: `var argumentsLength = function(...args) {
  return args.length;
};`,
        explanation:
          'Rest parameters (`...args`) collect every argument into a real array, so its `.length` is simply how many arguments were passed. This is the modern replacement for the old, array-like `arguments` object.',
      },
      {
        slug: 'allow-one-function-call',
        title: 'Allow One Function Call',
        difficulty: 'Easy',
        prompt: 'Write `once(fn)` that returns a new function which calls `fn` only the first time it is invoked. Every call after that returns the same result as the first call, without calling `fn` again.',
        example: `let calls = 0
const inc = once(() => ++calls)
inc() // 1, calls is now 1
inc() // still 1, fn was not called again
inc() // still 1`,
        starterCode: `var once = function(fn) {
  // return a wrapped function
};`,
        solutionCode: `var once = function(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
};`,
        explanation:
          'The wrapper closes over a `called` flag and a `result` slot. The first call runs `fn` and remembers both the fact that it ran and what it returned; every later call skips straight to returning the remembered `result`, so `fn` truly only ever executes once.',
      },
      {
        slug: 'memoize',
        title: 'Memoize',
        difficulty: 'Medium',
        prompt: 'Write `memoize(fn)` that returns a new function with the same behaviour as `fn`, but that caches results by their arguments. If it is called again with arguments it has seen before, it should return the cached result instead of calling `fn` again.',
        example: `let calls = 0
const square = memoize((n) => { calls++; return n * n; })
square(4) // 16, calls = 1
square(4) // 16, calls still 1 (cached)
square(5) // 25, calls = 2`,
        starterCode: `function memoize(fn) {
  // return a wrapped, caching function
}`,
        solutionCode: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}`,
        explanation:
          'The cache key is built by serialising the whole argument list, so calls with the same arguments in the same order hit the same cache entry regardless of how many arguments there are. `JSON.stringify` is a simple, if imperfect, way to do that; it does not distinguish some edge cases like `NaN` or functions passed as arguments, which is worth mentioning if asked.',
      },
    ],
  },
  {
    name: 'Promises and Time',
    description: 'setTimeout, setInterval, Promise.race and friends, all in service of async control flow.',
    problems: [
      {
        slug: 'add-two-promises',
        title: 'Add Two Promises',
        difficulty: 'Easy',
        prompt: 'Write an async function `addTwoPromises(promise1, promise2)` that resolves both promises, then resolves to the sum of their two resolved values.',
        example: `addTwoPromises(Promise.resolve(2), Promise.resolve(5))
  .then(console.log) // 7, after both resolve`,
        starterCode: `var addTwoPromises = async function(promise1, promise2) {
  // await both, then return their sum
};`,
        solutionCode: `var addTwoPromises = async function(promise1, promise2) {
  const [a, b] = await Promise.all([promise1, promise2]);
  return a + b;
};`,
        explanation:
          '`Promise.all` waits for both promises concurrently rather than one after the other, which is faster whenever the two operations do not depend on each other. Awaiting the combined promise gives back both resolved values at once, ready to add together.',
      },
      {
        slug: 'sleep',
        title: 'Sleep',
        difficulty: 'Easy',
        prompt: 'Write a function `sleep(millis)` that returns a promise which resolves after `millis` milliseconds have passed.',
        example: `let t = Date.now()
await sleep(200)
Date.now() - t // roughly 200`,
        starterCode: `var sleep = function(millis) {
  // return a promise that resolves after millis
};`,
        solutionCode: `var sleep = function(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
};`,
        explanation:
          'This is the standard "promisified" `setTimeout`: wrap the callback-based timer API in a `Promise` executor, and call `resolve` (with no value needed) once the timer fires. It turns delays into something `await`-able.',
      },
      {
        slug: 'timeout-cancellation',
        title: 'Timeout Cancellation',
        difficulty: 'Easy',
        prompt: 'Write `cancellable(fn, args, t)` that schedules `fn(...args)` to run after `t` milliseconds, and returns a cancel function. If the cancel function is called before `t` milliseconds elapse, `fn` should never run.',
        example: `const log = (msg) => console.log(msg)
const cancel = cancellable(log, ['hi'], 50)
cancel() // fn never runs`,
        starterCode: `var cancellable = function(fn, args, t) {
  // schedule fn, and return a function that cancels it
};`,
        solutionCode: `var cancellable = function(fn, args, t) {
  const timer = setTimeout(() => fn(...args), t);
  return () => clearTimeout(timer);
};`,
        explanation:
          '`setTimeout` returns an id that `clearTimeout` can later use to cancel the pending call. Returning a closure over that id gives the caller a simple, single-purpose "undo" function without exposing the id itself.',
      },
      {
        slug: 'interval-cancellation',
        title: 'Interval Cancellation',
        difficulty: 'Easy',
        prompt: 'Write `cancellable(fn, args, t)` that calls `fn(...args)` immediately, then again every `t` milliseconds, and returns a cancel function that stops future calls.',
        example: `const cancel = cancellable(log, ['tick'], 100)
// logs "tick" immediately, then every 100ms
setTimeout(cancel, 350) // stops after roughly 4 ticks`,
        starterCode: `var cancellable = function(fn, args, t) {
  // call fn now and every t ms, return a function that cancels it
};`,
        solutionCode: `var cancellable = function(fn, args, t) {
  fn(...args);
  const intervalId = setInterval(() => fn(...args), t);
  return () => clearInterval(intervalId);
};`,
        explanation:
          'The immediate call happens synchronously, outside the interval, since `setInterval` only fires after the first `t` milliseconds have passed. `clearInterval` on the returned id stops all future ticks, leaving the ones that already ran untouched.',
      },
      {
        slug: 'promise-time-limit',
        title: 'Promise Time Limit',
        difficulty: 'Medium',
        prompt: 'Write `timeLimit(fn, t)` that returns a new async function with the same arguments as `fn`. It should resolve or reject with whatever `fn` does, unless `t` milliseconds pass first, in which case it should reject with the string `"Time Limit Exceeded"`.',
        example: `const slow = () => sleep(1000).then(() => 'done')
const limited = timeLimit(slow, 100)
limited() // rejects with "Time Limit Exceeded" after 100ms`,
        starterCode: `var timeLimit = function(fn, t) {
  // return a wrapped function
};`,
        solutionCode: `var timeLimit = function(fn, t) {
  return async function(...args) {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) => setTimeout(() => reject("Time Limit Exceeded"), t)),
    ]);
  };
};`,
        explanation:
          '`Promise.race` settles as soon as the first of its promises settles, win or lose. Racing the real call against a timer that always rejects after `t` milliseconds means the caller gets the real result if it is fast enough, or the timeout rejection if it is not.',
      },
      {
        slug: 'cache-with-time-limit',
        title: 'Cache With Time Limit',
        difficulty: 'Medium',
        prompt: 'Implement a `TimeLimitedCache` class with `set(key, value, duration)` (stores a value that expires after `duration` ms, and returns whether an unexpired value already existed for that key), `get(key)` (returns the value, or `-1` if missing or expired), and `count()` (returns the number of currently unexpired keys).',
        example: `const cache = new TimeLimitedCache()
cache.set(1, 'a', 100) // false, nothing existed
cache.get(1) // 'a'
cache.count() // 1`,
        starterCode: `class TimeLimitedCache {
  constructor() {
    // set up storage
  }
  set(key, value, duration) {}
  get(key) {}
  count() {}
}`,
        solutionCode: `class TimeLimitedCache {
  constructor() {
    this.cache = new Map();
  }
  set(key, value, duration) {
    const existed = this.cache.has(key);
    if (existed) clearTimeout(this.cache.get(key).timer);
    const timer = setTimeout(() => this.cache.delete(key), duration);
    this.cache.set(key, { value, timer });
    return existed;
  }
  get(key) {
    return this.cache.has(key) ? this.cache.get(key).value : -1;
  }
  count() {
    return this.cache.size;
  }
}`,
        explanation:
          'Each entry stores both its value and the timer that will delete it. Re-setting an existing key clears the old timer before starting a fresh one, so the expiry always reflects the most recent `set` rather than the first one.',
      },
      {
        slug: 'debounce',
        title: 'Debounce',
        difficulty: 'Medium',
        prompt: 'Write `debounce(fn, t)` that returns a new function which delays calling `fn` until `t` milliseconds have passed without it being called again. Every new call resets the delay.',
        example: `const log = debounce(console.log, 100)
log('a'); log('b'); log('c')
// only "c" is logged, 100ms after the last call`,
        starterCode: `var debounce = function(fn, t) {
  // return a debounced function
};`,
        solutionCode: `var debounce = function(fn, t) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), t);
  };
};`,
        explanation:
          'Exactly the pattern the Debounced Search challenge in the Training section builds by hand: every call clears whatever timer is pending and starts a fresh one, so only a call that goes `t` milliseconds without a follow-up ever actually reaches `fn`.',
      },
      {
        slug: 'execute-async-functions-in-parallel',
        title: 'Execute Asynchronous Functions in Parallel',
        difficulty: 'Medium',
        prompt: 'Write `promiseAll(functions)` that takes an array of functions, each returning a promise, and returns a single promise. It should resolve to an array of all their resolved values, in the original order, once every one has resolved, or reject as soon as any one of them rejects.',
        example: `promiseAll([
  () => new Promise((res) => setTimeout(() => res(1), 200)),
  () => new Promise((res) => setTimeout(() => res(2), 100)),
]).then(console.log) // [1, 2], after 200ms, in the original order`,
        starterCode: `var promiseAll = function(functions) {
  // return a promise that resolves to an array of results
};`,
        solutionCode: `var promiseAll = function(functions) {
  return new Promise((resolve, reject) => {
    const results = new Array(functions.length);
    let completed = 0;
    if (functions.length === 0) return resolve(results);
    functions.forEach((fn, i) => {
      fn()
        .then((value) => {
          results[i] = value;
          completed++;
          if (completed === functions.length) resolve(results);
        })
        .catch(reject);
    });
  });
};`,
        explanation:
          'This is a hand-rolled `Promise.all`. Every function is called immediately so they run concurrently, not one after another. Results are written into a pre-sized array by index, so even though the second function above resolves first, its value still ends up in position 1, preserving the input order regardless of completion order.',
      },
    ],
  },
  {
    name: 'Array and Object Utilities',
    description: 'Small, self-contained helpers over arrays and objects that show up constantly in real code.',
    problems: [
      {
        slug: 'is-object-empty',
        title: 'Is Object Empty',
        difficulty: 'Easy',
        prompt: 'Write `isEmpty(obj)` that returns `true` if the given object or array has no own enumerable keys/elements, and `false` otherwise.',
        example: `isEmpty({}) // true
isEmpty({ a: 1 }) // false
isEmpty([]) // true
isEmpty([1]) // false`,
        starterCode: `var isEmpty = function(obj) {
  // return true or false
};`,
        solutionCode: `var isEmpty = function(obj) {
  if (Array.isArray(obj)) return obj.length === 0;
  return Object.keys(obj).length === 0;
};`,
        explanation:
          '`Object.keys` returns only the object\'s own enumerable keys, so its length is a direct measure of "how much is in here". Arrays are handled separately with `.length`, since `Object.keys` on an array returns its numeric indices as strings, which works but is less direct.',
      },
      {
        slug: 'chunk-array',
        title: 'Chunk Array',
        difficulty: 'Easy',
        prompt: 'Write `chunk(arr, size)` that splits `arr` into an array of smaller arrays, each of length `size`, except possibly the last one, which holds whatever is left over.',
        example: `chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]`,
        starterCode: `var chunk = function(arr, size) {
  // return an array of arrays
};`,
        solutionCode: `var chunk = function(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};`,
        explanation:
          'Stepping through the array `size` at a time and slicing out each window is simpler than tracking a running sub-array manually. `slice` automatically clamps to the array\'s end, so the last chunk comes out the right, possibly shorter, length with no extra logic.',
      },
      {
        slug: 'array-prototype-last',
        title: 'Array Prototype Last',
        difficulty: 'Easy',
        prompt: 'Add a `last()` method to `Array.prototype` that returns the last element of the array it is called on, or `-1` if the array is empty.',
        example: `[1, 2, 3].last() // 3
[].last() // -1`,
        starterCode: `Array.prototype.last = function() {
  // return the last element, or -1
};`,
        solutionCode: `Array.prototype.last = function() {
  return this.length === 0 ? -1 : this[this.length - 1];
};`,
        explanation:
          'Inside a method added to `Array.prototype`, `this` is the array it was called on. This is the classic way to extend a built-in prototype; worth being able to discuss when it is appropriate (a personal script, a controlled environment) versus risky (a shared library, since it can collide with future language features or other code doing the same thing).',
      },
      {
        slug: 'group-by',
        title: 'Group By',
        difficulty: 'Medium',
        prompt: 'Add a `groupBy(fn)` method to `Array.prototype` that groups the array\'s elements into an object, keyed by the return value of `fn(element)` for each element.',
        example: `const people = [{ name: 'A', age: 20 }, { name: 'B', age: 20 }, { name: 'C', age: 30 }]
people.groupBy((p) => p.age)
// { 20: [{name:'A',age:20},{name:'B',age:20}], 30: [{name:'C',age:30}] }`,
        starterCode: `Array.prototype.groupBy = function(fn) {
  // return a grouped object
};`,
        solutionCode: `Array.prototype.groupBy = function(fn) {
  const result = {};
  for (const item of this) {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
};`,
        explanation:
          'A single pass building up a lookup object: for each item, work out its key, make sure that key has an array waiting for it, and push the item on. This is the pattern behind the modern built-in `Object.groupBy`, written by hand.',
      },
      {
        slug: 'sort-by',
        title: 'Sort By',
        difficulty: 'Easy',
        prompt: 'Write `sortBy(arr, fn)` that returns a new array sorted in ascending order of `fn(element)`, without mutating the original array.',
        example: `sortBy([{ x: 3 }, { x: 1 }, { x: 2 }], (o) => o.x)
// [{x:1}, {x:2}, {x:3}]`,
        starterCode: `var sortBy = function(arr, fn) {
  // return a new, sorted array
};`,
        solutionCode: `var sortBy = function(arr, fn) {
  return [...arr].sort((a, b) => fn(a) - fn(b));
};`,
        explanation:
          'Spreading into a new array before sorting avoids mutating the caller\'s array, which `Array.prototype.sort` would otherwise do in place. Comparing `fn(a) - fn(b)` sorts ascending by whatever numeric value `fn` extracts from each element.',
      },
      {
        slug: 'join-two-arrays-by-id',
        title: 'Join Two Arrays by ID',
        difficulty: 'Medium',
        prompt: 'Write `join(arr1, arr2)`, where both arrays contain objects with an `id` field. Return a single array with one object per unique id, sorted by id ascending, where fields from `arr2` override matching fields from `arr1` for the same id.',
        example: `join(
  [{ id: 1, x: 1 }, { id: 2, x: 9 }],
  [{ id: 1, y: 10 }],
)
// [{ id: 1, x: 1, y: 10 }, { id: 2, x: 9 }]`,
        starterCode: `var join = function(arr1, arr2) {
  // return the merged, sorted array
};`,
        solutionCode: `var join = function(arr1, arr2) {
  const map = new Map();
  for (const obj of arr1) map.set(obj.id, { ...obj });
  for (const obj of arr2) {
    map.set(obj.id, { ...(map.get(obj.id) || {}), ...obj });
  }
  return [...map.values()].sort((a, b) => a.id - b.id);
};`,
        explanation:
          'A `Map` keyed by id acts like a mini SQL full outer join: seed it with everything from `arr1`, then merge each `arr2` object over whatever is already there (or add it fresh if that id has not been seen). Spreading the old object before the new one means the new object\'s fields win on conflicts.',
      },
      {
        slug: 'flatten-deeply-nested-array',
        title: 'Flatten Deeply Nested Array',
        difficulty: 'Medium',
        prompt: 'Write `flat(arr, n)` that flattens nested arrays inside `arr` up to `n` levels deep, without using the built-in `Array.prototype.flat`.',
        example: `flat([1, [2, [3, [4]], 5]], 1) // [1, 2, [3, [4]], 5]
flat([1, [2, [3, [4]], 5]], 2) // [1, 2, 3, [4], 5]`,
        starterCode: `var flat = function(arr, n) {
  // return the flattened array
};`,
        solutionCode: `var flat = function(arr, n) {
  if (n === 0) return arr.slice();
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && n > 0) {
      result.push(...flat(item, n - 1));
    } else {
      result.push(item);
    }
  }
  return result;
};`,
        explanation:
          'Recursion mirrors the shape of the problem: an array nested inside an array is flattened by recursively flattening it with one less level of depth remaining, then splicing its results in. Reaching `n === 0` (or a non-array element) is the base case that stops the recursion.',
      },
      {
        slug: 'compact-object',
        title: 'Compact Object',
        difficulty: 'Medium',
        prompt: 'Write `compactObject(obj)` that returns a deep copy of `obj` with every key whose value is falsy (`false`, `0`, `""`, `null`, `undefined`, `NaN`) removed, recursively, including inside nested objects and arrays.',
        example: `compactObject({ a: null, b: { c: false, d: 1 }, e: [0, 1, false, 2] })
// { b: { d: 1 }, e: [1, 2] }`,
        starterCode: `var compactObject = function(obj) {
  // return a deeply compacted copy
};`,
        solutionCode: `var compactObject = function(obj) {
  if (Array.isArray(obj)) {
    return obj.filter(Boolean).map(compactObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Boolean(obj[key])) result[key] = compactObject(obj[key]);
    }
    return result;
  }
  return obj;
};`,
        explanation:
          'Three cases, checked in order: arrays filter out falsy elements then recurse into what remains; plain objects rebuild themselves key by key, skipping falsy values and recursing into truthy ones; anything else (a primitive) is returned as-is, which is the recursion\'s base case.',
      },
    ],
  },
  {
    name: 'Classes',
    description: 'Classic object-oriented patterns written as ES classes.',
    problems: [
      {
        slug: 'event-emitter',
        title: 'Event Emitter',
        difficulty: 'Medium',
        prompt: 'Implement an `EventEmitter` class with `subscribe(eventName, callback)`, which registers a listener and returns an object with an `unsubscribe()` method, and `emit(eventName, args)`, which calls every subscriber for that event with the given arguments and returns an array of their return values.',
        example: `const emitter = new EventEmitter()
const sub = emitter.subscribe('greet', (name) => 'hi ' + name)
emitter.emit('greet', ['Erin']) // ['hi Erin']
sub.unsubscribe()
emitter.emit('greet', ['Erin']) // []`,
        starterCode: `class EventEmitter {
  constructor() {
    // set up storage
  }
  subscribe(eventName, callback) {}
  emit(eventName, args = []) {}
}`,
        solutionCode: `class EventEmitter {
  constructor() {
    this.events = {};
  }
  subscribe(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
    return {
      unsubscribe: () => {
        this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
      },
    };
  }
  emit(eventName, args = []) {
    const callbacks = this.events[eventName] || [];
    return callbacks.map((cb) => cb(...args));
  }
}`,
        explanation:
          'This is the pub/sub pattern at the heart of DOM events, Node\'s EventEmitter, and most state-management libraries: a map from event name to a list of listeners. `subscribe` returns a closure that knows exactly which callback to remove, so unsubscribing does not need the caller to track an id.',
      },
      {
        slug: 'array-wrapper',
        title: 'Array Wrapper',
        difficulty: 'Easy',
        prompt: 'Implement an `ArrayWrapper` class that takes an array of numbers in its constructor. Adding two instances with `+` should give the sum of both arrays\' elements. Converting an instance to a string (via template literals or `String()`) should give `"[element,element,...]"`.',
        example: `const a = new ArrayWrapper([1, 2])
const b = new ArrayWrapper([3, 4])
a + b // 10 (1+2+3+4)
\`\${a}\` // "[1,2]"`,
        starterCode: `class ArrayWrapper {
  constructor(arr) {
    this.arr = arr;
  }
  // implement valueOf and toString
}`,
        solutionCode: `class ArrayWrapper {
  constructor(arr) {
    this.arr = arr;
  }
  valueOf() {
    return this.arr.reduce((sum, n) => sum + n, 0);
  }
  toString() {
    return \`[\${this.arr.join(',')}]\`;
  }
}`,
        explanation:
          'JavaScript calls `valueOf()` automatically when an object is used in a numeric context, like the `+` operator, and `toString()` when it is used in a string context, like a template literal. Defining both lets a custom class opt into operators and string interpolation without any special syntax at the call site.',
      },
      {
        slug: 'calculator-with-method-chaining',
        title: 'Calculator with Method Chaining',
        difficulty: 'Easy',
        prompt: 'Implement a `Calculator` class that takes a starting value, with chainable methods `add`, `subtract`, `multiply`, `divide` and `power`, plus a `getResult()` method. `divide` should throw an `Error("Division by zero is not allowed")` when dividing by 0.',
        example: `new Calculator(10).add(5).subtract(3).multiply(2).getResult() // 24
new Calculator(5).divide(0) // throws`,
        starterCode: `class Calculator {
  constructor(value) {
    this.value = value;
  }
  // implement add, subtract, multiply, divide, power, getResult
}`,
        solutionCode: `class Calculator {
  constructor(value) {
    this.value = value;
  }
  add(v) { this.value += v; return this; }
  subtract(v) { this.value -= v; return this; }
  multiply(v) { this.value *= v; return this; }
  divide(v) {
    if (v === 0) throw new Error("Division by zero is not allowed");
    this.value /= v;
    return this;
  }
  power(v) { this.value = Math.pow(this.value, v); return this; }
  getResult() { return this.value; }
}`,
        explanation:
          'The trick behind method chaining is simple: every method that is meant to be chained ends with `return this`, handing back the same instance so the next method call can be appended directly. Only `getResult` breaks the chain, since it returns the value itself rather than the calculator.',
      },
    ],
  },
  {
    name: 'Function Utilities',
    description: 'Beyond debounce and memoize: currying, piping, throttling and reimplementing bind.',
    problems: [
      {
        slug: 'curry',
        title: 'Curry',
        difficulty: 'Medium',
        prompt: 'Write `curry(fn)` that returns a curried version of `fn`: it can be called with fewer arguments than `fn` expects, in which case it returns a function waiting for the rest. Once enough arguments have been supplied across one or more calls, it calls the original `fn` and returns its result.',
        example: `function sum3(a, b, c) { return a + b + c }
const curried = curry(sum3)
curried(1)(2)(3) // 6
curried(1, 2)(3) // 6
curried(1, 2, 3) // 6`,
        starterCode: `function curry(fn) {
  // return a curried version of fn
}`,
        solutionCode: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...next) {
      return curried.apply(this, [...args, ...next]);
    };
  };
}`,
        explanation:
          '`fn.length` tells you how many parameters a function declares, which is how the curried version knows when it has "enough" arguments. Until then, each call returns a new function that remembers the arguments collected so far and waits for the rest, recursively, so any split of arguments across calls works.',
      },
      {
        slug: 'pipe-function',
        title: 'Pipe Function',
        difficulty: 'Easy',
        prompt: 'Write `pipe(...fns)` that returns a single function. Calling it with `x` should apply the given functions left to right: the first function runs on `x`, and each result feeds into the next function in order.',
        example: `const double = (x) => x * 2
const addOne = (x) => x + 1
const fn = pipe(double, addOne)
fn(4) // addOne(double(4)) = addOne(8) = 9`,
        starterCode: `function pipe(...fns) {
  // return a single function
}`,
        solutionCode: `function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}`,
        explanation:
          'The mirror image of `compose`: `reduce` (not `reduceRight`) processes the functions left to right, threading `x` through each one in turn. Many people find `pipe`\'s left-to-right order easier to read than `compose`\'s right-to-left order, since it matches the order the functions are written in.',
      },
      {
        slug: 'throttle',
        title: 'Throttle',
        difficulty: 'Medium',
        prompt: 'Write `throttle(fn, wait)` that returns a function which calls `fn` at most once every `wait` milliseconds, no matter how often it is called. If it is called again while waiting, the most recent call\'s arguments should be used for the next allowed call.',
        example: `const log = throttle(console.log, 100)
log(1); log(2); log(3)
// logs 1 immediately, then 3 (the latest call) about 100ms later`,
        starterCode: `function throttle(fn, wait) {
  // return a throttled function
}`,
        solutionCode: `function throttle(fn, wait) {
  let waiting = false;
  let lastArgs = null;

  function startCooldown(context) {
    waiting = true;
    setTimeout(() => {
      if (lastArgs) {
        fn.apply(context, lastArgs);
        lastArgs = null;
        startCooldown(context); // still recent activity, cool down again
      } else {
        waiting = false;
      }
    }, wait);
  }

  return function(...args) {
    if (waiting) {
      lastArgs = args;
      return;
    }
    fn.apply(this, args);
    startCooldown(this);
  };
}`,
        explanation:
          'Unlike debounce, which waits for a pause, throttle guarantees calls happen at a steady rate: the first call fires immediately and starts a cooldown; any calls during the cooldown are dropped except their arguments are remembered, so the most recent one gets a turn at the end of the window. This suits things like scroll or resize handlers, where you want regular updates, not silence until the user stops.',
      },
      {
        slug: 'custom-bind-implementation',
        title: 'Custom bind() Implementation',
        difficulty: 'Medium',
        prompt: 'Implement `Function.prototype.myBind(context, ...boundArgs)`, a simplified version of the built-in `bind`. Calling the bound function should call the original function with `this` set to `context`, with `boundArgs` followed by any arguments passed at call time.',
        example: `function greet(greeting, name) { return \`\${greeting}, \${name}! I am \${this.role}\` }
const bound = greet.myBind({ role: 'assistant' }, 'Hello')
bound('Erin') // "Hello, Erin! I am assistant"`,
        starterCode: `Function.prototype.myBind = function(context, ...boundArgs) {
  // return a new function with this bound to context
};`,
        solutionCode: `Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;
  return function(...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};`,
        explanation:
          'Inside `myBind`, `this` is the original function being bound, since it is called as `someFunction.myBind(...)`. The returned function closes over both `fn` and `context`, and uses `apply` to invoke `fn` with `context` as `this` and the bound arguments followed by whatever is passed later.',
      },
    ],
  },
  {
    name: 'Async Utilities',
    description: 'Reimplementing the Promise combinators, plus a retry helper for flaky calls.',
    problems: [
      {
        slug: 'promise-all-polyfill',
        title: 'Promise.all Polyfill',
        difficulty: 'Medium',
        prompt: 'Implement `promiseAllPolyfill(promises)`, a version of `Promise.all`. It resolves with an array of all resolved values, in input order, once every promise has resolved, or rejects immediately with the first rejection reason.',
        example: `promiseAllPolyfill([Promise.resolve(1), Promise.resolve(2)])
  .then(console.log) // [1, 2]`,
        starterCode: `function promiseAllPolyfill(promises) {
  // return a promise
}`,
        solutionCode: `function promiseAllPolyfill(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}`,
        explanation:
          'Wrapping each item in `Promise.resolve` means the function also accepts plain, non-promise values, matching the real `Promise.all`. A shared countdown (`remaining`) tracks how many are still pending, and the very first rejection anywhere immediately rejects the whole thing via the second argument to `.then`.',
      },
      {
        slug: 'promise-race-polyfill',
        title: 'Promise.race Polyfill',
        difficulty: 'Medium',
        prompt: 'Implement `promiseRacePolyfill(promises)`, a version of `Promise.race`. It should settle (resolve or reject) as soon as the first of the given promises settles, with that same value or reason.',
        example: `promiseRacePolyfill([sleep(100).then(() => 'slow'), sleep(10).then(() => 'fast')])
  .then(console.log) // "fast"`,
        starterCode: `function promiseRacePolyfill(promises) {
  // return a promise
}`,
        solutionCode: `function promiseRacePolyfill(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((p) => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
}`,
        explanation:
          'Attaching the same `resolve`/`reject` pair to every promise means whichever one settles first "wins": a `Promise` executor only honours the first call to `resolve` or `reject` it receives, silently ignoring every call after that, which is exactly the race behaviour needed here.',
      },
      {
        slug: 'retry-with-exponential-backoff',
        title: 'Retry with Exponential Backoff',
        difficulty: 'Medium',
        prompt: 'Write an async function `retry(fn, retries, delay)` that calls `fn()` (which returns a promise). If it rejects, wait `delay` milliseconds and try again, doubling the delay each time, up to `retries` attempts. If every attempt fails, throw the last error.',
        example: `let attempt = 0
const flaky = () => attempt++ < 2 ? Promise.reject('fail') : Promise.resolve('ok')
await retry(flaky, 3, 100) // 'ok', after two failed attempts with growing delays`,
        starterCode: `async function retry(fn, retries = 3, delay = 500) {
  // try fn, retrying with exponential backoff on failure
}`,
        solutionCode: `async function retry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}`,
        explanation:
          'A recursive function is a natural fit: the base case is running out of retries, in which case the error is finally allowed to propagate; otherwise, wait out the current delay and recurse with one fewer retry and a doubled delay. Exponential backoff like this is the standard way to avoid hammering a struggling server with immediate retries.',
      },
    ],
  },
  {
    name: 'Design Patterns',
    description: 'Two classic patterns, written in plain JavaScript, that come up in system-design-flavoured frontend interviews.',
    problems: [
      {
        slug: 'singleton-pattern',
        title: 'Singleton Pattern',
        difficulty: 'Easy',
        prompt: 'Implement a `Singleton` class that only ever allows one instance to exist. Calling `new Singleton()` more than once, or calling the static `Singleton.getInstance()`, should always return the exact same object.',
        example: `const a = new Singleton()
const b = Singleton.getInstance()
a === b // true`,
        starterCode: `class Singleton {
  constructor() {
    // ensure only one instance ever exists
  }
  static getInstance() {}
}`,
        solutionCode: `class Singleton {
  static #instance = null;
  constructor() {
    if (Singleton.#instance) return Singleton.#instance;
    Singleton.#instance = this;
  }
  static getInstance() {
    if (!Singleton.#instance) Singleton.#instance = new Singleton();
    return Singleton.#instance;
  }
}`,
        explanation:
          'A private static field holds the one allowed instance. The constructor checks it first: if an instance already exists, it returns that instance instead of a new one (a constructor is allowed to return an object, which replaces the newly created one). Use sparingly in real apps: singletons are effectively global state, which makes testing and reasoning about the code harder.',
      },
      {
        slug: 'observer-pub-sub-pattern',
        title: 'Observer / Pub-Sub Pattern',
        difficulty: 'Medium',
        prompt: 'Implement a `PubSub` class with `subscribe(topic, callback)`, which registers a callback for a topic and returns an unsubscribe function, and `publish(topic, data)`, which calls every subscriber of that topic with `data`.',
        example: `const bus = new PubSub()
const unsubscribe = bus.subscribe('news', (msg) => console.log('got:', msg))
bus.publish('news', 'hello') // logs "got: hello"
unsubscribe()
bus.publish('news', 'again') // nothing logs`,
        starterCode: `class PubSub {
  constructor() {
    // set up storage
  }
  subscribe(topic, callback) {}
  publish(topic, data) {}
}`,
        solutionCode: `class PubSub {
  constructor() {
    this.subscribers = {};
  }
  subscribe(topic, callback) {
    if (!this.subscribers[topic]) this.subscribers[topic] = [];
    this.subscribers[topic].push(callback);
    return () => {
      this.subscribers[topic] = this.subscribers[topic].filter((cb) => cb !== callback);
    };
  }
  publish(topic, data) {
    (this.subscribers[topic] || []).forEach((cb) => cb(data));
  }
}`,
        explanation:
          'Structurally identical to the Event Emitter problem, because it is the same pattern under a different name: subjects (publishers) notify observers (subscribers) without either side needing to know about the other directly. This decoupling is why it shows up everywhere from DOM events to Redux\'s store subscriptions.',
      },
    ],
  },
  {
    name: 'Objects and Recursion',
    description: 'Deep operations on nested data: cloning, comparing, and a small cache with real eviction.',
    problems: [
      {
        slug: 'deep-clone',
        title: 'Deep Clone',
        difficulty: 'Medium',
        prompt: 'Write `deepClone(value)` that returns a copy of `value` where every nested object and array is also copied, so changing the clone never affects the original, no matter how deeply nested the change is.',
        example: `const original = { a: 1, b: { c: 2 } }
const copy = deepClone(original)
copy.b.c = 99
original.b.c // still 2`,
        starterCode: `function deepClone(value) {
  // return a deep copy of value
}`,
        solutionCode: `function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const result = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = deepClone(value[key]);
    }
  }
  return result;
}`,
        explanation:
          'Primitives (numbers, strings, `null`, and so on) are returned as-is since they are already copied by value whenever they are assigned; that is the base case. Arrays and objects are rebuilt fresh, with every value inside them passed back through `deepClone` recursively, so nested structures are copied all the way down rather than just at the top level, which is what `structuredClone` or a shallow spread would miss.',
      },
      {
        slug: 'deep-equal',
        title: 'Deep Equal',
        difficulty: 'Medium',
        prompt: 'Write `deepEqual(a, b)` that returns `true` if two values are structurally equal: same primitive value, or objects/arrays with the same keys and deeply equal values at every one of them.',
        example: `deepEqual({ a: [1, 2] }, { a: [1, 2] }) // true
deepEqual({ a: [1, 2] }, { a: [1, 3] }) // false`,
        starterCode: `function deepEqual(a, b) {
  // return true or false
}`,
        solutionCode: `function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}`,
        explanation:
          '`===` handles identical primitives and identical references immediately. If either side is not a non-null object at that point, they cannot be equal (one is a primitive, the other is not, or they are different primitives). Otherwise, both must have the same number of keys, and every value at each key must itself be deeply equal, checked recursively.',
      },
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        prompt: 'Implement an `LRUCache` class with a fixed `capacity`. `get(key)` returns the value (and marks it as recently used) or `-1` if missing. `put(key, value)` adds or updates a value; if the cache is at capacity and a new key is added, the least recently used entry should be evicted.',
        example: `const cache = new LRUCache(2)
cache.put(1, 'a')
cache.put(2, 'b')
cache.get(1) // 'a', and 1 is now most recently used
cache.put(3, 'c') // evicts 2, the least recently used
cache.get(2) // -1`,
        starterCode: `class LRUCache {
  constructor(capacity) {
    // set up storage
  }
  get(key) {}
  put(key, value) {}
}`,
        solutionCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
        explanation:
          'A JavaScript `Map` remembers insertion order, and deleting then re-inserting a key moves it to the end of that order. Treating "end" as "most recently used" means the first key returned by `.keys()` is always the least recently used one, which is exactly the entry to evict when the cache is full.',
      },
    ],
  },
]

export const totalJsProblems = jsCategories.reduce((sum, c) => sum + c.problems.length, 0)

export function findJsProblem(slug: string) {
  for (const category of jsCategories) {
    const problem = category.problems.find((p) => p.slug === slug)
    if (problem) return { category, problem }
  }
  return undefined
}
