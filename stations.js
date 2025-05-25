const networkingCode = 37765
const manufacturingCode = 90426
const reconCode = 57220
const securityCode = 49489
const bossfightCode = 13576

let currentStation = 0

let networkingFirst = Math.random() >= 0.5; //can be overwridden when loading a save
let reconFirst = Math.random() >= 0.5;

let networkingScore = 0
let manufacturingScore = 0
let reconScore = 0
let securityScore = 0
let endingState = undefined

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

function goToEnding() {
    hide('bossfightCodeCheck')
    hide('bossfight'); 
    show('bossfightComplete'); 
    show('ending')
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

function savingGoToFirstStation() {
    goToFirstStation()
}

function savingGoToSecondStation() {
    savingGoToFirstStation()
    if(networkingFirst) {
        goToStationFromNetworking()
    } else {
        goToStationFromManufacturing()
    }
}

function savingGoToThirdStation() {
    savingGoToSecondStation()
    if(networkingFirst) {
        goToStationFromManufacturing()
    } else {
        goToStationFromNetworking()
    }
}

function savingGoToFourthStation() {
    savingGoToThirdStation()
    if(reconFirst) {
        goToStationFromRecon()
    } else {
        goToStationFromSecurity()
    }
}

function savingGoToBossfight() {
    savingGoToFourthStation()
    if(reconFirst) {
        goToStationFromSecurity()
    } else {
        goToStationFromRecon()
    }
}

function savingGoToEnding() {
    savingGoToBossfight()
    goToEnding()
}

function loadSave() {
    const save = JSON.parse(localStorage.getItem("save"))
    if(save === null) {
        return
    }
    networkingFirst = save.networkingFirst
    reconFirst = save.reconFirst
    networkingScore = save.networkingScore
    manufacturingScore = save.manufacturingScore
    reconScore = save.reconScore
    securityScore = save.securityScore
    endingState = save.endingState
    const stationsComplete = (networkingScore > 0) + (manufacturingScore > 0) + (reconScore > 0) + (securityScore > 0) + (endingState !== undefined)
    switch(stationsComplete) {
        case 0: 
            break; //could go to first station but idk
        case 1: 
            savingGoToSecondStation()
            break;
        case 2:
            savingGoToThirdStation()
            break;
        case 3:
            savingGoToFourthStation()
            break;
        case 4:
            savingGoToBossfight()
            break;
        case 5:
            savingGoToEnding()
            break;
    }
}

function saveCurrentState() {
    const save = {networkingFirst: networkingFirst, reconFirst: reconFirst, networkingScore: networkingScore, manufacturingScore, reconScore, securityScore, endingState}
    localStorage.setItem("save", JSON.stringify(save))
    //console.log(JSON.parse(JSON.stringify(save)))
}

function clearSave() {
    localStorage.clear()
}

function reloadGame() {
    location.reload()
}

document.addEventListener('DOMContentLoaded', () => {
    clearSave()
    loadSave()
    // networkingFirst = true
    // reconFirst = true
    // networkingScore = 1
    // manufacturingScore = 1
    // reconScore = 1
    // securityScore = 1
    // endingState = 1
    // savingGoToBossfight()
});
