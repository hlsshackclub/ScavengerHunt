function setup() {
    let cyas = document.getElementsByClassName("cya");

    for (let element of cyas) {
        const text = element.innerHTML;
        const match = text.match(/{(.*?)}/);
        if (match) {
            const specialBlock = match[1];
            element.innerHTML = '<div class="cyaHeading" onclick="dropDown(this)"><h1>' + specialBlock + '</h1></div>'
            + '<div class="cyaContent">' + text.replace(/{.*?}/, "") + '</div>';
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    setup();
});

function dropDown(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}