function setupBoss() {
    const bossNetworkingScore = 1
    const bossManufacturingScore = 1
    const bossReconScore = 1
    const bossSecurityScore = 1
    // bossNetworkingScore = networkingScore
    // bossManufacturingScore = manufacturingScore
    // bossReconScore = reconScore
    // bossSecurityScore = securityScore

    const aspectRatio = 0.35838622129; // the visible aspect ratio width/height of a cell

    class Room {
        constructor(size, offset, hasRobot = false, hasComputer = false, visible = false) {
            this.connectingRooms = { north: undefined, east: undefined, south: undefined, west: undefined };
            this.size = size;
            this.offset = offset;
            this.fogged = false;
            this.hasRobot = hasRobot
            this.hasComputer = hasComputer
            this.hasDisabledComputer = false;
            this.visible = visible
        }
        setConnectingRoom(direction, room) {
            this.connectingRooms[direction] = room;
        }
    }

    function connectRooms(r1, r2, direction) {
        let room1 = rooms[r1]
        let room2 = rooms[r2]
        room1.setConnectingRoom(direction, room2);
        switch (direction) {
            case "north":
                room2.setConnectingRoom("south", room1);
                break;
            case "south":
                room2.setConnectingRoom("north", room1);
                break;
            case "east":
                room2.setConnectingRoom("west", room1);
                break;
            case "west":
                room2.setConnectingRoom("east", room1);
                break;
        }
    }

    let startRoom = new Room([7, 3], [42, 27], false, false, true);
    let rooms = [startRoom];

    let roomSizes = [
        [19, 7], [11, 3], [7, 5], [7, 3], [11, 3], [7, 7], [7, 5], [15, 3], [7, 3], [7, 3], [7, 5], [11, 3], [7, 5], [7, 7], [7, 3], [7, 3], [11, 3], [15, 3], [7, 3], [11, 3], [7, 3], [7, 5], [7, 3], [15, 3], [7, 7], [11, 3], [19, 7], [7, 5], [7, 3], [7, 5], [7, 5], [11, 3], [7, 3], [7, 7], [7, 7], [11, 3], [11, 3], [11, 3], [11, 3], [7, 5], [15, 3], [11, 3], [7, 5], [19, 7], [11, 3], [11, 5], [11, 3], [6, 3]
    ];

    //[x,y]
    let roomOffsets = [
        [6, 1], [38, 3], [30, 5], [58, 5], [46, 7], [10, 9], [62, 9], [22, 11], [42, 11], [70, 11], [50, 13], [18, 15], [70, 15], [38, 17], [78, 17], [14, 19], [54, 19], [22, 21], [66, 21], [82, 21], [54, 23], [26, 25], [90, 25], [10, 27], [34, 27], [50, 27], [66, 27], [86, 29], [6, 31], [50, 33], [10, 35], [38, 35], [90, 35], [30, 37], [58, 37], [78, 37], [18, 39], [66, 39], [11, 43], [2, 46], [34, 45], [50, 45], [62, 47], [10, 49], [42, 51], [30, 53], [54, 53], [4, 42]
    ];

    let computersRemaining = 4 - bossNetworkingScore
    const computerRooms = [1, 27, 44].slice(0, computersRemaining)

    for (let i = 0; i < roomOffsets.length; i++) {
        rooms[i + 1] = new Room(roomSizes[i], roomOffsets[i]);
    }

    const robotRooms = (() => {
        let rand = splitmix32f(cyrb128("boss"))
        let rRooms = []
        if (bossManufacturingScore === 1) {
            var probability = 0.5
        } else if (bossManufacturingScore === 2) {
            var probability = 0.3
        } else {
            var probability = 9 / rooms.length //get approximately 9 robots
        }
        for (let i = 1; i < rooms.length; i++) {
            const r = rand()
            if (r < probability && !computerRooms.includes(i)) {
                rRooms.push(i)
            }
        }
        return rRooms
    })()

    for (const i of robotRooms) {
        rooms[i].hasRobot = true
    }

    for (const i of computerRooms) {
        rooms[i].hasComputer = true
    }

    if (bossReconScore >= 2) {
        for (const room of rooms) {
            room.fogged = true
        }
    }

    {
        // ROOM CONNECTIONS (this took way too long)
        connectRooms(0, 25, "west"); connectRooms(0, 26, "east"); //start
        connectRooms(25, 22, "west"); connectRooms(25, 32, "south"); //room1
        connectRooms(22, 24, "west"); connectRooms(22, 18, "north"); //room2
        connectRooms(24, 29, "south"); //room3
        connectRooms(29, 31, "south"); //room4
        connectRooms(31, 37, "east"); //room5
        connectRooms(37, 39, "south"); connectRooms(37, 34, "east"); //room6
        connectRooms(39, 48, "west"); //room7
        connectRooms(40, 44, "east"); connectRooms(40, 48, "north"); //room8
        connectRooms(44, 46, "east"); //room9
        connectRooms(46, 45, "east"); //room10
        connectRooms(45, 47, "east"); //room11
        connectRooms(47, 43, "north"); //room12
        connectRooms(43, 42, "west"); //room13
        connectRooms(42, 35, "north"); connectRooms(42, 41, "west"); //room14
        connectRooms(35, 38, "east"); connectRooms(35, 30, "west"); //room15
        connectRooms(38, 36, "east"); //room 16
        connectRooms(36, 33, "east"); //room17
        connectRooms(33, 28, "north"); //room18
        connectRooms(28, 27, "west"); connectRooms(28, 23, "north"); //room19
        connectRooms(23, 20, "north"); //room21
        connectRooms(20, 15, "north"); //room22
        connectRooms(15, 13, "west"); //room23
        connectRooms(13, 10, "north"); connectRooms(13, 19, "south"); //room24
        connectRooms(10, 7, "west"); //room25
        connectRooms(7, 4, "north"); //room26
        connectRooms(4, 5, "west"); //room27
        connectRooms(5, 2, "north"); connectRooms(5, 9, "south"); //room28
        connectRooms(2, 3, "west"); //room29
        connectRooms(3, 8, "south"); //room30 
        connectRooms(8, 12, "south"); //room31
        connectRooms(12, 6, "west"); connectRooms(12, 16, "south"); //room32
        connectRooms(6, 1, "north"); //room33
        connectRooms(16, 18, "east"); //room35
        connectRooms(18, 14, "east"); //room36
        connectRooms(9, 11, "east"); //room38
        connectRooms(11, 17, "south"); //room39
        connectRooms(17, 19, "east"); connectRooms(17, 21, "south"); //room40
        connectRooms(21, 26, "south"); //room42
        connectRooms(30, 32, "west"); //room44  
        connectRooms(32, 34, "west"); //room45
        connectRooms(34, 41, "south"); //room46
    }

    let playerPos = [45, 28]
    const maxHealth = 10
    let playerHealth = 10
    const playerHealthEmojis = ["🪦", "😣", "😞", "😟", "😕", "😐", "🙂", "😊", "😃", "😄", "😁"]

    const minSteps = 282 //probably slightly inaccurate, but this is about the minimum number of steps
    let timeRemaining = 1
    const timeDecline = bossSecurityScore === 3 ? (1 / minSteps / 3) : //3x optimal allowed
        bossSecurityScore === 2 ? (1 / minSteps / 2) : //2x optimal allowed
            (1 / minSteps / 1.5) //1.5x optimal allowed

    const CellTypes = Object.freeze({
        OUTSIDE: "x",
        WALL: "X",
        INSIDE_VISIBLE: " ",
        INSIDE_INVISIBLE: "-",
        INSIDE_FOGGED: "F",
        CONNECTION: "+",
        CONNECTION_INVISIBLE: "*",
        PLAYER: "P",
        COMPUTER: "C",
        COMPUTER_DISABLED: "c",
        SERVER: "S",
        SERVER_DISABLED: "s",
        ROBOT: "R",
    });

    function getRoomCenter(room) {
        return [room.offset[0] + Math.floor(room.size[0] / 2), room.offset[1] + Math.floor(room.size[1] / 2)]
    }

    let cells = undefined
    function renderToCells() {
        let width = Math.max(...(rooms.map(room => room.offset[0] + room.size[0] + 1)))
        let height = Math.max(...(rooms.map(room => room.offset[1] + room.size[1] + 1)))
        cells = Array.from({ length: height }, () => Array(width).fill(CellTypes.OUTSIDE));
        for (const room of rooms) {
            //carve out room borders
            for (let i = room.offset[1] - 1; i < room.offset[1] + room.size[1] + 1; i++) {
                for (let j = room.offset[0] - 1; j < room.offset[0] + room.size[0] + 1; j++) {
                    cells[i][j] = CellTypes.WALL;
                }
            }
        }
        for (const room of rooms) {
            //carve out rooms
            for (let i = room.offset[1]; i < room.offset[1] + room.size[1]; i++) {
                for (let j = room.offset[0]; j < room.offset[0] + room.size[0]; j++) {
                    cells[i][j] = room.visible ? CellTypes.INSIDE_VISIBLE : room.fogged ? CellTypes.INSIDE_FOGGED : CellTypes.INSIDE_INVISIBLE;
                }
            }
        }
        for (const room of rooms) {
            //add computer and server chars
            if (room.hasComputer && room.visible) {
                const c = room.hasDisabledComputer ? CellTypes.COMPUTER_DISABLED : CellTypes.COMPUTER
                const s = room.hasDisabledComputer ? CellTypes.SERVER_DISABLED : CellTypes.SERVER
                let computerLoc = getRoomCenter(room)
                cells[computerLoc[1]][computerLoc[0]] = c;
                for (delta of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]) {
                    const serverLoc = v2Add(computerLoc, delta)
                    cells[serverLoc[1]][serverLoc[0]] = s;
                }
            }
        }
        for (const room of rooms) {
            //add robot chars
            if (room.hasRobot && room.visible) {
                const robotPos = room.offset
                cells[robotPos[1]][robotPos[0]] = CellTypes.ROBOT
            }
        }
        function setConType(list, y, x, cType) {
            if (list[y][x] !== CellTypes.CONNECTION) {
                list[y][x] = cType;
            }
        }
        for (const room of rooms) {
            //draw connections
            let conType = (room.visible || room.fogged) ? CellTypes.CONNECTION : CellTypes.CONNECTION_INVISIBLE;
            for (const [con, cRoom] of Object.entries(room.connectingRooms)) {
                if (cRoom) {
                    switch (con) {
                        case "south":
                            for (let i = Math.max(room.offset[0], cRoom.offset[0]); i < Math.min((room.offset[0] + room.size[0]), (cRoom.offset[0] + cRoom.size[0])); i++) {
                                setConType(cells, room.offset[1] + room.size[1], i, conType);
                            }
                            break;
                        case "north":
                            for (let i = Math.max(room.offset[0], cRoom.offset[0]); i < Math.min((room.offset[0] + room.size[0]), (cRoom.offset[0] + cRoom.size[0])); i++) {
                                setConType(cells, room.offset[1] - 1, i, conType);
                            }
                            break;
                        case "east":
                            for (let i = Math.max(room.offset[1], cRoom.offset[1]); i < Math.min((room.offset[1] + room.size[1]), (cRoom.offset[1] + cRoom.size[1])); i++) {
                                setConType(cells, i, room.offset[0] + room.size[0], conType);
                            }
                            break;
                        case "west":
                            for (let i = Math.max(room.offset[1], cRoom.offset[1]); i < Math.min((room.offset[1] + room.size[1]), (cRoom.offset[1] + cRoom.size[1])); i++) {
                                setConType(cells, i, room.offset[0] - 1, conType);
                            }
                            break;
                    }
                }
            }
        }
        cells[playerPos[1]][playerPos[0]] = CellTypes.PLAYER
    }

    function getRooms(pos) {
        //check for in room
        for (const room of rooms) {
            if (pos[0] >= room.offset[0] && pos[0] < room.offset[0] + room.size[0] && pos[1] >= room.offset[1] && pos[1] < room.offset[1] + room.size[1]) {
                return [room]
            }
        }

        //check for between 2 rooms (connection)
        let room1 = undefined
        for (const room of rooms) {
            if ((pos[0] >= room.offset[0] - 1 && pos[0] < room.offset[0] + room.size[0] + 1 && pos[1] >= room.offset[1] - 1 && pos[1] < room.offset[1] + room.size[1] + 1)
                && !((pos[0] == room.offset[0] - 1 || pos[0] == room.offset[0] + room.size[0]) && (pos[1] == room.offset[1] - 1 || pos[1] == room.offset[1] + room.size[1]))) {
                if (room1 === undefined) {
                    room1 = room
                } else {
                    return [room1, room]
                }
            }
        }
    }

    //both must be odd
    const tableWidth = 31
    const tableHeight = 9
    let tCells = []
    function renderToTable() {
        const playerPosInTable = [(tableWidth - 1) / 2, (tableHeight - 1) / 2]
        const delta = v2Sub(playerPos, playerPosInTable)
        for (let row = 0; row < tCells.length; row++) {
            for (let col = 0; col < tCells[0].length; col++) {
                const cPos = v2Add([col, row], delta)
                let tcText = ""
                if (cPos[0] >= 0 && cPos[0] < cells[0].length && cPos[1] >= 0 && cPos[1] < cells.length) {
                    const cText = cells[cPos[1]][cPos[0]];
                    if (cText === CellTypes.OUTSIDE) {
                        tcText = "<div class='outside'>█</div>"
                    } else if (cText === CellTypes.WALL) {
                        tcText = "<div class='wall'>█</div>"
                    } else if (cText === CellTypes.INSIDE_VISIBLE) {
                        tcText = "<div class='inside-visible'></div>"
                    } else if (cText === CellTypes.INSIDE_FOGGED) {
                        tcText = "<div class='inside-invisible'>▓</div>"
                    } else if (cText === CellTypes.CONNECTION) {
                        tcText = "<div class='connection'>░</div>"
                    } else if (cText === CellTypes.PLAYER) {
                        tcText += `<div class='emoji'>${playerHealthEmojis[playerHealth]}</div>`
                    } else if (cText === CellTypes.CONNECTION_INVISIBLE) {
                        tcText = "<div class='wall'>█</div>";
                    } else if (cText === CellTypes.INSIDE_INVISIBLE) {
                        tcText = "<div class='wall'>█</div>";
                    } else if (cText === CellTypes.ROBOT) {
                        tcText = "<div class='emoji'>🤖</div>";
                    } else if (cText === CellTypes.COMPUTER) {
                        tcText = "<div class='computer'>🖥️</div>";
                    } else if (cText === CellTypes.COMPUTER_DISABLED) {
                        tcText = "<div class='computer-disabled'>🖥️</div>";
                    } else if (cText === CellTypes.SERVER) {
                        tcText = "<div class='emoji'>🗄️</div>";
                    } else if (cText === CellTypes.SERVER_DISABLED) {
                        tcText = "<div class='emoji'>🔥</div>";
                    }
                }
                tCells[row][col].innerHTML = tcText;
            }
        }
    }

    function getComputerArrows() {
        const currentRooms = getRooms(playerPos)
        let arrows = []
        for (i of computerRooms) {
            if (currentRooms.includes(rooms[i])) {
                continue
            }
            const pos = getRoomCenter(rooms[i])
            arrows.push(v2Sub(pos, playerPos))
        }
        return arrows
    }

    function makeBorderWithArrows(arrows) {
        const mazeTopOuter = document.getElementById("mazeTopOuter");
        const mazeTopInner = document.getElementById("mazeTopInner");
        const mazeLeftOuter = document.getElementById("mazeLeftOuter");
        const mazeLeftInner = document.getElementById("mazeLeftInner");
        const mazeRightOuter = document.getElementById("mazeRightOuter");
        const mazeRightInner = document.getElementById("mazeRightInner");
        const mazeBottomOuter = document.getElementById("mazeBottomOuter");
        const mazeBottomInner = document.getElementById("mazeBottomInner");

        const cellsHeight = tableHeight * 3
        const cellsWidth = tableWidth * 3

        let topTextOuter = Array(cellsWidth + 4).fill(' ')
        let topTextInner = Array(cellsWidth + 4).fill('#'); topTextInner[0] = ' '; topTextInner[topTextInner.length - 1] = ' '
        let bottomTextOuter = topTextOuter.slice()
        let bottomTextInner = topTextInner.slice()
        let leftTextOuter = Array(cellsHeight).fill(' ')
        let leftTextInner = Array(cellsHeight).fill('#');
        let rightTextOuter = leftTextOuter.slice()
        let rightTextInner = leftTextInner.slice()

        //assume center of maze is (0, 0) and each cell has width and height 1
        const bottomY = Math.floor((cellsHeight + 4) / 2)
        const topY = -bottomY
        const rightX = Math.floor((cellsWidth + 4) / 2)
        const leftX = -rightX

        if (bossReconScore === 3) {
            for (const arrow of arrows) {
                if (v2Eq(arrow, [0, 0])) {
                    continue
                }
                let pos = rayRectIntersection(arrow[0], arrow[1], cellsWidth + 3, cellsHeight + 3) //half a cell missing on each side
                pos = pos.map(Math.round)

                let char = 'X'
                // const angle = Math.atan2(-arrow[1], arrow[0] * aspectRatio); // negative y because screen coords
                // const deg = (angle * 180 / Math.PI + 360) % 360;
                // if (deg >= 337.5 || deg < 22.5) char = '→';
                // else if (deg >= 22.5 && deg < 67.5) char = '↗';
                // else if (deg >= 67.5 && deg < 112.5) char = '↑';
                // else if (deg >= 112.5 && deg < 157.5) char = '↖';
                // else if (deg >= 157.5 && deg < 202.5) char = '←';
                // else if (deg >= 202.5 && deg < 247.5) char = '↙';
                // else if (deg >= 247.5 && deg < 292.5) char = '↓';
                // else if (deg >= 292.5 && deg < 337.5) char = '↘';
                char = `<span class="mazeArrow">${char}</span>`

                if (pos[1] === topY) {
                    topTextOuter[pos[0] + rightX] = char
                } else if (pos[1] === bottomY) {
                    bottomTextOuter[pos[0] + rightX] = char
                } else if (pos[0] === leftX) {
                    if (pos[1] === topY + 1) {
                        topTextInner[0] = char
                    } else if (pos[1] === bottomY - 1) {
                        bottomTextInner[0] = char
                    } else {
                        leftTextOuter[pos[1] + bottomY - 2] = char
                    }
                } else if (pos[0] === rightX) {
                    if (pos[1] === topY + 1) {
                        topTextInner[topTextInner.length - 1] = char
                    } else if (pos[1] === bottomY - 1) {
                        bottomTextInner[bottomTextInner.length - 1] = char
                    } else {
                        rightTextOuter[pos[1] + bottomY - 2] = char
                    }
                }
            }
        }

        topTextOuter = topTextOuter.join(""); topTextInner = topTextInner.join("")
        bottomTextOuter = bottomTextOuter.join(""); bottomTextInner = bottomTextInner.join("")
        leftTextOuter = leftTextOuter.join("<br>"); leftTextInner = leftTextInner.join("<br>")
        rightTextOuter = rightTextOuter.join("<br>"); rightTextInner = rightTextInner.join("<br>")

        mazeTopOuter.innerHTML = topTextOuter; mazeTopInner.innerHTML = topTextInner;
        mazeBottomOuter.innerHTML = bottomTextOuter; mazeBottomInner.innerHTML = bottomTextInner;
        mazeLeftOuter.innerHTML = leftTextOuter; mazeLeftInner.innerHTML = leftTextInner;
        mazeRightOuter.innerHTML = rightTextOuter; mazeRightInner.innerHTML = rightTextInner;
    }

    halfHealthPrinted = false
    function printHalfHealthWarning() {
        if (!halfHealthPrinted) {
            halfHealthPrinted = true
            document.getElementById("maze-status").innerHTML += `<br><span class='error'>Half of your health remains!</span>`
        }
    }

    quarterHealthPrinted = false
    function printQuarterHealthWarning() {
        if (!quarterHealthPrinted) {
            quarterHealthPrinted = true
            document.getElementById("maze-status").innerHTML += `<br><span class='error'>One quarter of your health remains!</span>`
        }
    }

    halfTimePrinted = false
    function printHalfTimeWarning() {
        if (!halfTimePrinted) {
            halfTimePrinted = true
            document.getElementById("maze-status").innerHTML += `<br><span class='error'>Half of your time remains!</span>`
        }
    }

    quarterTimePrinted = false
    function printQuarterTimeWarning() {
        if (!quarterTimePrinted) {
            quarterTimePrinted = true
            document.getElementById("maze-status").innerHTML += `<br><span class='error'>One quarter of your time remains!</span>`
        }
    }

    function updateHealthAndTime(newRoom) {
        if (newRoom !== undefined && newRoom.hasRobot) {
            playerHealth -= 1
        }
        timeRemaining -= timeDecline
    }

    function updateVisibleAndFogged(rooms) {
        for (const room of rooms) {
            room.visible = true
        }

        if (bossReconScore === 1) { //if higher, all rooms start fogged
            let c = rooms.flatMap(room => Object.values(room.connectingRooms));
            for (const connected of c) {
                if (connected) {
                    connected.fogged = true;
                }
            }
        }
    }

    function getBarColor(amount) {
        const zeroHue = 0
        const maxHue = 120
        return hslToHex(amount * maxHue + (1 - amount) * zeroHue, 100, 50)
    }

    function updateHealthbar() {
        const healthbar = document.getElementById('mazeHealthbar')
        const maxWidth = tableWidth * 3 + 4
        let width = Math.ceil(playerHealth / maxHealth * maxWidth)
        if (width === 0) {
            healthbar.innerHTML = '<br>'
        } else {
            healthbar.innerHTML = `<span style='color:${getBarColor(playerHealth / maxHealth)}'>${'#'.repeat(width)}</span>`
        }
    }

    function updateTimebar() {
        const timebar = document.getElementById('mazeTimebar')
        const maxWidth = tableWidth * 3 + 4
        let width = 0
        if (timeRemaining > 0) {
            width = 1 + Math.floor(timeRemaining * (maxWidth - 1))
        }
        if (width === 0) {
            timebar.innerHTML = '<br>'
        } else {
            timebar.innerHTML = `<span style='color:${getBarColor(timeRemaining)}'>${'#'.repeat(width)}</span>`
        }
    }

    function updateVisuals(rooms, newRoom) {
        updateVisibleAndFogged(rooms)
        renderToCells();
        renderToTable();
        makeBorderWithArrows(getComputerArrows());
        updateHealthbar()
        updateTimebar()
        if (newRoom !== undefined && newRoom.hasComputer && !newRoom.hasDisabledComputer) {
            printComputerFound()
        }
        if(timeRemaining < 1/2) {
            printHalfTimeWarning()
        } else if(timeRemaining < 1/4) {
            printQuarterTimeWarning()
        }
        if(playerHealth < maxHealth/2) {
            printHalfHealthWarning()
        } else if(playerHealth < maxHealth/4) {
            printQuarterHealthWarning()
        }
    }

    const keyToDir = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0] }
    function move(delta) {
        const newPos = v2Add(playerPos, delta)
        const rooms = getRooms(newPos);
        if (rooms === undefined) {
            return [false, rooms, undefined]; //tried to move into a wall
        }
        let newRoom = undefined
        for (const room of rooms) {
            if (room.visible === false) {
                newRoom = room
                break
            }
        }
        playerPos = v2Add(playerPos, delta)
        return [true, rooms, newRoom]
    }

    function moveAndUpdate(delta) {
        const [moved, rooms, newRoom] = move(delta);
        if (!moved) {
            return;
        }
        updateHealthAndTime(newRoom)
        updateVisuals(rooms, newRoom)
    }

    function printComputerFound() {
        document.getElementById("maze-status").innerHTML += `<br>Computer #${4 - computersRemaining} found! Walk up to it and press E to destroy it.`
    }

    function printComputerDisabled() {
        document.getElementById("maze-status").innerHTML += `<br><span class='win'>Computer #${4 - computersRemaining} destroyed!</span>`
        computersRemaining--
    }

    function printRemainingComputers(prefix) {
        if (computersRemaining === 0) {
            document.getElementById("maze-status").innerHTML += `${prefix}<span class='win'>All computers destroyed!</span>.`
        } else if (computersRemaining === 1) {
            document.getElementById("maze-status").innerHTML += `${prefix}${computersRemaining} computer remains.`
        } else {
            document.getElementById("maze-status").innerHTML += `${prefix}${computersRemaining} computers remain.`
        }
    }

    function tryDisableComputer() {
        const rooms = getRooms(playerPos)
        if (rooms.length === 1 && rooms[0].hasComputer && !rooms[0].hasDisabledComputer && v2DistSquared(getRoomCenter(rooms[0]), playerPos) < 4) {
            rooms[0].hasDisabledComputer = true
            printComputerDisabled()
            printRemainingComputers(' ')
        }
    }

    addEventListener("DOMContentLoaded", () => {
        const table = document.createElement("table");
        const tbody = document.createElement("tbody");
        for (let row = 0; row < tableHeight; row++) {
            const tr = document.createElement("tr");
            tCells.push([]);

            for (let col = 0; col < tableWidth; col++) {
                const td = document.createElement("td");
                tr.appendChild(td);

                tCells[row].push(td);
            }

            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        table.setAttribute('tabindex', '0');
        let wInterval = undefined
        let aInterval = undefined
        let sInterval = undefined
        let dInterval = undefined
        table.addEventListener('keydown', (e) => {
            if (["w", "a", "s", "d"].includes(e.key)) {
                if (e.repeat) {
                    return
                }
                function moveInDir() {
                    moveAndUpdate(keyToDir[e.key])
                }
                moveInDir()
                const firstMoveDelay = 150
                const moveDelayVertical = 75
                const moveDelayHorizontal = moveDelayVertical * aspectRatio
                if (e.key == 'w') {
                    clearInterval(sInterval)
                    wInterval = setTimeout(() => wInterval = setInterval(moveInDir, moveDelayVertical), firstMoveDelay)
                } else if (e.key == 'a') {
                    clearInterval(dInterval)
                    aInterval = setTimeout(() => aInterval = setInterval(moveInDir, moveDelayHorizontal), firstMoveDelay)
                } else if (e.key == 's') {
                    clearInterval(wInterval)
                    sInterval = setTimeout(() => sInterval = setInterval(moveInDir, moveDelayVertical), firstMoveDelay)
                } else {
                    clearInterval(aInterval)
                    dInterval = setTimeout(() => dInterval = setInterval(moveInDir, moveDelayHorizontal), firstMoveDelay)
                }
            } else if (e.key === 'e') {
                tryDisableComputer()
                updateVisuals(getRooms(playerPos))
            }
        });
        table.addEventListener('keyup', (e) => {
            if (e.key == 'w') {
                clearInterval(wInterval)
            } else if (e.key == 'a') {
                clearInterval(aInterval)
            } else if (e.key == 's') {
                clearInterval(sInterval)
            } else {
                clearInterval(dInterval)
            }
        })
        table.addEventListener('click', () => {
            table.focus();
        });
        table.addEventListener('blur', () => {
            clearInterval(wInterval)
            clearInterval(aInterval)
            clearInterval(sInterval)
            clearInterval(dInterval)
        })
        document.getElementById("maze").appendChild(table);

        updateVisuals(getRooms(playerPos))
        printRemainingComputers('')
    });
}
setupBoss()
