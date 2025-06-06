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

function v2DistSquared(a, b) {
    return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
}

//https://stackoverflow.com/a/37580979
function* permute(permutation) {
    var length = permutation.length,
        c = Array(length).fill(0),
        i = 1, k, p;

    yield permutation.slice();
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            yield permutation.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function convertLeadingSpacesToTabs(input) {
    const spacesPerTab = 4
    return input
        .split('\n')
        .map(line => {
            const leadingSpaces = line.match(/^ +/);
            if (leadingSpaces) {
                const numSpaces = leadingSpaces[0].length;
                const numTabs = Math.floor(numSpaces / spacesPerTab);
                const remainderSpaces = numSpaces % spacesPerTab;
                const newIndent = '\t'.repeat(numTabs) + ' '.repeat(remainderSpaces);
                return newIndent + line.slice(numSpaces);
            }
            return line;
        })
        .join('\n');
}

//https://stackoverflow.com/a/47593316
function splitmix32(a) {
    return function () {
        a |= 0;
        a = a + 0x9e3779b9 | 0;
        let t = a ^ a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) /*/ 4294967296;*/ //dont want floats, want ints
    }
}
function splitmix32f(a) { // ok but here i want floats
    const rand = splitmix32(a)
    return function () {
        return rand() / 4294967296
    }
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

//https://stackoverflow.com/a/51506718
function wrapText(str, width) {
    return str.replace(
        new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'), '$1\n'
    )
}

//https://stackoverflow.com/a/12646864
function shuffleArray(array, seed) {
    const rand = splitmix32f(cyrb128(seed))

    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array
}

//gpt
function rayRectIntersection(x, y, w, h) {
    if (x === 0 && y === 0) {
        return undefined; // Edge case: origin itself
    }

    const halfW = w / 2;
    const halfH = h / 2;

    const tx = (x !== 0) ? halfW / Math.abs(x) : Infinity;
    const ty = (y !== 0) ? halfH / Math.abs(y) : Infinity;

    const t = Math.min(tx, ty);

    return [x * t, y * t]
}

//https://stackoverflow.com/a/44134328
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}