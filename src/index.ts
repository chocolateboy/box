interface Factory {
    <T, R>(value: T, fn: (value: T) => R): R;
    <T>(value: T): Box<T>;
}

export class Box<T> {
    static of <T>(value: T) {
        return new Box(value)
    }

    private readonly _value: T;

    constructor (value: T) {
        this._value = value
    }

    map <U>(fn: (value: T) => U) {
        return (this.constructor as typeof Box).of(fn(this._value))
    }

    tap (fn: (value: T) => void): this {
        return fn(this._value), this
    }

    then <U>(fn: (value: T) => U): U {
        return fn(this._value)
    }

    value (fn?: (value: T) => void): T {
        return fn && fn(this._value), this._value
    }
}

const factory: Factory = (value: any, fn?: any) => {
    return fn ? fn(value) : Box.of(value)
}

export { factory as box, factory as $ }
export default factory
