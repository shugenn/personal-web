// Smooth scrolling untuk navigasi
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

            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar active link + animated underline berdasarkan section
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const navIndicator = document.querySelector('.nav-indicator');
const navList = document.querySelector('.nav-links');
const headerElement = document.querySelector('header');
const observedSections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

function moveNavIndicator(activeLink) {
    if (!navIndicator || !navList || !activeLink) return;

    const listRect = navList.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const offsetX = linkRect.left - listRect.left;

    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = `translateX(${offsetX}px)`;
}

function setActiveNavLink(activeLink) {
    if (!activeLink) return;

    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
    moveNavIndicator(activeLink);
}

function updateHeaderMode(currentSection) {
    if (!headerElement) return;

    const isHomeSection = currentSection && currentSection.id === 'home';
    headerElement.classList.toggle('home-mode', isHomeSection);
}

function updateActiveNavByScroll() {
    if (!observedSections.length) return;

    const header = document.querySelector('header');
    const headerOffset = header ? header.offsetHeight + 20 : 90;
    const scrollTarget = window.scrollY + headerOffset;

    let currentSection = observedSections[0];

    observedSections.forEach(section => {
        if (scrollTarget >= section.offsetTop) {
            currentSection = section;
        }
    });

    const matchedLink = document.querySelector(`.nav-links a[href="#${currentSection.id}"]`);
    if (matchedLink) {
        setActiveNavLink(matchedLink);
    }

    updateHeaderMode(currentSection);
}

window.addEventListener('scroll', updateActiveNavByScroll, { passive: true });

window.addEventListener('resize', () => {
    updateActiveNavByScroll();
    const activeLink = document.querySelector('.nav-links a.active');
    moveNavIndicator(activeLink);
});

// ============================================
// HERO SECTION ANIMATIONS WITH GSAP
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const initialLink = document.querySelector('.nav-links a.active') || navLinks[0];
    setActiveNavLink(initialLink);
    updateActiveNavByScroll();

    gsap.from('.hero-image', {
        duration: 1,
        opacity: 0,
        scale: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.hero-greeting', {
        duration: 0.8,
        x: -50,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.3
    });

    gsap.from('.hero-name', {
        duration: 1,
        x: -80,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.5
    });

    gsap.from('.hero-role', {
        duration: 0.8,
        x: -50,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.7
    });

    gsap.from('.hero-socials', {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.9
    });

    gsap.from('.hero-buttons', {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power2.out',
        delay: 1.1
    });

    gsap.from('.hero-bg-letter', {
        duration: 1.5,
        opacity: 0,
        scale: 0.9,
        ease: 'power2.out',
        delay: 0.2
    });
    
    function animateWordWithLine(lineClass, dotClass, wordClass, delay = 0) {
        const line = document.querySelector(lineClass);
        const dot = document.querySelector(dotClass);
        const word = document.querySelector(wordClass);
        
        if (!line || !dot || !word) return;
        
        const lineLength = line.getTotalLength();
        
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = lineLength;
        
        const tl = gsap.timeline({ delay: delay });
        
        tl.set(line, { opacity: 1 })
        .to(line, {
            strokeDashoffset: 0,
            duration: 1,
            ease: 'power2.inOut'
        })
        .to(dot, {
            opacity: 1,
            duration: 0.2
        }, '-=0.2')
        .fromTo(word, 
            { opacity: 0, y: -15 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' },
            '-=0.1'
        );
        
        return tl;
    }
    
    animateWordWithLine('.line-dreamer', '.dot-dreamer', '.word-dreamer', 1.5);
    animateWordWithLine('.line-yearner', '.dot-yearner', '.word-yearner', 1.8);
    animateWordWithLine('.line-rizzler', '.dot-rizzler', '.word-rizzler', 2.1);
    
    gsap.from('.about .hero-stats', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.4
    });
});

