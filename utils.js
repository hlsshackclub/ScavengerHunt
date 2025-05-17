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