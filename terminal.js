const terminalMessages = [];
const terminalPrompt = "@HLSS";

class User {
    constructor(name, home) {
	this.name = name;
	this.home = home;
    }
}

class Directory {
    constructor(name, parent, perms) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.files = [];
    }

    typeToString() {
	return "directory";
    }
}

class File {
    constructor(name, parent, perms) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.content = "";
    }

    typeToString() {
	return "file";
    }
}

const root = new Directory("", "", 777);
let currentPath = root;
let admin = {};
let user = {}
let currentUser = {};
let users = [];

function initSystem() {
    mkdir(["home"]);
    mkdir(["home/hacker"]);
    mkdir(["etc"]);
    mkdir(["bin"]);
    mkdir(["lib"]);
    mkdir(["home/root"]);
    mkdir(["home/root/SuperSecretFolder"]);
    touch(["home/root/SuperSecretFolder/password.txt"]);
    touch(["home/root/SuperSecretFolder/fakePassword.txt"]);
    user = new User("hacker", getByName("/home/hacker", root, Directory));
    currentUser = user;
    users.push(user);
    admin = new User("root", getByName("/home/root", root, Directory));
    users.push(admin);
}

initSystem();

function ls(args) {
    let path = currentPath;
    if (args.length !== 0) {
        const dir = getByName(args[0], currentPath, Directory);
        if (dir) path = dir;
    }

    const output = path.files.map(file => {
        if (file instanceof Directory) return `[DIR] ${file.name}`;
        else return file.name;
    }).join(" ");
    return(output);
}

function cd(args) {
    if (args.length === 0) {
        currentPath = root;
        return "Changed directory to /";
    }

    currentPath = getByName(args[0], currentPath, Directory);
    return `Changed directory to ${args[0]}`;
}

/*TODO: make perms work*/
function sudo(args) { }

function cat(args) {
    if (args.length === 0) {
	return("cat: missing operand");
    }

    const path = getByName(args[0], currentPath, File);
    if (path) {
	return(path.content);
    } else {
	return(`cat: '${args[0]}': No such file`);
    }
}

function mkdir(args) {
    return create(args, Directory, "mkdir");
}

function touch(args) {
    return create(args, File, "touch");
}

function create(args, type, command) {
    if (args.length === 0) {
        return(`${command}: missing operand`);
    }

    const path = getByName(args[0], currentPath, type);
    if (path) {
        return(`${command}: '${args[0]}' exists`);
    }

    let dir = currentPath
    let name = args[0];

    if (args[0].includes("/")) {
        /*remove file name (text after the last /) to get path*/
        let p = args[0].slice(0, args[0].lastIndexOf("/"));
	name = args[0].slice(args[0].lastIndexOf("/") + 1);
        dir = getByName(p, currentPath, Directory);
    }

    const n = new type(name, dir, 777);
    dir.files.push(n);
    return(`Created ${args[0]}`);
}

function rmdir(args) {
    return r(args, Directory, "rmdir");
}

function rm(args) {
    return r(args, File, "rm");
}

function r(args, type, command) {
    if (args.length === 0) {
        return(`${command}: missing operand`);
    }

    const path = getByName(args[0], currentPath, type);
    if (path) {
        const index = currentPath.files.indexOf(path);
	if (path instanceof Directory && path.files.length > 0) {
	    return(`${command}: '${args[0]}': Directory not empty`);
	}
        path.parent.files.splice(index, 1);
        return(`Removed ${path.name}`);
    } else {
        return(`${command}: cannot remove '${args[0]}': Does not exist or is not a ${type.prototype.typeToString()}`);
    }
}

function getPathString(p) {
    let path = p;
    const segments = [];

    while (path) {
        segments.unshift(path.name);
        path = path.parent;
    }

    return "/" + segments.filter(seg => seg !== "").join("/");
}

function getByName(name, p, type) {
    let path = p;
    if (name[0] === "/") {
	path = root;
	name = name.slice(1);
    }
    const parts = name.split("/");
    for (let part of parts) {
	if (part === "..") {
	    if (path.parent != root) path = path.parent;
	} else {
	    const next = path.files.find(file => file.name === part);
	    if (next) path = next;
	    else {
		return null;
	    }
	}
    }
    return path instanceof type ? path : null;
}

function enter(x) {
    let val = x.children[1].value;
    x.children[1].value = "";
    let tPrompt = "[" + currentUser.name + terminalPrompt + getPathString(currentPath) + "]$ "
    terminalMessages.push(tPrompt + val);
    executeCommand(val);
    x.children[0].innerText = tPrompt;
    let messagesString = terminalMessages[0];
    terminalMessages.slice(1).forEach(message => {
	if (message === "") {
	    messagesString += "<br> ";
	} else {
            messagesString += ("<br>" + htmlEscape(message));
	}
    });
    document.getElementById("terminal").innerHTML = messagesString;
}

function printToConsole(s) {
    terminalMessages.push(s);
}

function echo(args) {
    if  (args.includes(">>")) {
	const index = args.indexOf(">>");
	const fileName = args[index + 1];
	const file = getByName(fileName, currentPath, File);
	if (file) {
	    file.content += args.slice(0, index).join(" ");
	    return(`Wrote to ${fileName}`);
	} else {
	    return(`echo: '${fileName}': No such file`);
	}
    }
    if (args.includes(">")) {
	const index = args.indexOf(">");
	const fileName = args[index + 1];
	const file = getByName(fileName, currentPath, File);
	if (file) {
	    file.content = args.slice(0, index).join(" ");
	    return(`Wrote to ${fileName}`);
	} else {
	    return(`echo: '${fileName}': No such file`);
	}
    }
    printToConsole(args.join(" "));
}

function help(args) {
    printToConsole("echo - display a line of text");
    return("help - displays this message");
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

function executeCommand(input) {
    const args = parseArgs(input);
    const [funcName, ...funcArgs] = args;
    const functions = {
        echo,
        help,
        cd,
        ls,
        rm,
        sudo,
        rmdir,
        touch,
        mkdir,
        cat,
    };
    const func = functions[funcName];

    if (typeof func === "function") {
        printToConsole(func(funcArgs));
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
