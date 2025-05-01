let onloads = []
window.onload = function () {
    onloads.forEach(fn => fn())
};

function isSubset(subset, superset, compareFn) {
    outer: for (const a of subset) {
        for (const b of superset) {
            if (compareFn(a, b)) {
                continue outer;
            }
        }
        return false;
    }
    return true;
}

function setupNetWalk() {
    const rotate = {
        "🗄️": "🗄️",
        "🖥️": "🖥️",

        "─": "│",
        "│": "─",

        "┌": "┐",
        "┐": "┘",
        "┘": "└",
        "└": "┌",

        "├": "┬",
        "┬": "┤",
        "┤": "┴",
        "┴": "├",

        "╶": "╷",
        "╷": "╴",
        "╴": "╵",
        "╵": "╶",
    };

    const connections = {
        "─": [[-1, 0], [1, 0]], // left + right
        "│": [[0, -1], [0, 1]], // up + down

        "┌": [[1, 0], [0, 1]],    // right + down
        "┐": [[-1, 0], [0, 1]],   // left + down
        "┘": [[-1, 0], [0, -1]],  // left + up
        "└": [[1, 0], [0, -1]],   // right + up

        "├": [[1, 0], [0, -1], [0, 1]],   // right + up + down
        "┬": [[-1, 0], [1, 0], [0, 1]],   // left + right + down
        "┤": [[-1, 0], [0, -1], [0, 1]],  // left + up + down
        "┴": [[-1, 0], [1, 0], [0, -1]],  // left + right + up

        "╶": [[1, 0]],    // connects to right
        "╷": [[0, 1]],    // connects down
        "╴": [[-1, 0]],   // connects to left
        "╵": [[0, -1]],   // connects up
    };

    const board = [
        ["🖥️╶", "🖥️╶", "🖥️╵", "├", "🖥️╴"],
        ["│", "┌", "├", "┐", "🖥️╵"],
        ["└", "🗄️┤", "├", "🖥️╷", "─"],
        ["🖥️╶", "┐", "│", "─", "┬"],
        ["┌", "─", "─", "─", "└"]
    ];

    const height = board.length;
    const width = board[0].length;

    const serverPos = (() => {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (board[row][col].indexOf("🗄️") != -1) {
                    return [col, row];
                }
            }
        }
    })();

    const computerPositions = (() => {
        let poses = []
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                if (board[row][col].indexOf("🖥️") != -1) {
                    poses.push([col, row]);
                }
            }
        }
        return poses;
    })();

    let cells = []
    function showConnections() {
        cells.forEach(row => row.forEach(cell => {
            cell.querySelector(".not-emoji").classList.add("gray");
            cell.querySelector(".not-emoji").classList.remove("blue");
        }));

        function neighbors_(pos, node) {
            const directions = connections[node.querySelector(".not-emoji").innerText];
            const neighbors = [];
            for (const dir of directions) {
                const newPos = [pos[0] + dir[0], pos[1] + dir[1]];
                if (newPos[0] >= 0 && newPos[0] < width && newPos[1] >= 0 && newPos[1] < height) {
                    neighbors.push(newPos);
                }
            }
            return neighbors
        }

        let seen = []
        let queue = [serverPos];
        outer: while (queue.length > 0) {
            pos = queue.shift();
            for (const seenPos of seen) {
                if (seenPos[0] == pos[0] && seenPos[1] == pos[1]) {
                    continue outer;
                }
            }
            seen.push(pos)
            const node = cells[pos[1]][pos[0]];
            node.querySelector(".not-emoji").classList.add("blue");
            node.querySelector(".not-emoji").classList.remove("gray");
            for (const neighbor of neighbors_(pos, node)) {
                const neighborNode = cells[neighbor[1]][neighbor[0]];
                const secondNeighbors = neighbors_(neighbor, neighborNode);
                for (const secondNeighbor of secondNeighbors) {
                    if (pos[0] == secondNeighbor[0] && pos[1] == secondNeighbor[1]) {
                        queue.push(neighbor);
                    }
                }
            }
        }

        return isSubset(computerPositions, seen, (a, b) => a[0] == b[0] && a[1] == b[1])
    }

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    for (let row = 0; row < height; row++) {
        const tr = document.createElement("tr");
        cells.push([]);

        for (let col = 0; col < width; col++) {
            const td = document.createElement("td");
            const cellText = board[row][col];
            if (cellText.indexOf("🖥️") != -1 || cellText.indexOf("🗄️") != -1) {
                const emoji = cellText.slice(0, -1)
                const otherChar = cellText.slice(-1)

                const emojiDiv = document.createElement("div");
                emojiDiv.classList.add("emoji");
                emojiDiv.innerText = emoji;

                const otherCharDiv = document.createElement("div");
                otherCharDiv.classList.add("not-emoji");
                otherCharDiv.innerText = otherChar;

                td.appendChild(emojiDiv);
                td.appendChild(otherCharDiv);
            } else {
                const div = document.createElement("div");
                div.classList.add("not-emoji");
                div.innerText = cellText;

                td.appendChild(div);
            }
            td.addEventListener("click", event => {
                const notEmoji = event.currentTarget.querySelector(".not-emoji");
                notEmoji.innerText = rotate[notEmoji.innerText];
                console.log(showConnections())
            })

            tr.appendChild(td);
            cells[row].push(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    document.getElementById("NetWalk").appendChild(table);
    showConnections()
}
onloads.push(setupNetWalk)