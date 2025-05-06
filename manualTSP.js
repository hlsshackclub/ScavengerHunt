function setupManualTSP(width, height, computerPositions, serverIndex, winFunc, showStatusFunc) {
    let cells = []
    const minLength = (() => {
        let minLen = Infinity; //upper bound
        let computerPositionsPermutable = computerPositions.slice();
        for (const perm of permute(computerPositionsPermutable)) {
            let length = 0;
            for (let i = 0; i < perm.length; i++) {
                const cellA = perm[i]
                const cellB = perm[(i + 1) % perm.length]
                length += v2MDist(cellA, cellB)
            }
            minLen = Math.min(minLen, length)
        }
        return minLen
    })();
    console.log(minLength)

    let oldCell = undefined
    let held = false
    let path = []

    function trimPath(cell) {
        for (const [i, pathCell] of path.entries()) {
            if (v2Eq(cell, pathCell)) {
                path.length = i;
                return;
            }
        }
    }

    function render() {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                cells[row][col].notEmojiDiv.innerText = ""
            }
        }

        for (const pos of computerPositions) {
            const cl = cells[pos[1]][pos[0]].td.classList
            cl.add('infected')
            cl.remove('disinfected')
        }

        for (const [i, pathCell] of path.entries()) {
            cells[pathCell[1]][pathCell[0]].notEmojiDiv.classList.add(`c${i}`);
            for (const pos of computerPositions) {
                if (v2Eq(pos, pathCell)) {
                    const cl = cells[pathCell[1]][pathCell[0]].td.classList
                    cl.add('disinfected')
                    cl.remove('infected')
                    break;
                }
            }
            let text = undefined
            if (path.length == 1) {
                text = '⬝';
            } else {
                if (i == 0) {
                    if (path.length >= 4 && v2MDist(path[0], path.slice(-1)[0]) === 1) {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path.slice(-1)[0], pathCell), v2Sub(path[i + 1], pathCell)])];
                    } else {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[i + 1], pathCell)])];
                    }
                } else if (i < path.length - 1) {
                    text = connectionsBackwards[JSON.stringify([v2Sub(path[i + 1], pathCell), v2Sub(path[i - 1], pathCell)])];
                } else {
                    if (path.length >= 4 && v2MDist(path[0], path.slice(-1)[0]) === 1) {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[0], pathCell), v2Sub(path[i - 1], pathCell)])];
                    } else {
                        text = connectionsBackwards[JSON.stringify([v2Sub(path[i - 1], pathCell)])];
                    }
                }
            }
            cells[pathCell[1]][pathCell[0]].notEmojiDiv.innerText = text
        }
    }

    let wonAlready = false
    function showStatusAndCheckWin() {
        let allComputersHit = true;
        outer: for (let cPos of computerPositions) {
            for (let pathCell of path) {
                if (v2Eq(pathCell, cPos)) {
                    continue outer;
                }
            }
            allComputersHit = false;
            break;
        }
        const loops = path.length >= 4 && v2MDist(path[0], path.slice(-1)[0]) === 1;

        let good = false;
        let status = '';
        let length = Math.max(0, path.length - 1);
        if (loops) {
            length += 1;
        }
        if (!allComputersHit) {
            status = 'Path misses some computers'
        } else if (!loops) {
            status = "Path doesn't loop back!"
        } else if (length > minLength) {
            status = 'Path is suboptimal.'
        } else {
            status = 'Optimal path found!'
            good = true;
            if (!wonAlready) {
                showStatusFunc(length, status, good, wonAlready);
                wonAlready = true;
                winFunc(); //idk if this is the most intuitive place to call this but whatever
                return; //jank flow :(
            }
        }
        showStatusFunc(length, status, good, wonAlready);
    }

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
            for (const [i, pos] of computerPositions.entries()) {
                if (v2Eq(cell, pos)) {
                    emojiDiv = document.createElement("div");
                    emojiDiv.classList.add("emoji");
                    if (i == serverIndex) {
                        emojiDiv.innerText = "🗄️"
                    } else {
                        emojiDiv.innerText = "🖥️"
                    }
                    td.appendChild(emojiDiv);
                    break;
                }
            }

            td.addEventListener("mouseover", event => {
                if (oldCell !== undefined && v2MDist(oldCell, cell) === 2 && Math.abs(oldCell[0] - cell[0]) === 1) {
                    const cellReal = [oldCell[0], cell[1]]
                    trimPath(cellReal)
                    path.push(cellReal);
                }

                if (!held) {
                    return;
                }
                if (path.length >= 1 && v2MDist(path.slice(-1)[0], cell) != 1) {
                    return;
                }
                if (path.length >= 8 && v2Eq(path[0], cell)) { //so you can finish the loop
                    return;
                }

                trimPath(cell)
                path.push(cell);
                render();
                showStatusAndCheckWin();
                oldCell = cell
            })
            td.addEventListener("mousedown", event => {
                held = true;
                if (path.length == 1 && v2MDist(path.slice(-1)[0], cell) != 1) {
                    path.length = 0;
                } else {
                    trimPath(cell)
                }
                if (path.length > 1 && v2MDist(path.slice(-1)[0], cell) != 1) {
                    return;
                }
                path.push(cell);
                render();
            })
            td.addEventListener("dblclick", event => {
                path.length = 0;
                render();
                showStatusAndCheckWin();
            })
            td.addEventListener("mouseup", event => {
                held = false;
                oldCell = undefined;
            })

            tr.appendChild(td);
            cells[row].push({ td: td, notEmojiDiv: div, emojiDiv: emojiDiv });
        }

        tbody.appendChild(tr);
    }
    render()
    showStatusAndCheckWin();

    table.appendChild(tbody);
    document.getElementById("ManualTSP").appendChild(table);
}

document.addEventListener("DOMContentLoaded", () => setupManualTSP(25, 12,
    [[12, 11], [12, 0], [20, 2], [4, 3], [7, 5], [15, 5], [17, 9], [2, 10], [20, 10]], 0,
    () => console.log("win tsp"),
    (length, status, good, wonAlready) => {
        const TSPLen = document.getElementById("manualTSPLength");
        TSPLen.innerText = `Length: ${length}`;
        if (wonAlready) {
            return
        }
        const TSPStatus = document.getElementById("manualTSPStatus");
        TSPStatus.innerText = status;
        if (good) {
            TSPStatus.classList.remove("error");
            TSPStatus.classList.add("win");
        } else {
            TSPStatus.classList.add("error");
            TSPStatus.classList.remove("win");
        }
    }));