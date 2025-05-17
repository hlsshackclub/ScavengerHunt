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

let startRoom = new Room([2,2], [10,13]);
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

function drawMaze() {
    maze = Array.from({ length: 29 }, () => Array(24).fill(' '));
    for (const room of rooms) {
        maze[room.offset[1]][room.offset[0]] = "┌";
        maze[room.offset[1]][room.offset[0]+room.size[0]-1] = '┐';
        maze[room.offset[1]+room.size[1]-1][room.offset[0]] = '└';
        maze[room.offset[1]+room.size[1]-1][room.offset[0]+room.size[0]-1] = '┘';

        for (let i = 1; i < room.size[0]-1; i++) {
            maze[room.offset[1]][room.offset[0] + i] = '─';
            maze[room.offset[1]+room.size[1]-1][room.offset[0] + i] = '─';
        }

        for (let i = 1; i < room.size[1]-1; i++) {
            maze[room.offset[1] + i][room.offset[0]] = '│';
            maze[room.offset[1] + i][room.offset[0]+room.size[0]-1] = '│';
        }
    }
    return maze
}

let roomSizes = [
    [2,4], [2,3], [4,2], [2,2], [2,3], [3,2], [3,2], [2,3], [5,4], [3,3], [3,2], [3,2], [2,3], [3,2], [2,4], [3,2], [3,2], [2,2], [2,3], [5,4], [2,2], [3,2], [2,2], [2,3], [2,2], [2,3], [2,2], [3,2], [3,2], [2,3], [4,2], [3,2], [2,4], [5,4], [2,2], [4,2], [2,4], [2,2], [2,3], [3,2], [2,2], [2,2], [3,2], [2,3], [3,2], [2,4], [4,2]
];

//[x,y]
//computers in [9], [20], and [34] (-1 for the room offsets/sizes bc no start room)
let roomOffsets = [
    [8,13], [6,12], [2,13], [1,15], [2,17], [4,19], [2,21], [0,22], [2,24], [7,26], [10,25], [13,26], [15,23], [12,22], [14,18], [16,19], [19,18], [22,17], [21, 14], [16,13], [22, 12], [20,10], [19,8], [17,7], [17,5], [15,4], [14,2], [11,3], [9,1], [7,2], [5,5], [4,7], [2,4], [1,0], [3,9], [5,10], [9,8], [10,5], [12,6], [13,9], [16,10], [13,11], [12,13], [12,16], [9,17], [7,18], [8,22]
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
console.log(testMaze());

addEventListener("DOMContentLoaded", () => {
    m = drawMaze();
    rows = []
    for (row of m) {
        rows.push(row.join(""));
    }
    document.getElementById('maze').innerHTML = rows.join("<br>");
});
