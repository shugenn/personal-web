// ============================================================
// SMOOTH SCROLLING
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            setActiveNavLink(this);
            const header = document.querySelector('header');
            const headerOffset = header ? header.offsetHeight + 10 : 80;
            const sectionTop = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: sectionTop, behavior: 'smooth' });
        }
    });
});

// ============================================================
// NAVBAR
// ============================================================
const navLinks      = document.querySelectorAll('.nav-links a[href^="#"]');
const navIndicator  = document.querySelector('.nav-indicator');
const navList       = document.querySelector('.nav-links');
const headerElement = document.querySelector('header');
const observedSections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

function moveNavIndicator(activeLink) {
    if (!navIndicator || !navList || !activeLink) return;
    const listRect = navList.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    navIndicator.style.width     = `${linkRect.width}px`;
    navIndicator.style.transform = `translateX(${linkRect.left - listRect.left}px)`;
}

function setActiveNavLink(activeLink) {
    if (!activeLink) return;
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
    moveNavIndicator(activeLink);
}

function updateHeaderMode(currentSection) {
    if (!headerElement) return;
    headerElement.classList.toggle('home-mode', !!(currentSection && currentSection.id === 'home'));
}

function updateActiveNavByScroll() {
    if (!observedSections.length) return;
    const header = document.querySelector('header');
    const headerOffset = header ? header.offsetHeight + 20 : 90;
    let currentSection = observedSections[0];
    observedSections.forEach(section => {
        if (section.getBoundingClientRect().top <= headerOffset) currentSection = section;
    });
    const matchedLink = document.querySelector(`.nav-links a[href="#${currentSection.id}"]`);
    if (matchedLink) setActiveNavLink(matchedLink);
    updateHeaderMode(currentSection);
}

window.addEventListener('scroll', updateActiveNavByScroll, { passive: true });
window.addEventListener('resize', () => {
    updateActiveNavByScroll();
    moveNavIndicator(document.querySelector('.nav-links a.active'));
});
window.addEventListener('load', updateActiveNavByScroll);

// ============================================================
// GSAP
// ============================================================
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SNAP-TO-SECTION HELPER
// Ketika user hampir meninggalkan sebuah section (threshold),
// halaman otomatis scroll ke awal section berikutnya / sebelumnya.
// ============================================================
function setupSectionSnap() {
    const snapSections = [
        document.querySelector('#home'),
        document.querySelector('#about'),
        document.querySelector('#contact'),
    ].filter(Boolean);

    let isSnapping    = false;
    let lastScrollY   = window.scrollY;
    let scrollTimeout = null;

    window.addEventListener('scroll', () => {
        if (isSnapping) return;

        const currentScrollY = window.scrollY;
        const scrollingDown  = currentScrollY > lastScrollY;
        lastScrollY = currentScrollY;

        // Hanya snap saat scroll ke BAWAH
        if (!scrollingDown) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Cari section BERIKUTNYA yang hampir masuk viewport dari bawah
            // Threshold tinggi (0.55) = harus sudah lebih dari separuh terlihat
            // sebelum snap dipicu — ini mencegah snap saat masih scrolling di dalam section
            for (const sec of snapSections) {
                const rect    = sec.getBoundingClientRect();
                const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const ratio   = visible / window.innerHeight;

                // Snap hanya jika:
                // - section terlihat antara 55%-95% (sudah masuk tapi belum penuh)
                // - bagian atas section masih di bawah header (belum di-snap)
                const header = document.querySelector('header');
                const headerH = header ? header.offsetHeight : 70;
                const topBelowHeader = rect.top > headerH + 10;

                if (ratio > 0.55 && ratio < 0.95 && topBelowHeader) {
                    const targetY = sec.getBoundingClientRect().top + window.scrollY - headerH;
                    isSnapping = true;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                    setTimeout(() => { isSnapping = false; }, 1000);
                    break; // snap hanya 1 section per event
                }
            }
        }, 150);
    }, { passive: true });
}

