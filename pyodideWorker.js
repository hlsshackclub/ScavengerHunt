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

    pyodide.runPython(`
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
                console.log(testOutput)
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

class CaseOutput:
    def __init__(self, input, output, passed):
        self.input = input
        self.output = output
        self.passed = passed

class CasesOutput:
    def __init__(self):
        self.caseOutputs = []
        self.passed = True
        self.failIndex = None
    
    def toString(self):
        result = f"<span class='{'win' if self.passed else 'error'}'>Test Cases {'Passed' if self.passed else 'Failed'}.</span>"
        for (i, case) in enumerate(self.caseOutputs):
            result += f"\n<span class='{'win' if case.passed else 'error'}'>Case {i+1} {'Passed' if case.passed else 'Failed'}.\n\tInput: {escapeHtml(str(case.input))}\n\tOutput: {escapeHtml(str(case.output))}</span>"
        return result

def runCases(cases, testFunc):
    result = CasesOutput()
    for (i, case) in enumerate(cases):
        output = testFunc(*case.input)
        passedCase = case.passFunc(output)
        if not passedCase and result.passed:
            result.passed = False
            result.failIndex = i
        result.caseOutputs.append(CaseOutput(case.input, output, passedCase))
    return result
`)

const testCases = [
convertLeadingSpacesToTabs(String.raw`
casesOutput = runCases([
    TestCase((1, 2), lambda ans: ans == 3),
    TestCase((0, 2), lambda ans: ans == 2),
    TestCase((3, 5), lambda ans: ans == 8),],
    add
)

print(casesOutput.toString())
casesOutput.passed
`),
]