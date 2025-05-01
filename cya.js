function setup() {
    let cyas = document.getElementsByClassName("cya");

    for (let element of cyas) {
        const text = element.innerHTML;
    
        // Use matchAll with the global flag
        const matches = [...text.matchAll(/{(.*?)}/g)];
    
        if (matches.length > 0) {
            // Extract all matched text (without braces)
            const specialBlocks = matches.map(match => match[1]);
            const heading = specialBlocks[0];
    
            // Remove all {...} blocks from the content
            const cleanedText = text.replace(/{.*?}/g, "");

            let buttons = "";
            for (let i = 1; i < specialBlocks.length; i++) {
                const block = specialBlocks[i];
                const [label, functionName] = block.split("@");

                // If functionName is missing, skip or set a default
                if (!label || !functionName) continue;

                buttons += `<div style="display: inline;" class="cyaButton" onclick="${functionName}">${label}</div> `;
            }
    
            element.innerHTML =
                '<div class="cyaHeading" onclick="dropDown(this)"><h1>' + heading + '</h1></div>' +
                '<div class="cyaContent">' + cleanedText +
                '<div class="cyaButtons">' + buttons + '</div>' + '</div>';
        }
    }    
}
document.addEventListener("DOMContentLoaded", () => {
    setup();
});

function test(element) {
    console.log(element.innerHTML + " clicked");
}

function dropDown(element) {
    const content = element.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}