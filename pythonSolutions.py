def findTarget(arr, size):
    bestPos = [0, 0]
    best = 0
    for i in range(len(arr)-size):
        for j in range(len(arr[0])-size):
            count = 0
            for k in range(size):
                for l in range(size):
                    if arr[i+k][j+l] == 1:
                        count += 1
            #if count == best:
                #bestPos.append([i, j, count]) #purely for debugging if a test case has multiple solutions
            if count > best:
                best = count
                bestPos = [j, i]

    return bestPos

def decrypt(message, shift):
    decrypted = ""
    for char in message:
        if char.isalpha():
            if char.islower():
                decrypted += chr((ord(char) + shift - 97) % 26 + 97)
            else:
                decrypted += chr((ord(char) + shift - 65) % 26 + 65)
        else:
            decrypted += char
    return decrypted

def destroy(s):
	if "trap" not in s:
		s = ""
	return s

#python3 -m http.server 8000