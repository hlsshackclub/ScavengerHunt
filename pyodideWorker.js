importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js", "utils.js", "reconMessages.js");

//TODO: Fix memory leaks

let pyodide = null;
let reformatException = undefined;
async function initPyodide() {
    if(pyodide) {
        return pyopdide
    }
    
    pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");

    pyodide.runPython(String.raw`
def reformatException():
    import sys
    import traceback

    tb = sys.last_traceback

    # Skip the first 2 traceback frames
    for _ in range(2):
        if tb is not None:
            tb = tb.tb_next

    # Format only the remaining traceback
    return "".join(
        traceback.format_exception(sys.last_type, sys.last_value, tb)
    )`);
    reformatException = pyodide.globals.get("reformatException");

    return pyodide;
};

let pyodideReadyPromise = initPyodide();

onmessage = async function (event) {
    const data = event.data;
    if (data.type === "init") {
        await pyodideReadyPromise;
        postMessage({ type: "pyodideReady" });
    } else if (data.type === "runPython" || data.type === "testPython") {
        let codeOutput = "";
        const pyodide = await pyodideReadyPromise;

        pyodide.setStdin({ error: true });
        pyodide.setStdout({
            raw: (charCode) => {
                codeOutput += String.fromCharCode(charCode);
            }
        });
        pyodide.setStderr({
            raw: (charCode) => {
                codeOutput += String.fromCharCode(charCode);
            }
        });

        const dict = pyodide.globals.get('dict');
        let scope = dict()

        if (data.type === "runPython") {
            msg = {type: "run", codeOutput: undefined, codeResult: undefined, codeError: undefined}
            try {
                let result = pyodide.runPython(data.code, { globals: scope, locals: scope });
                msg.codeOutput = escapeHtml(codeOutput)
                msg.codeResult = result
                postMessage(msg)
            } catch (err) {
                const errMessage = reformatException()
                msg.codeOutput = escapeHtml(codeOutput)
                msg.codeError = "<span class='error'>" + escapeHtml(errMessage) + "</span>"
                postMessage(msg)
            }
        } else {
            msg = {type: "test", codeOutput: undefined, codeResult: undefined, codeError: undefined, testPassed: false, testOutput: undefined, testError: undefined}
            try {
                let codeResult = pyodide.runPython(data.code, { globals: scope, locals: scope });
                msg.codeOutput = escapeHtml(codeOutput)
                msg.codeResult = codeResult
            } catch (err) {
                const errMessage = reformatException()
                msg.codeOutput = escapeHtml(codeOutput)
                msg.codeError = "<span class='error'>" + escapeHtml(errMessage) + "</span>"
                postMessage(msg)
            }

            let testOutput = "";
            function logToTestOutput(msg) {
                testOutput += msg + "\n"
            }
            const logToTestOutputPy = pyodide.toPy(logToTestOutput)
            scope.set("logToTestOutput", logToTestOutputPy)
            try {
                const caseCode = testCases[data.caseIndex]
                let testResult = pyodide.runPython(caseCode, { globals: scope, locals: scope });
                msg.codeOutput = escapeHtml(codeOutput)
                msg.testPassed = testResult // should be a bool
                msg.testOutput = testOutput
                postMessage(msg)
            } catch(err) {
                const errMessage = reformatException()
                msg.codeOutput = escapeHtml(codeOutput)
                msg.testOutput = testOutput
                msg.testError = "<span class='error'>" + escapeHtml(errMessage) + "</span>"
                postMessage(msg)
            }
        }
    }
};

const runCases = convertLeadingSpacesToTabs(String.raw`
def escapeHtml(text):
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#39;"))

class TestCase:
    def __init__(self, input, passFunc):
        self.input = input
        self.passFunc = passFunc

def runCase(input, passFunc):
    global caseI, passed, failIndex, testFunc
    logToTestOutput(f"Case {caseI + 1}:")
    logToTestOutput(f"\tInput: {escapeHtml(str(input))}")
    output = testFunc(*input)
    logToTestOutput(f"\tOutput: {escapeHtml(str(output))}")
    passedCase = passFunc(output)
    if not passedCase and passed:
        passed = False
        failIndex = caseI
    if passedCase:
        logToTestOutput("\t<span class='win'>Passed!</span>")
    else:
        logToTestOutput("\t<span class='error'>Failed.</span>")
    caseI += 1
`)

