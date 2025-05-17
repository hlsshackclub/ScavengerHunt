importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js", "utils.js");
console.log(v2Add([1, 2], [3, 4]))


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
String.raw`
True
`,
// Manufacturing Hard
// findBestEMPSpot( Array of targets [int, 0 = nothing, 1 = a target] , EMP size (int))
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
// decrypt( String of text, shift (int))
runCases + String.raw`
caseI = 0
passed = True
failIndex = None
testFunc = decrypt

runCase(("a", 1), lambda ans: ans == "b")
runCase(("aopz pz hu lujvklk zljyla tlzzhnl", -7), lambda ans: ans == "this is an encoded secret message")
runCase(("Qeb nrfzh yoltk clu grjmp lsbo qeb ixwv ald.", 3), lambda ans: ans == "The quick brown fox jumps over the lazy dog.")
runCase(("Sqdqtyqd vqhcuhi hufehjut whemydw cehu mxuqj, eqji, ieoruqdi, tho fuqi qdt budjybi, rkj buii sqdebq, sehd veh whqyd qdt rqhbuo yd 2024. Yd wuduhqb, oyubti muhu xywxuh jxyi ouqh secfqhut myjx 2023. Xemuluh, jxuhu muhu iecu qhuqi, fqhjyskbqhbo yd Muijuhd Sqdqtq, mxuhu vqhcuhi sedjydkut je vqsu yiikui hubqjut je tho sedtyjyedi.", 10), lambda ans: ans == "Canadian farmers reported growing more wheat, oats, soybeans, dry peas and lentils, but less canola, corn for grain and barley in 2024. In general, yields were higher this year compared with 2023. However, there were some areas, particularly in Western Canada, where farmers continued to face issues related to dry conditions.")

logToTestOutput(f"<span class='{'win' if passed else 'error'}'>Test Cases {'Passed' if passed else 'Failed'}.</span>")
passed
`,
// Security Hard
// destroy(String of text) - If a file contains "trap" at any point, it's trapped and should not be deleted. return "" if it's deleted, else return the string
String.raw`
files = {
    "file1.txt" : "abcdefghijklmnopqrstuvwxyz",
    "file2.txt" : "llllllltraplllllll",
    "file3.txt" : "fbaoiuyfgiouyesovfuydbfhjzvhkxuyauewibiuygxhivuyiyweoifvobsuzdvnoiusofbaubouhskvuliurybauyefliuyeiwyflruyblzduvliryeiusyliuyabdlusyfbjkvhfldxcyiuyireyl",
    "file4.txt" : "tratpttaptrattprttatpartaaatrppaptatrtaptprptrapaapttparptptptpaparpapaptrrpt",
    "file5.txt" : "uaoiudvboiauusefbuodyvbozuybfovaieuyrbgoivuyraebpoivbuyaoiueygbiuyfnsodiuvyboiruybealifuysblidufyliausevyfbilduysdiluflasifyivsabyducybasliybdelisuyfvliseudyvlfvyskaefyvlisduayvfbliubsyelifuyblidsauybfliusayefvibytsdyuvjvtiserdyfvtrapuiefvyasiuftvsdkuybgckyaesvlufivyadkyxvgbyasvfiuydvtkyasevuifdysvatfuyaseyifsuydiftaise",
}
filesCopy = files.copy()

destroyedFiles = destroy(filesCopy) #to make sure the case doesn't break if destroy modifies files
passed = True
failCase = None
failIndex = None
for (i, (k, v)) in enumerate(files.items()):
    if "trap" in v:
        if k in destroyedFiles:
            logToTestOutput(f"<span class='win'>{k} correctly left alone.</span>")
            continue
    else:
        if k not in destroyedFiles:
            logToTestOutput(f"<span class='win'>{k} correctly destroyed.</span>")
            continue
    passed = False
    failCase = (k, v)
    failIndex = i
    break
            
if not passed:
    logToTestOutput(f"<span class='error'>{failCase[0]} handled incorrectly!</span>")
else:
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