#targets is a 2d array of 1s and 0s. 1 means there's a target there, 0 means there's no target there
#targets is indexed with y coordinate first, x coordinate second
#EMPsize is the side length of the square that your EMP destroys
#For example, if your EMP has a size of 5, and you place it at [2, 2], it would destroy a square from [0, 0] to [4, 4]
#Return the position [x, y] which destroys the most targets
def findBestEMPSpot(targets, EMPSize):
    #Write your code here!