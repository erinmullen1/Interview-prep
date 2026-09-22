import type { Question } from './content'

/**
 * General computer-science and web-fundamentals quizzes. These are not tied
 * to a challenge; they cover the background questions interviewers mix in
 * alongside the practical exercises.
 */
export interface GeneralTest {
  id: string
  title: string
  description: string
  questions: Question[]
}

export const GENERAL_CATEGORY = 'General Computer Science'

export const generalTests: GeneralTest[] = [
  {
    id: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Closures, `this`, equality, the event loop and other language questions that come up in almost every frontend interview.',
    questions: [
      {
        prompt: 'What does this code log, and why?',
        code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}`,
        options: ['0, 1, 2', '3, 3, 3', '0, 0, 0', 'undefined three times'],
        answer: 1,
        explanation:
          '`var` is function-scoped, so all three callbacks share one `i`. By the time the timers run, the loop has finished and `i` is 3. Using `let` gives each iteration its own `i` and logs 0, 1, 2.',
      },
      {
        prompt: 'What is a closure?',
        options: [
          'A function that has finished running',
          'A function that remembers the variables from the scope where it was created, even after that scope has finished',
          'A way to make object properties private using the `#` prefix',
          'A block of code wrapped in curly braces',
        ],
        answer: 1,
        explanation:
          'Every function in JavaScript captures its surrounding variables. This is what lets a debounce helper remember its timer, or a counter function keep its count between calls.',
      },
      {
        prompt: 'What is the difference between `==` and `===`?',
        options: [
          'They are identical',
          '`==` converts the values to the same type before comparing; `===` compares without converting',
          '`===` only works on numbers',
          '`==` compares by reference and `===` compares by value',
        ],
        answer: 1,
        explanation:
          '`0 == ""` is true because both convert to a falsy value; `0 === ""` is false. Use `===` by default so comparisons do what they look like they do.',
      },
      {
        prompt: 'In what order does this log?',
        code: `console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')`,
        options: ['A, B, C, D', 'A, D, C, B', 'A, D, B, C', 'A, C, D, B'],
        answer: 1,
        explanation:
          'Synchronous code runs first (A, D). Then the event loop drains microtasks such as promise callbacks (C) before any macrotask such as a timer (B), even a zero-millisecond one.',
      },
      {
        prompt: 'What does `this` refer to inside an arrow function?',
        options: [
          'The global object',
          'The object the function is called on',
          'Whatever `this` was in the surrounding code where the arrow function was written',
          'Arrow functions cannot use `this`',
        ],
        answer: 2,
        explanation:
          'Arrow functions do not get their own `this`. They use the one from the enclosing scope. That is why they are convenient in callbacks inside class methods, and why they cannot be used as constructors.',
      },
      {
        prompt: 'What is the difference between `null` and `undefined`?',
        options: [
          'There is none; they are interchangeable',
          '`undefined` means a value was never assigned; `null` is an intentional "no value" set by the programmer',
          '`null` is a string and `undefined` is a number',
          '`undefined` is only used for functions',
        ],
        answer: 1,
        explanation:
          'A declared but unassigned variable, a missing property, or a function with no return gives `undefined`. `null` is something you set on purpose to mean "empty".',
      },
      {
        prompt: 'What is the difference between a shallow copy and a deep copy of an object?',
        options: [
          'A shallow copy is faster but is not a real copy',
          'A shallow copy duplicates the top level only; nested objects are still shared. A deep copy duplicates everything',
          'A deep copy only copies primitive values',
          'Shallow copies are read-only',
        ],
        answer: 1,
        explanation:
          'Spreading (`{ ...obj }`) is a shallow copy. If `obj.address` is an object, both copies point at the same address object. `structuredClone(obj)` makes a deep copy.',
      },
    ],
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Arrays, maps, sets, stacks, queues and trees, and which one to reach for.',
    questions: [
      {
        prompt: 'You need to check whether a value has already been seen, many times, over a large list. Which structure is best?',
        options: ['An array with `includes`', 'A `Set`', 'A sorted array with a loop', 'A string with `indexOf`'],
        answer: 1,
        explanation:
          '`Set.has` is a constant-time lookup on average. `Array.includes` scans the whole array each time, so checking every item against it becomes quadratic.',
      },
      {
        prompt: 'What is the main difference between a stack and a queue?',
        options: [
          'A stack stores numbers and a queue stores strings',
          'A stack removes the most recently added item first (LIFO); a queue removes the oldest item first (FIFO)',
          'A queue can only hold one item at a time',
          'There is no difference',
        ],
        answer: 1,
        explanation:
          'Undo history is a stack: the last thing you did is undone first. A print queue is a queue: first job in, first job out. The browser call stack is a stack; the task queue is a queue.',
      },
      {
        prompt: 'When would you use a `Map` instead of a plain object as a lookup table?',
        options: [
          'Never; objects are always better',
          'When keys are not strings, when you need insertion order guaranteed, or when you add and remove keys frequently',
          'Only when storing functions',
          'When you need JSON serialisation',
        ],
        answer: 1,
        explanation:
          'Objects coerce keys to strings and inherit properties from their prototype. Maps accept any key type, keep insertion order, and expose `size` directly. Objects are still fine for fixed, string-keyed records.',
      },
      {
        prompt: 'What is a linked list, and what is it good at compared with an array?',
        options: [
          'A list of URLs; it is good at navigation',
          'Nodes that each point to the next; inserting or removing in the middle is cheap, but reaching the nth item requires walking from the start',
          'An array that is sorted; it is good at searching',
          'A two-dimensional array',
        ],
        answer: 1,
        explanation:
          'Arrays give instant access by index but shift every later element on a middle insert. Linked lists do the opposite. In JavaScript you rarely need one, but the trade-off is a classic question.',
      },
      {
        prompt: 'The DOM is an example of which data structure?',
        options: ['A hash map', 'A tree', 'A linked list', 'A graph with cycles'],
        answer: 1,
        explanation:
          'Each element has one parent and any number of children, with a single root. Walking the DOM, finding ancestors, and event bubbling are all tree operations.',
      },
      {
        prompt: 'Which structure would you use to find the shortest path between two users in a social network?',
        options: ['A stack', 'A binary search tree', 'A graph, searched breadth-first', 'A sorted array'],
        answer: 2,
        explanation:
          'Friendships form a graph (many-to-many connections). Breadth-first search explores neighbours level by level, so the first time it reaches the target is via the fewest hops.',
      },
    ],
  },
  {
    id: 'algorithms-complexity',
    title: 'Algorithms & Big-O',
    description: 'Reasoning about how code scales, and the common algorithms interviewers expect you to recognise.',
    questions: [
      {
        prompt: 'What does Big-O notation describe?',
        options: [
          'The exact number of milliseconds a function takes',
          'How the time or memory a function needs grows as its input gets bigger',
          'The number of lines of code',
          'The number of bugs per function',
        ],
        answer: 1,
        explanation:
          'Big-O ignores constants and small inputs and asks: if the input doubles, roughly what happens to the work? O(n) doubles. O(n²) quadruples. O(log n) barely changes.',
      },
      {
        prompt: 'What is the time complexity of this function?',
        code: `function hasDuplicate(items) {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i] === items[j]) return true
    }
  }
  return false
}`,
        options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
        answer: 3,
        explanation:
          'Every item is compared with every later item. For n items that is roughly n²/2 comparisons, which Big-O writes as O(n²). Using a Set makes it O(n).',
      },
      {
        prompt: 'Binary search on a sorted array of one million items needs at most about how many steps?',
        options: ['1,000,000', '1,000', '20', '2'],
        answer: 2,
        explanation:
          'Each step halves the remaining range. 2^20 is about a million, so 20 halvings are enough. That is what O(log n) looks like in practice. It only works if the data is sorted.',
      },
      {
        prompt: 'What is the typical time complexity of a good general-purpose sort, such as the one behind `Array.prototype.sort`?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
        answer: 1,
        explanation:
          'Comparison-based sorts cannot do better than O(n log n) in general. Merge sort and the TimSort used by JavaScript engines achieve it. Bubble sort and insertion sort are O(n²).',
      },
      {
        prompt: 'What is recursion, and what must every recursive function have?',
        options: [
          'A loop that never ends; it must have a `break`',
          'A function that calls itself on a smaller problem; it must have a base case that stops the calls',
          'A function that runs in parallel; it must have a callback',
          'A function stored in an array; it must have an index',
        ],
        answer: 1,
        explanation:
          'Without a base case the calls never stop and the call stack overflows. Walking a tree (like the DOM) is the natural place for recursion in frontend work.',
      },
      {
        prompt: 'Memoisation is best described as:',
        options: [
          'Writing comments so you remember what code does',
          'Caching the result of a function for a given input so repeated calls with that input return instantly',
          'Splitting a function into smaller functions',
          'Running a function ahead of time at build',
        ],
        answer: 1,
        explanation:
          'It trades memory for time. React\'s `useMemo` is the same idea applied to a render calculation: skip the work if the inputs have not changed.',
      },
    ],
  },
  {
    id: 'browser-fundamentals',
    title: 'How the Browser Works',
    description: 'Rendering, the event loop, storage, and what happens between typing a URL and seeing a page.',
    questions: [
      {
        prompt: 'What is the critical rendering path, in order?',
        options: [
          'JavaScript, then CSS, then HTML',
          'Parse HTML into the DOM, parse CSS into the CSSOM, combine into a render tree, lay out positions, paint pixels',
          'Download images, then text, then styles',
          'Paint, then layout, then parse',
        ],
        answer: 1,
        explanation:
          'Browsers cannot paint until they know both structure (DOM) and style (CSSOM). That is why blocking CSS in the head delays the first paint and why layout-changing scripts can cause "jank".',
      },
      {
        prompt: 'Why does JavaScript need an event loop if it is single-threaded?',
        options: [
          'To run code on multiple CPU cores',
          'So the one thread can hand off slow work (timers, network, I/O) to the browser and pick up the results later, instead of freezing',
          'To compile code faster',
          'It does not; the event loop is a Node.js-only feature',
        ],
        answer: 1,
        explanation:
          'The call stack runs one thing at a time. The browser does the waiting elsewhere and queues a callback when done. The loop pushes queued callbacks onto the stack when it is empty.',
      },
      {
        prompt: 'What is the difference between a reflow (layout) and a repaint?',
        options: [
          'They are the same',
          'Reflow recalculates element positions and sizes; repaint redraws pixels without changing geometry. Reflow is more expensive',
          'Repaint happens first, then reflow',
          'Reflow only happens on page load',
        ],
        answer: 1,
        explanation:
          'Changing `width` or adding an element triggers reflow, which can cascade to the whole page. Changing `color` only repaints. Animating `transform` and `opacity` avoids both, which is why they are smooth.',
      },
      {
        prompt: 'Which statement about `localStorage` is correct?',
        options: [
          'It is sent to the server with every request',
          'It stores strings only, persists until cleared, and is shared by all tabs on the same origin',
          'It is cleared when the tab closes',
          'It can hold up to 1GB per site',
        ],
        answer: 1,
        explanation:
          '`sessionStorage` is the one that dies with the tab. Cookies are the ones sent with requests. `localStorage` is synchronous and usually capped around 5MB, so keep it for small preferences.',
      },
      {
        prompt: 'What is event delegation?',
        options: [
          'Assigning an event to a different user',
          'Attaching one listener to a parent element and using event bubbling to handle events from many children',
          'Delaying an event until the page has loaded',
          'Sending events to a web worker',
        ],
        answer: 1,
        explanation:
          'Because clicks bubble up from the target to its ancestors, one listener on a `<ul>` can handle clicks on any `<li>`, including ones added later. It saves memory and setup work.',
      },
      {
        prompt: 'What does `defer` do on a `<script>` tag?',
        options: [
          'Skips the script on slow connections',
          'Downloads the script in parallel with parsing and runs it after the HTML is fully parsed, in document order',
          'Runs the script before any HTML is parsed',
          'Loads the script only when the user scrolls to it',
        ],
        answer: 1,
        explanation:
          'A plain script blocks HTML parsing while it downloads and runs. `defer` removes the block and keeps ordering. `async` also removes the block but runs as soon as the download finishes, in any order.',
      },
    ],
  },
  {
    id: 'http-networking',
    title: 'HTTP & Networking',
    description: 'Methods, status codes, caching, CORS and what actually travels over the wire.',
    questions: [
      {
        prompt: 'Which HTTP method is idempotent, meaning repeating it has the same effect as doing it once?',
        options: ['POST', 'PUT', 'PATCH is always idempotent, PUT never is', 'None of them'],
        answer: 1,
        explanation:
          'PUT replaces a resource with the given state, so doing it twice leaves the same result. POST typically creates something new each time. GET and DELETE are also idempotent by definition.',
      },
      {
        prompt: 'What does a 401 status mean, and how is it different from 403?',
        options: [
          '401 means the page moved; 403 means it was deleted',
          '401 means you are not authenticated (not logged in); 403 means you are authenticated but not allowed',
          '401 is a server error; 403 is a client error',
          'They are interchangeable',
        ],
        answer: 1,
        explanation:
          '401 says "identify yourself". 403 says "I know who you are and the answer is no". 404 is "not found", 500 is "the server broke".',
      },
      {
        prompt: 'What is CORS?',
        options: [
          'A way to compress responses',
          'A browser security rule that blocks a page from reading responses from a different origin unless that server explicitly allows it via headers',
          'A server-side firewall',
          'A JavaScript library for making requests',
        ],
        answer: 1,
        explanation:
          'The browser enforces it, not the server. A request from app.example.com to api.other.com succeeds only if the response carries an `Access-Control-Allow-Origin` header permitting it. Tools like curl are unaffected.',
      },
      {
        prompt: 'What does the `Cache-Control: max-age=3600` header tell the browser?',
        options: [
          'Delete the file after one hour',
          'The response can be reused without asking the server again for the next 3600 seconds',
          'The server will change the file in an hour',
          'Only cache on Wi-Fi',
        ],
        answer: 1,
        explanation:
          'Combined with a content hash in the filename (as Vite does for built assets), you can set a very long max-age safely because a changed file gets a new URL.',
      },
      {
        prompt: 'What is the difference between HTTP/1.1 and HTTP/2 that most affects frontend performance?',
        options: [
          'HTTP/2 uses a different URL scheme',
          'HTTP/2 can send many requests and responses at once over a single connection, so bundling everything into one file matters less',
          'HTTP/2 does not support cookies',
          'HTTP/1.1 is faster on mobile',
        ],
        answer: 1,
        explanation:
          'HTTP/1.1 browsers opened a handful of connections and queued requests behind each other. HTTP/2 multiplexing removed that bottleneck, which changed advice on sprites and bundling.',
      },
      {
        prompt: 'What happens when you type a URL and press Enter, at a high level?',
        options: [
          'The browser downloads the whole website',
          'DNS resolves the name to an IP, a TCP (and TLS) connection is made, an HTTP request is sent, the response HTML is parsed and further resources are fetched',
          'The browser asks Google for the page',
          'The URL is sent to the operating system',
        ],
        answer: 1,
        explanation:
          'This is a classic open-ended question. Being able to name each stage, and mention where caching (DNS, HTTP) and rendering (DOM, CSSOM) fit, is what interviewers listen for.',
      },
    ],
  },
  {
    id: 'web-security',
    title: 'Web Security Basics',
    description: 'The handful of attack types every frontend developer is expected to recognise and defend against.',
    questions: [
      {
        prompt: 'What is cross-site scripting (XSS)?',
        options: [
          'Loading a script from a CDN',
          'An attacker getting their own JavaScript to run in other users\' browsers, usually by injecting it through unescaped user input',
          'Two websites sharing one script',
          'A CSS vulnerability',
        ],
        answer: 1,
        explanation:
          'If a comment containing `<script>` is inserted into the page as raw HTML, it runs for everyone who views it. React escapes text by default; the risk returns with `dangerouslySetInnerHTML` or building HTML strings by hand.',
      },
      {
        prompt: 'Which practice most directly prevents XSS?',
        options: [
          'Using HTTPS',
          'Escaping or sanitising any user-provided content before inserting it into the page, and using a Content Security Policy',
          'Minifying JavaScript',
          'Storing tokens in localStorage',
        ],
        answer: 1,
        explanation:
          'HTTPS protects data in transit but does nothing about malicious content the server willingly serves. Treat all user input as text, never as markup.',
      },
      {
        prompt: 'What is CSRF (cross-site request forgery)?',
        options: [
          'Forging a certificate',
          'A malicious site tricking a logged-in user\'s browser into sending a request to another site, riding on cookies the browser attaches automatically',
          'Guessing passwords',
          'Reading another site\'s localStorage',
        ],
        answer: 1,
        explanation:
          'Because cookies are sent automatically, a hidden form on evil.com can POST to bank.com as you. Defences: `SameSite` cookies, anti-CSRF tokens, and checking the `Origin` header.',
      },
      {
        prompt: 'Why is `HttpOnly` a useful cookie flag?',
        options: [
          'It makes the cookie work only over HTTP, not HTTPS',
          'JavaScript cannot read the cookie, so a successful XSS attack cannot steal it',
          'It compresses the cookie',
          'It makes the cookie expire on tab close',
        ],
        answer: 1,
        explanation:
          'Session tokens in `HttpOnly` cookies are safer than tokens in localStorage, which any injected script can read. Pair it with `Secure` (HTTPS only) and `SameSite`.',
      },
      {
        prompt: 'What does a Content Security Policy (CSP) do?',
        options: [
          'Encrypts page content',
          'Tells the browser which sources of scripts, styles and other resources the page is allowed to load, blocking everything else',
          'Compresses images',
          'Rate-limits API calls',
        ],
        answer: 1,
        explanation:
          'A strict CSP means that even if an attacker injects a `<script>` tag, the browser refuses to run it because its source is not allowed. It is a second line of defence behind escaping.',
      },
      {
        prompt: 'Where should a frontend app never put a secret such as an API key with write access?',
        options: [
          'In an environment variable on the server',
          'In client-side JavaScript, because anything shipped to the browser can be read by any user',
          'In a database',
          'In a server-side config file',
        ],
        answer: 1,
        explanation:
          'Bundlers like Vite only expose variables prefixed `VITE_` for exactly this reason: anything in the bundle is public. Keep privileged keys on a server and call it from the client.',
      },
    ],
  },
  {
    id: 'restful-apis',
    title: 'RESTful APIs',
    description: 'REST conventions, resource design, status codes in practice, and how a component should talk to an API.',
    questions: [
      {
        prompt: 'What does it mean for an API to be "RESTful"?',
        options: [
          'It uses XML instead of JSON',
          'It models the API as resources (nouns) manipulated with a fixed set of HTTP methods (verbs), addressed by URLs, and each request contains everything needed to handle it',
          'It requires a GraphQL schema',
          'It only supports GET requests',
        ],
        answer: 1,
        explanation:
          'REST (Representational State Transfer) is a style, not a protocol. The core ideas are: resources have URLs, HTTP methods express the action, requests are stateless (no server-side session between calls), and responses represent the resource\'s current state.',
      },
      {
        prompt: 'Which URL design best follows REST conventions for fetching a single order?',
        options: [
          '/getOrder?id=42',
          '/orders/42',
          '/api/order/fetch/42',
          '/order_fetch_by_id_42',
        ],
        answer: 1,
        explanation:
          'REST URLs name resources (nouns), not actions. `/orders/42` is "the order with id 42". `/getOrder?id=42` bakes the verb into the URL, which is what the HTTP method is already for.',
      },
      {
        prompt: 'A client POSTs a new order to `/orders`. What should a well-designed API return?',
        options: [
          '200 OK with an empty body',
          '201 Created, with the new resource (including its id) in the body and a Location header pointing at it',
          '204 No Content',
          '302 redirect to the homepage',
        ],
        answer: 1,
        explanation:
          '201 signals "a new resource was created". Returning the created object saves the client an extra GET, and it now has the server-assigned id to use for further requests.',
      },
      {
        prompt: 'What is the difference between PUT and PATCH on `/orders/42`?',
        options: [
          'They are identical in REST',
          'PUT replaces the entire order with the given representation; PATCH applies a partial update, changing only the fields sent',
          'PUT is for creating, PATCH is for deleting',
          'PATCH is idempotent and PUT is not',
        ],
        answer: 1,
        explanation:
          'Sending `{ status: "shipped" }` as a PUT would, strictly, wipe out every other field not included. PATCH is built for exactly this partial-update case. Both are idempotent: repeating either leaves the resource in the same state.',
      },
      {
        prompt: 'A component fetches `/orders/42` and the order does not exist. What should the API return, and how should the component treat it?',
        options: [
          '200 OK with `null` in the body; the component checks if the body is null',
          '404 Not Found; the component checks `response.ok` or the status before treating the response as an error',
          '500 Internal Server Error, because any lookup failure is a server problem',
          'The connection should be closed with no response',
        ],
        answer: 1,
        explanation:
          '404 is the correct, cacheable, standard way to say "no such resource". `fetch` does not throw for a 404, so the component must check `response.ok` (or `response.status`) itself before parsing the body as data.',
      },
      {
        prompt: 'Why is pagination usually implemented with query parameters rather than as part of the resource path?',
        options: [
          'Query parameters are faster to parse',
          'Pagination is a way of viewing a collection resource, not a different resource, so it belongs in `?page=2&limit=20` on `/orders`, not in the path',
          'The path can only contain one segment',
          'It is required by the HTTP specification',
        ],
        answer: 1,
        explanation:
          '`/orders?page=2&limit=20` is still "the orders collection", just filtered to one page. Putting page numbers in the path (`/orders/page/2`) implies they are separate resources, which they are not.',
      },
      {
        prompt: 'What is a practical downside of REST that GraphQL is often chosen to address?',
        options: [
          'REST cannot use HTTPS',
          'A screen that needs data from several related resources (a user, their orders, and each order\'s items) may need several REST requests or a custom endpoint, while GraphQL can fetch exactly that shape in one request',
          'REST APIs cannot return JSON',
          'REST does not support authentication',
        ],
        answer: 1,
        explanation:
          'This is "over-fetching and under-fetching": a REST resource returns a fixed shape, so a screen with unusual data needs often ends up calling multiple endpoints or getting more fields than it needs. It is a trade-off, not a flaw; REST\'s simplicity and cacheability are real advantages GraphQL gives up.',
      },
    ],
  },
  {
    id: 'react-fundamentals',
    title: 'React Fundamentals',
    description: 'Rendering, state, keys, effects and the mental model behind the hooks used throughout the challenges.',
    questions: [
      {
        prompt: 'Why does React need a `key` on each item in a list?',
        options: [
          'For CSS styling',
          'So React can tell which items were added, removed or reordered between renders, instead of guessing by position',
          'To sort the list',
          'Keys are optional and only silence a warning',
        ],
        answer: 1,
        explanation:
          'Using the array index as a key breaks when items are reordered or removed: React reuses the wrong DOM nodes and state (like input text) ends up on the wrong row. Use a stable id.',
      },
      {
        prompt: 'What causes a React component to re-render?',
        options: [
          'Only a page refresh',
          'Its state changing, its props changing, or its parent re-rendering',
          'Any variable inside it changing',
          'A timer React runs every second',
        ],
        answer: 1,
        explanation:
          'Plain variables changing do nothing; only `setState` (or a parent render) triggers a render. That is why derived values are computed during render rather than stored.',
      },
      {
        prompt: 'When should you use `useEffect`?',
        options: [
          'For every calculation in a component',
          'To synchronise with something outside React: a network request, a subscription, a timer, or the DOM',
          'To update state whenever props change',
          'Never; it is deprecated',
        ],
        answer: 1,
        explanation:
          'If a value can be computed from props and state, compute it during render. Effects are for side effects with the outside world, and they should clean up after themselves.',
      },
      {
        prompt: 'What is the difference between controlled and uncontrolled inputs?',
        options: [
          'Controlled inputs are disabled',
          'A controlled input\'s value lives in React state and is set via `value`; an uncontrolled input keeps its own value in the DOM and is read via a ref',
          'Uncontrolled inputs cannot have an onChange',
          'Controlled inputs are only for forms with validation',
        ],
        answer: 1,
        explanation:
          'Controlled inputs make validation and derived UI easy because React always knows the value. Uncontrolled inputs are simpler for one-off reads, like a file picker.',
      },
      {
        prompt: 'What problem does lifting state up solve?',
        options: [
          'Making state persist across page reloads',
          'Letting two sibling components share the same piece of state by moving it to their common parent',
          'Making state global',
          'Reducing the number of components',
        ],
        answer: 1,
        explanation:
          'Siblings cannot see each other\'s state. The parent owns it and passes the value and a setter down as props. Context or a store is the next step when the parent is far away.',
      },
      {
        prompt: 'Why is `setCount(count + 1)` called twice in one handler not the same as adding two?',
        code: `function handleClick() {
  setCount(count + 1)
  setCount(count + 1)
}`,
        options: [
          'It is; count increases by two',
          'Both calls read the same `count` from this render, so both set it to the same value. Use `setCount((c) => c + 1)` to chain updates',
          'The second call is ignored by React',
          'It throws an error',
        ],
        answer: 1,
        explanation:
          'State is a snapshot for the duration of a render. The functional form receives the latest pending value, which is why the challenges use it whenever new state depends on old state.',
      },
    ],
  },
]

export function getGeneralTest(id: string): GeneralTest | undefined {
  return generalTests.find((t) => t.id === id)
}
