function makeFlowFreeGame(width, height, starts, onWin) {
    let paths = []
    for (const _ of starts) {
        paths.push([])
    }

    let held = false
    let oldPaths = []
    let currentPathI = undefined

    function populatePaths(from, to, excludes) {
        to.length = 0
        for (const [i, path] of from.entries()) {
            if (excludes !== undefined && excludes.includes(i)) {
                continue
            }
            to.push(path.slice())
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

    function trimPath(pos) {
        for (const [i, path] of paths.entries()) {
            for (const [j, pPos] of path) {
                if (v2Eq(pPos, pos)) {
                    path.length = j
                    console.log(path.length)
                    return
                }
            }
        }
    }

    function makeBoardState() {
        let board = []
        for (let x = 0; x < width; x++) {
            board.push([])
            for (let y = 0; y < height; y++) {
                board[x].push(undefined)
            }
        }
        for (const [i, path] of paths.entries()) {
            for (const pPos of path) {
                board[pPos[0]][pPos[1]] = i
            }
        }
        return board
    }

    function click(pos) {
        if (getStart(pos) === undefined && getPath(pos) === undefined) {
            return;
        }
        held = true;
        populatePaths(paths, oldPaths)
    }

    function release() {
        held = false;
        oldPaths.length = 0
    }

    function hoverOver(pos) {
        (() => {
            if (!held) {
                return
            }
            if (pos[0] < 0 || pos[1] < 0 || pos[0] >= width || pos[1] >= height) {
                return
            }
            if (currentPathI !== undefined 
                && paths[currentPathI].length > 0
                && v2MDist(paths[currentPathI].slice(-1)[0], pos) !== 1) {
                return
            }

            if(currentPathI === undefined) {
                currentPathI = getStart(pos);
            }

            trimPath(pos)
            paths[currentPathI].push(pos)
        })()
        return paths;
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

    let game = makeFlowFreeGame(width, height, starts, undefined)

    let cells = []
    function render(paths) {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                cells[x][y].notEmojiDiv.setAttribute('class', '')
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
                const paths = game.hoverOver(cell)
                render(paths)
            })
            td.addEventListener("mouseup", event => {
                game.release(cell)
            })
            td.addEventListener("mouseover", event => {
                const paths = game.hoverOver(cell)
                render(paths)
            })

            tr.appendChild(td);
            cells[y].push({ td: td, emojiDiv: emojiDiv, notEmojiDiv: div });
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    flowFree.appendChild(table);
}

//TODO: make this not break with non-square boards because i mixed up row and col somewhere
// function setupFlowFree(width, height, starts, nodeID, winFunc) {
//     const container = document.getElementById(nodeID);
//     container.innerHTML += `
//     <p>${"#".repeat(width * 3 + 2)}</p>
//     <div class="flex-table-holder-holder">
//         <p>${"#<br>".repeat(height * 3)}
//         </p>
//         <div class="flex-table-holder flowFree"></div>
//         <p>${"#<br>".repeat(height * 3)}
//         </p>
//     </div>
//     <p>${"#".repeat(width * 3 + 2)}</p>`
//     const ftss = container.querySelectorAll(".flex-table-holder");
//     const flowFree = ftss[ftss.length - 1]; //add to the last one found bcs that's the one you just created

//     let currentPath = undefined

//     let cells = []

//     const paths = []
//     for (let i = 0; i < starts.length; i++) {
//         paths.push([]);
//     }

//     function getCurrentPath(cell) {
//         for (const [i, startPair] of starts.entries()) {
//             if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
//                 || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
//                 return i
//             }
//         }

//         for (const [i, path] of paths.entries()) {
//             for (let pathCell of path) {
//                 if (pathCell[0] == cell[0] && pathCell[1] == cell[1]) {
//                     return i
//                 }
//             }
//         }
//         return undefined
//     }

//     function trimPath(cell) {
//         //account for the fact you can break a path and start from the other side
//         let pathFound = undefined
//         let startUsed = undefined
//         outer: for (const [i, startPair] of starts.entries()) {
//             for (const [j, start] of startPair.entries()) {
//                 if (v2Eq(start, cell)) {
//                     pathFound = i
//                     startUsed = j
//                     break outer
//                 }
//             }
//         }
//         if (pathFound !== undefined
//             && paths[pathFound].length != 0
//             && !v2Eq(paths[pathFound][0], starts[pathFound][startUsed])
//             && v2MDist(paths[pathFound].slice(-1)[0], cell) > 1) {
//             paths[pathFound].length = 0
//         } else {
//             //trim the path normally
//             for (const path of paths) {
//                 for (const [j, pathCell] of path.entries()) {
//                     if (pathCell[0] == cell[0] && pathCell[1] == cell[1]) {
//                         path.length = j
//                     }
//                 }
//             }
//         }
//     }

//     function render() {
//         for (let row = 0; row < height; row++) {
//             for (let col = 0; col < width; col++) {
//                 for (let i = 0; i < starts.length; i++) {
//                     cells[col][row].notEmojiDiv.classList.remove(`c${i}`);
//                     cells[col][row].notEmojiDiv.innerText = ""
//                 }
//             }
//         }

//         for (const [i, path] of paths.entries()) {
//             for (const [j, pathCell] of path.entries()) {
//                 cells[pathCell[1]][pathCell[0]].notEmojiDiv.classList.add(`c${i}`);
//                 let text = undefined
//                 if (path.length == 1) {
//                     text = '';
//                 } else {
//                     if (j == 0) {
//                         text = connectionsBackwards[JSON.stringify([v2Sub(path[j + 1], pathCell)])];
//                     } else if (j < path.length - 1) {
//                         text = connectionsBackwards[JSON.stringify([v2Sub(path[j + 1], pathCell), v2Sub(path[j - 1], pathCell)])];
//                     } else {
//                         text = connectionsBackwards[JSON.stringify([v2Sub(path[j - 1], pathCell)])];
//                     }
//                 }
//                 cells[pathCell[1]][pathCell[0]].notEmojiDiv.innerText = text
//             }
//         }
//     }

//     function isEnd(cell) {
//         const possibleStart1 = starts[currentPath][0];
//         const possibleStart2 = starts[currentPath][1];
//         const thisStart = paths[currentPath][0];
//         return !v2Eq(cell, thisStart) && (v2Eq(cell, possibleStart1) || v2Eq(cell, possibleStart2));
//     }

//     function won() {
//         for (const startPair of starts) {
//             checkStart: for (const start of startPair) {
//                 for (const path of paths) {
//                     if (path.length == 0) {
//                         continue;
//                     }
//                     if (v2Eq(start, path[0]) || v2Eq(start, path.slice(-1)[0])) {
//                         continue checkStart;
//                     }
//                 }
//                 return false;
//             }
//         }
//         return true;
//     }
//     let wonAlready = false

//     const table = document.createElement("table");
//     const tbody = document.createElement("tbody");
//     for (let row = 0; row < height; row++) {
//         const tr = document.createElement("tr");
//         cells.push([]);
//         for (let col = 0; col < width; col++) {
//             const cell = [col, row];
//             const td = document.createElement("td");
//             td.classList.add(`cb${(row + col) % 2}`);

//             const div = document.createElement("div");
//             div.classList.add("not-emoji");
//             td.appendChild(div);

//             let emojiDiv = undefined
//             for (const [i, startPair] of starts.entries()) {
//                 if (v2Eq(startPair[0], cell) || v2Eq(startPair[1], cell)) {
//                     emojiDiv = document.createElement("div");
//                     emojiDiv.classList.add("emoji");
//                     emojiDiv.classList.add(`c${i}`);
//                     emojiDiv.innerText = v2Eq(startPair[0], cell) ? "◆" : "◉"
//                     td.appendChild(emojiDiv);
//                     break;
//                 }
//             }

//             td.addEventListener("mouseover", event => {
//                 if (currentPath === undefined) {
//                     return;
//                 }
//                 if (paths[currentPath].length >= 1 && isEnd(paths[currentPath].slice(-1)[0]) && getCurrentPath(cell) != currentPath) { //past the end
//                     return;
//                 }
//                 let isDiffStart = false;
//                 for (const [i, startPair] of starts.entries()) {
//                     if (currentPath == i) {
//                         continue;
//                     }
//                     if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
//                         || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
//                         isDiffStart = true
//                     }
//                 }
//                 const isRightPos = paths[currentPath].length == 0
//                     || Math.abs(paths[currentPath].slice(-1)[0][0] - cell[0]) + Math.abs(paths[currentPath].slice(-1)[0][1] - cell[1]) == 1
//                 const isOnSamePath = getCurrentPath(cell) == currentPath
//                 if (isDiffStart || (!isRightPos && !isOnSamePath)) {
//                     return
//                 }
//                 trimPath(cell)
//                 paths[currentPath].push(cell);
//                 render();
//                 if (!wonAlready && won()) {
//                     wonAlready = true
//                     winFunc()
//                 }
//             })
//             td.addEventListener("mousedown", event => {
//                 currentPath = getCurrentPath(cell);
//                 if (currentPath === undefined) {
//                     return;
//                 }
//                 trimPath(cell)
//                 paths[currentPath].push(cell);
//                 render();
//                 if (!wonAlready && won()) {
//                     wonAlready = true
//                     winFunc()
//                 }
//             })
//             td.addEventListener("mouseup", event => {
//                 currentPath = undefined;
//             })

//             tr.appendChild(td);
//             cells[row].push({ td: td, emojiDiv: emojiDiv, notEmojiDiv: div });
//         }

//         tbody.appendChild(tr);
//     }

//     table.appendChild(tbody);
//     flowFree.appendChild(table);
// }

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

    setupFlowFree(7, 7,
        [[[3, 2], [3, 6]],
        [[0, 3], [5, 5]],
        [[1, 5], [6, 0]],
        [[0, 0], [1, 3]],
        [[1, 1], [5, 2]]],
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
        () => show("flowFreeWin6"))
}

document.addEventListener("DOMContentLoaded", setupAllFlowFrees);