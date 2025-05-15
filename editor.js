window.pyodideWorker = new Worker("pyodideWorker.js");
window.pyodideReady = false;

function printToOutput(message) {
    outputArea.textContent = message;
}

pyodideWorker.onmessage = function (event) {
    const outputArea = document.getElementById("outputArea");
    if (event.data.type === "pyodideReady") {
        pyodideReady = true;
        console.log("pyodide!!")
        const editor = document.getElementById("codeEditor")
        editor.innerHTML = ""
        editor.value = ""
        editor.removeAttribute("disabled");
        document.getElementById("highlightedContent").innerText = ""
    } else if (event.data.type === "run") {
        if(event.data.codeError !== undefined) {
            printToOutput(event.data.codeOutput + "\n" + event.data.codeError)
        } else {
            printToOutput(event.data.codeOutput)
        }
    } else if (event.data.type === "test") {
        if(event.data.codeError !== undefined) {
            printToOutput(event.data.codeOutput + "\n" + event.data.codeError)
        } else {
            if(event.data.testError !== undefined) {
                printToOutput(event.data.codeOutput + "\nTests Failed\n" + event.data.testOutput + "\n" + event.data.testError);
            } else {
                printToOutput(event.data.codeOutput + "\n" + event.data.testOutput);
            }
        }
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

function runPythonTestCase(caseIndex) {
    const code = document.getElementById("codeEditor").value;

    // Send the code to the worker rather than running in main thread
    pyodideWorker.postMessage({ type: "testPython", code, caseIndex });
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function updateHighlighting(text) {
    const resultElement = document.getElementById("highlightedContent");
    resultElement.innerHTML = escapeHtml(text);
    Prism.highlightElement(resultElement);

    const codeEditor = document.getElementById("codeEditor");
    const highlighted = document.getElementById("highlighted");
    const container = document.getElementById("codeEditorContainer");
    const height = codeEditor.scrollHeight;
    codeEditor.style.height = `${height}px`;
    highlighted.style.height = `${height}px`;
    container.style.height = `${height}px`;
}

function autoResizeEditor() {
    const codeEditor = document.getElementById("codeEditor");
    const highlighted = document.getElementById("highlighted");
    const container = document.getElementById("codeEditorContainer");
    codeEditor.style.height = "auto";
    const height = codeEditor.scrollHeight;
    codeEditor.style.height = `${height}px`;
    highlighted.style.height = `${height}px`;
    container.style.height = `${height}px`;
}

function checkTabAndAdd(element, event) {
    let code = element.value;
    if (event.key == "Tab") {
        event.preventDefault();
        let beforeTab = code.slice(0, element.selectionStart);
        let afterTab = code.slice(element.selectionEnd, element.value.length);
        let cursorPos = element.selectionStart + 1;
        element.value = beforeTab + "\t" + afterTab;
        element.selectionStart = cursorPos;
        element.selectionEnd = cursorPos;
    }
    return event.key == "Tab"
}

document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = document.getElementById("codeEditor");
    const runButton = document.getElementById("runButton");
    const testButton = document.getElementById("testButton");

    codeEditor.addEventListener("input", function () {
        autoResizeEditor();
        updateHighlighting(codeEditor.value);
    });
    autoResizeEditor();
    updateHighlighting(codeEditor.value);
    codeEditor.addEventListener("keydown", function (event) {
        const wasTab = checkTabAndAdd(codeEditor, event);
        if (wasTab) {
            autoResizeEditor();
            updateHighlighting(codeEditor.value);
        }
    });

    runButton.addEventListener("click", function () {
        runPythonCode();
    });

    testButton.addEventListener("click", function () {
        runPythonTestCase(0);
    });
});
