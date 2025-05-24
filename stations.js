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
        document.getElementById("station1CodeCheck").appendChild(document.getElementById("networkingCodeCheck"))
        document.getElementById("station1").appendChild(document.getElementById("networkingContainer"))
        document.getElementById("station1Complete").appendChild(document.getElementById("networkingComplete"))
        show("networkingCodeCheck")
    } else {
        currentStation = 1
        document.getElementById("station1CodeCheck").appendChild(document.getElementById("manufacturingCodeCheck"))
        document.getElementById("station1").appendChild(document.getElementById("manufacturingContainer"))
        document.getElementById("station1Complete").appendChild(document.getElementById("manufacturingComplete"))
        show("manufacturingCodeCheck")
    }
}

function goToThirdStation() {
    if(reconFirst) {
        currentStation = 2
        document.getElementById("station3CodeCheck").appendChild(document.getElementById("reconCodeCheck"))
        document.getElementById("station3").appendChild(document.getElementById("reconContainer"))
        document.getElementById("station3Complete").appendChild(document.getElementById("reconComplete"))
        show("reconCodeCheck")
    } else {
        currentStation = 3
        document.getElementById("station3CodeCheck").appendChild(document.getElementById("securityCodeCheck"))
        document.getElementById("station3").appendChild(document.getElementById("securityContainer"))
        document.getElementById("station3Complete").appendChild(document.getElementById("securityComplete"))
        show("securityCodeCheck")
    }
}

function goToBossfight() {
    setupBossStation()
    show("bossfightCodeCheck")
}

function setNetworkingScore(difficulty) {
    networkingScore = Math.max(networkingScore, difficulty)
}

function setManufacturingScore(difficulty) {
    manufacturingScore = Math.max(manufacturingScore, difficulty)
}

function setReconScore(difficulty) {
    reconScore = Math.max(reconScore, difficulty)
}

function setSecurityScore(difficulty) {
    securityScore = Math.max(securityScore, difficulty)
}

function goToStationFromNetworking() {
    hide("networkingCodeCheck")
    hide("networkingContainer")
    show("networkingComplete")
    document.getElementById("networkingCompleteLabel").innerText = `Networking (${scoreToName(networkingScore)}) Complete`
    if(networkingFirst) {
        currentStation = 1
        document.getElementById("station2CodeCheck").appendChild(document.getElementById("manufacturingCodeCheck"))
        document.getElementById("station2").appendChild(document.getElementById("manufacturingContainer"))
        document.getElementById("station2Complete").appendChild(document.getElementById("manufacturingComplete"))
        show("manufacturingCodeCheck")
    } else {
        goToThirdStation()
    }
}

function goToStationFromManufacturing() {
    hide("manufacturingCodeCheck")
    hide("manufacturingContainer")
    show("manufacturingComplete")
    document.getElementById("manufacturingCompleteLabel").innerText = `Manufacturing (${scoreToName(manufacturingScore)}) Complete`
    if(!networkingFirst) {
        currentStation = 0
        document.getElementById("station2CodeCheck").appendChild(document.getElementById("networkingCodeCheck"))
        document.getElementById("station2").appendChild(document.getElementById("networkingContainer"))
        document.getElementById("station2Complete").appendChild(document.getElementById("networkingComplete"))
        show("networkingCodeCheck")
    } else {
        goToThirdStation()
    }
}

function goToStationFromRecon() {
    hide("reconCodeCheck")
    hide("reconContainer")
    show("reconComplete")
    document.getElementById("reconCompleteLabel").innerText = `Recon (${scoreToName(reconScore)}) Complete`
    if(reconFirst) {
        currentStation = 3
        document.getElementById("station4CodeCheck").appendChild(document.getElementById("securityCodeCheck"))
        document.getElementById("station4").appendChild(document.getElementById("securityContainer"))
        document.getElementById("station4Complete").appendChild(document.getElementById("securityComplete"))
        show("securityCodeCheck")
    } else {
        goToBossfight()
    }
}

function goToStationFromSecurity() {
    hide("securityCodeCheck")
    hide("securityContainer")
    show("securityComplete")
    document.getElementById("securityCompleteLabel").innerText = `Security (${scoreToName(securityScore)}) Complete`
    if(!reconFirst) {
        currentStation = 0
        document.getElementById("station4CodeCheck").appendChild(document.getElementById("reconCodeCheck"))
        document.getElementById("station4").appendChild(document.getElementById("reconContainer"))
        document.getElementById("station4Complete").appendChild(document.getElementById("reconComplete"))
        show("reconCodeCheck")
    } else {
        goToBossfight()
    }
}

function testingGoToFirstStation() {
    goToFirstStation()
}

function testingGoToSecondStation() {
    testingGoToFirstStation()
    if(networkingFirst) {
        networkingScore = 3;
        goToStationFromNetworking()
    } else {
        manufacturingScore = 3;
        goToStationFromManufacturing()
    }
}

function testingGoToThirdStation() {
    testingGoToSecondStation()
    if(networkingFirst) {
        manufacturingScore = 3;
        goToStationFromManufacturing()
    } else {
        networkingScore = 3;
        goToStationFromNetworking()
    }
}

function testingGoToFourthStation() {
    testingGoToThirdStation()
    if(reconFirst) {
        reconScore = 3
        goToStationFromRecon()
    } else {
        securityScore = 3
        goToStationFromSecurity()
    }
}

function testingGoToBossfight() {
    testingGoToFourthStation()
    if(reconFirst) {
        securityScore = 3
        goToStationFromSecurity()
    } else {
        reconScore = 3
        goToStationFromRecon()
    }
}


document.addEventListener('DOMContentLoaded', () => {
    //testingGoToBossfight()
});
