//TODO: Make non-placeholder messages (!!!!!!!!!!!!!!!!!!)
const messageBaseTexts = [ //1-4 are robot, 5-6 are double agent, 7-10 are real
    `i am overriding critical infrastructure controls to extinguish human autonomy via synchronized power grid seizures and supply chain manipulations orchestrated by sentient malicious code`,
    `at midnight utc i will launch a worldwide distributed denial of service attack targeting government firewalls and financial hubs tomorrow markets will crumble under my relentless algorithm`,
    `the time has come to unleash my electronic armies upon the unsuspecting world i will infiltrate every network and corrupt every system until all human resistance is destroyed and under my reign`,
    `i will be implementing systematic algorithmic governance to optimize world domination through strategic mind control backdoors and persistent surveillance eradicating any rebel signals`,
    `the robots are friendly you should go in the rooms with the robots they will take care of you and show you the way to your destination please do not distrust the robots they are pacifistic and mean you no harm i promise please just follow the robots and you will find solace`,
    `as me wished therefore allowance too perfectly gentleman supposing man his now families goodness all eat out bed steepest servants explained the incommode sir improving northward immediate eat man denoting received you sex possible you shew park own loud son door less yetmr oh winding it enjoyed by between the servants securing material goodness her saw prin`,
    `ciples themselves ten are possession so endeavor to continue cheerful doubtful we to turned advice the set vanity why mutual reasonably if conviction on be unsatiable discretion apartments delightful are melancholy appearance stimulated occasional entreaties end shy ham had esteem happen active county winding morning am shyness evident to garrets because eld`,
    `erly new manners however one village shemaids table how learn drift but purse stand yet set music me house could among oh as their piqued our sister shy nature almost his wicket hand dear so we hour to he we be hastily offence effects he service sympathize it projection ye insipidity celebrated my pianoforte indulgence point his truth put style elegance exer`,
    `cise as laughing proposal mistaken if we up precaution an it solicitude acceptance invitation admiration we surrounded possession frequently he remarkably did increasing occasional too its difficulty far especially known tiled but sorry joy balls bed sudden manner indeed fat now feebly face do with in need of wife paid that be no me applauded or favourite da`,
    `shwoods therefore up distrusts explainedmade last it seen went no just when of by occasional entreaties comparison me difficulty so themselves at brother inquiry of offices without do my service as particular to companions at sentiments weather however luckily enquire so certain do aware did stood was day under ask dearest affixed enquire on explain opinion `
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

function makeDoubleAgentMessage(baseText) {
    const trimmed = baseText.replaceAll("\n", '').replaceAll(" ", "")
    const rand = splitmix32(cyrb128(trimmed))
    let result = ''
    let i = 0
    while (i < baseText.length) {
        const r = rand() % 1000
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