// ============================================
// PORTFOLIO INTERACTIVE UI
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.portfolio-tab');
    const groups = document.querySelectorAll('.portfolio-slider-group');
    const portfolioSection = document.getElementById('projects');

    if (!portfolioSection) return;

    // ─── STATE ───────────────────────────────────────────────
    let scrollTl        = null;
    let pinTrigger      = null;
    let entranceTrigger = null;
    let isAnimating     = false;

    // ─── HELPERS ─────────────────────────────────────────────

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
        if (scrollTl)        { scrollTl.kill();  scrollTl = null; }
        if (entranceTrigger) { entranceTrigger.kill(true);  entranceTrigger = null; }

        if (pinTrigger) {
            pinTrigger.kill(true);
            pinTrigger = null;

            // GSAP pin meng-inject inline style: position, top, width, dll
            // ke portfolioSection dan wrapper pin-spacer yang ia buat.
            // Harus di-reset manual agar section tidak tetap menempel/overlap.
            portfolioSection.style.position   = '';
            portfolioSection.style.top        = '';
            portfolioSection.style.left       = '';
            portfolioSection.style.width      = '';
            portfolioSection.style.zIndex     = '';
            portfolioSection.style.transform  = '';
            portfolioSection.style.willChange = '';

            // Hapus pin-spacer yang dibuat GSAP (div pembungkus sementara)
            const pinSpacer = portfolioSection.parentElement;
            if (pinSpacer && pinSpacer.classList.contains('pin-spacer')) {
                // Pindahkan section kembali ke parent aslinya sebelum spacer dihapus
                pinSpacer.parentElement.insertBefore(portfolioSection, pinSpacer);
                pinSpacer.parentElement.removeChild(pinSpacer);
            }
        }

        // Refresh semua ScrollTrigger yang tersisa agar posisi dihitung ulang
        ScrollTrigger.refresh();
    }

    // ─── RESET LAYOUT BERSIH ─────────────────────────────────
    // Hanya bersihkan properti transform/opacity dari GSAP,
    // JANGAN clearProps:'all' karena merusak display/height dari CSS
    function cleanGsapProps(elements) {
        if (!elements || !elements.length) return;
        gsap.set(elements, { clearProps: 'x,y,opacity,transform,transition' });
    }

    // ─── SETUP UTAMA ─────────────────────────────────────────
    function setupPortfolioAnimations() {
        killAll();

        // Bersihkan hanya transform dari section — bukan semua props
        gsap.set(portfolioSection, { clearProps: 'transform,opacity' });

        const activeGroup = portfolioSection.querySelector('.portfolio-slider-group.active');
        if (!activeGroup) return;

        const cards = activeGroup.querySelectorAll('.portfolio-card');
        if (!cards.length) return;

        ensureWrappersAndOverlays(cards);

        // Pastikan group aktif visible dengan display flex
        activeGroup.style.display = 'flex';

        // Bersihkan transform lama dari card & wrapper
        const wrappers = activeGroup.querySelectorAll('.card-wrapper');
        cleanGsapProps(wrappers);
        cleanGsapProps(cards);

        // Force reflow agar offsetLeft akurat
        void activeGroup.offsetWidth;
        void activeGroup.offsetHeight;

        // ── Hitung jarak tempuh ──────────────────────────────
        let maxTravel = 0;
        if (wrappers.length > 1) {
            maxTravel = wrappers[wrappers.length - 1].offsetLeft;
        }
        if (!maxTravel || maxTravel <= 0) {
            // Fallback: card 320px + gap 2rem(32px) = 352px
            maxTravel = (wrappers.length - 1) * 352;
        }

        // Jika hanya 1 card atau maxTravel = 0, skip scroll animation
        if (maxTravel <= 0) {
            // Hanya setup entrance tanpa scroll stacking
            entranceTrigger = ScrollTrigger.create({
                trigger: portfolioSection,
                start: 'top 80%',
                onEnter: () => {
                    gsap.fromTo(cards,
                        { x: '100vw', opacity: 0 },
                        { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
                    );
                },
                onLeaveBack: () => {
                    gsap.set(cards, { x: '100vw', opacity: 0 });
                }
            });
            ScrollTrigger.refresh();
            return;
        }

        // ── 1. Scroll-driven stacking timeline ───────────────
        scrollTl = gsap.timeline();

        wrappers.forEach((wrapper) => {
            const dist = wrapper.offsetLeft;
            if (dist > 0) {
                scrollTl.fromTo(wrapper,
                    { x: 0 },
                    { x: -dist, ease: 'none', duration: dist / maxTravel },
                    0
                );
            }
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
                            const statics = card.querySelectorAll('.card-progress, .card-nav');
                            const actions  = card.querySelectorAll('.card-heart, .card-info-btn');
                            const infoBox  = card.querySelector('.portfolio-card-info');

                            gsap.to(statics, { opacity: 1, duration: 0.3, overwrite: 'auto' });
                            gsap.fromTo(actions,
                                { y: 15, opacity: 0 },
                                { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, overwrite: 'auto' }
                            );
                            if (infoBox) {
                                gsap.to(infoBox, {
                                    top: '50px',
                                    transform: 'translate(-50%, 0)',
                                    duration: 0.4, ease: 'power2.out', overwrite: 'auto'
                                });
                            }
                        }
                    } else {
                        if (card._overlayVisible) {
                            card._overlayVisible = false;
                            const allOvs = card.querySelectorAll('.card-progress, .card-nav, .card-heart, .card-info-btn');
                            const infoBox = card.querySelector('.portfolio-card-info');

                            gsap.to(allOvs, { opacity: 0, duration: 0.2, overwrite: 'auto' });
                            if (infoBox) {
                                gsap.to(infoBox, {
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    duration: 0.4, ease: 'power2.out', overwrite: 'auto'
                                });
                            }
                        }
                    }
                });
            }
        });

        // ── 2. Entrance animation ────────────────────────────
        const playEntrance = () => {
            gsap.fromTo(cards,
                { x: '100vw', opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.8, stagger: 0.12,
                    ease: 'power3.out', overwrite: 'auto',
                    onStart:    () => cards.forEach(c => c.style.transition = 'none'),
                    onComplete: () => cards.forEach(c => c.style.transition = '')
                }
            );
        };

        const resetEntrance = () => {
            gsap.set(cards, { x: '100vw', opacity: 0 });
        };

        entranceTrigger = ScrollTrigger.create({
            trigger: portfolioSection,
            start: 'top 80%',
            end: () => `+=${portfolioSection.offsetHeight + maxTravel * 2.5}`,
            onEnter:      playEntrance,
            onEnterBack:  playEntrance,
            onLeaveBack:  resetEntrance
        });

        ScrollTrigger.refresh();
    }

    // ─── INISIASI AWAL ───────────────────────────────────────
    gsap.set(portfolioSection.querySelectorAll('.portfolio-card'), { x: '100vw', opacity: 0 });

    setTimeout(() => {
        setupPortfolioAnimations();
    }, 100);

    // ─── TAB SWITCHING ───────────────────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.classList.contains('active') || isAnimating) return;

            const targetId    = this.dataset.target;
            const activeGroup = portfolioSection.querySelector('.portfolio-slider-group.active');
            const currentCards = activeGroup ? activeGroup.querySelectorAll('.portfolio-card') : [];

            // Tutup semua overlay yang terbuka
            currentCards.forEach(c => {
                if (c._overlayVisible) {
                    const allOvs = c.querySelectorAll('.card-progress, .card-nav, .card-heart, .card-info-btn');
                    const infoBox = c.querySelector('.portfolio-card-info');
                    gsap.to(allOvs, { opacity: 0, duration: 0.1 });
                    if (infoBox) gsap.set(infoBox, { top: '50%', transform: 'translate(-50%, -50%)' });
                    c._overlayVisible = false;
                }
            });

            const clickedTab = this;

            const performSwitch = () => {
                isAnimating = true;

                // 1. Simpan posisi scroll awal ScrollTrigger sebelum dihancurkan
                const targetScroll = pinTrigger ? pinTrigger.start : portfolioSection.offsetTop;

                // 1b. Scroll ke posisi awal SEBELUM killAll agar pin-spacer
                //     tidak menyebabkan lompatan layout saat spacer dihapus
                if (targetScroll !== undefined && targetScroll > 0) {
                    window.scrollTo({ top: targetScroll, behavior: 'instant' });
                }

                // 2. Hancurkan semua trigger & timeline aktif
                killAll();

                // 3. Bersihkan HANYA transform/opacity GSAP dari section
                //    JANGAN clearProps:'all' — merusak display, height, dll dari CSS
                gsap.set(portfolioSection, { clearProps: 'transform,opacity,x,y' });

                // Bersihkan props dari group & card yang lama
                if (activeGroup) {
                    const oldWrappers = activeGroup.querySelectorAll('.card-wrapper');
                    cleanGsapProps(oldWrappers);
                    const oldCards = activeGroup.querySelectorAll('.portfolio-card');
                    cleanGsapProps(oldCards);

                    // Sembunyikan group lama secara eksplisit
                    activeGroup.classList.remove('active');
                    activeGroup.style.display = 'none';
                }

                // 4. Update tab active
                tabs.forEach(t => t.classList.remove('active'));
                clickedTab.classList.add('active');

                // 5. Tampilkan group baru
                const nextGroup = document.getElementById(targetId);
                if (nextGroup) {
                    // Pastikan group lain tersembunyi
                    groups.forEach(g => {
                        if (g !== nextGroup) {
                            g.classList.remove('active');
                            g.style.display = 'none';
                        }
                    });

                    nextGroup.classList.add('active');
                    nextGroup.style.display = 'flex'; // Paksa display flex langsung

                    // Set kartu baru di luar layar sebelum entrance
                    const nextCards = nextGroup.querySelectorAll('.portfolio-card');
                    gsap.set(nextCards, { x: '100vw', opacity: 0 });

                    // Force reflow agar layout terukur dengan benar
                    void nextGroup.offsetWidth;
                    void nextGroup.offsetHeight;
                }

                // 6. Build ulang animasi setelah DOM stabil
                //    Gunakan requestAnimationFrame + setTimeout untuk pastikan layout sudah siap
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setupPortfolioAnimations();

                        // 7. Jalankan entrance animation untuk kartu baru
                        const newGroup = portfolioSection.querySelector('.portfolio-slider-group.active');
                        if (newGroup) {
                            const newCards = newGroup.querySelectorAll('.portfolio-card');
                            gsap.fromTo(newCards,
                                { x: '100vw', opacity: 0 },
                                {
                                    x: 0, opacity: 1,
                                    duration: 0.8, stagger: 0.12,
                                    ease: 'power3.out', overwrite: 'auto',
                                    onStart: () => newCards.forEach(c => c.style.transition = 'none'),
                                    onComplete: () => {
                                        newCards.forEach(c => c.style.transition = '');
                                        isAnimating = false;
                                    }
                                }
                            );
                        } else {
                            isAnimating = false;
                        }
                    }, 50); // Delay kecil agar reflow selesai
                });
            };

            // Animasi exit kartu lama, lalu switch
            if (currentCards.length > 0) {
                isAnimating = true;
                gsap.to(currentCards, {
                    x: '100vw',
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power3.in',
                    onComplete: () => {
                        isAnimating = false;
                        performSwitch();
                    }
                });
            } else {
                performSwitch();
            }
        });
    });
});

