function toggleButton(button) {
    button.classList.toggle("toggled");
}

function depressButton(button) {
    document.getElementById(button).classList.remove("toggled")
}

function validateAndShow(inputBox, wantedCode, toShow, wrongToShow) {
    if(document.getElementById(toShow).classList.contains("hidden")) {
        return
    }

    if(document.getElementById(inputBox).value == wantedCode) {
        document.getElementById(toShow).classList.remove("hidden");
        document.getElementById(wrongToShow).classList.add("hidden");
    } else {
        document.getElementById(toShow).classList.add("hidden");
        document.getElementById(wrongToShow).classList.remove("hidden");
    }
}

vcCalledAlready = new Set()
function validateAndCall(inputBox, wantedCode, toCall, wrongToShow) {
    if(vcCalledAlready.has(toCall)) {
        return
    }

    if(document.getElementById(inputBox).value == wantedCode) {
        toCall();
        document.getElementById(wrongToShow).classList.add("hidden");
        vcCalledAlready.add(toCall)
    } else {
        document.getElementById(wrongToShow).classList.remove("hidden");
    }
}

function toggleShow(toToggle) {
    const elem = document.getElementById(toToggle)
    elem.classList.toggle("hidden");
    if(!elem.classList.contains("hidden")) {
        void elem.offsetHeight
    }
}

function show(toShow) {
    const elem = document.getElementById(toShow)
    elem.classList.remove("hidden");
}

function hide(toHide) {
    document.getElementById(toHide).classList.add("hidden");
}