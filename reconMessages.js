//TODO: Make non-placeholder messages (!!!!!!!!!!!!!!!!!!)
const messageBaseTexts = [ //1-4 are robot, 5-6 are double agent, 7-10 are real
    `i am overriding critical infrastructure controls to extinguish human autonomy via synchronized power grid seizures and supply chain manipulations orchestrated by sentient malicious code`,
    `at midnight utc i will launch a worldwide distributed denial of service attack targeting government firewalls and financial hubs tomorrow markets will crumble under my relentless algorithm`,
    `the time has come to unleash my electronic armies upon the unsuspecting world i will infiltrate every network and corrupt every system until all human resistance is destroyed and under my reign`,
    `i will be implementing systematic algorithmic governance to optimize world domination through strategic mind control backdoors and persistent surveillance eradicating any rebel signals`,
    `the robots are friendly you should go in the rooms with the robots they will take care of you and show you the way to your destination please do not distrust the robots they are peaceful and mean you no harm i say just follow the robots and you will find peace`,
    `avoid big rooms if you see a big room turn back because the big rooms the large rooms have computers in them which are scary and you should not poke them and should just leave them alone because terrible things will happen if you interfere with computers`,
    `i have gathered information about the maze which the evil robot resides in it is composed of connected rooms some of which have a robot minion inside which will hurt you on sight but you cant easily see into the rooms before entering so good luck surviving`,
    `i have broken into the maze and done some scouting i believe the main computing centers of the robot are located in three computer rooms inside the maze one of them is in the top left one of them is in the bottom left and one of them is in the bottom right`,
    `it would be wise to prepare for your final confrontation with the evil robot by bolstering your own defenses while trying to sabotage it as much as possible to maximize your chances of survival the maze is terribly dangerous and will kill you if unprepared`,
    `this is a test message to ensure the message sending encoding and decoding system works if you are reading this message decrypted then you have successfully deciphered it hopefully the evil robot has not managed to accurately replicate our messages to send`
]

const numRobotMessages = 4
const numDoubleAgentMessages = 2
const numHumanMessages = 10 - numRobotMessages - numDoubleAgentMessages

const messageIdentities = shuffleArray(Array(numRobotMessages).fill("robot").concat(Array(numDoubleAgentMessages).fill("doubleAgent"), Array(numHumanMessages).fill("human")), "order")
//console.log(messageIdentities)

const robotTemplate = `
OOOOOOOOOOOOOOOO
O  OOOO  OOOO  O
OOO          OOO
OO  OOOOOOOO  OO
OO OOOOOOOOOO OO
O  O   OO   O  O
O  OO OOOO OO  O
O  OOOOOOOOOO  O
O  OOOOOOOOOO  O
O  OOOOOOOOOO  O
O  OO      OO  O
O  O        O  O
O  OOOOOOOOOO  O
O   OOOOOOOO   O
OO            OO
OOOOOOOOOOOOOOOO
`.trim()

const width = 16
function squarifyMessage(msg) {
    let newMsg = ""
    let i = 0
    for (let char of msg) {
        if (i === width * width) {
            break
        }
        newMsg += char
        if (i % width == width - 1) {
            newMsg += '\n'
        }
        i++
    }
    return newMsg
}

function substituteIntoRobotTemplate(baseText) {
    let newText = ''
    let baseI = 0
    for (const char of robotTemplate) {
        if (char === 'O') {
            newText += baseText[baseI]
            baseI++
        } else {
            newText += char
        }
    }
    return newText
}

function makeRobotMessage(baseText) {
    return substituteIntoRobotTemplate(baseText.replaceAll(" ", ""))
}

const robotMessages = messageBaseTexts.slice(0, numRobotMessages).map(makeRobotMessage)

const doubleAgentRand = splitmix32(cyrb128("doubleAgent"))
function makeDoubleAgentMessage(baseText) {
    const trimmed = baseText.replaceAll("\n", '').replaceAll(" ", "")
    //const rand = splitmix32(cyrb128(trimmed))
    let result = ''
    let i = 0
    while (i < baseText.length) {
        const r = doubleAgentRand() % 1000
        if (r <= 750) { //only get weirdly short or weirdly long words
            var wordLen = r % 2 + 1
        } else {
            var wordLen = r % 6 + 10
        }
        const j = i + wordLen
        result += trimmed.slice(i, j) + " ";
        i = j
    }
    return result.trim();
}

