// Integer-safe helpers using BigInt

// ceil(num / den) for BigInt
export const divCeil = (num, den) => (num + den - 1n) / den;

// nearest integer (ties up)
export const divNearest = (num, den) => (num + den / 2n) / den;
