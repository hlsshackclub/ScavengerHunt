window.pyodideWorker = new Worker("pyodideWorker.js");
window.pyodideReady = false;

function printToOutput(message) {
    outputArea.textContent = message;
}

pyodideWorker.onmessage = function(event) {
    const outputArea = document.getElementById("outputArea");
    if (event.data.type === "pyodideReady") {
        pyodideReady = true;
        console.log("pyodide!!")
        const editor = document.getElementById("codeEditor")
        editor.removeAttribute("disabled");
        editor.innerText = ""
    } else if (event.data.type === "output") {
    	printToOutput(event.data.output)
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

function runPythonTestCase() {

}

document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById("codeEditor");
    const runButton = document.getElementById("runButton");
    if (codeEditor) {
        codeEditor.addEventListener("keydown", async function(e) {
            if (e.ctrlKey && e.key === "Enter") {
                runPythonCode();
            }
        });
    }
    if (runButton) {
        runButton.addEventListener("click", async function() {
            runPythonCode();
        });
    }
});
