function setupBoss() {
    class Room {
        constructor(size, offset, hasRobot = false, visible = false) {
            this.connectingRooms = { north: undefined, east: undefined, south: undefined, west: undefined };
            this.size = size;
            this.offset = offset;
            this.fogged = false;
            this.hasRobot = hasRobot
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

    let startRoom = new Room([7, 3], [42, 27], false, true);
    let rooms = [startRoom];
    //computer rooms are 1, 28, 44

    let roomSizes = [
        [19, 7], [11, 3], [7, 5], [7, 3], [11, 3], [7, 7], [7, 5], [15, 3], [7, 3], [7, 3], [7, 5], [11, 3], [7, 5], [7, 7], [7, 3], [7, 3], [11, 3], [15, 3], [7, 3], [11, 3], [7, 3], [7, 5], [7, 3], [15, 3], [7, 7], [11, 3], [19, 7], [7, 5], [7, 3], [7, 5], [7, 5], [11, 3], [7, 3], [7, 7], [7, 7], [11, 3], [11, 3], [11, 3], [11, 3], [7, 5], [15, 3], [11, 3], [7, 5], [19, 7], [11, 3], [11, 5], [11, 3], [6, 3]
    ];

    //[x,y]
    let roomOffsets = [
        [6, 1], [38, 3], [30, 5], [58, 5], [46, 7], [10, 9], [62, 9], [22, 11], [42, 11], [70, 11], [50, 13], [18, 15], [70, 15], [38, 17], [78, 17], [14, 19], [54, 19], [22, 21], [66, 21], [82, 21], [54, 23], [26, 25], [90, 25], [10, 27], [34, 27], [50, 27], [66, 27], [86, 29], [6, 31], [50, 33], [10, 35], [38, 35], [90, 35], [30, 37], [58, 37], [78, 37], [18, 39], [66, 39], [11, 43], [2, 46], [34, 45], [50, 45], [62, 47], [10, 49], [42, 51], [30, 53], [54, 53], [4, 42]
    ];

    function initMaze() {
        for (let i = 0; i < roomOffsets.length; i++) {
            rooms[i + 1] = new Room(roomSizes[i], roomOffsets[i]);
        }

        let rand = splitmix32f(cyrb128("boss"))
        let robotRooms = []
        for (let i = 1; i < rooms.length; i++) {
            const r = rand()
            console.log(r)
            if (r < 0.2) {
                robotRooms.push(i)
            }
        }

        for (const room of robotRooms) {
            rooms[room].hasRobot = true
        }

        // ROOM CONNECTIONS (this took way too long)

        //start
        connectRooms(0, 25, "west");
        connectRooms(0, 26, "east");
        //room1
        connectRooms(25, 22, "west");
        connectRooms(25, 32, "south");
        //room2
        connectRooms(22, 24, "west");
        connectRooms(22, 18, "north");
        //room3
        connectRooms(24, 29, "south");
        //room4
        connectRooms(29, 31, "south");
        //room5
        connectRooms(31, 37, "east");
        //room6
        connectRooms(37, 39, "south");
        connectRooms(37, 34, "east");
        //room7
        connectRooms(39, 48, "west");
        //room8
        connectRooms(40, 44, "east");
        connectRooms(40, 48, "north");
        //room9
        connectRooms(44, 46, "east");
        //room10
        connectRooms(46, 45, "east");
        //room11
        connectRooms(45, 47, "east");
        //room12
        connectRooms(47, 43, "north");
        //room13
        connectRooms(43, 42, "west");
        //room14
        connectRooms(42, 35, "north");
        connectRooms(42, 41, "west");
        //room15
        connectRooms(35, 38, "east");
        connectRooms(35, 30, "west");
        //room 16
        connectRooms(38, 36, "east");
        //room17
        connectRooms(36, 33, "east");
        //room18
        connectRooms(33, 28, "north");
        //room19
        connectRooms(28, 27, "west");
        connectRooms(28, 23, "north");
        //room21
        connectRooms(23, 20, "north");
        //room22
        connectRooms(20, 15, "north");
        //room23
        connectRooms(15, 13, "west");
        //room24
        connectRooms(13, 10, "north");
        connectRooms(13, 19, "south");
        //room25
        connectRooms(10, 7, "west");
        //room26
        connectRooms(7, 4, "north");
        //room27
        connectRooms(4, 5, "west");
        //room28
        connectRooms(5, 2, "north");
        connectRooms(5, 9, "south");
        //room29
        connectRooms(2, 3, "west");
        //room30
        connectRooms(3, 8, "south");
        //room31
        connectRooms(8, 12, "south");
        //room32
        connectRooms(12, 6, "west");
        connectRooms(12, 16, "south");
        //room33
        connectRooms(6, 1, "north");
        //room35
        connectRooms(16, 18, "east");
        //room36
        connectRooms(18, 14, "east");
        //room38
        connectRooms(9, 11, "east");
        //room39
        connectRooms(11, 17, "south");
        //room40
        connectRooms(17, 19, "east");
        connectRooms(17, 21, "south");
        //room42
        connectRooms(21, 26, "south");
        //room44 
        connectRooms(30, 32, "west");
        //room45
        connectRooms(32, 34, "west");
        //room46
        connectRooms(34, 41, "south");
    }
    initMaze()

    let playerPos = [45, 28]

    const CellTypes = Object.freeze({
        OUTSIDE: "x",
        WALL: "X",
        INSIDE_VISIBLE: " ",
        INSIDE_INVISIBLE: "-",
        INSIDE_FOGGED: "F",
        CONNECTION: "+",
        CONNECTION_INVISIBLE: "*",
        PLAYER: "P",
    });

    let cells = undefined
    function renderToCells() {
        let width = Math.max(...(rooms.map(room => room.offset[0] + room.size[0] + 1)))
        let height = Math.max(...(rooms.map(room => room.offset[1] + room.size[1] + 1)))
        cells = Array.from({ length: height }, () => Array(width).fill(CellTypes.OUTSIDE));
        let mediumMode = true;
        if (mediumMode) {
            let c = getRooms(playerPos).flatMap(room => Object.values(room.connectingRooms));
            for (const connected of c){
                if (connected) {
                    connected.fogged = true;
                }
            }
        }

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

    const keyToDir = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0] }
    function move(delta) {
        const newPos = v2Add(playerPos, delta)
        const rooms = getRooms(newPos);
        if (rooms === undefined) {
            return; //tried to move into a wall
        }
        if (rooms.length === 2) {
            for (const room of rooms) {
                if (room.visible) {
                    continue;
                }
                //if you're walking into a new room then
                room.visible = true
                //probably do something with the enemies here
            }
        }
        playerPos = v2Add(playerPos, delta)
    }

    function testPrintCells() {
        console.log(cells.map(row => row.join('')).join('\n'))
    }

    testPrintCells(renderToCells(rooms, playerPos))

    //both must be odd
    const tableWidth = 31
    const tableHeight = 13
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
                        tcText = "<span class='outside'>█</span>"
                    } else if (cText === CellTypes.WALL) {
                        tcText = "<span class='wall'>█</span>"
                    } else if (cText === CellTypes.INSIDE_VISIBLE) {
                        tcText = "<span class='inside-visible'></span>"
                    } else if (cText === CellTypes.INSIDE_FOGGED) {
                        tcText = "<span class='inside-invisible'>▓</span>"
                    } else if (cText === CellTypes.CONNECTION) {
                        tcText = "<span class='connection'>░</span>"
                    } else if (cText === CellTypes.PLAYER) {
                        tcText = "<span class='player'>⍟</span>"
                    } else if (cText === CellTypes.CONNECTION_INVISIBLE) {
                        tcText = "<span class='wall'>█</span>";
                    } else if (cText === CellTypes.INSIDE_INVISIBLE) {
                        tcText = "<span class='wall'>█</span>";
                    }
                }
                tCells[row][col].innerHTML = tcText;
            }
        }
    }

    function moveAndUpdate(delta) {
        move(delta);
        renderToCells();
        renderToTable();
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

                const div = document.createElement("div");
                td.appendChild(div)

                tCells[row].push(div);
            }

            tbody.appendChild(tr);
        }
        renderToTable()
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
                const moveDelay = 50
                if (e.key == 'w') {
                    clearInterval(sInterval)
                    wInterval = setTimeout(() => wInterval = setInterval(moveInDir, moveDelay), firstMoveDelay)
                } else if (e.key == 'a') {
                    clearInterval(dInterval)
                    aInterval = setTimeout(() => aInterval = setInterval(moveInDir, moveDelay), firstMoveDelay)
                } else if (e.key == 's') {
                    clearInterval(wInterval)
                    sInterval = setTimeout(() => sInterval = setInterval(moveInDir, moveDelay), firstMoveDelay)
                } else {
                    clearInterval(aInterval)
                    dInterval = setTimeout(() => dInterval = setInterval(moveInDir, moveDelay), firstMoveDelay)
                }
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
        document.getElementById("maze").appendChild(table);
    });
}
setupBoss()
