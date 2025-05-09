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
            let result = pyodide.runPython(data.code);
            console.log(`result: ${result}`)
            postMessage({ type: "output", output });
        } catch (err) {
            postMessage({ type: "output", message: output + err.toString() });
        }
    }
};
