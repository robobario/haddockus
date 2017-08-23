export function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export function iteritems<T>(a: { [key: number]: T }, f: (key: string, value: T) => any) {
    for (let key of Object.keys(a)) {
        const value = a[key];
        f(key, value);
    }
}

export function flatmap<T, S>(a: { [key: number]: T }, f: (key: string, value: T) => S[]): S[] {
    let collector: S[] = [];
    for (let key of Object.keys(a)) {
        const value = a[key];
        extend(collector, f(key, value));
    }
    return collector;
}

