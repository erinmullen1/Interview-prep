import type { KeyTerm, TrainingStep } from './content'

/**
 * Training modules for the general computer-science topics. Same lesson
 * format as the challenge modules, but each has its own title because there
 * is no matching challenge demo. Ids match the general tests so the
 * "Take the test" link works.
 */
export interface GeneralTraining {
  id: string
  title: string
  intro: string
  outcomes: string[]
  terms: KeyTerm[]
  steps: TrainingStep[]
}

export const generalTraining: GeneralTraining[] = [
  // ---------------------------------------------------------------------------
  {
    id: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    intro:
      'These are the language questions that come up in nearly every frontend interview: how scope and closures work, what `this` means, how the event loop orders work, and how values are compared and copied. Each lesson shows a small piece of code, predicts what it does, and explains why.',
    outcomes: [
      'Predict what a closure will "remember"',
      'Explain the difference between var, let and const',
      'Order synchronous code, promises and timers correctly',
      'Know when `==`, `===`, spread and structuredClone are the right tool',
    ],
    terms: [
      { term: 'Scope', meaning: 'The part of the code where a variable can be seen. Functions and blocks (curly braces) create scopes.' },
      { term: 'Closure', meaning: 'A function plus the variables it could see when it was created. It keeps them even after the outer function has returned.' },
      { term: 'Hoisting', meaning: 'JavaScript moves declarations to the top of their scope before running. `var` becomes undefined; `let` and `const` exist but cannot be used yet.' },
      { term: 'Event loop', meaning: 'The mechanism that runs queued callbacks (timers, promise results, clicks) one at a time whenever the main code has finished.' },
      { term: 'Microtask', meaning: 'A promise callback. Microtasks always run before the next timer or event callback.' },
    ],
    steps: [
      {
        title: 'Scope, var vs let, and the loop question',
        summary: '`var` is shared across a whole function; `let` gives each loop iteration its own copy.',
        concept:
          'The classic question shows a `for` loop with `setTimeout` and asks what it logs. The answer depends on whether the variable is shared by all iterations (`var`) or created fresh each time (`let`). Understanding this is really understanding scope.',
        walkthrough: [
          {
            text: 'Predict this first. All three callbacks run after the loop finishes. With `var`, there is one `i`, and by then it is 3.',
            code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// logs: 3, 3, 3`,
          },
          {
            text: 'Change `var` to `let`. Now each iteration gets its own `i`, and each callback captures its own.',
            code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// logs: 0, 1, 2`,
          },
          {
            text: 'The rule of thumb: use `const` by default, `let` when you need to reassign, and never `var`. `const` does not make objects immutable; it only stops you reassigning the variable.',
            code: `const user = { name: 'Erin' }
user.name = 'Sam'   // fine: the object changed, the binding did not
user = {}           // TypeError: assignment to constant`,
          },
        ],
        pitfalls: ['Saying "`const` makes it immutable". It makes the variable unreassignable; the contents can still change.'],
        checkpoint: 'Without running it, what does the `var` version log if the timeout is 1000ms instead of 0? Why does the delay not matter?',
      },
      {
        title: 'Closures',
        summary: 'A function remembers the variables around it, even after the outer function has finished.',
        concept:
          'A closure is a function bundled with its surrounding variables. It is how a debounce helper remembers its timer, how a counter keeps its count, and how React hooks work under the hood. Interviewers ask about closures because they explain so many other behaviours.',
        walkthrough: [
          {
            text: 'A counter factory. `count` lives in `makeCounter`, which has already returned. The inner function keeps it alive.',
            code: `function makeCounter() {
  let count = 0
  return function () {
    count += 1
    return count
  }
}

const next = makeCounter()
next() // 1
next() // 2

const other = makeCounter()
other() // 1  (its own separate count)`,
          },
          {
            text: 'A real use: a debounce helper. The returned function closes over `timer`, so every call can cancel the previous one.',
            code: `function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const save = debounce(() => console.log('saved'), 300)
save(); save(); save() // logs "saved" once, 300ms after the last call`,
          },
          {
            text: 'The gotcha: a closure captures the variable, not its value at the time. If the variable changes later, the closure sees the new value. That is exactly why the `var` loop logs 3, 3, 3, and why React code sometimes reads "stale" state.',
          },
        ],
        checkpoint: 'Explain, using the counter example, why two calls to `makeCounter()` do not share a count.',
      },
      {
        title: 'The event loop: what runs first',
        summary: 'Synchronous code, then all promise callbacks, then one timer or event, then repeat.',
        concept:
          'JavaScript runs one thing at a time. Slow work like timers and network requests is handed to the browser, and their callbacks are queued. The event loop takes queued callbacks when the main code finishes. Promise callbacks (microtasks) are special: they all run before the next timer or event callback (macrotasks).',
        walkthrough: [
          {
            text: 'Predict the order.',
            code: `console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')
// logs: A, D, C, B`,
          },
          {
            text: 'Why: A and D are synchronous and run immediately. The promise callback C is a microtask, which runs as soon as the synchronous code ends. The timer B is a macrotask and waits until all microtasks are done, even with a 0ms delay.',
          },
          {
            text: '`async`/`await` is promises in disguise. Everything after an `await` is a microtask.',
            code: `async function run() {
  console.log('1')
  await null
  console.log('3')
}
run()
console.log('2')
// logs: 1, 2, 3`,
          },
        ],
        pitfalls: ['Assuming `setTimeout(fn, 0)` runs immediately. It runs after the current code and all pending promise callbacks.'],
        checkpoint: 'Why can a long synchronous loop freeze the whole page, including click handlers and timers?',
      },
      {
        title: '`this`, equality, and copying',
        summary: 'Arrow functions borrow `this`; use `===`; spread copies one level only.',
        concept:
          'Three smaller questions that come up constantly. What `this` is inside a function depends on how it was called, except arrow functions, which take it from where they were written. `==` converts types before comparing, which causes surprises. And spreading an object copies only the top level.',
        walkthrough: [
          {
            text: '`this` in a regular method is the object before the dot. Passing the method somewhere else loses that. An arrow function does not have its own `this`, so it keeps the surrounding one.',
            code: `const timer = {
  seconds: 0,
  start() {
    setInterval(function () { this.seconds++ }, 1000) // wrong: "this" is not timer here
    setInterval(() => { this.seconds++ }, 1000)        // right: arrow keeps the outer "this"
  },
}`,
          },
          {
            text: 'Loose equality converts types. Strict equality does not. Use `===` unless you have a specific reason.',
            code: `0 == ''        // true  (both convert to 0)
0 === ''       // false
null == undefined   // true
null === undefined  // false
'1' == 1       // true
'1' === 1      // false`,
          },
          {
            text: 'Spread makes a shallow copy. Nested objects are shared. `structuredClone` makes a deep copy.',
            code: `const a = { name: 'A', address: { city: 'Leeds' } }
const b = { ...a }
b.address.city = 'York'
a.address.city // 'York'  (shared!)

const c = structuredClone(a)
c.address.city = 'Hull'
a.address.city // still 'York'`,
          },
        ],
        checkpoint: 'Why do React state updates use spread (`{ ...prev, x: 1 }`) rather than editing the object directly, and when is a shallow copy not enough?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'data-structures',
    title: 'Data Structures',
    intro:
      'You rarely implement data structures from scratch in frontend work, but you choose between them every day: array or Set, object or Map, and how to walk a tree like the DOM. This module teaches each one by what it is good at and shows the JavaScript you would actually write.',
    outcomes: [
      'Pick between array, Set, object and Map for a given job',
      'Recognise stacks and queues in everyday code',
      'Walk a tree with recursion',
      'Explain what a graph is and how breadth-first search works',
    ],
    terms: [
      { term: 'Constant time', meaning: 'The operation takes the same time no matter how much data there is. Looking up a key in a Map is constant time.' },
      { term: 'Linear time', meaning: 'The time grows in step with the amount of data. Searching an array with `includes` is linear.' },
      { term: 'LIFO / FIFO', meaning: 'Last In, First Out (a stack). First In, First Out (a queue).' },
      { term: 'Node', meaning: 'One item in a linked structure, holding a value and links to other nodes.' },
      { term: 'Traversal', meaning: 'Visiting every item in a structure, in some order.' },
    ],
    steps: [
      {
        title: 'Arrays vs Sets',
        summary: 'Arrays keep order and duplicates. Sets give instant "have I seen this?" checks.',
        concept:
          'An array is a list. Checking whether it contains something means scanning it. A Set stores unique values and answers "is this in here?" almost instantly. The classic interview trap is checking every item of one array against another with `includes`, which becomes very slow as lists grow.',
        walkthrough: [
          {
            text: 'The slow version. For each item, `includes` scans the whole array. With 10,000 items that is up to 100 million comparisons.',
            code: `function hasDuplicate(items) {
  for (let i = 0; i < items.length; i++) {
    if (items.slice(i + 1).includes(items[i])) return true
  }
  return false
}`,
          },
          {
            text: 'The fast version. A Set remembers what we have seen with a constant-time check.',
            code: `function hasDuplicate(items) {
  const seen = new Set()
  for (const item of items) {
    if (seen.has(item)) return true
    seen.add(item)
  }
  return false
}`,
          },
          {
            text: 'Removing duplicates is one line for the same reason.',
            code: `const unique = [...new Set(items)]`,
          },
        ],
        pitfalls: ['Using `array.includes` inside a loop over another array. It works on small data and collapses on large data.'],
        checkpoint: 'You have a list of 50,000 user ids and a list of 50,000 blocked ids. How would you find the users who are blocked, and why not with two nested loops?',
      },
      {
        title: 'Objects vs Maps',
        summary: 'Objects are fine for fixed string keys. Maps are better for dynamic keys and non-string keys.',
        concept:
          'Both are key-to-value lookup tables. A plain object turns every key into a string and carries inherited properties like `toString`. A Map accepts any key type, keeps insertion order, and tells you its size. Use an object for a fixed shape (a user record) and a Map for a dynamic lookup table.',
        walkthrough: [
          {
            text: 'Objects coerce keys to strings, so two different objects used as keys collide.',
            code: `const cache = {}
const a = { id: 1 }, b = { id: 2 }
cache[a] = 'first'
cache[b] = 'second'
Object.keys(cache) // ['[object Object]']  (one key!)`,
          },
          {
            text: 'A Map keeps them separate and supports `size`, ordered iteration and easy deletion.',
            code: `const cache = new Map()
cache.set(a, 'first')
cache.set(b, 'second')
cache.size          // 2
cache.get(a)        // 'first'
cache.delete(b)
for (const [key, value] of cache) { /* insertion order */ }`,
          },
          {
            text: 'The shopping cart challenge uses a plain object keyed by product id. That is fine because the keys are strings and the object is small. Say why you chose it, and when you would switch.',
          },
        ],
        checkpoint: 'Give one case where a plain object is the better choice and one where a Map is.',
      },
      {
        title: 'Stacks and queues',
        summary: 'A stack takes from the top (undo history). A queue takes from the front (a line at a shop).',
        concept:
          'A stack is Last In, First Out: the most recently added item comes out first. Undo history, the browser back button, and the JavaScript call stack are stacks. A queue is First In, First Out: the oldest item comes out first. Print jobs and the browser\'s task queue are queues.',
        walkthrough: [
          {
            text: 'A stack with an array: `push` to add, `pop` to remove. Both are constant time.',
            code: `const history = []
history.push('typed a')
history.push('typed b')
history.pop() // 'typed b'  (undo the latest)`,
          },
          {
            text: 'A queue with an array: `push` to add, `shift` to remove. Note `shift` moves every remaining element, so it is linear time. For large queues use two stacks or a linked list.',
            code: `const jobs = []
jobs.push('print A')
jobs.push('print B')
jobs.shift() // 'print A'  (oldest first)`,
          },
          {
            text: 'A common interview task: check that brackets are balanced. Push opening brackets; on a closing bracket, the top of the stack must match.',
            code: `function balanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch)
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false
    }
  }
  return stack.length === 0
}`,
          },
        ],
        checkpoint: 'Why is the JavaScript call stack a stack? What happens to it when a recursive function has no base case?',
      },
      {
        title: 'Trees and graphs',
        summary: 'The DOM is a tree. Walk it with recursion. A social network is a graph. Search it breadth-first.',
        concept:
          'A tree has one root and every node has one parent. The DOM, a folder structure, and a comment thread are trees. Recursion is the natural way to walk one. A graph is looser: nodes can connect to any other nodes, including in cycles. Friendships, routes and dependencies are graphs. Breadth-first search finds the shortest path in hops.',
        walkthrough: [
          {
            text: 'Walk a tree with recursion. The function handles one node and calls itself for each child.',
            code: `function countNodes(node) {
  let total = 1
  for (const child of node.children) {
    total += countNodes(child)
  }
  return total
}
countNodes(document.body)`,
          },
          {
            text: 'Breadth-first search on a graph uses a queue. It explores all neighbours at distance 1, then distance 2, and so on, so the first time it reaches the target is by the shortest route.',
            code: `function shortestPath(graph, start, target) {
  const queue = [[start, 0]]
  const visited = new Set([start])
  while (queue.length) {
    const [node, dist] = queue.shift()
    if (node === target) return dist
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next)
        queue.push([next, dist + 1])
      }
    }
  }
  return -1
}

const friends = { ann: ['bo'], bo: ['ann', 'cy'], cy: ['bo'] }
shortestPath(friends, 'ann', 'cy') // 2`,
          },
          {
            text: 'The `visited` set is what stops a graph search looping forever on a cycle. Trees do not need it because they have no cycles.',
          },
        ],
        pitfalls: ['Forgetting `visited` in a graph search. On any cycle, the search never ends.'],
        checkpoint: 'Why does recursion suit trees but need extra care on graphs?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'algorithms-complexity',
    title: 'Algorithms & Big-O',
    intro:
      'Big-O is a way of talking about how code slows down as data grows. Interviewers use it to check that you can spot a nested loop that will not scale, and that you know the handful of standard techniques (binary search, sorting, recursion, memoisation) well enough to reach for them.',
    outcomes: [
      'Read a function and name its Big-O',
      'Explain O(1), O(log n), O(n), O(n log n) and O(n²) with examples',
      'Implement binary search and explain why it needs sorted data',
      'Write a recursive function with a base case and add memoisation',
    ],
    terms: [
      { term: 'Big-O', meaning: 'A label for how the work grows with input size n, ignoring constants. O(n) means "roughly proportional to n".' },
      { term: 'O(1)', meaning: 'Constant. The same work regardless of size. Array index lookup, Map.get.' },
      { term: 'O(log n)', meaning: 'Logarithmic. Doubling the data adds one more step. Binary search.' },
      { term: 'O(n log n)', meaning: 'What good sorting algorithms cost.' },
      { term: 'O(n²)', meaning: 'Quadratic. Doubling the data quadruples the work. A loop inside a loop over the same data.' },
      { term: 'Base case', meaning: 'The condition that stops a recursive function calling itself.' },
    ],
    steps: [
      {
        title: 'Reading Big-O from code',
        summary: 'One loop over n is O(n). A loop inside a loop is O(n²). A lookup in a Map is O(1).',
        concept:
          'Big-O asks: if the input doubles, roughly what happens to the work? You can usually read it from the loop structure. Constants and small terms are dropped, so O(2n + 5) is written O(n).',
        walkthrough: [
          {
            text: 'One pass over the data is linear.',
            code: `function sum(nums) {           // O(n)
  let total = 0
  for (const n of nums) total += n
  return total
}`,
          },
          {
            text: 'A loop inside a loop over the same data is quadratic. This is the pattern to watch for.',
            code: `function pairs(nums) {         // O(n²)
  const out = []
  for (const a of nums)
    for (const b of nums) out.push([a, b])
  return out
}`,
          },
          {
            text: 'Two separate loops are still linear: O(n) + O(n) = O(2n) = O(n). Only nesting multiplies.',
            code: `function twoPasses(nums) {     // O(n), not O(n²)
  for (const n of nums) { /* ... */ }
  for (const n of nums) { /* ... */ }
}`,
          },
          {
            text: 'Hidden costs: `array.includes`, `indexOf`, `find` and `shift` are each O(n). Calling one inside a loop makes the loop O(n²).',
          },
        ],
        pitfalls: ['Missing the O(n) hiding inside `includes` or `find` when it is called in a loop.'],
        checkpoint: 'A function loops over 1,000 items and calls `list.find(...)` on a 1,000-item list each time. About how many operations is that?',
      },
      {
        title: 'Binary search',
        summary: 'Halve the search range each step. A million items takes about 20 steps. Needs sorted data.',
        concept:
          'If the data is sorted, you can find an item by checking the middle, deciding which half it must be in, and repeating. Each step halves the range, so the number of steps is the logarithm of the size. This is the standard example of O(log n).',
        walkthrough: [
          {
            text: 'Keep two indexes for the current range. Compare with the middle and move one boundary.',
            code: `function binarySearch(sorted, target) {
  let lo = 0
  let hi = sorted.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (sorted[mid] === target) return mid
    if (sorted[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`,
          },
          {
            text: 'Why 20 steps for a million: 2 to the power 20 is about 1,048,576. Twenty halvings get you from a million to one.',
          },
          {
            text: 'The requirement: the data must be sorted. Sorting first costs O(n log n), so binary search pays off when you search many times, not once.',
          },
        ],
        checkpoint: 'You need to look up prices by product code thousands of times. Compare: linear search, binary search on a sorted array, and a Map. Which would you pick?',
      },
      {
        title: 'Sorting',
        summary: 'Good sorts are O(n log n). `Array.sort` is one. Always pass a compare function.',
        concept:
          'You will almost never write a sort by hand, but you should know that comparison sorting cannot beat O(n log n), that `Array.prototype.sort` achieves it, and two practical gotchas: it sorts as strings by default, and it changes the array in place.',
        walkthrough: [
          {
            text: 'The string-sort gotcha.',
            code: `[10, 9, 1].sort()            // [1, 10, 9]  (compared as strings!)
[10, 9, 1].sort((a, b) => a - b) // [1, 9, 10]`,
          },
          {
            text: 'In-place mutation. Copy first if the original must stay intact (as the data-table challenge does).',
            code: `const sorted = [...items].sort((a, b) => a.price - b.price)`,
          },
          {
            text: 'Sorting objects by a string field: use `localeCompare` so accents and case are handled.',
            code: `people.sort((a, b) => a.name.localeCompare(b.name))`,
          },
        ],
        pitfalls: ['Calling `.sort()` on numbers with no compare function.', 'Sorting shared data in place.'],
        checkpoint: 'Why can a comparison-based sort not be faster than O(n log n) in general? (A one-sentence intuition is fine.)',
      },
      {
        title: 'Recursion and memoisation',
        summary: 'Recursion solves a problem by solving a smaller copy of it. Memoisation caches answers so you never solve the same copy twice.',
        concept:
          'A recursive function calls itself on a smaller input and must have a base case that stops it. Some recursive problems recompute the same sub-answers many times. Memoisation stores each answer the first time, turning exponential work into linear. React\'s `useMemo` is the same idea applied to rendering.',
        walkthrough: [
          {
            text: 'Fibonacci the naive way. Correct, but `fib(40)` makes over a billion calls because it recomputes the same values endlessly.',
            code: `function fib(n) {
  if (n <= 1) return n            // base case
  return fib(n - 1) + fib(n - 2)  // smaller copies
}`,
          },
          {
            text: 'Add a cache. Now each `n` is computed once. `fib(40)` is instant.',
            code: `function fib(n, memo = new Map()) {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)
  const result = fib(n - 1, memo) + fib(n - 2, memo)
  memo.set(n, result)
  return result
}`,
          },
          {
            text: 'A general memoise helper, which is roughly what `useMemo` does for a render calculation.',
            code: `function memoise(fn) {
  const cache = new Map()
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg))
    return cache.get(arg)
  }
}`,
          },
        ],
        pitfalls: ['A recursive function with no base case, which overflows the call stack.'],
        checkpoint: 'What is the trade-off memoisation makes, and when would it not be worth it?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'browser-fundamentals',
    title: 'How the Browser Works',
    intro:
      'Frontend interviews often step back from React and ask how the browser itself turns HTML into pixels, why some changes are slow, and where data can be stored. This module walks the path from HTML to paint and the handful of browser mechanisms you interact with daily.',
    outcomes: [
      'Describe the critical rendering path',
      'Explain reflow vs repaint and which CSS properties are cheap to animate',
      'Use event bubbling and delegation',
      'Choose between localStorage, sessionStorage and cookies',
    ],
    terms: [
      { term: 'DOM', meaning: 'The tree of objects the browser builds from your HTML. JavaScript reads and changes the page through it.' },
      { term: 'CSSOM', meaning: 'The same idea for CSS: a tree of all the style rules.' },
      { term: 'Reflow (layout)', meaning: 'Recalculating where every element sits and how big it is.' },
      { term: 'Repaint', meaning: 'Redrawing pixels without changing positions or sizes.' },
      { term: 'Bubbling', meaning: 'An event fires on the element clicked, then on its parent, then its grandparent, up to the document.' },
    ],
    steps: [
      {
        title: 'From HTML to pixels',
        summary: 'Parse HTML into the DOM, CSS into the CSSOM, combine them, work out positions, paint.',
        concept:
          'The browser cannot draw anything until it knows both the structure (DOM) and the styles (CSSOM). It combines them into a render tree, computes layout (where everything goes), then paints. Knowing this order explains why CSS in the head blocks rendering and why scripts can delay the page.',
        walkthrough: [
          {
            text: 'The stages, in order: HTML → DOM. CSS → CSSOM. DOM + CSSOM → render tree (visible elements with their styles). Render tree → layout (geometry). Layout → paint (pixels).',
          },
          {
            text: 'Scripts block parsing by default, because a script might change the DOM. `defer` downloads in parallel and runs after parsing, in order. `async` runs as soon as it downloads, in any order.',
            code: `<script src="app.js"></script>          <!-- blocks parsing while it loads and runs -->
<script src="app.js" defer></script>    <!-- runs after parsing, keeps order -->
<script src="analytics.js" async></script> <!-- runs whenever ready, any order -->`,
          },
          {
            text: 'CSS is render-blocking: the browser waits for stylesheets before painting so users do not see unstyled content. Keep critical CSS small and load the rest later.',
          },
        ],
        checkpoint: 'Why does a large stylesheet in the head delay the first paint even if the HTML has fully arrived?',
      },
      {
        title: 'Reflow, repaint, and smooth animation',
        summary: 'Changing size or position triggers reflow (expensive). Changing colour triggers repaint (cheaper). transform and opacity avoid both.',
        concept:
          'When you change something that affects geometry, the browser recalculates layout, possibly for the whole page. That is reflow. Changing only appearance repaints without layout. `transform` and `opacity` can be handled by the compositor without either, which is why they animate smoothly.',
        walkthrough: [
          {
            text: 'Reflow triggers: width, height, margin, padding, font-size, adding or removing elements. Repaint only: color, background, box-shadow. Neither: transform, opacity.',
          },
          {
            text: 'Animate movement with transform, not left/top.',
            code: `/* janky: reflow on every frame */
.box { transition: left 0.3s; }
.box.moved { left: 200px; }

/* smooth: compositor only */
.box { transition: transform 0.3s; }
.box.moved { transform: translateX(200px); }`,
          },
          {
            text: 'Layout thrashing: reading a layout value (like `offsetHeight`) right after writing a style forces the browser to reflow immediately. In a loop this is very slow. Batch reads, then writes.',
            code: `// slow: read/write/read/write forces a reflow each time
items.forEach((el) => { el.style.height = el.offsetHeight + 10 + 'px' })

// better: read all, then write all
const heights = items.map((el) => el.offsetHeight)
items.forEach((el, i) => { el.style.height = heights[i] + 10 + 'px' })`,
          },
        ],
        checkpoint: 'Why does animating `transform` feel smoother than animating `left`?',
      },
      {
        title: 'Events: bubbling and delegation',
        summary: 'Events travel up from the target to the document. One listener on a parent can handle all its children.',
        concept:
          'When you click a button, the click event fires on the button, then bubbles up through every ancestor. Event delegation uses this: put one listener on a parent and inspect `event.target` to see what was actually clicked. It works for elements added later and saves creating hundreds of listeners.',
        walkthrough: [
          {
            text: 'One listener on the list handles every item, including ones added after.',
            code: `document.querySelector('ul').addEventListener('click', (e) => {
  const li = e.target.closest('li')
  if (li) console.log('clicked', li.dataset.id)
})`,
          },
          {
            text: '`stopPropagation()` stops the bubble. The accessible-modal challenge uses it so a click inside the dialog does not reach the backdrop\'s close handler. `preventDefault()` is different: it stops the browser\'s default action (following a link, submitting a form).',
          },
          {
            text: 'React uses delegation itself: it attaches one listener at the root and dispatches to your handlers. That is why React event handling is cheap even with thousands of elements.',
          },
        ],
        pitfalls: ['Confusing `stopPropagation` (stop bubbling) with `preventDefault` (stop the default action).'],
        checkpoint: 'You have a table with 5,000 rows, each with a delete button. Where do you attach the click listener, and why?',
      },
      {
        title: 'Storing data in the browser',
        summary: 'localStorage persists, sessionStorage dies with the tab, cookies travel to the server.',
        concept:
          'There are several places to keep data client-side and each has a different lifetime and audience. Pick by asking: does it need to survive a tab close? Does the server need to see it? How big is it?',
        walkthrough: [
          {
            text: 'localStorage: strings only, about 5MB, persists until cleared, shared by all tabs on the same origin, never sent to the server. Synchronous, so keep it small. The training progress in this app uses it.',
            code: `localStorage.setItem('theme', 'dark')
localStorage.getItem('theme') // 'dark'
localStorage.setItem('prefs', JSON.stringify({ compact: true }))`,
          },
          {
            text: 'sessionStorage: same API, but scoped to one tab and cleared when it closes. Good for multi-step form state.',
          },
          {
            text: 'Cookies: small (4KB), sent with every request to the server, can be flagged `HttpOnly` (hidden from JavaScript), `Secure` (HTTPS only) and `SameSite` (limits cross-site sending). Use for session tokens, not app data.',
          },
          {
            text: 'IndexedDB: a real asynchronous database for large or structured data (offline caches, files). More work to use; wrap it in a small library if you need it.',
          },
        ],
        checkpoint: 'Where would you store a login session token, a "dark mode" preference, and a 20MB offline dataset? Give a reason for each.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'http-networking',
    title: 'HTTP & Networking',
    intro:
      'Every fetch in the challenges rides on HTTP. Interviewers expect you to know the methods and status codes, how caching and CORS work, and to be able to narrate what happens between typing a URL and seeing a page. This module covers those with the actual headers and code you would use.',
    outcomes: [
      'Choose the right HTTP method and read status codes',
      'Explain CORS and fix a CORS error correctly',
      'Use Cache-Control and content hashing',
      'Narrate the URL-to-page journey',
    ],
    terms: [
      { term: 'Origin', meaning: 'Scheme + host + port, e.g. https://app.example.com. Two URLs with any of those different are different origins.' },
      { term: 'Idempotent', meaning: 'Doing it twice has the same effect as doing it once. GET, PUT and DELETE are; POST usually is not.' },
      { term: 'Preflight', meaning: 'An automatic OPTIONS request the browser sends before certain cross-origin requests to ask permission.' },
      { term: 'DNS', meaning: 'The lookup that turns a domain name into an IP address.' },
      { term: 'TLS', meaning: 'The encryption layer under HTTPS.' },
    ],
    steps: [
      {
        title: 'Methods and status codes',
        summary: 'GET reads, POST creates, PUT replaces, PATCH edits, DELETE removes. 2xx good, 4xx your fault, 5xx their fault.',
        concept:
          'Methods describe intent, and the safe/idempotent properties matter for retries and caching. Status codes are grouped by first digit. Knowing the common ones lets you handle errors properly in a fetch.',
        walkthrough: [
          {
            text: 'Methods: GET fetches and must not change anything. POST creates or triggers an action (not idempotent). PUT replaces a whole resource (idempotent). PATCH changes part of one. DELETE removes (idempotent).',
          },
          {
            text: 'Codes to know: 200 OK, 201 Created, 204 No Content, 301/302 redirect, 304 Not Modified (cache still valid), 400 Bad Request, 401 not logged in, 403 logged in but forbidden, 404 not found, 429 too many requests, 500 server error, 503 unavailable.',
          },
          {
            text: 'A gotcha: `fetch` only rejects on network failure. A 404 or 500 resolves normally. Check `response.ok`.',
            code: `const res = await fetch('/api/orders')
if (!res.ok) throw new Error(\`Request failed: \${res.status}\`)
const data = await res.json()`,
          },
        ],
        pitfalls: ['Assuming `fetch` throws on a 4xx or 5xx response. It does not.'],
        checkpoint: 'Why is it safe for a client to automatically retry a failed PUT but risky to retry a failed POST?',
      },
      {
        title: 'CORS',
        summary: 'The browser blocks reading cross-origin responses unless the server says it is allowed via headers.',
        concept:
          'By default, a page on one origin cannot read responses from another origin. This protects users: without it, any site you visit could read your bank\'s API using your cookies. The server opts in by sending `Access-Control-Allow-Origin`. The browser enforces it; tools like curl and server-to-server calls are unaffected.',
        walkthrough: [
          {
            text: 'A simple request (GET, no custom headers) is sent, and the browser then decides whether your code may read the response.',
            code: `// Response from https://api.other.com
Access-Control-Allow-Origin: https://app.example.com`,
          },
          {
            text: 'Requests with JSON bodies, custom headers or methods like PUT trigger a preflight: the browser sends OPTIONS first and only proceeds if the server allows the method and headers.',
            code: `OPTIONS /orders
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type

// Server must answer with:
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, PUT
Access-Control-Allow-Headers: content-type`,
          },
          {
            text: 'Fixing a CORS error is a server change (or a proxy), never a client trick. `mode: "no-cors"` does not fix it; it just hides the response from you.',
          },
        ],
        pitfalls: ['Trying to fix CORS in the frontend. The header has to come from the server you are calling.'],
        checkpoint: 'A CORS error appears in the console but the request shows 200 in the network tab. What happened, and who has to change what?',
      },
      {
        title: 'Caching',
        summary: 'Tell the browser how long a response is fresh. Put a hash in filenames so long caching is safe.',
        concept:
          'HTTP caching lets the browser reuse a response without asking again. `Cache-Control: max-age` sets how long. For built assets, bundlers put a hash of the contents in the filename, so you can cache for a year: any change produces a new filename. HTML itself should not be cached long, so users get the new filenames.',
        walkthrough: [
          {
            text: 'Fresh for an hour; after that, revalidate.',
            code: `Cache-Control: max-age=3600`,
          },
          {
            text: 'Hashed asset filenames (Vite does this in `dist/`) can be cached "forever".',
            code: `/assets/index-4f3a9c1b.js
Cache-Control: public, max-age=31536000, immutable`,
          },
          {
            text: 'Revalidation: the server sends an `ETag`. Next time the browser sends `If-None-Match`. If unchanged, the server replies 304 with no body, saving bandwidth.',
          },
        ],
        checkpoint: 'Why can you cache `index-4f3a9c1b.js` for a year but not `index.html`?',
      },
      {
        title: 'From URL to page',
        summary: 'DNS, connect (TCP + TLS), request, response, parse, fetch more, render.',
        concept:
          'This open-ended question checks whether you can connect the pieces. A good answer names each stage in order and mentions where caching and rendering fit. Depth is optional; order and completeness are not.',
        walkthrough: [
          {
            text: '1. The browser checks its cache (and the OS, and DNS caches) then asks DNS for the IP address of the host.',
          },
          {
            text: '2. It opens a TCP connection to that IP and, for HTTPS, performs a TLS handshake to agree encryption keys.',
          },
          {
            text: '3. It sends an HTTP request: method, path, headers (including cookies for that origin).',
          },
          {
            text: '4. The server responds with a status, headers and the HTML body. Redirects (3xx) repeat from step 1 with the new URL.',
          },
          {
            text: '5. The browser parses HTML into the DOM, discovers CSS, scripts and images, and fetches them (using the cache where allowed). CSS becomes the CSSOM; scripts run (blocking unless deferred).',
          },
          {
            text: '6. DOM + CSSOM → render tree → layout → paint. The page appears. JavaScript then attaches handlers and may fetch data.',
          },
        ],
        checkpoint: 'Give the six stages from memory, then name one place caching helps in the first half and one in the second half.',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'web-security',
    title: 'Web Security Basics',
    intro:
      'Frontend developers are the last line of defence against a small set of attacks that keep recurring. Interviewers want to see that you recognise them, know the specific defence for each, and understand what React does and does not protect you from.',
    outcomes: [
      'Explain XSS and how to prevent it in React and plain JavaScript',
      'Explain CSRF and the cookie flags and tokens that stop it',
      'Set up a basic Content Security Policy',
      'Know what must never ship in client-side code',
    ],
    terms: [
      { term: 'XSS', meaning: 'Cross-site scripting: an attacker gets their JavaScript to run in other users\' browsers on your site.' },
      { term: 'CSRF', meaning: 'Cross-site request forgery: a different site makes a logged-in user\'s browser send a request to yours.' },
      { term: 'Sanitise', meaning: 'Clean user-supplied HTML so only safe tags and attributes remain.' },
      { term: 'Escape', meaning: 'Convert characters like < and & into text so they display instead of being treated as markup.' },
      { term: 'CSP', meaning: 'Content Security Policy: a header telling the browser which sources of scripts and other resources are allowed.' },
    ],
    steps: [
      {
        title: 'XSS: injected scripts',
        summary: 'Never insert user input as HTML. React escapes text for you; dangerouslySetInnerHTML turns that off.',
        concept:
          'If user input is inserted into the page as raw HTML, a comment like `<img onerror="...">` runs code for every visitor. That code can read cookies, make requests as the user, or rewrite the page. The defence is to treat input as text (escape it) or, if HTML is genuinely needed, sanitise it with a proper library.',
        walkthrough: [
          {
            text: 'The vulnerable pattern in plain JavaScript.',
            code: `// DANGEROUS: comment is inserted as markup
el.innerHTML = '<p>' + comment + '</p>'

// SAFE: comment is inserted as text
el.textContent = comment`,
          },
          {
            text: 'React escapes by default. Text in JSX is always rendered as text, so this is safe even if `comment` contains a script tag.',
            code: `<p>{comment}</p>   // safe: rendered as text`,
          },
          {
            text: 'The escape hatch is exactly what it says. Only use it with sanitised HTML.',
            code: `import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />`,
          },
          {
            text: 'Other injection points: `href="javascript:..."` on links built from user input, and inserting user data into inline event handlers or style attributes.',
          },
        ],
        pitfalls: ['Believing React makes XSS impossible. It makes the default safe; the escape hatches are still there.'],
        checkpoint: 'A product page renders a seller-written description with `dangerouslySetInnerHTML`. What is the risk and what is the fix?',
      },
      {
        title: 'CSRF: forged requests',
        summary: 'Cookies are sent automatically, so another site can make your browser act as you. SameSite cookies and tokens stop it.',
        concept:
          'The browser attaches your cookies to any request to a site, even one triggered by a different site. So a hidden form on evil.com can POST to bank.com/transfer as you. Defences: the `SameSite` cookie attribute (the browser stops sending the cookie cross-site), an anti-CSRF token the attacker cannot know, and checking the `Origin` header on the server.',
        walkthrough: [
          {
            text: 'The attack, in outline.',
            code: `<!-- on evil.com, auto-submitted by script -->
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="1000" />
</form>`,
          },
          {
            text: 'Cookie flags that help. `SameSite=Lax` is the modern default and blocks most CSRF.',
            code: `Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax`,
          },
          {
            text: 'Token approach: the server embeds a random token in the page or a header; the client sends it back on state-changing requests; the server rejects requests without it. Attackers cannot read the token because of the same-origin policy.',
            code: `fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, amount }),
})`,
          },
        ],
        checkpoint: 'Why does storing the session in an `HttpOnly` cookie protect against XSS token theft but not, by itself, against CSRF?',
      },
      {
        title: 'Content Security Policy',
        summary: 'A header that whitelists where scripts and other resources may come from. Injected scripts get blocked.',
        concept:
          'Even with careful escaping, a CSP is a second layer. It tells the browser "only run scripts from these sources". An injected inline script or a script from an attacker\'s domain is simply refused. Artifacts in this environment use one, which is why external scripts are restricted to a few CDNs.',
        walkthrough: [
          {
            text: 'A reasonable starting policy.',
            code: `Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;`,
          },
          {
            text: 'Blocked things fail silently in the page but show in the console. Use `Content-Security-Policy-Report-Only` to test a policy before enforcing it.',
          },
          {
            text: 'Inline scripts and `eval` are blocked by default under a strict `script-src`. That is the point: most XSS payloads are inline.',
          },
        ],
        checkpoint: 'An attacker manages to inject `<script src="https://evil.com/x.js">` into a page with the policy above. What happens?',
      },
      {
        title: 'Secrets, HTTPS, and dependencies',
        summary: 'Anything in the bundle is public. Use HTTPS everywhere. Audit what you install.',
        concept:
          'Three habits interviewers check. Nothing shipped to the browser is secret, so privileged API keys must stay on a server. HTTPS protects data in transit and is required for many browser features. And third-party packages run with full access to your page, so they are part of your security surface.',
        walkthrough: [
          {
            text: 'Vite only exposes environment variables prefixed `VITE_`, precisely because they end up in the public bundle. A key with write access to a paid API does not belong there.',
            code: `// .env
VITE_PUBLIC_MAPS_KEY=...   // ok: restricted, read-only, domain-locked
STRIPE_SECRET_KEY=...      // never prefix this; keep it server-side`,
          },
          {
            text: 'Pattern: the browser calls your own backend, which holds the secret and calls the third-party API.',
          },
          {
            text: 'Dependencies: run `npm audit`, pin versions, and be suspicious of packages with few users that ask for a lot. A compromised package can exfiltrate every form your users fill in.',
          },
        ],
        checkpoint: 'A colleague suggests putting the payment provider\'s secret key in a `VITE_` variable "just for staging". What do you say?',
      },
    ],
  },
  // ---------------------------------------------------------------------------
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    intro:
      'The challenges use hooks throughout. This module steps back to the mental model underneath: what a render is, why state is a snapshot, what keys are for, and when an effect is the right tool. Getting these right is what separates "it works" from "I can explain why it works".',
    outcomes: [
      'Explain what triggers a render and what does not',
      'Use functional state updates when new state depends on old',
      'Choose stable keys and explain what goes wrong with index keys',
      'Decide when something belongs in useEffect and when it does not',
    ],
    terms: [
      { term: 'Render', meaning: 'React calling your component function to work out what the UI should look like now.' },
      { term: 'State snapshot', meaning: 'During one render, state values are fixed. Setting state schedules a new render; it does not change the current variables.' },
      { term: 'Reconciliation', meaning: 'React comparing the new output with the previous one and updating only what changed in the DOM.' },
      { term: 'Key', meaning: 'A stable id on list items so React can match old and new items across renders.' },
      { term: 'Side effect', meaning: 'Anything that reaches outside the component: network, timers, subscriptions, the DOM.' },
    ],
    steps: [
      {
        title: 'What a render is and what triggers it',
        summary: 'A render is React calling your function. Only state changes and parent renders cause one.',
        concept:
          'Your component is a function. React calls it to get the UI, then compares the result with last time and updates the DOM where needed. It calls it again only when that component\'s state changes or its parent re-renders. Changing a plain variable does nothing.',
        walkthrough: [
          {
            text: 'This never updates on screen, because nothing tells React to render again.',
            code: `function Counter() {
  let count = 0
  return <button onClick={() => { count++ }}>{count}</button>
}`,
          },
          {
            text: 'State is how you tell React "something changed, render again".',
            code: `function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}`,
          },
          {
            text: 'Anything you can compute from props and state should be computed during render, not stored. The data-table challenge derives its rows this way.',
            code: `const total = items.reduce((s, i) => s + i.price, 0) // derived, not state`,
          },
        ],
        pitfalls: ['Storing derived values in state and syncing them with an effect. It adds lag and a second source of truth.'],
        checkpoint: 'A child component re-renders even though its own props did not change. What is the most likely reason?',
      },
      {
        title: 'State is a snapshot',
        summary: 'Inside one render, state is fixed. Use the function form of setState to build on the latest value.',
        concept:
          'When you call `setCount`, `count` in the current function does not change. It is a snapshot of that render. React schedules a new render with the new value. This explains why calling the setter twice with `count + 1` only adds one, and why the function form exists.',
        walkthrough: [
          {
            text: 'Both calls read the same snapshot value.',
            code: `function handleClick() {
  setCount(count + 1) // uses count = 0 → 1
  setCount(count + 1) // uses count = 0 → 1 again
}`,
          },
          {
            text: 'The function form receives the latest pending value, so updates chain.',
            code: `function handleClick() {
  setCount((c) => c + 1) // 0 → 1
  setCount((c) => c + 1) // 1 → 2
}`,
          },
          {
            text: 'Same rule for objects and arrays: build a new one from `prev`. This is why every challenge writes `setTodos((prev) => prev.map(...))`.',
            code: `setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))`,
          },
        ],
        checkpoint: 'Why does `setItems([...items, newItem])` inside a promise callback risk dropping items, while `setItems((prev) => [...prev, newItem])` does not?',
      },
      {
        title: 'Keys',
        summary: 'Keys let React match list items between renders. Use a stable id, not the array index.',
        concept:
          'When a list re-renders, React needs to know which new item corresponds to which old one, so it can move DOM nodes instead of rebuilding them and keep per-item state (like a text input\'s value) attached to the right row. Keys provide that identity. Index keys break as soon as items are inserted, removed or reordered.',
        walkthrough: [
          {
            text: 'Index keys: delete the first item and every remaining row is now "the item that used to be at index n-1". Any input text or open state shifts to the wrong row.',
            code: `{todos.map((t, i) => <TodoRow key={i} todo={t} />)}   // fragile`,
          },
          {
            text: 'Stable keys: React tracks each row by id across renders.',
            code: `{todos.map((t) => <TodoRow key={t.id} todo={t} />)}    // correct`,
          },
          {
            text: 'Keys must be unique among siblings, not globally. And changing a key on purpose is a legitimate trick to reset a component: the training page in this app does `<TrainingInner key={id} />` so navigating to a new module resets its state.',
          },
        ],
        pitfalls: ['Using the index as a key for a list that can change order or length.'],
        checkpoint: 'You render a list of inputs keyed by index. The user types in the first one, then deletes the first row. What does the user see, and why?',
      },
      {
        title: 'When to use an effect',
        summary: 'Effects are for talking to things outside React. If you can compute it, do not effect it.',
        concept:
          '`useEffect` runs after render and is for synchronising with the outside world: fetching, subscribing, timers, measuring the DOM. It is not for transforming data or responding to a user event; those belong in render or in the handler. Every effect that sets something up should return a cleanup that tears it down.',
        walkthrough: [
          {
            text: 'Good: an external subscription with cleanup.',
            code: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])`,
          },
          {
            text: 'Not needed: deriving a value. Compute it in render instead.',
            code: `// unnecessary effect
useEffect(() => { setFullName(first + ' ' + last) }, [first, last])

// just derive it
const fullName = first + ' ' + last`,
          },
          {
            text: 'Not needed: reacting to a click. Put the logic in the handler.',
            code: `// unnecessary: effect watching a flag set by a click
// better: do the work directly in onClick`,
          },
          {
            text: 'The dependency array lists everything from the component the effect reads. Leaving something out means the effect can run with stale values; that is the bug the infinite-scroll challenge avoids by listing `[hasMore, loading, loadNext]`.',
          },
        ],
        pitfalls: ['Using an effect to copy props into state, or to derive one state value from another.'],
        checkpoint: 'For each: fetching a user on mount, formatting a price for display, focusing an input after it appears, and filtering a list by a search term. Which need an effect?',
      },
    ],
  },
]

export function getGeneralTraining(id: string): GeneralTraining | undefined {
  return generalTraining.find((t) => t.id === id)
}
