class Room {
    constructor(size, offset) {
        this.connectingRooms = {north: undefined, east: undefined, south: undefined, west: undefined};
        this.size = size;
        this.offset = offset;
    }
    getConnectingRoom(direction) {
        try {
            return this.connectingRooms[direction];
        }
        catch (e) {
            return undefined;
        }
    }
    setConnectingRoom(direction, room) {
        this.connectingRooms[direction] = room;
    }
}

function connectRooms(r1, r2, direction){
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

let currentRoom = undefined;

let startRoom = new Room([6,3], [42,27]);
let rooms = [startRoom];

function testMaze(){
    maze = Array.from({ length: 29 }, () => Array(24).fill(' '));
    for (const room of rooms)  {
        for (let i = 0; i < room.size[1]; i++) {
            for (let j = 0; j < room.size[0]; j++) {
                maze[room.offset[1]+i][room.offset[0]+j] = "x";
            }
        }
    }
    
    let rows = []
    for (row of maze) {
        rows.push(row.join("").trimEnd());
    }
    
    const answer = " xxxxx xxxxx   xxx xxxxx xxxxx  xx xxxxx xx  xxxxx  xx   xx  xxx xx  xx xxxx xx   xxxx  xx xxxx xxxx xxxx  xxxxx     xx   xx    xxx  xx xx   xxxx   xx    xx  xxx xxxx   xxxxxxxx  xxxxx  xxx     xxxxxx  xx xx  xxx      xx     xx       xx  xxxxxxxxxxxxx xxxxx xx  xxxxxxxxxxxxx xxxxxxx xx     xx      xxxxxxx xx     xx  xx  xxxxxxx  xx     xxxxx        xx  xx   xxxxxxxxx   xxxxx  xxxxxxx     xxxxxxxx    xxxxx     xxxxx  xxx  xx     xxxxxxx   xxxxxxxxx      xxxxxxxxxxxxxxxx        xx  xxxxx   xxx  xx  xxxxxxxxxxxxxx  xxxxxxxx   xxx       xxx"
    return (rows.join("") === answer);
}

function drawMaze(r) {
    maze = Array.from({ length: 60 }, () => Array(100).fill('█'));
    for (const room of r) {
        for (let i = room.offset[1]; i < room.offset[1] + room.size[1]; i++){
            for (let j = room.offset[0]; j < room.offset[0] + room.size[0]; j++){
                maze[i][j] = " ";
            }
        }
    }
    return maze
}

let roomSizes = [
    [18, 7], [10, 3], [6, 5], [6, 3], [10, 3], [6, 7], [6, 5], [14, 3], [6, 3], [6, 3], [6, 5], [10, 3], [6, 5], [6, 7], [6, 3], [6, 3], [10, 3], [14, 3], [6, 3], [10, 3], [6, 3], [6, 5], [6, 3], [14, 3], [6, 7], [10, 3], [18, 7], [6, 5], [6, 3], [6, 5], [6, 5], [10, 3], [6, 3], [6, 7], [6, 7], [10, 3], [10, 3], [10, 3], [10, 3], [6, 5], [14, 3], [10, 3], [6, 5], [18, 7], [10, 3], [10, 5], [10, 3]
];

//[x,y]
let roomOffsets = [
    [6, 1], [38, 3], [30, 5], [58, 5], [46, 7], [10, 9], [62, 9], [22, 11], [42, 11], [70, 11], [50, 13], [18, 15], [70, 15], [38, 17], [78, 17], [14, 19], [54, 19], [22, 21], [66, 21], [82, 21], [54, 23], [26, 25], [90, 25], [10, 27], [34, 27], [50, 27], [66, 27], [86, 29], [6, 31], [50, 33], [10, 35], [38, 35], [90, 35], [30, 37], [58, 37], [78, 37], [18, 39], [66, 39], [10, 43], [2, 45], [34, 45], [50, 45], [62, 47], [10, 49], [42, 51], [30, 53], [54, 53]
];


function initMaze(){
    for (let i = 0; i < 47; i++) {
        rooms[i+1] = new Room(roomSizes[i], roomOffsets[i]);
    }

    // ROOM CONNECTIONS (this took way too long)

    //start
    connectRooms(0, 1, "west");
    connectRooms(0, 43, "east");
    //room1
    connectRooms(1, 2, "west");
    connectRooms(1, 45, "south");
    //room2
    connectRooms(2, 3, "west");
    connectRooms(2, 36, "north");
    //room3
    connectRooms(3, 4, "south");
    //room4
    connectRooms(4, 5, "south");
    //room5
    connectRooms(5, 6, "east");
    //room6
    connectRooms(6, 7, "south");
    connectRooms(6, 46, "east");
    //room7
    connectRooms(7, 8, "west");
    //room8
    connectRooms(8, 9, "east");
    //room9
    connectRooms(9, 10, "east");
    //room10
    connectRooms(10, 11, "east");
    //room11
    connectRooms(11, 12, "east");
    //room12
    connectRooms(12, 13, "north");
    //room13
    connectRooms(13, 14, "west");
    //room14
    connectRooms(14, 15, "north");
    connectRooms(14, 47, "west");
    //room15
    connectRooms(15, 16, "east");
    connectRooms(15, 44, "west");
    //room 16
    connectRooms(16, 17, "east");
    //room17
    connectRooms(17, 18, "east");
    //room18
    connectRooms(18, 19, "north");
    //room19
    connectRooms(19, 20, "west");
    connectRooms(19, 21, "north");
    //room21
    connectRooms(21, 22, "north");
    //room22
    connectRooms(22, 23, "north");
    //room23
    connectRooms(23, 24, "west");
    //room24
    connectRooms(24, 25, "north");
    //room25
    connectRooms(25, 26, "west");
    //room26
    connectRooms(26, 27, "north");
    //room27
    connectRooms(27, 28, "west");
    //room28
    connectRooms(28, 29, "north");
    //room29
    connectRooms(29, 30, "west");
    //room30
    connectRooms(30, 31, "south");
    //room31
    connectRooms(31, 32, "south");
    //room32
    connectRooms(32, 33, "west");
    connectRooms(32, 35, "south");
    //room33
    connectRooms(33, 34, "north");
    //room35
    connectRooms(35, 36, "east");
    //room36
    connectRooms(36, 37, "east");
    //room38
    connectRooms(38, 39, "east");
    //room39
    connectRooms(39, 40, "south");
    //room40
    connectRooms(40, 41, "east");
    connectRooms(40, 42, "south");
    //room42
    connectRooms(42, 43, "south");
    //room44 
    connectRooms(44, 45, "west");
    //room45
    connectRooms(45, 46, "west");
    //room46
    connectRooms(46, 47, "south");
}

initMaze();

addEventListener("DOMContentLoaded", () => {
    m = drawMaze(rooms);
    rows = []
    for (row of m) {
        rows.push(row.join(""));
    }
    document.getElementById('maze').innerHTML = rows.join("<br>");
});
