orig_maze = [
    " ccccc",
    " ccccc   ooo",
    " ccccc xxooo  oo",
    " ccccc xx  xxxoo",
    "  oo   xx  xxx xx",
    "  oo oooo oo   xxoo",
    "  oo oooo ooxx xxoo",
    "  ooxxx     xx   xx",
    "    xxx  oo xx   xxoo",
    "   oo    oo  ooo xxoo",
    "   ooxxxxoo  ooouu  xxx",
    "     xxxxoo  xx uu  xxx",
    "      oo     xx       oo",
    "  xxxxooxxssooo ccccc oo",
    "  xxxxooxxssooo cccccxx",
    " oo     xx      cccccxx",
    " oo     xx  xx  cccccxx",
    "  xx     oooxx        oo",
    "  xx   xxoooxxoo   xxxoo",
    "  xxoooxx     oouuuxxx",
    "    oooxx     oouuu",
    "  xxx  xx     oo",
    "ooxxx   ooooxxx",
    "oo      ooooxxxoo",
    "ooccccc        oo",
    "  ccccc   ooo  oo",
    "  cccccxxxoooxxx",
    "  cccccxxx   xxx",
    "       xxx"
]


# Step 1: Create list of lists
max_length = max(len(row) for row in orig_maze)
grid = []
for row in orig_maze:
    chars = list(row) + [' '] * (max_length - len(row))
    grid.append(chars)
orig_h, orig_w = len(grid), len(grid[0])

# Step 2: Expand with blanks
exp_h, exp_w = orig_h * 2, orig_w * 2
expanded = [[' ' for _ in range(exp_w)] for _ in range(exp_h)]
for i in range(orig_h):
    for j in range(orig_w):
        expanded[2*i][2*j] = grid[i][j]

# Step 3: Add walls (#) to surround rooms
for y in range(exp_h):
    for x in range(exp_w):
        if expanded[y][x] != ' ': continue
        # Horizontal gaps (between two original columns)
        if y % 2 == 0 and x % 2 == 1:
            row = y // 2
            left = expanded[y][x-1] if x-1 >= 0 else ' '
            right = expanded[y][x+1] if x+1 < exp_w else ' '
            if (left != ' ' or right != ' ') and (left != right):
                expanded[y][x] = '#'
        # Vertical gaps (between two original rows)
        elif y % 2 == 1 and x % 2 == 0:
            col = x // 2
            up = expanded[y-1][x] if y-1 >= 0 else ' '
            down = expanded[y+1][x] if y+1 < exp_h else ' '
            if (up != ' ' or down != ' ') and (up != down):
                expanded[y][x] = '#'
        # Intersection points (surrounding corners)
        elif y % 2 == 1 and x % 2 == 1:
            # check all four diagonal directions
            neighbors = []
            for dy, dx in [(-1,-1),(-1,1),(1,-1),(1,1)]:
                ny, nx = y+dy, x+dx
                if 0 <= ny < exp_h and 0 <= nx < exp_w:
                    ch = expanded[ny][nx]
                    if ch not in [' ', '#']:
                        neighbors.append(ch)
            if len(neighbors) >= 2 and len(set(neighbors)) > 1:
                expanded[y][x] = '#'
    
for y in range(exp_h):
    for x in range(exp_w):
        if expanded[y][x] != ' ':
            if x < (exp_w-2): 
                if expanded[y][x+1] == ' ' and expanded[y][x+2] == expanded[y][x]: 
                    expanded[y][x+1] = expanded[y][x]
            if y < (exp_h-2): 
                if expanded[y+1][x] == ' ' and expanded[y+2][x] == expanded[y][x]: 
                    expanded[y+1][x] = expanded[y][x]
       
output = "" 
for row in expanded:
    print(''.join(row))
    output += ''.join(row) + "\n"
    
with open("Output.txt", "w") as text_file:
    text_file.write(output)
    # for row in expanded:
    #     text_file.write(''.join(row))