const terminalMessages = [];
const terminalPrompt = "@HLSS";
let inCommand = false;
let nextFunc = undefined;
let nextArgs = undefined;
let sudoAccess = false;
const password = "1357d";
const fakePassword = "1357b";

class User {
    constructor(name, home, group) {
        this.name = name;
        this.home = home;
        this.group = group;
        this.groups = [];
    }
}

class Directory {
    constructor(name, parent, perms, owner) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.owner = owner;
        this.files = [];
    }

    typeToString() {
        return "directory";
    }
}

class File {
    constructor(name, parent, perms, owner) {
        this.name = name;
        this.parent = parent;
        this.perms = perms;
        this.owner = owner;
        this.content = "";
    }

    typeToString() {
        return "file";
    }
}

const root = new Directory("", "", 755, "root");
let currentPath = root;
let admin = {};
let user = {}
let currentUser = {};
let users = [];

let pyodideReadyPromise = null;

function initSystem() {
    admin = new User("root", {}, "root");
    users.push(admin);
    currentUser = admin;
    root.owner = admin;
    mkdir(["home"]);
    mkdir(["home/hacker"]);
    mkdir(["home/root"]);
    admin.home = getByName("/home/root", root, Directory);
    user = new User("hacker", getByName("/home/hacker", root, Directory), "users");
    users.push(user);
    getByName("/home/hacker", root, Directory).owner = user;
    mkdir(["etc"]);
    mkdir(["bin"]);
    mkdir(["lib"]);
    mkdir(["home/root/SuperSecretFolder"]);
    touch(["home/root/SuperSecretFolder/password.txt"]);
    echo([password, ">>", "home/root/SuperSecretFolder/password.txt"]);
    touch(["home/root/SuperSecretFolder/fakePassword.txt"]);
    echo([fakePassword, ">>", "home/root/SuperSecretFolder/fakePassword.txt"]);
    currentUser = user;
    user.groups.push("root");
}

initSystem();

function parsePerms(perms) {
    return [
        (perms >> 6) & 7, // Owner
        (perms >> 3) & 7, // Group
        perms & 7         // Others
    ];
}

function getActionBit(action) {
    return { r: 4, w: 2, x: 1 }[action] || 0;
}

function checkPerms(file, user, action) {
    const [ownerPerm, groupPerm, otherPerm] = parsePerms(parseInt(file.perms, 8));
    const actionBit = getActionBit(action);

    return (
        (file.owner === user && (ownerPerm & actionBit)) ||  // Owner check
        (user.group === file.owner.group && (groupPerm & actionBit)) || // Group check
        (user.groups.includes(file.owner.group) && (groupPerm & actionBit)) || // Additional groups
        (otherPerm & actionBit) // Others check
    ) > 0;
}


function ls(args) {
    let path = currentPath;
    if (args.length !== 0) {
        const dir = getByName(args[0], currentPath, Directory);
        if (dir) path = dir;
        else return `ls: ${args[0]}: Directory not found`
    }

    if (!checkPerms(path, currentUser, "r")) return `ls: ${path.name}: Permission denied`;

    const output = path.files.map(file => {
        if (file instanceof Directory) return `[DIR] ${file.name}`;
        else return file.name;
    }).join(" ");
    return (output);
}

function cd(args) {
    if (args.length === 0) {
        currentPath = root;
        return "Changed directory to /";
    }

    path = getByName(args[0], currentPath, Directory);
    if (path) {
        if (!checkPerms(path, currentUser, "r")) return `cd: ${args[0]}: Permission denied`;
        currentPath = path;
        return `Changed directory to ${args[0]}`;
    } else {
        return `cd: ${args[0]}: Directory not found`;
    }
}

/*TODO: make perms work*/
function sudo(args) {
    if (args.length === 0) {
        return ("sudo: missing operand");
    }

    if (sudoAccess) {
        currentUser = admin;
        executeCommand(args.join(" "));
        currentUser = user;
        return;
    }

    if (currentUser.groups.includes("root")) {
        nextArgs = args.join(" ");
        return ["Enter password: ", (args) => {
            if (args === password) {
                currentUser = admin;
                executeCommand(nextArgs);
                currentUser = user;
                inCommand = false;
                nextFunc = undefined;
                nextArgs = undefined;
                sudoAccess = true;
            } else {
                console.log(args);
                inCommand = false;
                nextFunc = undefined;
                nextArgs = undefined;
                printToConsole("sudo: incorrect password");
            }
        }];
    } else {
        return "sudo: permission denied";
    }
}

function cat(args) {
    if (args.length === 0) {
        return ("cat: missing operand");
    }

    const path = getByName(args[0], currentPath, File);
    if (!checkPerms(path, currentUser, "r")) return `cat: ${path.name}: Permission denied`;
    if (path) {
        return (path.content);
    } else {
        return (`cat: '${args[0]}': No such file`);
    }
}

