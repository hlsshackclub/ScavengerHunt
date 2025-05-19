function checkReconSelection(allowedIdentities, neutralIdentities) {
    const buttons = document.querySelectorAll('#reconSelectButtons button');
    for(const button of buttons) {
        let station = undefined
        for(let s = 10; s > 0; s--) {
            if(button.innerText.includes(`${s}`)) {
                station = s-1 //so its 0-indexed
                break
            }
        }
        if(neutralIdentities.includes(messageIdentities[station])) {
            continue
        }
        if(button.classList.contains("toggled") != allowedIdentities.includes(messageIdentities[station])) {
            return false
        }
    }
    return true
}

// document.addEventListener('DOMContentLoaded', () => {
//     checkReconSelection()
// });