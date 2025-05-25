f = open(r"D:\Files\Web Projects\Scavenger Hunt\ScavengerHunt\index.html")
text = f.read()

tags = set()

startIndex = None
for (i, char) in enumerate(text):
    if char == "<":
        startIndex = i
    elif startIndex != None and (char == " " or char == ">"):
        tags.add(text[startIndex:i])
        startIndex = None

print(list(tags))