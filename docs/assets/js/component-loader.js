/*
=============================================================
Project Clarity — Shared Component Loader
=============================================================
*/

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent("site-header", "components/header.html");
    await loadComponent("site-footer", "components/footer.html");
    initialiseNavigation();
    highlightCurrentNav();
    updateCurrentYear();
    initHeaderScroll();
});

async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (!element) return;

    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(file);
        element.innerHTML = await response.text();
    } catch (error) {
        console.error("Unable to load component:", file);
    }
}

function updateCurrentYear() {
    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();
}

function initialiseNavigation() {
    const button = document.getElementById("mobile-menu-button");
    const navigation = document.getElementById("site-navigation");
    if (!button || !navigation) return;

    button.addEventListener("click", () => {
        navigation.classList.toggle("navigation-open");
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
    });
}

function highlightCurrentNav() {
    const locationPath = window.location.pathname;
    const path = locationPath.split("/").pop() || "index.html";
    const isArticlePage = locationPath.includes("/articles/");
    const links = document.querySelectorAll(".site-navigation a");

    links.forEach((link) => {
        const href = link.getAttribute("href");
        const isCurrentPage = href === path || (path === "" && href === "index.html");
        const isArticlesSection = isArticlePage && href === "articles.html";

        if (isCurrentPage || isArticlesSection) {
            link.setAttribute("aria-current", "page");
        }
    });
}


function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) {
        // header loads async — observe after short delay
        setTimeout(() => {
            const h = document.querySelector(".site-header");
            if (!h) return;
            const onScroll = () => {
                h.classList.toggle("header-scrolled", window.scrollY > 12);
            };
            window.addEventListener("scroll", onScroll, { passive: true });
            onScroll();
        }, 100);
        return;
    }
    const onScroll = () => {
        header.classList.toggle("header-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}
