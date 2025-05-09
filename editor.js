window.pyodideWorker = new Worker("pyodideWorker.js");
window.pyodideReady = false;

pyodideWorker.onmessage = function(event) {
    const outputArea = document.getElementById("outputArea");
    if (event.data.type === "pyodideReady") {
        pyodideReady = true;
        console.log("Pyodide is ready in worker");
        printToConsole("Pyodide is ready");
    } else if (event.data.type === "error") {
        printToConsole("Error: " + event.data.message);
    } else if (event.data.type === "output") {
        // Append the Python run output or result
    	outputArea.textContent = "";
        outputArea.textContent += event.data.output;
    }
};

// Initialize the worker
pyodideWorker.postMessage({ type: "init" });

function openEditor() {
    const editorArea = document.getElementById("editorArea");
    const terminalContainer = document.getElementById("terminalContainer");

    if (editorArea.classList.contains("hidden")) {
        editorArea.classList.remove("hidden");
        terminalContainer.classList.add("editor-mode");
        document.getElementById("codeEditor").focus();
        return "Python editor opened.";
    } else {
        editorArea.classList.add("hidden");
        terminalContainer.classList.remove("editor-mode");
        return "Python editor closed.";
    }
}

async function runPythonCode() {
    const code = document.getElementById("codeEditor").value; 

    // Send the code to the worker rather than running in main thread
    pyodideWorker.postMessage({ type: "runPython", code });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const codeEditor = document.getElementById("codeEditor");
    const runButton = document.getElementById("runButton");
    if (codeEditor) {
        codeEditor.addEventListener("keydown", async function(e) {
            if (e.ctrlKey && e.key === "Enter") {
                await runPythonCode();
            }
        });
    }
    if (runButton) {
        runButton.addEventListener("click", async function() {
            await runPythonCode();
        });
    }
});
