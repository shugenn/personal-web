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

gsap.registerPlugin(ScrollTrigger);

function setupSectionSnap() {
    const snapSections = [
        document.querySelector('#home'),
        document.querySelector('#about'),
        document.querySelector('#blog'), 
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

        if (!scrollingDown) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            for (const sec of snapSections) {
                const rect    = sec.getBoundingClientRect();
                const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const ratio   = visible / window.innerHeight;

                const header = document.querySelector('header');
                const headerH = header ? header.offsetHeight : 70;
                const topBelowHeader = rect.top > headerH + 10;

                if (ratio > 0.55 && ratio < 0.95 && topBelowHeader) {
                    const targetY = sec.getBoundingClientRect().top + window.scrollY - headerH;
                    isSnapping = true;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                    setTimeout(() => { isSnapping = false; }, 1000);
                    break;
                }
            }
        }, 150);
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function () {

    const initialLink = document.querySelector('.nav-links a.active') || navLinks[0];
    setActiveNavLink(initialLink);
    updateActiveNavByScroll();

    setTimeout(setupSectionSnap, 500);

    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-image',    { duration: 1,   opacity: 0, scale: 0.85, ease: 'power2.out' })
        .from('.hero-greeting', { duration: 0.7, x: -50, opacity: 0 }, '-=0.6')
        .from('.hero-name',     { duration: 0.9, x: -80, opacity: 0 }, '-=0.5')
        .from('.hero-role',     { duration: 0.7, x: -50, opacity: 0 }, '-=0.5')
        .from('.hero-socials',  { duration: 0.6, y: 25,  opacity: 0 }, '-=0.4')
        .from('.hero-buttons',  { duration: 0.6, y: 25,  opacity: 0 }, '-=0.35');

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

    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const aboutTitle     = aboutSection.querySelector('.section-title');
        const aboutImg       = aboutSection.querySelector('.about-image-wrap');
        const aboutContent   = aboutSection.querySelector('.about-content');
        const aboutStatCards = aboutSection.querySelectorAll('.about-stat-card');

        gsap.set([aboutTitle, aboutContent], { autoAlpha: 0, y: 40 });
        gsap.set(aboutImg,   { autoAlpha: 0, x: -60, scale: 0.9 });
        gsap.set(aboutStatCards, { autoAlpha: 0, y: 35 });

        const enterAbout = (fromBelow) => {
            const yDir = fromBelow ? 40 : -40;

            gsap.killTweensOf([aboutTitle, aboutContent, aboutImg, ...aboutStatCards]);

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl
                .fromTo(aboutTitle,
                    { autoAlpha: 0, y: yDir },
                    { autoAlpha: 1, y: 0, duration: 0.65 })
                .fromTo(aboutImg,
                    { autoAlpha: 0, x: -60, scale: 0.9 },
                    { autoAlpha: 1, x: 0, scale: 1, duration: 0.75 }, '-=0.45')
                .fromTo(aboutContent,
                    { autoAlpha: 0, y: yDir * 0.75 },
                    { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.5')
                .fromTo(aboutStatCards,
                    { autoAlpha: 0, y: yDir * 0.75 },
                    { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 }, '-=0.3');
        };

        const leaveAbout = (goingDown) => {
            const yDir = goingDown ? -35 : 35;

            gsap.killTweensOf([aboutTitle, aboutContent, aboutImg, ...aboutStatCards]);

            gsap.to([aboutTitle, aboutContent], {
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
            start: 'top 90%',
            end: 'bottom 5%',
            onEnter:      () => enterAbout(true),
            onEnterBack:  () => enterAbout(false),
            onLeave:      () => leaveAbout(true),
            onLeaveBack:  () => leaveAbout(false),
        });
    }

    const contactSection = document.querySelector('.contact');
    if (contactSection) {
        const contactHeading = contactSection.querySelector('.contact-heading');
        const contactDivider = contactSection.querySelector('.contact-divider');
        const contactIcons   = contactSection.querySelectorAll('.contact-icon-item');
        const contactFooter  = contactSection.querySelector('.contact-footer-text');

        const allContactEls = [contactHeading, contactDivider, contactFooter].filter(Boolean);

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
            end: 'bottom 2%',
            onEnter:      () => enterContact(true),
            onEnterBack:  () => enterContact(false),
            onLeaveBack:  () => leaveContact(false),
        });
    }

    const blogSection = document.querySelector('.blog');
    if (blogSection) {
        const blogTitle    = blogSection.querySelector('.section-title');
        const blogSubtitle = blogSection.querySelector('.blog-subtitle');
        const blogCards    = blogSection.querySelectorAll('.blog-card');

        gsap.set([blogTitle, blogSubtitle], { autoAlpha: 0, y: 40 });
        gsap.set(blogCards, { autoAlpha: 0, y: 50 });

        ScrollTrigger.create({
            trigger: blogSection,
            start: 'top 85%',
            end: 'bottom 5%',
            onEnter: () => {
                gsap.killTweensOf([blogTitle, blogSubtitle, ...blogCards]);
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
                tl
                    .fromTo(blogTitle,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.65 })
                    .fromTo(blogSubtitle,
                        { autoAlpha: 0, y: 25 },
                        { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.4')
                    .fromTo(blogCards,
                        { autoAlpha: 0, y: 50 },
                        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 }, '-=0.3');
            },
            onEnterBack: () => {
                gsap.killTweensOf([blogTitle, blogSubtitle, ...blogCards]);
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
                tl
                    .fromTo(blogTitle,
                        { autoAlpha: 0, y: -30 },
                        { autoAlpha: 1, y: 0, duration: 0.55 })
                    .fromTo(blogSubtitle,
                        { autoAlpha: 0, y: -20 },
                        { autoAlpha: 1, y: 0, duration: 0.45 }, '-=0.35')
                    .fromTo(blogCards,
                        { autoAlpha: 0, y: -35 },
                        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.3');
            },
            onLeave: () => {
                gsap.killTweensOf([blogTitle, blogSubtitle, ...blogCards]);
                gsap.to([blogTitle, blogSubtitle], { autoAlpha: 0, y: -30, duration: 0.45, ease: 'power2.in' });
                gsap.to(blogCards, { autoAlpha: 0, y: -35, duration: 0.4, stagger: 0.06, ease: 'power2.in' });
            },
            onLeaveBack: () => {
                gsap.killTweensOf([blogTitle, blogSubtitle, ...blogCards]);
                gsap.to([blogTitle, blogSubtitle], { autoAlpha: 0, y: 30, duration: 0.45, ease: 'power2.in' });
                gsap.to(blogCards, { autoAlpha: 0, y: 40, duration: 0.4, stagger: 0.06, ease: 'power2.in' });
            },
        });
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const tabs             = document.querySelectorAll('.portfolio-tab');
    const groups           = document.querySelectorAll('.portfolio-slider-group');
    const portfolioSection = document.getElementById('projects');
    if (!portfolioSection) return;

    let scrollTl        = null;
    let pinTrigger      = null;
    let entranceTrigger = null;
    let isAnimating     = false;

    function ensureWrappersAndOverlays(cards) {
        cards.forEach((card) => {
            let wrapper = card.parentElement;
            if (!wrapper.classList.contains('card-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                card.parentNode.insertBefore(wrapper, card);
                wrapper.appendChild(card);
            }
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

    const sidebarEls = portfolioSection.querySelectorAll('.portfolio-heading, .portfolio-tab');
    gsap.set(sidebarEls, { autoAlpha: 0, x: -50 });

    ScrollTrigger.create({
        trigger: portfolioSection,
        start: 'top 85%',
        end: () => {
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

        scrollTl = gsap.timeline();
        wrappers.forEach((wrapper) => {
            const dist = wrapper.offsetLeft;
            if (dist > 0) scrollTl.fromTo(wrapper, { x: 0 }, { x: -dist, ease: 'none', duration: dist / maxTravel }, 0);
        });

        pinTrigger = ScrollTrigger.create({
            animation: scrollTl,
            trigger: portfolioSection,
            start: 'top top',
            end: () => `+=${maxTravel * 1.5}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
        });

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

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('active') || isAnimating) return;

            const targetId     = this.dataset.target;
            const activeGroup  = portfolioSection.querySelector('.portfolio-slider-group.active');
            const currentCards = activeGroup ? activeGroup.querySelectorAll('.portfolio-card') : [];

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

function openLightbox(card) {
    const img = card.querySelector('.portfolio-card-bg');
    if (!img) return;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

function updateAboutStats() {
    const totalProjects = document.querySelectorAll('#group-highschool .portfolio-card, #group-bince .portfolio-card, #group-putraputri .portfolio-card').length;
    const totalCerts    = 0;

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