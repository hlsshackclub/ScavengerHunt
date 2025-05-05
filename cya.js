function toggleButton(button) {
    button.classList.toggle("toggled");
}

function validateAndShow(inputBox, wantedCode, toShow, wrongToShow) {
    if(document.getElementById(inputBox).value == wantedCode) {
        document.getElementById(toShow).classList.remove("hidden");
        document.getElementById(wrongToShow).classList.add("hidden");
    } else {
        document.getElementById(toShow).classList.add("hidden");
        document.getElementById(wrongToShow).classList.remove("hidden");
    }
}

function toggleShow(toShow) {
    document.getElementById(toShow).classList.toggle("hidden");
}