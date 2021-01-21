const test           = require('ava')
const { Assertions } = require('ava/lib/assert.js')

const {
    Box,
    default: $default,
    $,
    box: $box,
} = require('..')

const identity = value => value
const noop = () => {}

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
    const box = $(42)
    const box2 = box.map(JSON.stringify)

    t.not(box2, box)
    t.isBox(box2, '42')
    t.isBox(box.map(it => it + 1), 43)
    t.isBox(box.map(identity), 42)
})

test('tap', t => {
    const seen = []
    const box = $(42)
    const box2 = box.tap(noop)

    t.is(box2, box)
    t.isBox(box.tap(it => seen.push(it)), 42)
    t.deepEqual(seen, [42])
})

test('then', t => {
    const box = $(42)

    t.is(box.then(it => it + 1), 43)
    t.is(box.then(identity), 42)
    t.is(box.then(identity), box.value())
})

test('value', t => {
    const box = $(42)
    const seen = []

    t.is(box.value(), 42)
    t.deepEqual(seen, [])

    t.is(box.value(it => seen.push(it)), 42)
    t.deepEqual(seen, [42])
})
