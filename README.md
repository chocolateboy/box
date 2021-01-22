# box

[![Build Status](https://github.com/chocolateboy/box/workflows/test/badge.svg)](https://github.com/chocolateboy/box/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/@chocolatey/box.svg)](https://www.npmjs.org/package/@chocolatey/box)

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
import $ from '@chocolatey/box'

$(42)                    // Box<42>
$(42).value()            // 42
$(42).map(it => it + 1)  // Box<43>
$(42).tap(console.log)   // Box<42>
$(42).then(it => it + 1) // 43
$(42, it => it + 1)      // 43

// "*.tar.gz" -> "*.gz"
const untar = name => $(name)
    .map(it => it.split('.'))
    .tap(it => it.splice(1, 1))
    .then(it => it.join('.'))
```

# DESCRIPTION

Box puts a value in a container which exposes a minimal set of methods to
facilitate piping the value through a series of functions.

It provides a lightweight implementation of the [box pattern][], which allows
the right-to-left flow of function composition to be declared with the
left-to-right syntax of method chaining familiar from jQuery, Lodash, promises
etc.

<!-- TOC:ignore -->
## compose

```javascript
import R from 'ramda'

const fn1 = value => baz(bar(foo(value)))
const fn2 = R.compose(baz, bar, foo)
```

<!-- TOC:ignore -->
## box

```javascript
import $ from '@chocolatey/box

const fn = value => $(value).map(foo).map(bar).then(baz)
```

## Why?

Because:

> composition and dot chaining are the same, and dot chaining is more ergonomic
> in JavaScript

— [Brian Lonsdorf](https://frontendmasters.com/courses/hardcore-js-v2/composition-is-dot-chaining/)

## Why not?

If you're using Babel, pipelines can be written natively with features such as
the (smart) [pipeline operator][], [do expressions][] and [partial application][],
e.g.:

```javascript
const untar = name =>
    name.split('.')
        |> tap(it => it.splice(1, 1))
        |> #.join('.')
```

If you're already using Lodash/Underscore or similar, you can use their
built-in methods to implement pipelines, e.g.:

```javascript
import _ from 'lodash'

const untar = name =>
    _(name)
        .split('.')
        .tap(it => it.splice(1, 1))
        .join('.')
```

# EXPORTS

## default

- **Type**:
  - `<T, R>(value: T, fn: (value: T) => R): R`
  - `<T>(value: T): Box<T>`
- **Alias**: `$`, `box`

```javascript
import $ from '@chocolatey/box'

const box = $(42)                // Box<42>
const succ = $(42, it => it + 1) // 43
```

The default export is a function which either takes a value and puts it in a
box or takes a value and a function and applies the function to the value.

The latter provides a convenient shorthand for passing a parameter to an IIFE,
e.g.:

<!-- TOC:ignore -->
### imperative

```javascript
const counter = () => {
    let count = 0
    return () => ++count
}

counter() // 1
counter() // 2
counter() // 3
```

<!-- TOC:ignore -->
### IIFE

```javascript
const counter = (function (count) { return () => ++count })(0)
```

<!-- TOC:ignore -->
### Box

```javascript
const counter = $(0, count => () => ++count)
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
import { Box } from '@chocolatey/box'

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

Takes a function which transforms the value inside the box into a new value and
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
import $ from '@chocolatey/box'

$(42).then(it => it + 1) // 43
```

Returns the result of applying the supplied function to the value inside the box.

#### value

- **Type**: `(fn?: (value: T) => void): T`

```javascript
import $ from '@chocolatey/box'

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

0.0.2

# AUTHOR

[chocolateboy](mailto:chocolate@cpan.org)

# COPYRIGHT AND LICENSE

Copyright © 2021 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[arrow functions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
[box pattern]: https://github.com/MostlyAdequate/mostly-adequate-guide/blob/master/ch08.md
[comma operator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_Operator
[do expressions]: https://github.com/tc39/proposal-do-expressions
[jsDelivr]: https://cdn.jsdelivr.net/npm/@chocolatey/box@0.0.2/dist/index.umd.min.js
[partial application]: https://github.com/tc39/proposal-partial-application
[pipeline operator]: https://github.com/tc39/proposal-pipeline-operator
[unpkg]: https://unpkg.com/@chocolatey/box@0.0.2/dist/index.umd.min.js
