function setupFlowFree() {
    let oldCell = undefined
    let clickStartCell = undefined

    let cells = []

    const width = 7;
    const height = 7;

    const paths = [
        [[0, 1], [4, 0]],
        [[6, 1], [6, 6]],
        [[0, 3], [4, 1]],
        [[0, 5], [2, 2]],
        [[4, 6], [5, 4]],
        [[1, 5], [4, 2]],
        [[0, 6], [6, 0]],
    ];

    const board = (() => {
        let b = []
        for(let row = 0; row < height; row++) {
            b.push([]);
            for(let col = 0; col < width; col++) {
                b[row].push("");
            }
        }

        for(let i = 0; i < paths.length; i++) {
            let poses = paths[i];
            b[poses[0][1]][poses[0][0]] = `${i}`;
            b[poses[1][1]][poses[1][0]] = `${i}`;
        }

        return b;
    })();

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    for (let row = 0; row < height; row++) {
        const tr = document.createElement("tr");
        cells.push([]);
        for (let col = 0; col < width; col++) {
            const td = document.createElement("td");
            td.classList.add(`cb${(row + col) % 2}`);
            const cellText = board[row][col];
            if (cellText !== '') {
                const emojiDiv = document.createElement("div");
                emojiDiv.classList.add("emoji");
                emojiDiv.innerText = '⬤';
                emojiDiv.classList.add(`c${cellText}`);

                const otherCharDiv = document.createElement("div");
                otherCharDiv.classList.add("not-emoji");

                td.appendChild(emojiDiv);
                td.appendChild(otherCharDiv);
            } else {
                const div = document.createElement("div");
                div.classList.add("not-emoji");

                td.appendChild(div);
            }
            td.addEventListener("mouseover", event => {                
                if(clickStartCell !== undefined) {
                    const cell = [col, row];
                    const oldCellNotEmoji = cells[oldCell[1]][oldCell[0]].querySelector(".not-emoji")

                    const d = [cell[0] - oldCell[0], cell[1] - oldCell[1]];
                    const minusD = [oldCell[0] - cell[0], oldCell[1] - cell[1]];
                    const newConnectorChar = connectionsBackwards[JSON.stringify([minusD])];
                    let oldConnectorChar = ''
                    if(oldCellNotEmoji.innerText !== '') {
                        oldConnectorChar = connectionsBackwards[JSON.stringify([d, connections[oldCellNotEmoji.innerText][0]])]
                    }
                    
                    oldCellNotEmoji.innerText = oldConnectorChar;

                    const notEmoji = event.currentTarget.querySelector(".not-emoji");
                    notEmoji.innerText = newConnectorChar;
                }
            })
            td.addEventListener("mouseout", event => { //TODO: this might not work consistently
                oldCell = [col, row];
            })
            td.addEventListener("mousedown", event => {
                clickStartCell = [col, row];
                // const notEmoji = event.currentTarget.querySelector(".not-emoji");
                // notEmoji.innerText = rotate[notEmoji.innerText];
            })
            td.addEventListener("mouseup", event => {
                clickStartCell = undefined
            })

            tr.appendChild(td);
            cells[row].push(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    document.getElementById("FlowFree").appendChild(table);
}

document.addEventListener("DOMContentLoaded", setupFlowFree);