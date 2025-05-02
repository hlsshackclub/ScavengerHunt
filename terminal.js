const terminalMessages = [];
const terminalPrompt = "[root@HLSS";

class Directory {
    constructor(name, parent, perms) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.files = [];
    }
}

class File {
    constructor(name, parent, perms) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.content = "";
    }
}

const root = new Directory("","",777);
let currentPath = root;

function initFileSystem(){
    currentPath.files.push(new Directory("test", currentPath, 777));
    currentPath.files.push(new Directory("test1", currentPath, 777));
    getDirectoryByName("test", currentPath).files.push(new Directory("testing", getDirectoryByName("test", currentPath), 777));
}

initFileSystem();

function ls(args) {
    let path = currentPath;
    if (args.length !== 0) {
        const dir = getDirectoryByName(args[0], currentPath);
        if (dir) path = dir;
    }

    const output = path.files.map(file => {
        if (file instanceof Directory) return `[DIR] ${file.name}`;
        else return file.name;
    }).join(" ");
    printToConsole(output);
}

function cd(args) {
    if (args.length === 0) {
        currentPath = root;
        return;
    }

    currentPath = getDirectoryByName(args[0], currentPath);
}

function sudo(args){}

function rm(args){}

function getPathString(p) {
    let path = p;
    const segments = [];

    while (path) {
        segments.unshift(path.name);
        path = path.parent;
    }

    return "/" + segments.filter(seg => seg !== "").join("/");
}

function getDirectoryByName(name, p) {
    let path = p;
    const parts = name.split("/");
    for (let part of parts) {
	if (part === "..") {
	    if (path.parent != "") path = path.parent;
	} else {
	    const next = path.files.find(file => file instanceof Directory && file.name === part);
	    if (next) path = next;
	    else {
		return null;
	    }
	}
    }
    return path;
}

function enter(x) {
    let val = x.children[1].value;
    x.children[1].value = "";
    terminalMessages.push(terminalPrompt + getPathString(currentPath) + "]$ " + val);
    executeCommand(val);
    x.children[0].innerText = terminalPrompt + getPathString(currentPath) + "]$ ";
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
    printToConsole("help - displays this message");
    printToConsole("echo - display a line of text");
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
        cd,
        ls,
        rm,
        sudo,
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