// ============================================================
// HERO ANIMATIONS (page load — tanpa ScrollTrigger)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

    const initialLink = document.querySelector('.nav-links a.active') || navLinks[0];
    setActiveNavLink(initialLink);
    updateActiveNavByScroll();

    // Panggil snap setelah layout siap
    setTimeout(setupSectionSnap, 500);

    // Hero entrance timeline
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-image',    { duration: 1,   opacity: 0, scale: 0.85, ease: 'power2.out' })
        .from('.hero-greeting', { duration: 0.7, x: -50, opacity: 0 }, '-=0.6')
        .from('.hero-name',     { duration: 0.9, x: -80, opacity: 0 }, '-=0.5')
        .from('.hero-role',     { duration: 0.7, x: -50, opacity: 0 }, '-=0.5')
        .from('.hero-socials',  { duration: 0.6, y: 25,  opacity: 0 }, '-=0.4')
        .from('.hero-buttons',  { duration: 0.6, y: 25,  opacity: 0 }, '-=0.35');

    // SVG line animations
    function animateWordWithLine(lineClass, dotClass, wordClass, delay = 0) {
        const line = document.querySelector(lineClass);
        const dot  = document.querySelector(dotClass);
        const word = document.querySelector(wordClass);
        if (!line || !dot || !word) return;
        const len = line.getTotalLength();
        line.style.strokeDasharray  = len;
        line.style.strokeDashoffset = len;
        gsap.timeline({ delay })
            .set(line, { opacity: 1 })
            .to(line, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' })
            .to(dot,  { opacity: 1, duration: 0.2 }, '-=0.2')
            .fromTo(word,
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.1'
            );
    }
    animateWordWithLine('.line-dreamer', '.dot-dreamer', '.word-dreamer', 1.5);
    animateWordWithLine('.line-yearner', '.dot-yearner', '.word-yearner', 1.8);
    animateWordWithLine('.line-rizzler', '.dot-rizzler', '.word-rizzler', 2.1);

    // ============================================================
    // ABOUT SECTION
    // Batas start/end dibuat LEBAR agar elemen tidak hilang
    // saat masih terlihat di viewport.
    // start: 'top 90%'  → trigger saat 90% dari atas layar
    // end:   'bottom 0%' → trigger saat bagian bawah section
    //                       menyentuh atas layar (benar-benar pergi)
    // ============================================================
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {

        const aboutTitle     = aboutSection.querySelector('.section-title');
        const aboutImg       = aboutSection.querySelector('.about-image-wrap');
        const aboutPara      = aboutSection.querySelector('.about-content p');
        const aboutMotto     = aboutSection.querySelector('.about-motto');
        const aboutBtns      = aboutSection.querySelector('.about-buttons');
        const aboutStatCards = aboutSection.querySelectorAll('.about-stat-card');

        const allTextEls = [aboutTitle, aboutPara, aboutMotto, aboutBtns].filter(Boolean);

        // Initial state — sembunyikan sebelum masuk
        gsap.set(allTextEls, { autoAlpha: 0, y: 40 });
        gsap.set(aboutImg,   { autoAlpha: 0, x: -60, scale: 0.9 });
        gsap.set(aboutStatCards, { autoAlpha: 0, y: 35 });

        // Fungsi enter — arah bisa dari bawah (fromBelow=true) atau atas
        const enterAbout = (fromBelow) => {
            const yDir = fromBelow ? 40 : -40;

            gsap.killTweensOf([...allTextEls, aboutImg, ...aboutStatCards]);

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl
                .fromTo(aboutTitle,
                    { autoAlpha: 0, y: yDir },
                    { autoAlpha: 1, y: 0, duration: 0.65 })
                .fromTo(aboutImg,
                    { autoAlpha: 0, x: -60, scale: 0.9 },
                    { autoAlpha: 1, x: 0, scale: 1, duration: 0.75 }, '-=0.45')
                .fromTo(aboutPara,
                    { autoAlpha: 0, y: yDir * 0.75 },
                    { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.5')
                .fromTo(aboutMotto,
                    { autoAlpha: 0, x: -30 },
                    { autoAlpha: 1, x: 0, duration: 0.55 }, '-=0.4')
                .fromTo(aboutBtns,
                    { autoAlpha: 0, y: yDir * 0.5 },
                    { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.35')
                .fromTo(aboutStatCards,
                    { autoAlpha: 0, y: yDir * 0.75 },
                    { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 }, '-=0.3');
        };

        // Fungsi leave — elemen pergi ke arah berlawanan dengan arah scroll
        const leaveAbout = (goingDown) => {
            const yDir = goingDown ? -35 : 35; // going down → keluar ke atas

            gsap.killTweensOf([...allTextEls, aboutImg, ...aboutStatCards]);

            gsap.to(allTextEls, {
                autoAlpha: 0, y: yDir,
                duration: 0.5, stagger: 0.04, ease: 'power2.in'
            });
            gsap.to(aboutImg, {
                autoAlpha: 0, x: goingDown ? -50 : -30, scale: 0.93,
                duration: 0.5, ease: 'power2.in'
            });
            gsap.to(aboutStatCards, {
                autoAlpha: 0, y: yDir * 0.8,
                duration: 0.45, stagger: 0.05, ease: 'power2.in'
            });
        };

        ScrollTrigger.create({
            trigger: aboutSection,
            // Mulai trigger lebih awal (90%) agar animasi enter sempat berjalan
            start: 'top 90%',
            // Akhiri trigger saat section benar-benar habis (0% = top of section at top of screen)
            // Gunakan 'bottom 5%' agar masih ada sedikit buffer sebelum exit dipicu
            end: 'bottom 5%',
            onEnter:      () => enterAbout(true),
            onEnterBack:  () => enterAbout(false),
            onLeave:      () => leaveAbout(true),
            onLeaveBack:  () => leaveAbout(false),
        });
    }

    // ============================================================
    // CONTACT SECTION
    // Sama — batas diperlebar agar tidak ada glitch
    // ============================================================
    const contactSection = document.querySelector('.contact');
    if (contactSection) {

        const contactHeading = contactSection.querySelector('.contact-heading');
        const contactDivider = contactSection.querySelector('.contact-divider');
        const contactIcons   = contactSection.querySelectorAll('.contact-icon-item');
        const contactFooter  = contactSection.querySelector('.contact-footer-text');

        const allContactEls = [contactHeading, contactDivider, contactFooter].filter(Boolean);

        // Initial hidden state
        gsap.set(allContactEls, { autoAlpha: 0, y: 40 });
        gsap.set(contactIcons,  { autoAlpha: 0, y: 40, scale: 0.85 });

        const enterContact = (fromBelow) => {
            const yDir = fromBelow ? 50 : -50;

            gsap.killTweensOf([...allContactEls, ...contactIcons]);

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl
                .fromTo(contactHeading,
                    { autoAlpha: 0, y: yDir },
                    { autoAlpha: 1, y: 0, duration: 0.7 })
                .fromTo(contactDivider,
                    { autoAlpha: 0, scaleX: 0 },
                    { autoAlpha: 1, scaleX: 1, duration: 0.5, transformOrigin: 'center' }, '-=0.35')
                .fromTo(contactIcons,
                    { autoAlpha: 0, y: yDir * 0.8, scale: 0.85 },
                    { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08 }, '-=0.25')
                .fromTo(contactFooter,
                    { autoAlpha: 0, y: 15 },
                    { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.2');
        };

        const leaveContact = (goingDown) => {
            const yDir = goingDown ? -35 : 35;

            gsap.killTweensOf([...allContactEls, ...contactIcons]);

            gsap.to(contactHeading, {
                autoAlpha: 0, y: yDir, duration: 0.45, ease: 'power2.in'
            });
            gsap.to(contactDivider, {
                autoAlpha: 0, duration: 0.35, ease: 'power2.in'
            });
            gsap.to(contactIcons, {
                autoAlpha: 0, y: yDir * 0.8, scale: 0.88,
                duration: 0.4, stagger: 0.05, ease: 'power2.in'
            });
            gsap.to(contactFooter, {
                autoAlpha: 0, duration: 0.3, ease: 'power2.in'
            });
        };

        ScrollTrigger.create({
            trigger: contactSection,
            start: 'top 75%',
            // Contact adalah section terakhir, tidak ada yang di bawahnya
            // 'bottom 2%' memberi buffer yang cukup agar tidak ada glitch
            end: 'bottom 2%',
            onEnter:      () => enterContact(true),
            onEnterBack:  () => enterContact(false),
            onLeaveBack:  () => leaveContact(false),
        });
    }

}); // end DOMContentLoaded

// ============================================================
// PORTFOLIO INTERACTIVE UI
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const tabs             = document.querySelectorAll('.portfolio-tab');
    const groups           = document.querySelectorAll('.portfolio-slider-group');
    const portfolioSection = document.getElementById('projects');
    if (!portfolioSection) return;

    let scrollTl        = null;
    let pinTrigger      = null;
    let entranceTrigger = null;
    let isAnimating     = false;

    // ── helpers ──────────────────────────────────────────────
    function ensureWrappersAndOverlays(cards) {
        cards.forEach((card) => {
            let wrapper = card.parentElement;
            if (!wrapper.classList.contains('card-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                card.parentNode.insertBefore(wrapper, card);
                wrapper.appendChild(card);
            }
            if (!card.querySelector('.card-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'card-overlay';
                overlay.innerHTML = `
                    <div class="card-progress"><div class="card-progress-bar"></div></div>
                    <button class="card-nav card-nav-prev">&#8592;</button>
                    <button class="card-nav card-nav-next">&#8594;</button>
                    <div class="card-bottom-actions">
                        <button class="card-heart">&#9829;</button>
                        <button class="card-info-btn">i</button>
                    </div>`;
                card.appendChild(overlay);
            }
            card._overlayVisible = false;
        });
    }

    function killAll() {
        if (scrollTl)        { scrollTl.kill(); scrollTl = null; }
        if (entranceTrigger) { entranceTrigger.kill(true); entranceTrigger = null; }
        if (pinTrigger) {
            pinTrigger.kill(true); pinTrigger = null;
            portfolioSection.style.position   = '';
            portfolioSection.style.top        = '';
            portfolioSection.style.left       = '';
            portfolioSection.style.width      = '';
            portfolioSection.style.zIndex     = '';
            portfolioSection.style.transform  = '';
            portfolioSection.style.willChange = '';
            const pinSpacer = portfolioSection.parentElement;
            if (pinSpacer && pinSpacer.classList.contains('pin-spacer')) {
                pinSpacer.parentElement.insertBefore(portfolioSection, pinSpacer);
                pinSpacer.parentElement.removeChild(pinSpacer);
            }
        }
        ScrollTrigger.refresh();
    }

    function cleanGsapProps(elements) {
        if (!elements || !elements.length) return;
        gsap.set(elements, { clearProps: 'x,y,opacity,transform,transition' });
    }

    // ── Portfolio sidebar animate in/out ──────────────────
    const sidebarEls = portfolioSection.querySelectorAll('.portfolio-heading, .portfolio-tab');
    gsap.set(sidebarEls, { autoAlpha: 0, x: -50 });

    ScrollTrigger.create({
    trigger: portfolioSection,
    start: 'top 85%',
    // End diperpanjang melewati pin zone agar sidebar tidak hilang
    // saat kartu masih sedang di-scroll
    end: () => {
        // Ambil end dari pinTrigger jika sudah dibuat, fallback ke bottom section
        if (pinTrigger) {
            return `+=${portfolioSection.offsetHeight + (pinTrigger.end - pinTrigger.start) + 200}`;
        }
        return 'bottom -50%';
    },
    onEnter: () => {
        gsap.killTweensOf(sidebarEls);
        gsap.fromTo(sidebarEls,
            { autoAlpha: 0, x: -50 },
            { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
        );
    },
    onEnterBack: () => {
        gsap.killTweensOf(sidebarEls);
        gsap.fromTo(sidebarEls,
            { autoAlpha: 0, x: -30 },
            { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        );
    },
    onLeave: () => {
        gsap.killTweensOf(sidebarEls);
        gsap.to(sidebarEls, { autoAlpha: 0, x: -40, duration: 0.4, stagger: 0.05, ease: 'power2.in' });
    },
    onLeaveBack: () => {
        gsap.killTweensOf(sidebarEls);
        gsap.to(sidebarEls, { autoAlpha: 0, x: -50, duration: 0.45, stagger: 0.06, ease: 'power2.in' });
    },
});

    // ── Main setup ────────────────────────────────────────
    function setupPortfolioAnimations() {
        killAll();
        gsap.set(portfolioSection, { clearProps: 'transform,opacity' });

        const activeGroup = portfolioSection.querySelector('.portfolio-slider-group.active');
        if (!activeGroup) return;
        const cards = activeGroup.querySelectorAll('.portfolio-card');
        if (!cards.length) return;

        ensureWrappersAndOverlays(cards);
        activeGroup.style.display = 'flex';

        const wrappers = activeGroup.querySelectorAll('.card-wrapper');
        cleanGsapProps(wrappers);
        cleanGsapProps(cards);

        void activeGroup.offsetWidth;
        void activeGroup.offsetHeight;

        let maxTravel = wrappers.length > 1 ? wrappers[wrappers.length - 1].offsetLeft : 0;
        if (!maxTravel || maxTravel <= 0) maxTravel = (wrappers.length - 1) * 352;

        if (maxTravel <= 0) {
            entranceTrigger = ScrollTrigger.create({
                trigger: portfolioSection,
                start: 'top 80%',
                onEnter:     () => gsap.fromTo(cards, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
                onLeaveBack: () => gsap.set(cards, { x: '100vw', opacity: 0 })
            });
            ScrollTrigger.refresh();
            return;
        }

        // Scroll-driven card stacking
        scrollTl = gsap.timeline();
        wrappers.forEach((wrapper) => {
            const dist = wrapper.offsetLeft;
            if (dist > 0) scrollTl.fromTo(wrapper, { x: 0 }, { x: -dist, ease: 'none', duration: dist / maxTravel }, 0);
        });

        const threshold = window.innerWidth * 0.68;

        pinTrigger = ScrollTrigger.create({
            animation: scrollTl,
            trigger: portfolioSection,
            start: 'top top',
            end: () => `+=${maxTravel * 1.5}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: () => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const centerThreshold = window.innerWidth * 0.52;
                    if (rect.left <= threshold && rect.left > centerThreshold) {
                        if (!card._overlayVisible) {
                            card._overlayVisible = true;
                            gsap.to(card.querySelectorAll('.card-progress, .card-nav'), { opacity: 1, duration: 0.3, overwrite: 'auto' });
                            gsap.fromTo(card.querySelectorAll('.card-heart, .card-info-btn'), { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, overwrite: 'auto' });
                            const ib = card.querySelector('.portfolio-card-info');
                            if (ib) gsap.to(ib, { top: '50px', transform: 'translate(-50%, 0)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
                        }
                    } else {
                        if (card._overlayVisible) {
                            card._overlayVisible = false;
                            gsap.to(card.querySelectorAll('.card-progress, .card-nav, .card-heart, .card-info-btn'), { opacity: 0, duration: 0.2, overwrite: 'auto' });
                            const ib = card.querySelector('.portfolio-card-info');
                            if (ib) gsap.to(ib, { top: '50%', transform: 'translate(-50%, -50%)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
                        }
                    }
                });
            }
        });

        // Card entrance / exit animations
        entranceTrigger = ScrollTrigger.create({
            trigger: portfolioSection,
            start: 'top 80%',
            end: () => `+=${portfolioSection.offsetHeight + maxTravel * 2.5}`,
            onEnter: () => {
                gsap.fromTo(cards,
                    { x: '100vw', opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', overwrite: 'auto',
                      onStart:    () => cards.forEach(c => c.style.transition = 'none'),
                      onComplete: () => cards.forEach(c => c.style.transition = '') }
                );
            },
            onEnterBack: () => {
                gsap.fromTo(cards,
                    { x: '100vw', opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', overwrite: 'auto',
                      onStart:    () => cards.forEach(c => c.style.transition = 'none'),
                      onComplete: () => cards.forEach(c => c.style.transition = '') }
                );
            },
            onLeave: () => {
                gsap.to(cards, { x: '100vw', opacity: 0, duration: 0.55, stagger: 0.07, ease: 'power2.in', overwrite: 'auto' });
            },
            onLeaveBack: () => {
                gsap.set(cards, { x: '100vw', opacity: 0 });
            }
        });

        ScrollTrigger.refresh();
    }

    gsap.set(portfolioSection.querySelectorAll('.portfolio-card'), { x: '100vw', opacity: 0 });
    setTimeout(() => setupPortfolioAnimations(), 100);

    // ── Tab switching ─────────────────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('active') || isAnimating) return;

            const targetId     = this.dataset.target;
            const activeGroup  = portfolioSection.querySelector('.portfolio-slider-group.active');
            const currentCards = activeGroup ? activeGroup.querySelectorAll('.portfolio-card') : [];

            currentCards.forEach(c => {
                if (c._overlayVisible) {
                    gsap.to(c.querySelectorAll('.card-progress, .card-nav, .card-heart, .card-info-btn'), { opacity: 0, duration: 0.1 });
                    const ib = c.querySelector('.portfolio-card-info');
                    if (ib) gsap.set(ib, { top: '50%', transform: 'translate(-50%, -50%)' });
                    c._overlayVisible = false;
                }
            });

            const clickedTab = this;

            const performSwitch = () => {
                isAnimating = true;
                const targetScroll = pinTrigger ? pinTrigger.start : portfolioSection.offsetTop;
                if (targetScroll !== undefined && targetScroll > 0) window.scrollTo({ top: targetScroll, behavior: 'instant' });
                killAll();
                gsap.set(portfolioSection, { clearProps: 'transform,opacity,x,y' });

                if (activeGroup) {
                    cleanGsapProps(activeGroup.querySelectorAll('.card-wrapper'));
                    cleanGsapProps(activeGroup.querySelectorAll('.portfolio-card'));
                    activeGroup.classList.remove('active');
                    activeGroup.style.display = 'none';
                }

                tabs.forEach(t => t.classList.remove('active'));
                clickedTab.classList.add('active');

                const nextGroup = document.getElementById(targetId);
                if (nextGroup) {
                    groups.forEach(g => { if (g !== nextGroup) { g.classList.remove('active'); g.style.display = 'none'; } });
                    nextGroup.classList.add('active');
                    nextGroup.style.display = 'flex';
                    gsap.set(nextGroup.querySelectorAll('.portfolio-card'), { x: '100vw', opacity: 0 });
                    void nextGroup.offsetWidth;
                    void nextGroup.offsetHeight;
                }

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setupPortfolioAnimations();
                        const newGroup = portfolioSection.querySelector('.portfolio-slider-group.active');
                        if (newGroup) {
                            const newCards = newGroup.querySelectorAll('.portfolio-card');
                            gsap.fromTo(newCards,
                                { x: '100vw', opacity: 0 },
                                { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', overwrite: 'auto',
                                  onStart:    () => newCards.forEach(c => c.style.transition = 'none'),
                                  onComplete: () => { newCards.forEach(c => c.style.transition = ''); isAnimating = false; } }
                            );
                        } else { isAnimating = false; }
                    }, 50);
                });
            };

            if (currentCards.length > 0) {
                isAnimating = true;
                gsap.to(currentCards, {
                    x: '100vw', opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.in',
                    onComplete: () => { isAnimating = false; performSwitch(); }
                });
            } else { performSwitch(); }
        });
    });
});

// ============================================================
// MODAL
// ============================================================
function openProjectModal(title, description, imageSrc, link) {
    document.getElementById('modalTitle').textContent       = title;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalImage').src               = imageSrc;
    document.getElementById('modalLink').href               = link;
    const modal = document.getElementById('projectModal');
    if (modal) modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('projectModal');
    if (e.target === modal) closeProjectModal();
});

// ============================================================
// ABOUT STATS
// ============================================================
function updateAboutStats() {
    const totalProjects = document.querySelectorAll('#group-project .portfolio-card').length;
    const totalCerts    = document.querySelectorAll('#group-certificate .portfolio-card').length;

    const statProjectsEl = document.getElementById('stat-projects');
    if (statProjectsEl) statProjectsEl.textContent = totalProjects > 0 ? `${totalProjects}+` : '0';

    const statCertificatesEl = document.getElementById('stat-certificates');
    if (statCertificatesEl) statCertificatesEl.textContent = totalCerts > 0 ? `${totalCerts}+` : '0';

    const startDate   = new Date(2024, 6, 1);
    const currentDate = new Date();
    let yearsOfExp    = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff   = currentDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < startDate.getDate())) yearsOfExp--;

    const statExpEl = document.getElementById('stat-experience');
    if (statExpEl) statExpEl.textContent = (currentDate >= startDate ? Math.max(yearsOfExp, 1) : 0) + '+';
}

document.addEventListener('DOMContentLoaded', updateAboutStats);

console.log('Website portfolio berhasil dimuat!');