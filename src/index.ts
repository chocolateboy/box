export class Box<T> {
    ['constructor']!: typeof Box;

    static of <T>(value: T) {
        return new (this || Box)(value)
    }

    private readonly _value: T;

    constructor (value: T) {
        this._value = value
    }

    map <U>(fn: (value: T) => U) {
        return this.constructor.of(fn(this._value))
    }

    tap <U>(fn: (value: T) => U): this {
        return fn(this._value), this
    }

    then <U>(fn: (value: T) => U) {
        return fn(this._value)
    }

    value (fn?: (value: T) => void) {
        return fn && fn(this._value), this._value
    }
}

function factory <T, R>(value: T, fn: (value: T) => R): R
function factory <T>(value: T): Box<T>
function factory <T, R>(value: T, fn?: (value: T) => R) {
    return fn ? fn(value) : Box.of(value)
}

export { factory as box, factory as $ }
export default factory
