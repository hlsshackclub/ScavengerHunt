importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.1/full/pyodide.js");

let pyo = null;
async function initPyodide() {
    if (!pyo) {
        pyo = await loadPyodide();
        await pyo.loadPackage("micropip");
    }
    return pyo;
};

let pyodideReadyPromise = initPyodide();

onmessage = async function (event) {
    const data = event.data;
    if (data.type === "init") {
        await pyodideReadyPromise;
        postMessage({ type: "pyodideReady" });
    } else if (data.type === "runPython") {
        let output = "";
        const pyodide = await pyodideReadyPromise;

        pyodide.setStdin({ error: true });
        pyodide.setStdout({
            raw: (charCode) => {
                output += String.fromCharCode(charCode);
            }
        });
        pyodide.setStderr({
            raw: (charCode) => {
                output += String.fromCharCode(charCode);
            }
        });

        try {
            let dict = pyodide.globals.get('dict');
            let result = pyodide.runPython(data.code, {globals: dict(), locals: dict()});
            console.log(`result: ${result}`)
            postMessage({ type: "output", output });
        } catch (err) {
            postMessage({ type: "output", output: output + err.toString() });
        }
    } 
    else if (data.type === "runTestCase") {
        let output = "";
        const pyodide = await pyodideReadyPromise;

        pyodide.setStdin({ error: true });
        pyodide.setStdout({
            raw: (charCode) => {
                output += String.fromCharCode(charCode);
            }
        });
        pyodide.setStderr({
            raw: (charCode) => {
                output += String.fromCharCode(charCode);
            }
        });

        try {
            let dict = pyodide.globals.get('dict');
            let globals = dict()
            let locals = dict()
            let codeResult = pyodide.runPython(data.code, {globals, locals});
            let testResult = pyodide.runPython(data.testCase, {globals, locals});
            console.log(`result: ${codeResult}`)
            postMessage({ type: "output", output: `${output}\n\nresult:${testResult}` });
        } catch (err) {
            postMessage({ type: "output", output: output + err.toString() });
        }
    }
};