function mkdir(args, owner = currentUser) {
    return create(args, Directory, "mkdir", owner);
}

function touch(args, owner = currentUser) {
    return create(args, File, "touch", owner);
}

function create(args, type, command, owner) {
    if (args.length === 0) {
        return (`${command}: missing operand`);
    }

    const path = getByName(args[0], currentPath, type);
    if (path) {
        return (`${command}: '${args[0]}' exists`);
    }

    let dir = currentPath
    let name = args[0];

    if (args[0].includes("/")) {
        /*remove file name (text after the last /) to get path*/
        let p = args[0].slice(0, args[0].lastIndexOf("/"));
        name = args[0].slice(args[0].lastIndexOf("/") + 1);
        dir = getByName(p, currentPath, Directory);
    }

    if (!checkPerms(dir, currentUser, "w")) return `${command}: Permission denied`;

    const n = new type(name, dir, dir.perms, owner);
    dir.files.push(n);
    return (`Created ${args[0]}`);
}

function rmdir(args) {
    return r(args, Directory, "rmdir");
}

function rm(args) {
    return r(args, File, "rm");
}

function r(args, type, command) {
    if (args.length === 0) {
        return (`${command}: missing operand`);
    }

    const path = getByName(args[0], currentPath, type);
    if (path) {
        const index = currentPath.files.indexOf(path);
        if (path instanceof Directory && path.files.length > 0) {
            return (`${command}: '${args[0]}': Directory not empty`);
        }
        if (!checkPerms(path, currentUser, "w")) return `${command}: Permission denied`;
        path.parent.files.splice(index, 1);
        return (`Removed ${path.name}`);
    } else {
        return (`${command}: cannot remove '${args[0]}': Does not exist or is not a ${type.prototype.typeToString()}`);
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
    let tPrompt = "[" + currentUser.name + terminalPrompt + getPathString(currentPath) + "]$ ";
    let output = undefined;
    if (inCommand) {
        output = nextFunc(val);
        //tPrompt = output === undefined ? "[" + currentUser.name + terminalPrompt + getPathString(currentPath) + "]$ " : output;
    } else {
        terminalMessages.push(tPrompt + val);
        output = executeCommand(val);
    }
    tPrompt = output === undefined ? "[" + currentUser.name + terminalPrompt + getPathString(currentPath) + "]$ " : output;
    x.children[0].innerText = tPrompt;
    updateTerminal();
}

function updateTerminal() {
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
    updateTerminal();
}

function echo(args) {
    if (args.includes(">>")) {
        const index = args.indexOf(">>");
        const fileName = args[index + 1];
        const file = getByName(fileName, currentPath, File);
        if (file) {
            file.content += args.slice(0, index).join(" ");
            return (`Wrote to ${fileName}`);
        } else {
            return (`echo: '${fileName}': No such file`);
        }
    }
    if (args.includes(">")) {
        const index = args.indexOf(">");
        const fileName = args[index + 1];
        const file = getByName(fileName, currentPath, File);
        if (file) {
            file.content = args.slice(0, index).join(" ");
            return (`Wrote to ${fileName}`);
        } else {
            return (`echo: '${fileName}': No such file`);
        }
    }
    return args.join(" ");
}

function help(args) {
    printToConsole("echo [string] - display a line of text");
    printToConsole("cd [directory] - change the current directory");
    printToConsole("ls [directory] - list directory contents");
    printToConsole("rm [file] - remove files");
    printToConsole("rmdir [directory] - remove empty directories");
    printToConsole("sudo [command] [options] - execute a command as root");
    printToConsole("mkdir [directory] - create a new directory");
    printToConsole("touch [file] - create a new file");
    printToConsole("cat [file] - display file contents");
    return ("help - displays this message");
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

// function editor(args) {
//     console.log("Opening editor");
//     if (!window.pyodideReady) {
//         return("Pyodide is initializing. Please wait a moment and try again.");
//     }
//     try {
//         return(openEditor());
//     } catch (error) {
//         return("Error initializing Pyodide or opening editor: " + error);
//     }
// }

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
        //editor,
    };
    const func = functions[funcName];

    if (typeof func === "function") {
        if (func.constructor.name === 'AsyncFunction') {
            func(funcArgs).catch(err => printToConsole('Error executing ' + funcName + ': ' + err));
        } else {
            let secondary = undefined;
            let output = func(funcArgs);
            if (typeof output === "object") {
                secondary = output[1];
                output = output[0];
            }
            if (output !== undefined) {
                if (secondary) {
                    inCommand = true;
                    nextFunc = secondary;
                    return output;
                } else {
                    if (output) {
                        printToConsole(output);
                    }
                }
            }
        }
    } else {
        printToConsole('Command "' + funcName + '" not found. Did you mean help?');
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
