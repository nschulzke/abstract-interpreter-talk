import Interval from "interval-arithmetic";

type Interval = typeof Interval;

export type TinyValue = boolean | number | undefined;

export type AbstractTinyValue =
    | AbstractNumber
    | AbstractBoolean
    | undefined;

export class AbstractNumber {
    private readonly interval: Interval

    constructor(interval: Interval = Interval(-Infinity, Infinity)) {
        this.interval = interval;
    }

    add(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.add(this.interval, other.interval));
    }

    sub(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.sub(this.interval, other.interval));
    }

    mul(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.mul(this.interval, other.interval));
    }

    div(other: AbstractNumber): AbstractNumber {
        return new AbstractNumber(Interval.div(this.interval, other.interval));
    }

    lessThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessThan(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterThan(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThan(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterThan(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessThan(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    lessThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.lessThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.greaterThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    greaterThanOrEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.greaterThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else if (Interval.lessThanOrEqual(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    equal(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this.interval, other.interval)) {
            return new AbstractBoolean([false]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    notEqual(other: AbstractNumber): AbstractBoolean {
        if (Interval.intervalsOverlap(this.interval, other.interval)) {
            return new AbstractBoolean([true]);
        } else {
            return new AbstractBoolean([true, false]);
        }
    }

    toString() {
        return `[${this.interval.lo},${this.interval.hi}]`;
    }
}

export class AbstractBoolean {
    private readonly values: Set<boolean>;

    constructor(values: boolean[] = [true, false]) {
        this.values = new Set(values);
    }

    and(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this.values.has(false) || other.values.has(false)) {
            newValues.push(false);
        }
        if (this.values.has(true) && other.values.has(true)) {
            newValues.push(true);
        }
        return new AbstractBoolean(newValues);
    }

    or(other: AbstractBoolean): AbstractBoolean {
        const newValues: boolean[] = [];
        if (this.values.has(true) || other.values.has(true)) {
            newValues.push(true);
        }
        if (this.values.has(false) && other.values.has(false)) {
            newValues.push(false);
        }
        return new AbstractBoolean(newValues);
    }

    toString() {
        return this.values.has(true) && this.values.has(false) ? "{true,false}" : this.values.has(true) ? "{true}" : "{false}";
    }
}
