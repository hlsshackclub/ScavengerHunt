window.pyodideWorker = new Worker("pyodideWorker.js");

function setEditorText(text) {
    const codeEditor = document.getElementById("codeEditor")
    codeEditor.value = text
    autoResizeEditor()
    updateHighlighting(text)
}

function printToOutput(message) {
    const outputArea = document.getElementById("outputArea")
    outputArea.innerHTML = message;
}

function printToTestOutput(message) {
    const testOutputArea = document.getElementById("testOutputArea")
    testOutputArea.innerHTML = message;
}

const stationDefaultTexts = [
    String.raw
        `#servers is a 2d array of integers, where 0 means there's no server there, and any other number means a server of that ID is there.
#servers is indexed with y coordinate first, x coordinate second
#location is an array of the form [x, y] which is the location of the disconnected computer
#You must return the ID of the server that is closest to the disconnected computer
#For example, if the server with ID 1 is at [0, 0], and the server with ID 2 is at [4,4], a disconnected computer at [0, 1] would be closest to server #1.
#Note: The distance between the computer and the server is calculated using the Manhattan distance.
#The Manhattan distance between two points is the sum of the absolute differences of both their x and y coordinates.

def findClosestServer(servers, location):
    #Write your code here!`,
    String.raw
        `#targets is a 2d array of 1s and 0s. 1 means there's a target there, 0 means there's no target there
#targets is indexed with y coordinate first, x coordinate second
#EMPsize is the side length of the square that your EMP destroys
#EMPSize will always be odd
#For example, if your EMP has a size of 5, and you place it at [2, 2], it would destroy a square from [0, 0] to [4, 4]
#Return the position [x, y] which destroys the most targets
def findBestEMPSpot(targets, EMPSize):
    #Write your code here!`,
    String.raw
        `#msgs is an array of all 10 messages (not formatted into squares though).
#Each message has been "ciphered" by the same amount: the letters have been shifted forwards in the alphabet by some number of letters.
#For example, ciphering the string "xylo phone" with a shift of 3 would create "abor skrqh". Notice how the x and y have wrapped around to a and b.
#Note that spaces are left alone when a message is ciphered.
#You must populate the array decipheredMsgs with all of the messages deciphered (in the same order that they were in msgs).

msgs = ${JSON.stringify(messagesCipheredFlat).replaceAll(",", "\n,")}

decipheredMsgs = []`,
    String.raw
        `#files is a dictionary of {file name : file contents} pairs
#File contents with the string "trap" inside them are trapped
#You must delete all the non-trapped files (return a dictionary with all of the non-trapped files gone, and all of the trapped files remaining)
def deleteFiles(files):
    #Write your code here!`
].map(convertLeadingSpacesToTabs)

const stationWinFuncs = [
    (() => {
        wonAlready = false
        function inner() {
            if (wonAlready) {
                return
            }
            wonAlready = true
            setNetworkingScore(3)
            show("networkingHardWin")
        }
        return inner
    })(),
    (() => {
        wonAlready = false
        function inner() {
            if (wonAlready) {
                return
            }
            wonAlready = true
            setManufacturingScore(3)
            show("manufacturingHardWin")
        }
        return inner
    })(),
    (() => {
        wonAlready = false
        function inner() {
            if (wonAlready) {
                return
            }
            wonAlready = true
            setReconScore(3)
            show("reconHardWin")
        }
        return inner
    })(),
    (() => {
        wonAlready = false
        function inner() {
            if (wonAlready) {
                return
            }
            wonAlready = true
            setSecurityScore(3)
            show("terminalWinHard")
        }
        return inner
    })(),
]

async function resetEditor(station) {
    await pyodideReadyPromise
    printToOutput('')
    printToTestOutput('')
    setEditorText(stationDefaultTexts[station])
}

async function moveEditorToStation(station, parent) {
    document.getElementById(parent).appendChild(document.getElementById("editorArea"))
    resetEditor(station)
    autoResizeEditor() //I want to fix sizing before pyodide is necessarily loaded. it means these are called twice but oh well
    updateHighlighting(document.getElementById("codeEditor").value)
}

let pyodideReadyResolve;
const pyodideReadyPromise = new Promise((resolve) => {
    pyodideReadyResolve = resolve;
});

