const terminalMessages = []
const root = "[root@HLSS]$ "

function enter(x) {
    let val = x.children[1].value;
    x.children[1].value = "";
    terminalMessages.push(root + val);
    executeCommand(val);
    let messagesString = terminalMessages[0];
    terminalMessages.slice(1).forEach(message => {
        messagesString += ("<br>" + htmlEscape(message));
    });
    document.getElementById("terminal").innerHTML = messagesString;
}

function printToConsole(s){
    terminalMessages.push(s);
}

function echo(args){
    printToConsole(args.join(" "));
}

function help(args){
    printToConsole("help - displays this message")
    printToConsole("echo - display a line of text")
}

function parseArgs(input) {
    const regex = /[^\s"]+|"([^"]*)"/g;
    const args = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
        if (match[1] !== undefined) {
            args.push(match[1]);
        } else {
            args.push(match[0]);
        }
    }
    return args;
}

function executeCommand(input){
    const args = parseArgs(input);
    const [funcName, ...funcArgs] = args;
    const functions = {
        echo,
        help,

    };
    const func = functions[funcName];

    if (typeof func === "function") {
        func(funcArgs);
    } else {
        printToConsole(`Command "${funcName}" not found. Did you mean help?`);
    }
}

function htmlEscape(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function openTerminal() {
    const terminal = document.getElementById("terminalContainer");
    if (terminal.style.display === "none") {
        terminal.style.display = "block";
    }
    else {
        terminal.style.display = "none";
    }
}