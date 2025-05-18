const networkingCode = 11111
const manufacturingCode = 22222
const reconCode = 33333
const securityCode = 44444
const bossfightCode = 55555

let currentStation = 0

const networkingFirst = Math.random() >= 0.5;
const reconFirst = Math.random() >= 0.5;

let networkingScore = 0
let manufacturingScore = 0
let reconScore = 0
let securityScore = 0

function scoreToName(difficulty) {
    if(difficulty === 1) {
        return "Easy"
    } else if(difficulty === 2) {
        return "Medium"
    } else {
        return "Hard"
    }
}

function goToFirstStation() {
    hide("intro")
    show("introComplete")
    if(networkingFirst) {
        currentStation = 0
        document.getElementById("station1").appendChild(document.getElementById("networkingContainer"))
        show("networkingContainer")
    } else {
        currentStation = 1
        document.getElementById("station1").appendChild(document.getElementById("manufacturingContainer"))
        show("manufacturingContainer")
    }
}

function setNetworkingScore(difficulty) {
    networkingScore = Math.max(networkingScore, difficulty)
}

function setManufacturingScore(difficulty) {
    manufacturingScore = Math.max(manufacturingScore, difficulty)
    console.log(manufacturingScore)
}

function goToStationFromNetworking() {
    hide("networkingContainer")
    show("networkingComplete")
    document.getElementById("networkingCompleteLabel").innerText = `Networking (${scoreToName(networkingScore)}) Complete`
    if(networkingFirst) {
        currentStation = 1
        document.getElementById("station1Complete").appendChild(document.getElementById("networkingComplete"))
        document.getElementById("station2").appendChild(document.getElementById("manufacturingContainer"))
        show("manufacturingContainer")
    } else {
        currentStation = 3
        document.getElementById("station2Complete").appendChild(document.getElementById("networkingComplete"))
        document.getElementById("station3").appendChild(document.getElementById("reconContainer"))
        show("reconContainer")
    }
}

function goToStationFromManufacturing() {
    hide("manufacturingContainer")
    show("manufacturingComplete")
    document.getElementById("manufacturingCompleteLabel").innerText = `Manufacturing (${scoreToName(manufacturingScore)}) Complete`
    if(!networkingFirst) {
        currentStation = 0
        document.getElementById("station1Complete").appendChild(document.getElementById("manufacturingComplete"))
        document.getElementById("station2").appendChild(document.getElementById("networkingContainer"))
        show("networkingContainer")
    } else {
        currentStation = 3
        document.getElementById("station2Complete").appendChild(document.getElementById("manufacturingComplete"))
        document.getElementById("station3").appendChild(document.getElementById("reconContainer"))
        show("reconContainer")
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(networkingFirst) {
        show("networkingFirstDiv");
    } else {
        show("manufacturingFirstDiv");
    }
});