export function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

export function iteritems<T>(a: { [key: number]: T }, f: (key: string, value: T) => any) {
    for (let key of Object.keys(a)) {
        var value = a[key];
        f(key, value);
    }

}