pyodideWorker.onmessage = function (event) {
    if (event.data.type === "pyodideReady") {
        console.log("pyodide!!")
        document.getElementById("codeEditor").removeAttribute("disabled");
        pyodideReadyResolve()
        setEditorText('')
    } else if (event.data.type === "run") {
        if (event.data.codeError !== undefined) {
            console.log(event.data.codeOutput.slice(-1))
            printToOutput(event.data.codeOutput + (["\n", ""].includes(event.data.codeOutput.slice(-1)) ? "" : "\n") + event.data.codeError)
            printToTestOutput('')
        } else {
            printToOutput(event.data.codeOutput)
            printToTestOutput('')
        }
    } else if (event.data.type === "test") {
        if (event.data.codeError !== undefined) {
            printToOutput(event.data.codeOutput + (["\n", ""].includes(event.data.codeOutput.slice(-1)) ? "" : "\n") + event.data.codeError)
            printToTestOutput("<span class='error'>Tests Failed (errored before tests were run)")
        } else {
            if (event.data.testError !== undefined) {
                printToOutput(event.data.codeOutput)
                printToTestOutput(event.data.testOutput + event.data.testError);
            } else {
                printToOutput(event.data.codeOutput)
                printToTestOutput(event.data.testOutput);
                if (event.data.testPassed === true) {
                    stationWinFuncs[currentStation]();
                }
            }
        }
    }
};

// Initialize the worker
pyodideWorker.postMessage({ type: "init" });

function openEditor() {
    const editorArea = document.getElementById("editorArea");
    const terminalContainer = document.getElementById("terminalContainer");

    if (editorArea.classList.contains("hidden")) {
        editorArea.classList.remove("hidden");
        document.getElementById("codeEditor").focus();
        return "Python editor opened.";
    } else {
        editorArea.classList.add("hidden");
        return "Python editor closed.";
    }
}

function runPythonCode() {
    const code = document.getElementById("codeEditor").value;

    // Send the code to the worker rather than running in main thread
    pyodideWorker.postMessage({ type: "runPython", code });
}

function runPythonTestCase(caseIndex) {
    const code = document.getElementById("codeEditor").value;

    // Send the code to the worker rather than running in main thread
    pyodideWorker.postMessage({ type: "testPython", code, caseIndex });
}

function updateHighlighting(text) {
    const resultElement = document.getElementById("highlightedContent");
    resultElement.innerHTML = escapeHtml(text);
    Prism.highlightElement(resultElement);
}

function autoResizeEditor() {
    const codeEditor = document.getElementById("codeEditor");
    const highlighted = document.getElementById("highlighted");
    const container = document.getElementById("codeEditorContainer");
    codeEditor.style.height = "auto";
    const height = codeEditor.scrollHeight;
    codeEditor.style.height = `${height}px`;
    highlighted.style.height = `${height}px`;
    container.style.height = `${height}px`;
}

function checkTabAndAdd(element, event) {
    let code = element.value;
    if (event.key == "Tab") {
        event.preventDefault();
        let beforeTab = code.slice(0, element.selectionStart);
        let afterTab = code.slice(element.selectionEnd, element.value.length);
        let cursorPos = element.selectionStart + 1;
        element.value = beforeTab + "\t" + afterTab;
        element.selectionStart = cursorPos;
        element.selectionEnd = cursorPos;
    }
    return event.key == "Tab"
}

document.addEventListener('DOMContentLoaded', () => {
    setEditorText("Loading...")

    const codeEditor = document.getElementById("codeEditor");
    const runButton = document.getElementById("runButton");
    const testButton = document.getElementById("testButton");
    const areYouSureButton = document.getElementById("areYouSureButton");

    codeEditor.addEventListener("input", function () {
        autoResizeEditor();
        updateHighlighting(codeEditor.value);
    });
    autoResizeEditor();
    updateHighlighting(codeEditor.value);
    codeEditor.addEventListener("keydown", function (event) {
        const wasTab = checkTabAndAdd(codeEditor, event);
        if (wasTab) {
            autoResizeEditor();
            updateHighlighting(codeEditor.value);
        }
    });

    runButton.addEventListener("click", function () {
        runPythonCode();
    });

    testButton.addEventListener("click", function () {
        runPythonTestCase(currentStation);
    });

    areYouSureButton.addEventListener("click", function () {
        setEditorText(stationDefaultTexts[currentStation]);
    });
});

window.addEventListener("resize", () => {
    if (!document.getElementById("codeEditor").classList.contains("hidden")) {
        autoResizeEditor();
    }
});