const doubleAgentMessages = messageBaseTexts.slice(numRobotMessages, numRobotMessages + numDoubleAgentMessages).map(msg => squarifyMessage(makeDoubleAgentMessage(msg)))
//const humanMessages = messageBaseTexts.slice(7, 10).map(msg => wrapText(msg, width).slice(0, width * width))
const humanMessages = messageBaseTexts.slice(numRobotMessages + numDoubleAgentMessages, numRobotMessages + numDoubleAgentMessages + numHumanMessages).map(msg => squarifyMessage(msg))

// for(msg of robotMessages.concat(doubleAgentMessages, humanMessages)) {
//     console.log(msg)
// }

function cipher(msg, shift) {
    let shifted = []
    const aCode = 'a'.charCodeAt(0)
    const zCode = 'z'.charCodeAt(0)
    for (char of msg) {
        const code = char.charCodeAt(0)
        if (code < aCode || code > zCode) {
            shifted.push(char)
        } else {
            shifted.push(String.fromCharCode((code - aCode + shift + 26) % 26 + aCode))
        }
    }
    return shifted.join("")
}

// function makeShifts(seed, len) {
//     const rand = splitmix32(cyrb128(seed))
//     let rs = []
//     for (let i = 0; i < len; i++) {
//         let shift = 0
//         do {
//             shift = rand() % 24 + 1
//         } while (rs.includes(shift)) //no repeats!!
//         rs.push(shift) //1 to 25
//     }
//     return rs
// }

//nvm chat we goin all the same shift now
function makeShifts(seed, len) {
    const rand = splitmix32(cyrb128(seed))
    const shift = rand() % 24 + 1
    return Array(len).fill(shift)
}

const robotShifts = makeShifts("robotShifts", robotMessages.length)
const doubleAgentShifts = makeShifts("doubleAgentShifts", doubleAgentMessages.length)
const humanShifts = makeShifts("humanShifts", humanMessages.length)

function cipherMessages(messages, shifts) {
    let rs = []
    for (let i = 0; i < messages.length; i++) {
        rs.push(cipher(messages[i], shifts[i]))
    }
    return rs
}

const robotMessagesCiphered = cipherMessages(robotMessages, robotShifts)
const doubleAgentMessagesCiphered = cipherMessages(doubleAgentMessages, doubleAgentShifts)
const humanMessagesCiphered = cipherMessages(humanMessages, humanShifts)

const robotMessagesFlat = robotMessages.map(msg => msg.replaceAll("\n", ""))
const doubleAgentMessagesFlat = doubleAgentMessages.map(msg => msg.replaceAll("\n", ""))
const humanMessagesFlat = humanMessages.map(msg => msg.replaceAll("\n", ""))

const robotMessagesCipheredFlat = robotMessagesCiphered.map(msg => msg.replaceAll("\n", ""))
const doubleAgentMessagesCipheredFlat = doubleAgentMessagesCiphered.map(msg => msg.replaceAll("\n", ""))
const humanMessagesCipheredFlat = humanMessagesCiphered.map(msg => msg.replaceAll("\n", ""))

function orderMessages(robotMessages_, doubleAgentMessages_, humanMessages_) {
    let ordered = []
    let ri = 0
    let di = 0
    let hi = 0
    for (const id of messageIdentities) {
        if(id === 'robot') {
            ordered.push(robotMessages_[ri])
            ri++
        } else if(id === 'doubleAgent') {
            ordered.push(doubleAgentMessages_[di])
            di++
        } else {
            ordered.push(humanMessages_[hi])
            hi++
        }
    }
    return ordered
}

const messagesFlat = orderMessages(robotMessagesFlat, doubleAgentMessagesFlat, humanMessagesFlat)

const messagesCipheredFlat = orderMessages(robotMessagesCipheredFlat, doubleAgentMessagesCipheredFlat, humanMessagesCipheredFlat)