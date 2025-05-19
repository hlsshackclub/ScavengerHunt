maze = []

with open("AnotherOutput.txt", "r") as text_file:
    maze = text_file.read().split("\n")
    
roomPos = []
roomWidths = []
roomHeights = []
roomSizes = []
i = 0
while i < len(maze):
    j = 0
    roomFound = False
    roomWidth = 0
    while j < len(maze[0]):
        inRoom = False
        print(len(roomWidths), len(roomHeights), len(roomPos))
        if len(roomWidths) >= len(roomPos):
            for k in range(len(roomPos)):
                if (j >= roomPos[k][0] and j <= roomPos[k][0]+roomWidths[k]) and ((i >= roomPos[k][1] and i <= roomPos[k][1]+roomHeights[k])): inRoom = True
        
        if not inRoom:
            if maze[i][j] == " ":
                if roomFound: 
                    roomWidth += 1
                else:
                    for k in range(i, len(maze)):
                        if maze[k][j] != " ": 
                            roomHeights.append(k-i)
                            break
                    roomPos.append([j,i])
                    roomFound = True
            else:
                roomFound = False
                if roomWidth > 0: roomWidths.append(roomWidth + 1)
                roomWidth = 0
        j += 1
    i += 1

for i in range(len(roomWidths)):
    roomSizes.append([roomWidths[i], roomHeights[i]])

print(roomSizes)
print()
print(roomPos)