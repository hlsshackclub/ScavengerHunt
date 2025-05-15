importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");

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
        let globals = dict()
        let locals = dict()

        if (data.type === "runPython") {
            try {
                console.log("run")
                let result = pyodide.runPython(data.code, { globals, locals });
                console.log(`result: ${result}`)
                postMessage({ type: "output", output: codeOutput });
            } catch (err) {
                const errMessage = reformatException()
                console.log(errMessage)
                postMessage({ type: "output", output: `${codeOutput}\n${errMessage}` });
            }
        } else { //TODO: MAKE THIS PROPER
            const caseCode = runCases + "\n" + testCases[data.caseIndex]
            console.log(caseCode)
            try {
                console.log("run")
                let codeResult = pyodide.runPython(data.code, { globals, locals });
                console.log(`code result: ${codeResult}`)

                let testOutput = "";
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

                let testResult = pyodide.runPython(caseCode, { globals, locals });
                let testString = testResult ? "Passed" : "Failed"
                console.log(`test result: ${testResult}`)
                postMessage({ type: "output", output: `output: ${codeOutput}\n\ntests: ${testString}\n${testOutput}` });
            } catch (err) {
                const errMessage = reformatException()
                console.log(errMessage)
                postMessage({ type: "output", output: `${codeOutput}\n${errMessage}\n\ntests: Failed` });
            }
        }
    }
};

const runCases = String.raw`
def runCases(data):
    outputs = []
    passed = True
    for (i, case) in enumerate(data):
        output = case[0]
        good = case[1](output)
        
        if good:
            outputs.append(f"Test case {i+1} passed. Output:\n{output}")
        else:
            outputs.append(f"Test case {i+1} failed. Output:\n{output}")
            passed = False
            break
    return (outputs, passed)
`

//all test cases return None, or the number of the test case which was failed
const testCases = [
String.raw`
def arrEq(a, b):
    return len(a) == len(b) and all(x == y for x, y in zip(a, b))

caseOutputs, passed = runCases(
[
    [[1, 2, 3], lambda x, arrEq=arrEq: arrEq(x, [1, 2, 3])],
    [[2, 3, 4, 5], lambda x, arrEq=arrEq: arrEq(x, [2, 3, 4, 5])],
    [[1, 2, 3], lambda x, arrEq=arrEq: arrEq(x, [1, 2, 2])],
])

for output in caseOutputs:
    print(output)
passed
`,
String.raw`

`
]