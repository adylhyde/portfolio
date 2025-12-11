
let lastScrollTop = 0;  // Store the last scroll position
const navbar = document.querySelector('.navbar');  // Get the navbar

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;  // Get current scroll position

    // If scrolling down, hide the navbar, if scrolling up, show the navbar
    if (currentScroll > lastScrollTop) {
        // Scrolling down
        navbar.classList.add('hide');
    } else {
        // Scrolling up
        navbar.classList.remove('hide');
    }

    // Update lastScrollTop to current scroll position
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("currentYear").textContent = new Date().getFullYear();
});

// JavaScript to handle the navbar menu toggle on mobile view
document.querySelector('.navbar-toggle').addEventListener('click', function() {
    const navbarLinks = document.querySelector('.navbar-links');
    const navbarToggle = document.querySelector('.navbar-toggle');
    
    // Toggle the 'active' class to show/hide the navbar links
    navbarLinks.classList.toggle('active');
    
    // Toggle the 'active' class on the hamburger icon to hide it when the menu is active
    navbarToggle.classList.toggle('active');
});



/* ==========================================================
    PARTICLE BACKGROUND
========================================================== */
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let particles = [];
for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.2
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    
    particles.forEach(p => {
        ctx.beginPath();
        ctx.rect(p.x, p.y, p.size, p.size);
        ctx.fill();

        p.y -= p.speed;
        if (p.y < -10) p.y = h + 10;
    });

    requestAnimationFrame(drawParticles);
}
drawParticles();


/* ==========================================================
    GSAP HERO ANIMATION (enhanced)
========================================================== */
const heroTimeline = gsap.timeline();

heroTimeline.from(".hero-3d-wrap", {
    opacity: 0,
    scale: 0.9,
    y: 40,
    duration: 1.2,
    ease: "back.out(1.2)"
})
.from(".hero-name", {
    opacity: 0,
    y: 30,
    duration: 0.9,
    ease: "power3.out"
}, "-=0.7");

// Subtle floating animation on hero image
gsap.to(".hero-image", {
    y: -10,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});


/* ==========================================================
    SKILLS CAROUSEL (infinite smooth scroll)
========================================================== */
(function () {
    const skillsTrack = document.getElementById("skillsTrack");
    if (!skillsTrack) return;

    const skillBoxes = Array.from(skillsTrack.querySelectorAll('.skill-box'));
    if (skillBoxes.length === 0) return;

    // Duplicate boxes for seamless infinite loop
    skillBoxes.forEach(box => {
        skillsTrack.appendChild(box.cloneNode(true));
    });

    const BOX_WIDTH = 140;
    const GAP = 32;
    const ITEM_WIDTH = BOX_WIDTH + GAP;
    const ORIGINAL_COUNT = skillBoxes.length;
    const TOTAL_WIDTH = ITEM_WIDTH * ORIGINAL_COUNT;

    let scrollPos = 0;
    const SPEED = 0.5; // pixels per frame

    function scroll() {
        scrollPos += SPEED;
        
        // Seamless loop: reset when scrolled past originals
        if (scrollPos >= TOTAL_WIDTH) {
            scrollPos = 0;
        }
        
        skillsTrack.style.transform = `translateX(-${scrollPos}px)`;
        requestAnimationFrame(scroll);
    }

    // Remove transition for smooth continuous motion
    skillsTrack.style.transition = 'none';
    
    // Start scrolling
    scroll();
})();

