const test           = require('ava')
const { Assertions } = require('ava/lib/assert.js')

const {
    Box,
    default: $default,
    $,
    box: $box,
} = require('..')

const identity = value => value

Object.assign(Assertions.prototype, {
    isBox (box, ...args) {
        this.assert(box instanceof Box)

        if (args.length) {
            const [want] = args
            const got = box.value()
            this.deepEqual(got, want)
        }
    },
})

test('exports', t => {
    t.is($box, $)
    t.is($default, $)
    t.is(typeof $, 'function')
    t.is(typeof Box, 'function')
    t.is(Box.name, 'Box')
})

test('factory', t => {
    t.isBox($(42), 42)
    t.is($(42, it => it + 1), 43)

    const counter = $(0, count => () => ++count)

    t.is(counter(), 1)
    t.is(counter(), 2)
    t.is(counter(), 3)
})

test('Box.of', t => {
    t.isBox(Box.of(42), 42)

    const array = ['foo', 'bar', 'baz', 'quux']
    const boxes = array.map(Box.of)

    for (let i = 0; i < array.length; ++i) {
        t.isBox(boxes[i], array[i])
    }
})

test('constructor', t => {
    t.isBox(new Box(42), 42)
})

test('map', t => {
    t.isBox($(42).map(it => it + 1), 43)
    t.isBox($(42).map(identity), 42)
})

test('tap', t => {
    const seen = []
    t.isBox($(42).tap(it => seen.push(it)), 42)
    t.deepEqual(seen, [42])
})

test('then', t => {
    t.is($(42).then(it => it + 1), 43)
    t.is($(42).then(identity), 42)
})

test('value', t => {
    const seen = []

    t.is($(42).value(), 42)
    t.deepEqual(seen, [])

    t.is($(42).value(it => seen.push(it)), 42)
    t.deepEqual(seen, [42])
})
