// function getCssVar(varName) {
//     return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
// }

// function setCssVar(varName, value) {
//     document.documentElement.style.setProperty(varName, value);
// }

// document.addEventListener('DOMContentLoaded', function () {
//     const el = document.createElement('span');
//     el.style.position = 'absolute';
//     el.style.visibility = 'hidden';
//     el.style.fontSize = getCssVar('--line-height-default');
//     el.style.lineHeight = 'normal';
//     el.style.padding = '0';
//     el.style.margin = '0';
//     el.style.border = 'none';
//     el.textContent = 'A';

//     document.body.appendChild(el);

//     // Use offsetHeight to get the rendered height in pixels
//     const lineHeight = (el.offsetHeight) + 'px';

//     document.body.removeChild(el);
//     console.log(getCssVar('--line-height-default'));
//     setCssVar('--line-height-default', lineHeight)

//     console.log(document.documentElement.style.getPropertyValue('--line-height-default'))
// });
