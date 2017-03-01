export function extend<T>(a: T[], b: T[]) {
    a.push.apply(a, b);
}