/* ==========================================================
    PROJECT IMAGE CAROUSEL (MULTIPLE CARDS SUPPORTED)
========================================================== */
function initProjectCarousels() {
    document.querySelectorAll(".project-card-horizontal").forEach((card, cardIndex) => {

        const wrapper = card.querySelector(".project-image-wrapper");
        const track = card.querySelector(".project-track");
        let images = Array.from(track.querySelectorAll("img"));
        let indicatorsContainer = card.querySelector(".project-indicators");

        if (!wrapper || !track || images.length === 0) return;

        wrapper.setAttribute('tabindex', '0');

        /** Rebuild indicators if needed **/
        let indicators = Array.from(indicatorsContainer.querySelectorAll(".project-dot"));
        if (indicators.length !== images.length) {
            indicatorsContainer.innerHTML = "";
            indicators = [];
            for (let i = 0; i < images.length; i++) {
                let btn = document.createElement("button");
                btn.className = "project-dot";
                btn.dataset.index = i;
                btn.setAttribute("aria-label", `View slide ${i + 1}`);
                btn.setAttribute("aria-pressed", "false");
                btn.setAttribute("tabindex", "-1");
                indicatorsContainer.appendChild(btn);
                indicators.push(btn);
            }
        }

        /** Dynamic width layout **/
        function configureTrack() {
            track.style.width = `${images.length * 100}%`;
            track.style.display = "flex";
            track.style.flexWrap = "nowrap";

            images.forEach(img => {
                img.style.width = `${100 / images.length}%`;
                img.style.flex = "0 0 auto";
                img.style.objectFit = "cover";
                img.style.height = "100%";
            });
        }

        /** Wait for image loads **/
        const loadPromises = images.map(img => new Promise(res => {
            if (img.complete) return res();
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
        }));

        let current = 0;
        const ROTATE_MS = 3500;
        let intervalId = null;

        /** Correct transform calculation **/
        function updateTransform() {
            const step = 100 / images.length;
            const offset = current * step;
            track.style.transform = `translateX(-${offset}%)`;
        }

        function setActive(index) {
            current = ((index % images.length) + images.length) % images.length;
            updateTransform();

            indicators.forEach((btn, i) => {
                const active = i === current;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-pressed", active);
                btn.setAttribute("tabindex", active ? "0" : "-1");
            });
        }

        function goTo(i) {
            setActive(i);
        }

        /** Indicator events **/
        indicators.forEach(btn => {
            btn.addEventListener("click", e => {
                goTo(Number(e.currentTarget.dataset.index));
                restartAuto();
            });
        });

        /** Hover pause **/
        wrapper.addEventListener("mouseenter", stopAuto);
        wrapper.addEventListener("mouseleave", startAuto);

        /** Auto rotate **/
        function startAuto() {
            if (intervalId) return;
            intervalId = setInterval(() => goTo(current + 1), ROTATE_MS);
        }

        function stopAuto() {
            clearInterval(intervalId);
            intervalId = null;
        }

        function restartAuto() {
            stopAuto();
            startAuto();
        }

        /** Final setup **/
        Promise.all(loadPromises).then(() => {
            images = Array.from(track.querySelectorAll("img"));
            configureTrack();
            setActive(0);
            startAuto();
        });
    });
}

// Initialize carousels after a delay to ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initProjectCarousels, 100);
    });
} else {
    setTimeout(initProjectCarousels, 100);
}

/* ==========================================================
    CERTIFICATE MODAL (IMPROVED)
========================================================== */
function openCert(el) {
    const modal = document.getElementById("certModal");
    const modalImg = document.getElementById("certModalImg");

    modalImg.src = el.querySelector("img").src;
    modal.classList.add("active");

    modal.onclick = () => modal.classList.remove("active");
}

/* COLLAGE MODAL */
document.querySelectorAll(".collage-grid img").forEach(img => {
    img.addEventListener("click", () => {
        const modal = document.getElementById("collageModal");
        const modalImg = document.getElementById("collageModalImg");
        modalImg.src = img.src;
        modal.classList.add("active");
    });
});

document.getElementById("collageModal").addEventListener("click", () => {
    document.getElementById("collageModal").classList.remove("active");
});

feather.replace();

// Add event listener for clicks on the entire screen
document.addEventListener('click', function() {
    // Redirect to the homepage
    window.location.href = '/index.html'; // Change '/' to your homepage URL if different
});
