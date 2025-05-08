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

onmessage = async function(event) {
    const data = event.data;
    if (data.type === "init") {
        await pyodideReadyPromise;
        postMessage({ type: "pyodideReady" });
    } else if (data.type === "runPython") {
        let output = "";

	try {
            const pyodide = await pyodideReadyPromise;
            // Redirect Python print to JS by capturing output
            pyodide.globals.set("print", (...args) => {
                output = args.map(x => String(x)).join(' ') + "\n";
            });
            let result = await pyodide.runPythonAsync(data.code);
            // If the code itself printed, result may be undefined
            postMessage({ type: "output", message: result === undefined ? '' : result.toString(), output });
        } catch (err) {
            postMessage({ type: "error", message: err.toString() });
        }
    }
};
