//TODO: make this not break with non-square boards because i mixed up row and col somewhere
function setupFlowFree(width, height, starts, nodeID, winFunc) {
    const container = document.getElementById(nodeID);
    container.innerHTML += `
    <p>${"#".repeat(width * 3 + 2)}</p>
    <div class="flex-table-holder-holder">
        <p>${"#<br>".repeat(height * 3)}
        </p>
        <div class="flex-table-holder flowFree"></div>
        <p>${"#<br>".repeat(height * 3)}
        </p>
    </div>
    <p>${"#".repeat(width * 3 + 2)}</p>`
    const ftss = container.querySelectorAll(".flex-table-holder");
    const flowFree = ftss[ftss.length - 1]; //add to the last one found bcs that's the one you just created

    let currentPath = undefined

    let cells = []

    const paths = []
    for (let i = 0; i < starts.length; i++) {
        paths.push([]);
    }

    function getCurrentPath(cell) {
        for (const [i, startPair] of starts.entries()) {
            if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
                || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
                return i
            }
        }

        for (const [i, path] of paths.entries()) {
            for (let pathCell of path) {
                if (pathCell[0] == cell[0] && pathCell[1] == cell[1]) {
                    return i
                }
            }
        }
        return undefined
    }

    function trimPath(cell) {
        //account for the fact you can break a path and start from the other side
        let pathFound = undefined
        let startUsed = undefined
        outer: for (const [i, startPair] of starts.entries()) {
            for (const [j, start] of startPair.entries()) {
                if (v2Eq(start, cell)) {
                    pathFound = i
                    startUsed = j
                    break outer
                }
            }
        }
        if (pathFound !== undefined
            && paths[pathFound].length != 0
            && !v2Eq(paths[pathFound][0], starts[pathFound][startUsed])
            && v2MDist(paths[pathFound].slice(-1)[0], cell) > 1) {
            paths[pathFound].length = 0
        } else {
            //trim the path normally
            for (const path of paths) {
                for (const [j, pathCell] of path.entries()) {
                    if (pathCell[0] == cell[0] && pathCell[1] == cell[1]) {
                        path.length = j
                    }
                }
            }
        }
    }

    function render() {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                for (let i = 0; i < starts.length; i++) {
                    cells[col][row].notEmojiDiv.classList.remove(`c${i}`);
                    cells[col][row].notEmojiDiv.innerText = ""
                }
            }
        }

        for (const [i, path] of paths.entries()) {
            for (const [j, pathCell] of path.entries()) {
                cells[pathCell[1]][pathCell[0]].notEmojiDiv.classList.add(`c${i}`);
                let text = undefined
                if (path.length == 1) {
                    text = '';
                } else {
                    if (j == 0) {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[j + 1], pathCell)])];
                    } else if (j < path.length - 1) {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[j + 1], pathCell), v2Sub(path[j - 1], pathCell)])];
                    } else {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[j - 1], pathCell)])];
                    }
                }
                cells[pathCell[1]][pathCell[0]].notEmojiDiv.innerText = text
            }
        }
    }

    function isEnd(cell) {
        const possibleStart1 = starts[currentPath][0];
        const possibleStart2 = starts[currentPath][1];
        const thisStart = paths[currentPath][0];
        return !v2Eq(cell, thisStart) && (v2Eq(cell, possibleStart1) || v2Eq(cell, possibleStart2));
    }

    function won() {
        for (const startPair of starts) {
            checkStart: for (const start of startPair) {
                for (const path of paths) {
                    if (path.length == 0) {
                        continue;
                    }
                    if (v2Eq(start, path[0]) || v2Eq(start, path.slice(-1)[0])) {
                        continue checkStart;
                    }
                }
                return false;
            }
        }
        return true;
    }
    let wonAlready = false

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    for (let row = 0; row < height; row++) {
        const tr = document.createElement("tr");
        cells.push([]);
        for (let col = 0; col < width; col++) {
            const cell = [col, row];
            const td = document.createElement("td");
            td.classList.add(`cb${(row + col) % 2}`);

            const div = document.createElement("div");
            div.classList.add("not-emoji");
            td.appendChild(div);

            let emojiDiv = undefined
            for (const [i, startPair] of starts.entries()) {
                if (v2Eq(startPair[0], cell) || v2Eq(startPair[1], cell)) {
                    emojiDiv = document.createElement("div");
                    emojiDiv.classList.add("emoji");
                    emojiDiv.classList.add(`c${i}`);
                    emojiDiv.innerText = v2Eq(startPair[0], cell) ? "◆" : "◉"
                    td.appendChild(emojiDiv);
                    break;
                }
            }

            td.addEventListener("mouseover", event => {
                if (currentPath === undefined) {
                    return;
                }
                if (paths[currentPath].length >= 1 && isEnd(paths[currentPath].slice(-1)[0]) && getCurrentPath(cell) != currentPath) { //past the end
                    return;
                }
                let isDiffStart = false;
                for (const [i, startPair] of starts.entries()) {
                    if (currentPath == i) {
                        continue;
                    }
                    if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
                        || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
                        isDiffStart = true
                    }
                }
                const isRightPos = paths[currentPath].length == 0
                    || Math.abs(paths[currentPath].slice(-1)[0][0] - cell[0]) + Math.abs(paths[currentPath].slice(-1)[0][1] - cell[1]) == 1
                const isOnSamePath = getCurrentPath(cell) == currentPath
                if (isDiffStart || (!isRightPos && !isOnSamePath)) {
                    return
                }
                trimPath(cell)
                paths[currentPath].push(cell);
                render();
                if (!wonAlready && won()) {
                    wonAlready = true
                    winFunc()
                }
            })
            td.addEventListener("mousedown", event => {
                currentPath = getCurrentPath(cell);
                if (currentPath === undefined) {
                    return;
                }
                trimPath(cell)
                paths[currentPath].push(cell);
                render();
                if (!wonAlready && won()) {
                    wonAlready = true
                    winFunc()
                }
            })
            td.addEventListener("mouseup", event => {
                currentPath = undefined;
            })

            tr.appendChild(td);
            cells[row].push({ td: td, emojiDiv: emojiDiv, notEmojiDiv: div });
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    flowFree.appendChild(table);
}

function setupAllFlowFrees() {
    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree1",
        () => show("flowFreeWin1"))

    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree2",
        () => show("flowFreeWin2"))

    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree3",
        () => show("flowFreeWin3"))

    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree4",
        () => show("flowFreeWin4"))
    
    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree5",
        () => show("flowFreeWin5"))
    
    setupFlowFree(7, 7,
        [[[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]]],
        "flowFree6",
        () => show("flowFreeWin6"))
}

document.addEventListener("DOMContentLoaded", setupAllFlowFrees);