function checkReconSelection(buttonParent, allowedIdentities, disallowedIdentities) {
    const buttons = document.querySelectorAll(`${buttonParent} button`);
    for(const button of buttons) {
        let station = undefined
        for(let s = 10; s > 0; s--) {
            if(button.innerText.includes(`${s}`)) {
                station = s-1 //so its 0-indexed
                break
            }
        }
        if(button.classList.contains("toggled")) {
            if(!allowedIdentities.includes(messageIdentities[station]) || disallowedIdentities.includes(messageIdentities[station])) {
                return false
            }
        } else {
            if(allowedIdentities.includes(messageIdentities[station])) {
                return false
            }
        }
    }
    return true
}

const checkRobotSelection = function(){
    let wonAlready = false
    return function() {
        if(wonAlready) {
            return
        }
        const won = checkReconSelection("#reconEasySelectButtons", ['robot'], ['doubleAgent', 'human'])
        if(won) {
            wonAlready = true
            setReconScore(1);
            show("reconRobotIdentifyWin")
            show("reconRobotNextStep")
            hide("reconRobotIdentifyError")
        } else {
            show("reconRobotIdentifyError")
        }
    }
}()

const checkDoubleAgentSelection = function(){
    let wonAlready = false
    return function() {
        if(wonAlready) {
            return
        }
        const won = checkReconSelection("#reconMediumSelectButtons", ['doubleAgent'], ['robot', 'human'])
        if(won) {
            wonAlready = true
            setReconScore(2);
            show("reconDoubleAgentIdentifyWin")
            show("reconDoubleAgentNextStep")
            hide("reconDoubleAgentIdentifyError")
        } else {
            show("reconDoubleAgentIdentifyError")
        }
    }
}()

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("reconMediumSelectButtons").innerHTML = document.getElementById("reconEasySelectButtons").innerHTML
});