// ============================================
// Modal Logic
// ============================================
function openProjectModal(title, description, imageSrc, link) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('modalLink').href = link;
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

// ============================================
// CONTACT SECTION FUNCTIONALITY
// ============================================
const copyEmailBtn    = document.getElementById('copyEmailBtn');
const copyStatus      = document.getElementById('copyStatus');
const commentForm     = document.getElementById('commentForm');
const commentList     = document.getElementById('commentList');
const commentStorageKey = 'portfolioComments';

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getStoredComments() {
    try {
        const stored = localStorage.getItem(commentStorageKey);
        return stored ? JSON.parse(stored) : [];
    } catch { return []; }
}

function saveComments(comments) {
    localStorage.setItem(commentStorageKey, JSON.stringify(comments));
}

function renderComments() {
    if (!commentList) return;
    const comments = getStoredComments();
    if (comments.length === 0) {
        commentList.innerHTML = '<p>No comments yet.</p>';
        return;
    }
    commentList.innerHTML = comments
        .map(c => `
            <div class="comment-item">
                <p class="comment-name">${escapeHtml(c.name)}</p>
                <p class="comment-message">${escapeHtml(c.message)}</p>
            </div>`)
        .join('');
}

if (copyEmailBtn && copyStatus) {
    copyEmailBtn.addEventListener('click', async () => {
        const email = copyEmailBtn.dataset.email || '';
        if (!email) { copyStatus.textContent = 'Email is not available.'; return; }
        try {
            await navigator.clipboard.writeText(email);
            copyStatus.textContent = 'Email copied to clipboard.';
        } catch {
            copyStatus.textContent = `Copy failed. Please use: ${email}`;
        }
    });
}

