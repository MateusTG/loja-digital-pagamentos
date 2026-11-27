

function centsToReais(cents: number): number {
    return cents / 100;
}

function reaisToCents(reais: number): number {
    return Math.round(reais*100)
}
export { centsToReais, reaisToCents}