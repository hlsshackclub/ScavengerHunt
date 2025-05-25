const terminalMessages = [];
const terminalPrompt = "@HLSS";
let inCommand = false;
let nextFunc = undefined;
let nextArgs = undefined;
let sudoAccess = false;
const password = "13576";
const fakePassword = "13579";
let sudoersFile = undefined;
const noPerms = 'Permission denied (try using sudo [command])'

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
let passwordFile = {};
let importantDataFile = {};

function initSystem() {
    admin = new User("root", {}, "users");
    admin.groups.push("root");
    users.push(admin);
    currentUser = admin;
    root.owner = admin;
    mkdir(["home"]);
    //mkdir(["home/hacker"]);
    mkdir(["home/root"]);
    admin.home = getByName("/home/root", root, Directory);
    //user = new User("hacker", getByName("/home/hacker", root, Directory), "users");
    user = new User("hacker", undefined, "users");
    users.push(user);
    //getByName("/home/hacker", root, Directory).owner = user;
    mkdir(["etc"]);
    mkdir(["home/root/SuperSecretFolder"]);
    touch(["home/root/SuperSecretFolder/password.txt"]);
    touch(["home/root/SuperSecretFolder/importantData.txt"]);
    importantDataFile = getByName("/home/root/SuperSecretFolder/importantData.txt", root, File);
    echo(["NOTE TO SELF: DO NOT DELETE EVIL PLANS\n\nPLAN #1: Operation Smartboard Subversion,\nStep 1: Infiltrate the school's network through the Wi-Fi or a smartboard update.\nStep 2: Implant a virus into all Chromebooks and staff computers to subtly collect data on student schedules, teacher habits, and PA announcements.\nStep 3: Use AI voice synthesis to hijack morning announcements and embed subliminal messages to influence students.\nGoal: Create loyal student minions under subtle mind control while feeding disinformation to staff.\n\nTODO: WRITE MORE EVIL PLANS LATER AND DON'T DELETE ANYTHING", ">", "home/root/SuperSecretFolder/importantData.txt"]);
    echo([password, ">", "home/root/SuperSecretFolder/password.txt"]);
    passwordFile = getByName("/home/root/SuperSecretFolder/password.txt", root, File)
    touch(["home/root/SuperSecretFolder/fakePassword.txt"]);
    echo([fakePassword, ">", "home/root/SuperSecretFolder/fakePassword.txt"]);
    touch(["etc/sudoers"]); 
    sudoersFile = getByName("/etc/sudoers", root, File);
    sudoersFile.content = "root";
    sudoersFile.perms = 777;
    currentUser = user;
    user.groups.push("wheel");
}

initSystem();

function parseSudoers() {
    const lines = sudoersFile.content.split("\n");
    const sudoers = [];
    for (let line of lines) {
	if (line.trim() === "") continue;
	const parts = line.split(" ");
	const group = parts[0];
	sudoers.push(group);
    }
    return sudoers;
}

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
    let list = false;
    if (args.includes("-l")) {
	args.splice(args.indexOf("-l"), 1);
	list = true;
    }
    if (args.length !== 0) {
        const dir = getByName(args[0], currentPath, Directory);
        if (dir) path = dir;
        else return `ls: ${args[0]}: Directory not found`
    }

    if (!checkPerms(path, currentUser, "r")) return `ls: ${path.name}: ${noPerms}`;

    const output = path.files.map(file => {
        if (file instanceof Directory) return `[DIR] ${file.name}`;
        else return file.name;
    }).join(" ");
    if (list) {
	return path.files.map(file => {
	    let perms = file.perms.toString().padStart(3, "0");
	    let type = file instanceof Directory ? "d" : "-";
	    let owner = file.owner.name;
	    let group = file.owner.group;
	    return `${type}${perms} ${owner} ${group} ${file.name}`;
	}).join("\n");
    }
    return (output);
}

function cd(args) {
    if (args.length === 0) {
        currentPath = root;
        return `Changed directory to ${getPathString(currentPath)}`;
    }

    path = getByName(args[0], currentPath, Directory);
    if (path) {
        if (!checkPerms(path, currentUser, "r")) return `cd: ${args[0]}: ${noPerms}`;
        currentPath = path;
        return `Changed directory to ${getPathString(currentPath)}`;
    } else {
        return `cd: ${args[0]}: Directory not found`;
    }
}

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

    let parsedSudoers = parseSudoers()
    if (parsedSudoers.some(s => currentUser.groups.includes(s)) || parsedSudoers.includes(currentUser.name)) {
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
                inCommand = false;
                nextFunc = undefined;
                nextArgs = undefined;
                printToConsole("sudo: incorrect password");
            }
        }];
    } else {
        return "sudo: permission denied (check help sudo)";
    }
}

