// function openFlowFree() {
//     const flowfree = document.getElementById("flowFreeContainer");

//     if (flowfree.style.display === "none") {
//         flowfree.style.display = "inline";
//     } else {
//         flowfree.style.display = "none";
//     }
// }

function setupManualTSP(width, height, winFunc) {
    let cells = []

    function isEnd(cell) {
        const possibleStart1 = starts[currentPath][0];
        const possibleStart2 = starts[currentPath][1];
        const thisStart = paths[currentPath][0];
        return !v2Eq(cell, thisStart) && (v2Eq(cell, possibleStart1) || v2Eq(cell, possibleStart2));
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

            // let emojiDiv = undefined
            // for (const [i, startPair] of starts.entries()) {
            //     if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
            //         || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
            //         emojiDiv = document.createElement("div");
            //         emojiDiv.classList.add("emoji");
            //         emojiDiv.classList.add(`c${i}`);
            //         emojiDiv.innerText = "⬤"
            //         td.appendChild(emojiDiv);
            //         break;
            //     }
            // }

            // td.addEventListener("mouseover", event => {
            //     if (currentPath === undefined) {
            //         return;
            //     }
            //     if (paths[currentPath].length >= 1 && isEnd(paths[currentPath].slice(-1)[0]) && getCurrentPath(cell) != currentPath) { //past the end
            //         return;
            //     }
            //     let isDiffStart = false;
            //     for (const [i, startPair] of starts.entries()) {
            //         if (currentPath == i) {
            //             continue;
            //         }
            //         if ((startPair[0][0] == cell[0] && startPair[0][1] == cell[1])
            //             || (startPair[1][0] == cell[0] && startPair[1][1] == cell[1])) {
            //             isDiffStart = true
            //         }
            //     }
            //     const isRightPos = paths[currentPath].length == 0
            //         || Math.abs(paths[currentPath].slice(-1)[0][0] - cell[0]) + Math.abs(paths[currentPath].slice(-1)[0][1] - cell[1]) == 1
            //     const isOnSamePath = getCurrentPath(cell) == currentPath
            //     if (isDiffStart || (!isRightPos && !isOnSamePath)) {
            //         return
            //     }
            //     trimPath(cell)
            //     paths[currentPath].push(cell);
            //     render();
            //     if (!wonAlready && won()) {
            //         wonAlready = true
            //         winFunc()
            //     }
            // })
            // td.addEventListener("mouseout", event => {
            // })
            // td.addEventListener("mousedown", event => {
            //     currentPath = getCurrentPath(cell);
            //     if (currentPath === undefined) {
            //         return;
            //     }
            //     trimPath(cell)
            //     paths[currentPath].push(cell);
            //     render();
            //     if (!wonAlready && won()) {
            //         wonAlready = true
            //         winFunc()
            //     }
            // })
            // td.addEventListener("mouseup", event => {
            //     currentPath = undefined;
            // })

            tr.appendChild(td);
            cells[row].push(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    document.getElementById("FlowFree").appendChild(table);
}

document.addEventListener("DOMContentLoaded", () => setupManualTSP(7, 7,
    [[[0, 1], [4, 0]],
    [[6, 1], [6, 6]],
    [[0, 3], [4, 1]],
    [[0, 5], [2, 2]],
    [[4, 6], [5, 4]],
    [[1, 5], [4, 2]],
    [[0, 6], [6, 0]]],
    () => console.log("win flow free")));