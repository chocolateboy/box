# box

[![Build Status](https://github.com/chocolateboy/box/workflows/test/badge.svg)](https://github.com/chocolateboy/box/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/@chocolateboy/box.svg)](https://www.npmjs.org/package/@chocolateboy/box)

<!-- TOC -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
  - [Why?](#why)
  - [Why not?](#why-not)
- [EXPORTS](#exports)
  - [default](#default)
  - [Box<T>](#box-class)
    - [Static Methods](#static-methods)
      - [constructor](#constructor)
      - [Box.of](#boxof)
    - [Instance Methods](#instance-methods)
      - [map](#map)
      - [tap](#tap)
      - [then](#then)
      - [value](#value)
- [DEVELOPMENT](#development)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

Box - put a value in a box

# FEATURES

- no dependencies
- &lt; 180 B minified + gzipped
- fully typed (TypeScript)
- CDN builds (UMD) - [jsDelivr][], [unpkg][]

# INSTALLATION

    $ npm install @chocolatey/box

# SYNOPSIS

```javascript
unraw('/user/repo/raw/master/README.md')
// => "/user/repo/master/README.md"
```

<!-- TOC:ignore -->
## before

```javascript
const unraw = path => {
    const steps = path.split('/')
    steps.splice(3, 1)
    return steps.join('/')
}
```

<!-- TOC:ignore -->
## after

```javascript
import $ from '@chocolatey/box'

const unraw = path => $(path.split('/'))
    .tap(steps => steps.splice(3, 1))
    .then(steps => steps.join('/'))
```

# DESCRIPTION

Box wraps a value in a container and provides some helper methods to facilitate
common operations on values in a boilerplate-free way.

## Why?

It's mainly useful to simplify and declutter code, replacing imperative
statements and declarations with a pipeline of transformations which more
clearly expresses the computation.

<!-- TOC:ignore -->
### Example

A common pattern that crops up when using ES6+ Maps is assigning and returning
an updated value. This is easy enough with plain objects, e.g.:

```javascript
const seen = {}
const updateStats = key => seen[key] = (seen[key] || 0) + 1
```

But the same operation is cluttered by boilerplate when working with Maps.

```javascript
const seen = new Map()

const updateStats = key => {
    const value = seen.get(key) || 0
    seen.set(key, value)
    return value
}
```

The extra steps are needed because `Map#set` returns the Map rather than the
value. This is sometimes useful, but here it's something we need to work
around. The additional housekeeping obscures the *what* (the update) and
foregrounds the *how* (the implementation).

<!-- TOC:ignore -->
### IIFE

We can simplify things and focus on the operation beneath the housekeeping by
spinning up a scope, e.g. an IIFE, in which to perform it, e.g.:

```javascript
const seen = new Map()

const updateStats = key => {
    return (function (value) {
        seen.set(key, ++value)
        return value
    })(seen.get(key) || 0)
}
```

With the help of the [comma operator][] and [arrow functions][], this could be
reduced to:

```javascript
const updateStats = key => (value => (seen.set(key, ++value), value))(seen.get(key) || 0)
```

The good news is that we've managed to remove the imperative boilerplate. The
bad news is that we've managed to replace it with functional boilerplate which
makes the underlying operation even *less* clear. At least with the imperative
version, the *order* is clear. Here we see the application of a function long
before we see what it's operating on, and the simple
left-to-right/top-to-bottom flow is reversed. This inversion becomes even more
awkward and inconvenient when there are more steps in a pipeline.

<!-- TOC:ignore -->
### Box

Box can simplify a case like this by spinning up a scope like the IIFE but
keeping the value in the scope (by default) so that we can operate on and
transform it with a chain of method calls in the standard style familiar from
jQuery, Lodash, promises etc.

```javascript
const updateStats = key => $(seen.get(key) || 0)
    .map(it => it + 1)
    .tap(it => seen.set(key, it))
    .value()
```

The [`value`](#value) method behaves like [`tap`](#tap) if a function is
supplied, so this can be shortened to:

```javascript
const updateStats = key => $(seen.get(key) || 0)
    .map(it => it + 1)
    .value(it => seen.set(key, it))
```

## Why not?

If you're using Babel, much of this decluttering can be done natively with
features such as the (smart) [pipeline operator][], [do expressions][] and
[partial application][], e.g.:

```javascript
const updateStats = key => (seen.get(key) || 0)
    |> # + 1
    |> tap(#, it => seen.set(key, it))
```

If you're already using Lodash/Underscore or similar, you can use their
built-in methods to implement pipelines, e.g.:

```javascript
import _ from 'lodash'

const updateStats = key => _(seen.get(key) || 0)
    .thru(it => it + 1)
    .tap(it => seen.set(key, it))
    .value()
```

Alternatively, a dedicated function or method could be used to fix inconvenient
APIs at the source, e.g. for the `Array#splice` example:

```javascript
import URI from 'urijs'

const unraw = path => URI(path).segment(2, '').toString()
```

# EXPORTS

## default

- **Type**:
  - `<T, R>(value: T, fn: (value: T) => R): R`
  - `<T>(value: T): Box<T>`
- **Alias**: `$`, `box`

```javascript
import $ from '@chocolatey/box'

const counter = $(0).then(count => () => ++count)

counter() // 1
counter() // 2
counter() // 3
```

The default export is a function which either takes a value and puts it in a
box or takes a value and a function and applies the function to the value.

The former is a shorthand for [`Box.of`](#boxof), while the latter is
equivalent to `Box.of(value).then(fn)`.

```javascript
import $ from '@chocolatey/box'

const box = $(42)                            // Box<42>
const counter = $(0, count => () => ++count) // () => number
```

<a name="box-class"></a>
## Box<T>

### Static Methods

#### constructor

- **Type**: `new <T>(value: T) => Box<T>`

```javascript
import { Box } from '@chocolatey/box'

const box = new Box(42) // Box<42>
```

Creates a new Box instance containing the supplied value.

#### Box.of

- **Type**: `<T>(value: T) => Box<T>`

```javascript
const box = Box.of(42)              // Box<42>
const boxes = [1, 2, 3].map(Box.of) // [Box<1>, Box<2>, Box<3>]
```

Returns a new [`Box`](#box-class) instance containing the supplied value.

The `of` method is polymorphic, i.e. calling `of` on a Box subclass returns an
instance of the subclass. It can also be called as a function, in which case
the constructor defaults to [`Box`](#box-class), i.e. the following are equivalent:

```javascript
const boxes1 = array.map(it => Box.of(it))
const boxes2 = array.map(Box.of)
```

### Instance Methods

#### map

- **Type**: `<U>(fn: (value: T) => U): Box<U>`

```javascript
import $ from '@chocolatey/box'

const box = $(42).map(it => it + 1) // Box<43>
```

Takes a function which transforms a value inside the box into a new value and
returns a new box containing the returned value.

#### tap

- **Type**: `<U>(fn: (value: T) => U): this`

```javascript
import $ from '@chocolatey/box'

$(42).tap(console.log) // Box<42>
```

Applies the supplied function to the value and returns the original box (the
invocant). Useful to insert side effects, logging etc into a pipeline without
changing the value.

#### then

- **Type**: `<U>(fn: (value: T) => U): U`

```javascript
$(42).then(it => it + 1) // 43
```

Returns the result of applying the supplied function to the value inside the box.

#### value

- **Type**: `(fn?: (value: T) => void): T`

```javascript
$(42).map(it => it + 1).value()            // 43
$(42).map(it => it + 1).value(console.log) // 43
```

Returns the value inside the box. If an optional function is supplied, it is
applied to the value before the value is returned. This is similar to
[`tap`](#tap), except the value is returned rather than the box.

```javascript
$(42).value()            // 42
$(42).value(console.log) // 42
```

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:doc - generate the README's TOC (table of contents)
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- rebuild - clean the target directory and recompile the library
- repl - launch a node REPL with the library loaded
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# SEE ALSO

<!-- TOC:ignore -->
## Libraries

- [fcf](https://github.com/GianlucaGuarini/fcf) - a functional alternative to control-flow statements such as `if`, `switch` and `while`

<!-- TOC:ignore -->
## Videos

- [Brian Lonsdorf - Create linear data flow with container style types (Box)](https://egghead.io/lessons/javascript-linear-data-flow-with-container-style-types-box)
- [Brian Lonsdorf - Oh Composable World!](https://www.youtube.com/watch?v=SfWR3dKnFIo)

# VERSION

0.0.1

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2021 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[arrow functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
[comma operator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_Operator
[do expressions]: https://github.com/tc39/proposal-do-expressions
[jsDelivr]: https://cdn.jsdelivr.net/npm/@chocolatey/box
[partial application]: https://github.com/tc39/proposal-partial-application
[pipeline operator]: https://github.com/tc39/proposal-pipeline-operator
[unpkg]: https://unpkg.com/@chocolatey/box