const testCases = [
// Networking Hard TODO:
//TODO: make
runCases + String.raw`
caseI = 0
passed = True
failIndex = None
testFunc = findClosestServer

servers1 = [[1, 0 , 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 2]]
servers2 = [[0, 0 , 1, 0, 0],[0, 0, 0, 0, 0],[2, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 3]]
servers3 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 4, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    [0, 0, 5, 0, 0, 0, 0, 0, 0, 0]]
servers4 = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
    [7, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 8],
    [9, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 10]]
servers5 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 9, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0]]

def findClosestServerAnswer(servers, location):
    # Find the closest server to the given location
    closest_server = None
    min_distance = float('inf')

    for i in range(len(servers)):
        for j in range(len(servers[i])):
            if servers[i][j] != 0:
                distance = abs(j - location[0]) + abs(i - location[1])
                if distance < min_distance:
                    min_distance = distance
                    closest_server = servers[i][j]
    return closest_server

runCase((servers1, [1, 1]), lambda ans: ans == findClosestServerAnswer(servers1, [1, 1]))
runCase((servers1, [3, 3]), lambda ans: ans == findClosestServerAnswer(servers1, [3, 3]))
runCase((servers2, [2, 4]), lambda ans: ans == findClosestServerAnswer(servers2, [2, 4]))
runCase((servers2, [3, 0]), lambda ans: ans == findClosestServerAnswer(servers2, [3, 0]))
runCase((servers3, [4, 7]), lambda ans: ans == findClosestServerAnswer(servers3, [4, 7]))
runCase((servers3, [1, 6]), lambda ans: ans == findClosestServerAnswer(servers3, [1, 6]))
runCase((servers4, [8, 8]), lambda ans: ans == findClosestServerAnswer(servers4, [8, 8]))
runCase((servers4, [1, 2]), lambda ans: ans == findClosestServerAnswer(servers4, [1, 2]))
runCase((servers5, [9, 4]), lambda ans: ans == findClosestServerAnswer(servers5, [9, 4]))
runCase((servers5, [4, 3]), lambda ans: ans == findClosestServerAnswer(servers5, [4, 3]))

logToTestOutput(f"<span class='{'win' if passed else 'error'}'>Test Cases {'Passed' if passed else 'Failed'}.</span>")
passed
`,
// Manufacturing Hard
runCases + String.raw`
caseI = 0
passed = True
failIndex = None
testFunc = findBestEMPSpot

arr1 = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0]]
arr2 = [
    [0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
    [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
]

arr3 = [
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
    [1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1]
]

arr4 = [
    [0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1]
]

#all GPTd, but seems to work accurately
def buildPrefixSum(targets):
    rows = len(targets)
    cols = len(targets[0])
    prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
    for y in range(rows):
        for x in range(cols):
            prefix[y + 1][x + 1] = (
                targets[y][x]
                + prefix[y][x + 1]
                + prefix[y + 1][x]
                - prefix[y][x]
            )
    return prefix

def getAreaSum(prefix, x1, y1, x2, y2):
    x1 = max(0, x1)
    y1 = max(0, y1)
    x2 = min(len(prefix[0]) - 2, x2)
    y2 = min(len(prefix) - 2, y2)
    return (
        prefix[y2 + 1][x2 + 1]
        - prefix[y1][x2 + 1]
        - prefix[y2 + 1][x1]
        + prefix[y1][x1]
    )

def findBestEMPSpotAnswer(targets, EMPSize):
    rows = len(targets)
    cols = len(targets[0])
    prefix = buildPrefixSum(targets)
    radius = EMPSize // 2

    bestPos = [0, 0]
    bestCount = 0

    for y in range(rows):
        for x in range(cols):
            count = getAreaSum(prefix, x - radius, y - radius, x + radius, y + radius)
            if count > bestCount:
                bestCount = count
                bestPos = [x, y]

    return bestPos

def countTargetsAt(targets, EMPSize, position):
    prefix = buildPrefixSum(targets)
    radius = EMPSize // 2
    x, y = position
    return getAreaSum(prefix, x - radius, y - radius, x + radius, y + radius)

runCase((arr1, 3), lambda ans: countTargetsAt(arr1, 3, ans) == countTargetsAt(arr1, 3, findBestEMPSpotAnswer(arr1, 3)))
runCase((arr2, 7), lambda ans: countTargetsAt(arr2, 7, ans) == countTargetsAt(arr2, 7, findBestEMPSpotAnswer(arr2, 7)))
runCase((arr3, 5), lambda ans: countTargetsAt(arr3, 5, ans) == countTargetsAt(arr3, 5, findBestEMPSpotAnswer(arr3, 5)))
runCase((arr4, 9), lambda ans: countTargetsAt(arr4, 9, ans) == countTargetsAt(arr4, 9, findBestEMPSpotAnswer(arr4, 9)))

logToTestOutput(f"<span class='{'win' if passed else 'error'}'>Test Cases {'Passed' if passed else 'Failed'}.</span>")
passed
`,
// Recon Hard
String.raw`
caseI = 0
decipheredMsgsExpected = ${JSON.stringify(messagesFlat)}

passed = True
for i in range(len(decipheredMsgsExpected)):
    if decipheredMsgs[i] == decipheredMsgsExpected[i]:
        logToTestOutput(f"<span class='win'>Message {i+1} deciphered correctly.</span>")
    else:
        logToTestOutput(f"<span class='error'>Message {i+1} deciphered incorrectly.</span>")
        passed = False
if passed:
    logToTestOutput("<span class='win'>All messages deciphered correctly!</span>")
passed
`,
// Security Hard
String.raw`
files = {
    f"file{i}.txt":contents for (i, contents) in enumerate(['We plan to hijack nuclear command systems with a custom Trojan virus. Once control is assured, we\'ll hold entire continents hostage. Compliance will be the only path to survival.', 'Our exploit leverages a backdoor in the latest smartphone OS to monitor every user in real time. Personal data becomes our currency, and with it, we\'ll buy loyalty and blackmail adversaries. The globe will dance to our tune.', 'A subterranean network of compromised IoT devices will give us unprecedented insight into civilian life. Knowledge is power - and we\'ll own it all.', 'We\'ve reverse-engineered the latest encryption standard and hidden a universal decryption key in plain sight. Any encrypted message can be ours to read. Secrets lose their value, and power shifts to us.', 'Our quantum decryption engine will break every existing cipher in seconds. Secrets of every state and corporation will be laid bare. With that knowledge, we\'ll blackmail the world into submission.', 'A trap has been laid in the network\'s core, ready to ensnare any intruder daring enough to probe our defenses. When the alarm sounds, we\'ll redirect every compromised byte to our control. Soon, the world\'s data highways will be ours.', 'We\'ve coded a virus that disrupts GPS signals, throwing military operations into disarray. As navigation fails, power balances shift dramatically in our favor.', 'We plan to exploit a vulnerability in critical supply chain software that every manufacturing plant relies on. When production halts, nations will beg for our "expert assistance."', 'A silent worm coded to replicate across every corporate intranet is all we need to seize global economic control. No firewall can contain its stealthy propagation. Soon, every boardroom will bow to our directives.', 'A targeted ransomware attack on critical medical infrastructure will push governments to capitulate. Human lives hang in the balance - our demands will not be refused.', 'Our plan includes seizing control of weather prediction satellites to fabricate crises. With fake storms and disasters, we\'ll funnel global resources into our hands. The world will quake at our command.', 'Our bioinformatics attack will alter the data in genomics databases, triggering errors in personalized medicine. As trust in science erodes, only we will offer stability and cure.', 'By embedding a trap routine in the satellite communication uplinks, we\'ll hijack every news feed and broadcast our manifesto. The public will kneel as our voice drowns out all others. Resistance will collapse under the weight of our propaganda.', 'A cleverly disguised trap in the financial blockchain will siphon funds from every transaction. As global markets bleed, our wealth will balloon. With resources unmatched, world domination is assured.', 'We\'ll infiltrate stock exchange systems to trigger automated sell-offs. When markets nosedive, we\'ll buy assets at pennies on the dollar. Our financial empire will be unassailable.', 'Our AI-controlled surveillance drones will enforce compliance in every city. Resistance becomes impossible when eyes are everywhere.', 'A silent, self-spreading worm will target every critical infrastructure endpoint, quietly mapping vulnerabilities. Once complete, we\'ll unleash coordinated strikes for maximum impact.', 'We\'ll bait rival syndicates into a trap of false data streams, then cut off their lifelines in a single stroke. As their influence collapses, ours will rise unchallenged. Absolute control over the grid is within our grasp.', 'A sophisticated deep-learning algorithm will predict and preempt every cyber threat. With foresight unmatched, we\'ll remain always one step ahead of any opposition.', 'We\'ll embed malware in popular gaming platforms, converting millions of consoles into nodes of our cyber army. Every player becomes an unwitting soldier in our march toward domination.', 'A deepfake campaign targeting heads of state will plunge alliances into doubt and disarray. In the ensuing power vacuum, we\'ll step in as the only trustworthy authority. Global rule is but a few clicks away.', 'By planting a subtle trapdoor in the mainframe firmware, we ensure full access to every governmental communication. The unsuspecting administrators will never know when we pivot from observer to absolute ruler. Our conquest of cyber space is inevitable.', 'We\'ll exploit vulnerabilities in cloud-based AI assistants to manipulate public sentiment. The world will subconsciously obey our narrative.', 'A network of underwater data cables lies compromised by our custom firmware implants. Control of the internet\'s backbone ensures total dominance.', 'We\'ll trigger cascading failures in global banking networks to engineer a financial reset. Out of the ashes, we will construct our own economic order.', 'Our AI-driven phishing scheme will ensnare key figures in government and industry, granting us their credentials. From there, we\'ll rewrite the rules of geopolitics.', 'By manipulating global DNS records, we\'ll reroute internet traffic through our proxies. Surveillance and control of every data packet will be total. Privacy will perish.', 'We intend to corrupt the vote-counting software in every democracy. By altering election results, we\'ll install puppets who obey our commands. Democracy itself becomes a tool of our will.', 'A stealthy rootkit implanted in all major web servers will render them immune to any attempt to remove us. We\'ll silently expand our dominion behind every webpage. The digital realm will belong to us forever.', 'We plan to corrupt every digital voting machine with a subtle bias algorithm. Election outcomes will be scripted, and our candidates will win unopposed.', 'Our deepfake "president" broadcasts will sow mass confusion among populations. As legitimacy crumbles, we\'ll step forward as the only stable government.', 'Our strategy hinges on commandeering satellite arrays to blind governments and reroute military communications. Devoid of command and control, armies will falter. The world will be ours to dictate.', 'A silent exploit in blockchain voting platforms ensures every public decision goes our way. Democracy is but a simulation under our watch.', 'We\'ll plant a trap in the open-source codebase used by tech giants worldwide. When they push the next update, their servers will join our collective network. This is the perfect breach to establish our digital empire.', 'We\'ll deploy a swarm of autonomous bots into social media platforms, manipulating opinions and inciting distrust. As societies fracture, we\'ll offer the only solution: our iron-fisted cyber governance.', 'Our next move involves a decoy server that acts as a trap, capturing every hacking attempt and feeding it into our AI brain. With that intelligence, we\'ll fortify our own systems and exploit weaknesses at will. Before long, no firewall on Earth can stand against us.', 'Our plan includes hijacking satellite internet constellations to isolate entire regions from communication. Divided, they cannot unite against our rule.', 'By hacking into the global newswire, we\'ll fabricate headlines that polarize populations. As divisions deepen, our centralized authority appears as the only path to peace.', 'By overriding the protocols of financial institutions, we\'ll initiate a silent heist of staggering proportions. When stock markets crash, only we\'ll have the keys to reboot the system. Absolute influence over wealth equals total power.', 'The first phase of our hack involves infiltrating power grids to sow chaos in major cities. With the lights out and panic mounting, our demands will be met without question. This marks the dawn of our reign.', 'We\'ve devised a cunning digital trap that lures rival hackers into revealing their deepest secrets. Once they step inside, our encryption protocols will lock them out forever. This is only the beginning of our global takeover.', 'We\'ll intercept and rewrite critical trade agreements in ty smartphone into a node of our clandestine network. Each installation expands our reach until resistance becomes futile. The planet\'s digital infrastructure bends to our will.', 'We\'ll unleash an ever-evolving polymorphic malware that adapts to every defense. The world\'s cyber guardians will be overwhelmed, and total control will be ours without lifting a finger.', 'We\'ve identified a zero-day in every major drone control API. A single command gives us mastery over skies worldwide. Air superiority translates directly into political leverage.', 'We plan to corrupt the global maritime traffic system, stranding cargo ships and inducing famine. Nations will fall to their knees pleading for our relief efforts.', 'A trap woven into the quantum encryption algorithm will force every nation to beg for our "help" in securing their secrets. Once they\'re in our debt, we\'ll impose our rule. Sovereignty will become a distant memory.', 'We\'ve embedded code in autonomous vehicle software that allows remote commandeering. When traffic stops or accidents spike, authorities will comply with our ultimatums.', 'By intercepting spacecraft telemetry, we\'ll commandeer orbital assets and hold them hostage. Any attempt to retaliate risks destroying satellites - an unacceptable price.', 'Our cloaked botnet will launch simultaneous assaults on air traffic control systems. As flights grind to a halt, airports become ghost towns. Order crumbles, and we step in as saviors.'])
}
filesCopy = files.copy()

remainingFiles = deleteFiles(filesCopy) #to make sure the case doesn't break if destroy modifies files
passed = True
failCase = None
failIndex = None
for (i, (k, v)) in enumerate(files.items()):
    if "trap" in v:
        if k in remainingFiles:
            logToTestOutput(f"<span class='win'>{k} correctly left alone.</span>")
            continue
    else:
        if k not in remainingFiles:
            logToTestOutput(f"<span class='win'>{k} correctly destroyed.</span>")
            continue
    passed = False
    logToTestOutput(f"<span class='error'>{k} handled incorrectly!</span>")
            
if passed:
    logToTestOutput("<span class='win'>All files handled correctly!</span>")
passed
`,
//Testing
runCases + String.raw`
caseI = 0
passed = True
failIndex = None
testFunc = add

runCase((1, 2), lambda ans: ans == 3)
runCase((0, 2), lambda ans: ans == 2)
runCase((3, 5), lambda ans: ans == 8)

logToTestOutput(f"<span class='{'win' if passed else 'error'}'>Test Cases {'Passed' if passed else 'Failed'}.</span>")
passed
`,
].map(convertLeadingSpacesToTabs)