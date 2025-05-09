function makeFlowFreeGame(width, height, starts) {
    let paths = []
    for (const _ of starts) {
        paths.push([])
    }

    let held = false
    let oldPaths = []
    clearOldPaths()
    let currentPathI = undefined

    function clearOldPaths() {
        oldPaths.length = 0
        for (const _ of starts) {
            oldPaths.push([])
        }
    }

    function populatePaths(from, to, exclude) {
        for (const [i, path] of from.entries()) {
            if (exclude === i) {
                continue
            }
            to[i] = path.slice()
        }
    }

    function getPath(pos) {
        for (const [i, path] of paths.entries()) {
            for (const pPos of path) {
                if (v2Eq(pPos, pos)) {
                    return i
                }
            }
        }
        return undefined
    }

    function getIInPath(pos, pathI) {
        for (const [i, pPos] of paths[pathI].entries()) {
            if (v2Eq(pPos, pos)) {
                return i
            }
        }
        return undefined
    }

    function getStart(pos) {
        for (const [i, start] of starts.entries()) {
            for (const sPos of start) {
                if (v2Eq(sPos, pos)) {
                    return i
                }
            }
        }
        return undefined
    }

    function isCompletedPath(pathI) {
        return pathI !== undefined && paths[pathI].length > 1
            && getStart(paths[pathI].slice(-1)[0]) !== undefined
    }

    function trimPaths(pos, exclude) {
        for (const [i, path] of paths.entries()) {
            if (i === exclude) {
                continue
            }
            for (const [j, pPos] of path.entries()) {
                if (v2Eq(pPos, pos)) {
                    path.length = j
                }
            }
        }
    }

    function checkWin() {
        for (const start of starts) {
            nextSPos: for (const sPos of start) {
                for (const path of paths) {
                    for (const pPos of path) {
                        if (v2Eq(sPos, pPos)) {
                            continue nextSPos
                        }
                    }
                }
                return false
            }
        }
        return true
    }

    function click(pos) {
        const start = getStart(pos)
        const pathI = getPath(pos)
        if (start === undefined && pathI === undefined) {
            return;
        }
        if (start !== undefined && paths[start].length !== 0
            && v2MDist(paths[start].slice(-1)[0], pos) !== 1) {
            paths[start].length = 0
        } else if (isCompletedPath(pathI)) {
            const iInPath = getIInPath(pos, pathI);
            if (paths[pathI].length - 1 - iInPath < iInPath) {
                paths[pathI].reverse()
            }
        }
        held = true;
        populatePaths(paths, oldPaths)
    }

    function release() {
        held = false;
        clearOldPaths()
        currentPathI = undefined
    }

    function hoverOver(pos) {
        inner: {
            if (!held) {
                break inner
            }
            if (pos[0] < 0 || pos[1] < 0 || pos[0] >= width || pos[1] >= height) {
                break inner
            }

            const cursorStartI = getStart(pos);

            let cursorPathI = cursorStartI
            if (cursorPathI === undefined) {
                cursorPathI = getPath(pos);
            }

            if (currentPathI !== undefined
                && (currentPathI !== cursorPathI
                    || (cursorStartI !== undefined && !v2Eq(paths[cursorStartI][0], pos)))
                && v2MDist(paths[currentPathI].slice(-1)[0], pos) !== 1) {
                break inner
            }

            if (isCompletedPath(currentPathI) && currentPathI !== cursorPathI) {
                break inner
            }

            if (currentPathI === undefined) {
                currentPathI = cursorPathI
            }

            if (cursorStartI !== undefined && cursorStartI !== currentPathI) {
                break inner
            }

            populatePaths(oldPaths, paths, currentPathI)
            trimPaths(pos)
            for (const pPos of paths[currentPathI]) {
                trimPaths(pPos, currentPathI)
            }
            paths[currentPathI].push(pos)
        }
        return { paths: paths, win: checkWin() };
    }

    return {
        click: click,
        release: release,
        hoverOver: hoverOver
    }
}

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

    let game = makeFlowFreeGame(width, height, starts)
    let alreadyWon = false

    let cells = []
    function render(paths) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for(let i = 0; i < starts.length; i++) {
                    cells[x][y].notEmojiDiv.classList.remove(`c${i}`)
                }
                cells[x][y].notEmojiDiv.innerText = ""
            }
        }

        for (const [i, path] of paths.entries()) {
            for (const [j, pathCell] of path.entries()) {
                const cell = cells[pathCell[1]][pathCell[0]];
                cell.notEmojiDiv.classList.add(`c${i}`);
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
                cell.notEmojiDiv.innerText = text
            }
        }
    }

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    for (let y = 0; y < height; y++) {
        const tr = document.createElement("tr");
        cells.push([]);
        for (let x = 0; x < width; x++) {
            const cell = [x, y];
            const td = document.createElement("td");
            td.classList.add(`cb${(x + y) % 2}`);

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

            td.addEventListener("mousedown", event => {
                game.click(cell)
                const state = game.hoverOver(cell)
                if (state.win && !alreadyWon) {
                    alreadyWon = true
                    winFunc()
                }
                render(state.paths)
            })
            td.addEventListener("mouseup", event => {
                game.release(cell)
            })
            td.addEventListener("mouseover", event => {
                const state = game.hoverOver(cell)
                if (state.win && !alreadyWon) {
                    alreadyWon = true
                    winFunc()
                }
                render(state.paths)
            })

            tr.appendChild(td);
            cells[y].push({ td: td, emojiDiv: emojiDiv, notEmojiDiv: div });
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
        [[[0, 0], [1, 5]],
        [[3, 1], [2, 5]],
        [[0, 2], [3, 4]],
        [[5, 1], [3, 3]],
        [[1, 0], [5, 5]],
        [[5, 2], [6, 5]]],
        "flowFree2",
        () => show("flowFreeWin2"))

    // setupFlowFree(7, 7,
    //     [[[3, 2], [3, 6]],
    //     [[0, 3], [5, 5]],
    //     [[1, 5], [6, 0]],
    //     [[0, 0], [1, 3]],
    //     [[1, 1], [5, 2]]],
    //     "flowFree3",
    //     () => show("flowFreeWin3"))
    setupFlowFree(7, 7,
        [[[3, 2], [0, 5]],
        [[0, 1], [5, 5]],
        [[0, 0], [2, 4]],
        [[0, 6], [6, 0]]],
        "flowFree3",
        () => show("flowFreeWin3"))

    setupFlowFree(10, 10,
        [[[2, 0], [9, 9]],
        [[0, 6], [5, 6]],
        [[2, 2], [2, 9]],
        [[1, 0], [1, 9]],
        [[1, 8], [8, 2]],
        [[3, 2], [7, 2]]],
        "flowFree4",
        () => show("flowFreeWin4"))

    setupFlowFree(10, 10,
        [[[3, 2], [7, 1]],
        [[5, 0], [1, 5]],
        [[1, 8], [8, 8]],
        [[8, 1], [0, 8]],
        [[7, 3], [6, 6]],
        [[0, 7], [7, 7]],
        [[0, 0], [9, 6]],
        [[4, 7], [5, 4]]],
        "flowFree5",
        () => show("flowFreeWin5"))

    setupFlowFree(10, 10,
        [[[0, 0], [9, 9]],
        [[2, 1], [3, 6]],
        [[0, 1], [7, 8]],
        [[2, 6], [8, 1]],
        [[4, 4], [8, 4]],
        [[6, 8], [8, 9]],
        [[2, 7], [5, 3]]],
        "flowFree6",
        () => {
            show("flowFreeWin6");
            hide('flowFreeBailMedium')
        })
}

document.addEventListener("DOMContentLoaded", setupAllFlowFrees);