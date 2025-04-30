var onloads = []
window.onload = function () {
    onloads.forEach(fn => fn())
};

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
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

    const board = [
        ["🖥️╶", "🖥️╶", "🖥️╵", "├", "🖥️╴"],
        ["│", "┌", "├", "┐", "🖥️╵"],
        ["└", "🗄️┤", "├", "🖥️╷", "─"],
        ["🖥️╶", "┐", "│", "─", "┬"],
        ["┌", "─", "─", "─", "└"]
    ];

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    var cells = []

    for (let row = 0; row < 5; row++) {
        const tr = document.createElement("tr");
        cells.push([]);

        for (let col = 0; col < 5; col++) {
            const td = document.createElement("td");
            const cellText = board[row][col];
            if(cellText.indexOf("🖥️") != -1 || cellText.indexOf("🗄️") != -1) {
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
            })

            tr.appendChild(td);
            cells[row].push(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    document.getElementById("NetWalk").appendChild(table);
}
onloads.push(setupNetWalk)