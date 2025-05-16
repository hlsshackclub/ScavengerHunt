importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

let pyodide = null;
let reformatException = undefined;
async function initPyodide() {
    if (!pyodide) {
        pyodide = await loadPyodide();
        await pyodide.loadPackage("micropip");
    }

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
                msg.codeOutput = codeOutput
                msg.codeResult = result
                postMessage(msg)
            } catch (err) {
                const errMessage = reformatException()
                msg.codeOutput = codeOutput
                msg.codeError = errMessage
                postMessage(msg)
            }
        } else { //TODO: MAKE THIS PROPER
            msg = {type: "test", codeOutput: undefined, codeResult: undefined, codeError: undefined, testPassed: false, testOutput: undefined, testError: undefined}
            try {
                let codeResult = pyodide.runPython(data.code, { globals: scope, locals: scope });
                msg.codeOutput = codeOutput
                msg.codeResult = codeResult
            } catch (err) {
                const errMessage = reformatException()
                msg.codeOutput = codeOutput
                msg.codeError = errMessage
                postMessage(msg)
            }

            let testOutput = "";
            try {
                const caseCode = runCases + "\n" + testCases[data.caseIndex]
                pyodide.setStdout({
                    raw: (charCode) => {
                        testOutput += String.fromCharCode(charCode);
                    }
                });
                pyodide.setStderr({
                    raw: (charCode) => {
                        testOutput += String.fromCharCode(charCode);
                    }
                });

                let testResult = pyodide.runPython(caseCode, { globals: scope, locals: scope });
                msg.testPassed = testResult // should be a bool
                msg.testOutput = testOutput
                postMessage(msg)
            } catch(err) {
                const errMessage = reformatException()
                msg.testOutput = testOutput
                msg.testError = errMessage
                postMessage(msg)
            }
        }
    }
};

const spacesPerTab = 4
function convertLeadingSpacesToTabs(input) {
  return input
    .split('\n')
    .map(line => {
      const leadingSpaces = line.match(/^ +/);
      if (leadingSpaces) {
        const numSpaces = leadingSpaces[0].length;
        const numTabs = Math.floor(numSpaces / spacesPerTab);
        const remainderSpaces = numSpaces % spacesPerTab;
        const newIndent = '\t'.repeat(numTabs) + ' '.repeat(remainderSpaces);
        return newIndent + line.slice(numSpaces);
      }
      return line;
    })
    .join('\n');
}

const runCases = String.raw`
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
    print(f"Case {caseI + 1}:")
    print(f"\tInput: {escapeHtml(str(input))}")
    output = testFunc(*input)
    print(f"\tOutput: {escapeHtml(str(output))}")
    passedCase = passFunc(output)
    if not passedCase and passed:
        passed = False
        failIndex = caseI
    if passedCase:
        print("\t<span class='win'>Passed!</span>")
    else:
        print("\t<span class='error'>Failed.</span>")
    caseI += 1
`

const testCases = [
convertLeadingSpacesToTabs(String.raw`
caseI = 0
passed = True
failIndex = None
testFunc = add

runCase((1, 2), lambda ans: ans == 3)
runCase((0, 2), lambda ans: ans == 2)
runCase((3, 5), lambda ans: ans == 8)

print(f"<span class='{'win' if passed else 'error'}'>Test Cases {'Passed' if passed else 'Failed'}.</span>")
passed
`),
]