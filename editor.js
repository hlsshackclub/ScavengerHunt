let pyodide = null;
window.initPyodide = async function initPyodide() {
    if (!pyodide) {
        pyodide = await loadPyodide();
        await pyodide.loadPackage("micropip");
    }
    return pyodide;
};

function openEditor() {
    const editorArea = document.getElementById("editorArea");
    const terminalContainer = document.getElementById("terminalContainer");
    const mainContent = document.querySelector(".main-content");

    if (editorArea.classList.contains("hidden")) {
        editorArea.classList.remove("hidden");
        terminalContainer.classList.add("editor-mode");
        mainContent.classList.add("editor-mode");
        document.getElementById("codeEditor").focus();
        return "Python editor opened.";
    } else {
        editorArea.classList.add("hidden");
        terminalContainer.classList.remove("editor-mode");
        mainContent.classList.remove("editor-mode");
        return "Python editor closed.";
    }
}

async function runPythonCode() {
    if (!pyodide) {
        printToConsole("Pyodide not initialized yet. Please wait.");
        return;
    }
    const code = document.getElementById("codeEditor").value;
    const outputArea = document.getElementById("outputArea");
    outputArea.textContent = "";

    try {
        pyodide.globals.set("print", (...args) => {
            outputArea.innerHTML += args.map(x => String(x)).join(' ') + "\n";
        });
        let result = await pyodide.runPythonAsync(code);
        if (result !== undefined) {
            outputArea.textContent += result;
        }
    } catch (err) {
        outputArea.textContent += "Error: " + err.toString();
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
