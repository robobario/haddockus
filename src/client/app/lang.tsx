export function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export function any_match<T>(a: { [key: string]: T }, f: (value: T) => boolean): boolean {
    for (let key of Object.keys(a)) {
        const value: T = a[key];
        if (f(value)) {
            return true;
        }
    }
    return false;
}

export function iteritems<T>(a: { [key: string]: T }, f: (key: string, value: T) => any) {
    for (let key of Object.keys(a)) {
        const value: T = a[key];
        f(key, value);
    }
}

export function map_uniq<T, S>(a: { [key: string]: T }, f: (key: string, value: T) => S) {
    let result: S[] = [];
    for (let key of Object.keys(a)) {
        const value: T = a[key];
        let s = f(key, value);
        if (result.indexOf(s) === -1) {
            result.push(s)
        }
    }
    return result;
}

export function flatmap<T, S>(a: { [key: string]: T }, f: (key: string, value: T) => S[]): S[] {
    let collector: S[] = [];
    for (let key of Object.keys(a)) {
        const value = a[key];
        extend(collector, f(key, value));
    }
    return collector;
}