// ============================================
// ABOUT STATS COMPONENT
// ============================================
function updateAboutStats() {
    const totalProjects = typeof projectData !== 'undefined' ? projectData.length : 0;
    const statProjectsEl = document.getElementById('stat-projects');
    if (statProjectsEl) statProjectsEl.textContent = totalProjects > 0 ? `${totalProjects}+` : totalProjects;

    const statCertificatesEl = document.getElementById('stat-certificates');
    if (statCertificatesEl) statCertificatesEl.textContent = 0;

    const startDate   = new Date(2024, 6, 1);
    const currentDate = new Date();
    let yearsOfExp    = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff   = currentDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < startDate.getDate())) yearsOfExp--;
    let displayYears = currentDate >= startDate ? Math.max(yearsOfExp, 1) : 0;

    const statExpEl = document.getElementById('stat-experience');
    if (statExpEl) statExpEl.textContent = displayYears + '+';
}

document.addEventListener('DOMContentLoaded', updateAboutStats);

if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(commentForm);
        const name    = (formData.get('name')    || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();
        if (!name || !message) return;
        const comments = getStoredComments();
        comments.unshift({ name, message });
        saveComments(comments);
        commentForm.reset();
        renderComments();
    });
}

renderComments();

console.log('Website portfolio berhasil dimuat!');