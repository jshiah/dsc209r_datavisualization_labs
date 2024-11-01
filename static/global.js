// console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//     return Array.from(context.querySelectorAll(selector));
// }

// const ARE_WE_HOME = document.documentElement.classList.contains('home');

// let nav = document.createElement('nav');
// document.body.prepend(nav);

// for (let p of pages) {
//     let a = document.createElement('a');
//     // a.href = url;
//     a.href = p.url; // Change this line to use p.url
//     a.textContent = p.title;

//     a.classList.toggle(
//         'current',
//         a.host === location.host && a.pathname === location.pathname
//     );

//     if (a.host !== location.host) {
//         a.target = "_blank"; // Open in new tab
//     }

//     nav.append(a);
// }

console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// Access the pages array from the global window object
const pages = window.pages || []; // Fallback to an empty array if pages is not defined

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create a navigation element
let nav = document.createElement('nav');
document.body.prepend(nav);

// Loop through the pages and create links
for (let p of pages) {
    let a = document.createElement('a');
    a.href = p.url; // Use p.url from the defined array
    a.textContent = p.title;

    // Highlight the current page link
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = "_blank"; // Open in new tab
    }

    // Append the link to the navigation
    nav.appendChild(a);
}