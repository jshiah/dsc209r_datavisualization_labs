console.log('IT’S ALIVE!');

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// // CHECK: is this right??
// let pages = [
//     { url: './', title: 'Home' },
//     { url: './projects', title: 'Projects' },
//     { url: './contact', title: 'Contact' },
//     { url: './resume', title: 'Resume' },
//     { url: 'https://github.com/jshiah', title: 'GitHub' } 
// ];


let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let a = document.createElement('a');
    // a.href = url;
    a.href = p.url; // Change this line to use p.url
    a.textContent = p.title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
        a.target = "_blank"; // Open in new tab
    }

    nav.append(a);
}
