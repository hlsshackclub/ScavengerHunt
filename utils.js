function v2Eq(a, b) {
    return a[0] == b[0] && a[1] == b[1]
}

function v2Add(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
}

function v2Sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]]
}

function v2MDist(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}