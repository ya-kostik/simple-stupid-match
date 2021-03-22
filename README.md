# Simple stupid matching library for JS
It uses for simple stupid pattern matching,
nice replacement for switch/case, if/else or mapping patterns.

# Examples
Runing specific callback, if user group in one of the states:
```js
import { match } from 'simple-stupid-match';

const matching = match([
 ['owner', addFullGrant],
 ['assistant', addPartialGrant],
 [/:guest$/i, addSmallGrant]
], () => {
  throw new Error('Nothing matched');
});

// ...

// Matching `user.group`, and pass `user` object into matched callback
// Then seting returned value of callback into result constant
const result = matching(user.group, user);
```

Creating reducer:
```js
const matching = match({
  ['bot/create'](state, action) {
    const bot = action.payload;
    return {
      ...state,
      bots: {
        ...state.bots,
        [bot.id]: bot
      }
    }
  },
  ['bot/remove'](state, action) {
    const id = action.payload;
    const nextState = { ...state };
    delete nextState[id];
    return nextState
  }
}, (state) => return state);

const reducer = (state, action) => matching(action.type, state, action);
// ...

const nextState = reducer(state, action);
```


# Usage

## Sneak peek
Import the `match` function:
```js
import { match } from 'simple-stupid-match';
```

Create a reusable pattern-matching function:
```js
const matching = match(patterns, onDefault);
```

Use it for find result or run specific functions:
```js
const result = matching(value, ...argumentsForCallbacks);
```


## Patterns
Patterns must be an object, an array of arrays or a Map instance

### When patterns is an object
Then key should be a string pattern,
and the function will compare the values using the `Object.is`.

Value should be a `callback` function or another value.
If it the `callback`, it will be called,
and `matching` function will return the result of callback.
If it another value, `matching` function will return this value.

Patterns as objects are a nice replacement for `mappings` patterns through the `object`.
```js
// We can replace:
const petWords = {
  'cow': 'Moo',
  'cat': 'Mew',
  'dog': 'Bark'
};

let result = petWords['cow']; // Moo
result = petWords['dog']; // Bark
result = petWords['slug']; // undefined

// With:
const matching = match({
  'cow': 'Moo',
  'cat': 'Mew',
  'dog': 'Bark'
}, 'Alien growl from abbys');

result = matching('cow'); // Moo
result = matching('dog'); // Bark
result = matching('slug'); // Alien growl from abbys
```

Or `switch/case`:
```js
// Lets replace:
const doSound = (animal) => {
  switch (animal) {
    case 'cow':
      return doMoo(animal);
    case 'cat':
      return doMew(animal);
    case 'dog':
      return doBark(animal);
    default:
      return doAnotherSound(animal);
  }
}

// With:
const doSound = match({
  cow: doMoo,
  cat: doMew,
  dog: doBark
}, doAnotherSound);
// where doMoo, doMew, doBark, doAnotherSound is functions

doSound('cow'); // calls doMoo with 'cow' as argument
doSound('cat'); // calls doMew with 'cat' as argument
doSound('slug'); // calls doAnotherSound with 'slug argument'
```

### When patterns is an instance of Map
Then matching becomes smarter.
With instance of Map, key should be:
- plain string, just like in object patterns;
- regular expression;
- boolean function, for complex patterns;
- any other value for comparing through `Object.is`.

```js
const matching = match(new Map([
  ['/robot/build', buildRobot,]
  ['/robot/run' runRobot],
  [/^\/robot\/custom\/.+?/,  processRobotCustom]
]), () => {
  throw new RobotHttpError(
    400, RobotHttpError.NO_ACTION_FOUND
  );
});

matching(req.path, req, res);
```

With boolean functions we can check complex patterns:
```js
const cast = match(new Map([
  [isString, castFromString],
  [isNumber, castFromNumber],
  [isObject, castFromObject]
]));

cast(42); // castFromNumber(42)
cast('answer'); // castFromString('answer')
cast({ answer: 42 }); // castFromObject({ answer: 42 })
cast(undefined); // nothing to do
```

### When patterns is an array of arrays
It's just shortcut for an instance of Map:
```js
// No need in `new Map`
const cast = match([
  [isString, castFromString],
  [isNumber, castFromNumber],
  [isObject, castFromObject]
]);
```


## Additional arguments for callback

There may be additional arguments in the `matching` function,
they will be delivered to the head arguments of `callback`.

```js
const updateAdmin = (group, user) => {
  // do something with group and user
}

const updatePlain = (group, user) => {
  // do something with group and user
}

const updateGroup = match({
  'admin': updateAdmin,
  'plain': updatePlain
});

updateGroup(user.group, groups.get(user.group), user);
```
↑ If `user.group` is `"admin"`,
`matcher` calls `updateAdmin` with three arguments in following order:
1. result of `groups.get(user.group)`
2. `user`
3. at last `user.group`

i. e. the first argument of `matching` function
always becomes the last argument of `callback` function.


# Install
It requires lodash

## Yarn
```sh
yarn add simple-stupid-match lodash
```

## NPM
```sh
npm install simple-stupid-match lodash
```