function cat(args) {
    if (args.length === 0) {
        return ("cat: missing operand");
    }

    const path = getByName(args[0], currentPath, File);
    if (path) {
    	if (!checkPerms(path, currentUser, "r")) return `cat: ${path.name}: ${noPerms}`;
	if (path === passwordFile){
	    //Easy Win
        setSecurityScore(1)
	    show("terminalWinEasy")
	}
        return (path.content);
    } else {
        return (`cat: '${args[0]}': No such file in this directory`);
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

    if (!checkPerms(dir, currentUser, "w")) return `${command}: ${noPerms}`;

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
        if (!checkPerms(path, currentUser, "w")) return `${command}: ${noPerms}`;
	if (path === importantDataFile){
	    //Medium Win
        setSecurityScore(2)
        hide('terminalWinEasy');
	    show("terminalWinMedium")
	}
        path.parent.files.splice(index, 1);
        return (`Removed ${path.name}`);
    } else {
        return (`${command}: cannot remove '${args[0]}': Does not exist in this directory or is not a ${type.prototype.typeToString()}`);
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
            if (path != root) path = path.parent;
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

let commandHistory = [];
let commandHistoryIndex = 0;

function enter(x) {
    let val = x.children[1].value;
    if (val === "") return;
    commandHistory.push(val);
    x.children[1].value = "";
    let tPrompt = "[" + currentUser.name + terminalPrompt + getPathString(currentPath) + "]$ ";
    let output = undefined;
    if (inCommand) {
        output = nextFunc(val);
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
    
    document.getElementById("terminalBox").scrollIntoView();
}

function printToConsole(s) {
    terminalMessages.push(s);
    updateTerminal();
}

function echo(args) {
    if (args.includes(">") || args.includes(">>")) {
    	if (args.includes(">>")) {
            const index = args.indexOf(">>");
            const fileName = args[index + 1];
            const file = getByName(fileName, currentPath, File);
	    if (!checkPerms(file, currentUser, "w")) return `echo: ${noPerms}`;
            if (file) {
                file.content += "\n" + args.slice(0, index).join(" ");
                return (`Wrote to ${fileName}`);
            } else {
                return (`echo: '${fileName}': No such file in this directory`);
            }
        }
        const index = args.indexOf(">");
        const fileName = args[index + 1];
        const file = getByName(fileName, currentPath, File);
	if (!checkPerms(file, currentUser, "w")) return `echo: ${noPerms}`;
        if (file) {
            file.content = args.slice(0, index).join(" ");
            return (`Wrote to ${fileName}`);
        } else {
            return (`echo: '${fileName}': No such file in this directory`);
        }
    }
    return args.join(" ");
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function getFirstLine(str) {
    const index = str.indexOf("\n");
    if (index === -1) {
	return str;
    } else {
	return str.slice(0, index);
    }
}

function help(args) {
    if (args.length > 0) {
	const func = aliases[args[0]] || args[0];
	if (func in functions){
	    const aliase = getKeyByValue(aliases, func);
	    let name = func;
	    if (aliase) {
		name = func + " or " + aliase;
	    }
	    printToConsole(name + " " + funcHelp[func]);
	} else {
	    printToConsole("help: '" + args[0] + "' not found");
	}
    } else {
	for (const [key, value] of Object.entries(functions)) {
	    const aliase = getKeyByValue(aliases, key);
	    let name = key;
	    if (aliase) {
		name = key + " or " + aliase;
	    }
	    printToConsole(name + " " + getFirstLine(funcHelp[key]));
	}
    }
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

const aliases = {
    "list": "ls",
    "go": "cd",
    "delete": "rm",
    "removeDirectory": "rmdir",
    "read": "cat",
    "makeDirectory": "mkdir",
    "makeFile": "touch",
    "write": "echo",
};

const functions = {
    help,
    echo,
    cd,
    ls,
    rm,
    sudo,
    rmdir,
    touch,
    mkdir,
    cat,
};

const funcHelp = {
    "echo": "[string] - display a line of text or overwrite/write to a file\n    use [text to write] > [file] to overwrite a file\n    use [text to append] >> [file] to append to a file",
    "help": "[command] - detailed help for a command\n    use help without arguments to list all commands",
    "cd": "[directory] - change the current directory\n    use .. to go up a directory\n    use / or run without arguments to go to the root directory",
    "ls": "[directory] - list directory contents\n    use -l for detailed list",
    "rm": "[file] - remove files",
    "rmdir": "[directory] - remove empty directories",
    "sudo": '[command] [options] - execute a command as root\n    can only be used if "wheel" or "hacker" are in /etc/sudoers\n    you will be prompted for a password',
    "mkdir": "[directory] - create a new directory",
    "touch": "[file] - create a new file",
    "cat": "[file] - display file contents",
};

function executeCommand(input) {
    const args = parseArgs(input);
    const [funcName, ...funcArgs] = args;
    const resolvedFuncName = aliases[funcName] || funcName;
    const func = functions[resolvedFuncName];

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
        .replaceAll("'", "&#39;")
	.replaceAll("\n", "<br>");
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

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('terminalBox');
    const form = document.getElementById('terminalContainer').querySelector('form');

    // Auto-grow the textarea
    textarea.addEventListener('input', () => {
	textarea.style.height = 'auto'; // reset height
	textarea.style.height = textarea.scrollHeight + 'px'; // set new height
    });

    // Submit on Enter
    textarea.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
            e.preventDefault(); // prevent newline
            form.requestSubmit(); // submit the form
        }
	if (e.key === 'ArrowUp') {
	    e.preventDefault();
	    if (commandHistory.length > 0) {
		if (commandHistoryIndex + 1 <= commandHistory.length) {
		    commandHistoryIndex++;
		    textarea.value = commandHistory[commandHistory.length-commandHistoryIndex];
		    textarea.focus();
		}
	    } 
	}
	if (e.key === 'ArrowDown') {
	    e.preventDefault();
	    if (commandHistory.length > 0) {
		if (commandHistoryIndex - 1 >= 0) {
		    commandHistoryIndex--;
		    if (commandHistoryIndex === 0) {
			textarea.value = "";
		    } else {
		        textarea.value = commandHistory[commandHistory.length-commandHistoryIndex];
		    }
		    textarea.focus();
		}
	    } 
	}
    });
});
