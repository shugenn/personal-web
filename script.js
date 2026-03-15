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

// Tunggu sampai DOM dan GSAP siap
document.addEventListener('DOMContentLoaded', function() {
    const initialLink = document.querySelector('.nav-links a.active') || navLinks[0];
    setActiveNavLink(initialLink);
    updateActiveNavByScroll();

    
    // Animasi foto masuk
    gsap.from('.hero-image', {
        duration: 1,
        opacity: 0,
        scale: 0.8,
        ease: 'power2.out'
    });

    // Animasi teks hero dari kiri
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

    // Background letter subtle animation
    gsap.from('.hero-bg-letter', {
        duration: 1.5,
        opacity: 0,
        scale: 0.9,
        ease: 'power2.out',
        delay: 0.2
    });
    
    // Fungsi untuk animasi lengkap (garis + kata)
    function animateWordWithLine(lineClass, dotClass, wordClass, delay = 0) {
        const line = document.querySelector(lineClass);
        const dot = document.querySelector(dotClass);
        const word = document.querySelector(wordClass);
        
        if (!line || !dot || !word) return;
        
        const lineLength = line.getTotalLength();
        
        // Set initial state untuk line
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = lineLength;
        
        // Timeline untuk satu animate in saja
        const tl = gsap.timeline({
            delay: delay
        });
        
        // 1. Tampilkan garis dan jalankan animasi wipe dari gambar ke kata
        // Menggunakan set opacity agar titik "stroke-linecap" tidak muncul di awal saat delay
        tl.set(line, { opacity: 1 })
        .to(line, {
            strokeDashoffset: 0,
            duration: 1,
            ease: 'power2.inOut'
        })
        
        // 2. Dot muncul
        .to(dot, {
            opacity: 1,
            duration: 0.2
        }, '-=0.2')
        
        // 3. Kata muncul dengan baseline (dari arah panah)
        .fromTo(word, 
            {
                opacity: 0,
                y: -15
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'back.out(1.7)'
            },
            '-=0.1'
        );
        
        return tl;
    }
    
    // Jalankan animasi untuk setiap kata dengan stagger delay
    animateWordWithLine('.line-dreamer', '.dot-dreamer', '.word-dreamer', 1.5);
    animateWordWithLine('.line-yearner', '.dot-yearner', '.word-yearner', 1.8);
    animateWordWithLine('.line-rizzler', '.dot-rizzler', '.word-rizzler', 2.1);
    
    // About section stats animation
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
// PORTFOLIO INTERACTIVE UI WITH GSAP
// ============================================

const tabs = document.querySelectorAll(".portfolio-tab");
const groups = document.querySelectorAll(".portfolio-slider-group");

tabs.forEach(tab => {
    tab.addEventListener("click", function() {
        if(this.classList.contains("active")) return;
        
        tabs.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        
        const targetId = this.getAttribute("data-target");
        const nextGroup = document.getElementById(targetId);
        const currentGroup = document.querySelector(".portfolio-slider-group.active");
        
        if (currentGroup) {
            const currentCards = currentGroup.querySelectorAll(".portfolio-card");
            // Slide out ke kanan
            gsap.to(currentCards, {
                x: 400,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.in",
                onComplete: () => {
                    currentGroup.classList.remove("active");
                    gsap.set(currentCards, { clearProps: "all" });
                }
            });
        }
        
        if (nextGroup) {
            nextGroup.classList.add("active");
            const nextCards = nextGroup.querySelectorAll(".portfolio-card");
            
            // Slide in dari kanan
            gsap.from(nextCards, {
                x: 400,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });
        }
    });
});

// Card Click Event for Dummy Modal
document.querySelectorAll(".portfolio-card").forEach(card => {
    card.addEventListener("click", function() {
        const title = this.querySelector("h3").innerText;
        const img = this.querySelector("img").src;
        openProjectModal(title, "Detail dari " + title + ". Ini adalah project dummy interaktif.", img);
    });
});

function openProjectModal(title, description, image) {
    const modal = document.getElementById("projectModal");
    
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDescription").textContent = description;
    document.getElementById("modalLink").href = "#";
    document.getElementById("modalImage").src = image;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modal ketika klik di luar content
document.getElementById('projectModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeProjectModal();
    }
});

// Close modal dengan tombol Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeProjectModal();
    }
});



// ============================================
// CONTACT SECTION FUNCTIONALITY
// ============================================

const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyStatus = document.getElementById('copyStatus');
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
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
    } catch {
        return [];
    }
}

function saveComments(comments) {
    localStorage.setItem(commentStorageKey, JSON.stringify(comments));
}

function renderComments() {
    if (!commentList) {
        return;
    }

    const comments = getStoredComments();

    if (comments.length === 0) {
        commentList.innerHTML = '<p>No comments yet.</p>';
        return;
    }

    commentList.innerHTML = comments
        .map(comment => `
            <div class="comment-item">
                <p class="comment-name">${escapeHtml(comment.name)}</p>
                <p class="comment-message">${escapeHtml(comment.message)}</p>
            </div>
        `)
        .join('');
}

if (copyEmailBtn && copyStatus) {
    copyEmailBtn.addEventListener('click', async () => {
        const email = copyEmailBtn.dataset.email || '';

        if (!email) {
            copyStatus.textContent = 'Email is not available.';
            return;
        }

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
    // 1. Update Total Projects
    // Mengambil dari jumlah array projectData
    const totalProjects = typeof projectData !== 'undefined' ? projectData.length : 0;
    const statProjectsEl = document.getElementById('stat-projects');
    if (statProjectsEl) {
        // beri tanda + jika diinginkan. Sementara memakai data murni
        statProjectsEl.textContent = totalProjects > 0 ? `${totalProjects}+` : totalProjects;
    }

    // 2. Update Total Certificates
    // Placeholder, nilai akan diganti setelah data sertifikat disiapkan
    const totalCertificates = 0; 
    const statCertificatesEl = document.getElementById('stat-certificates');
    if (statCertificatesEl) {
        statCertificatesEl.textContent = totalCertificates;
    }

    // 3. Update Years of Experience
    // Logika: Dihitung mulai bulan Juli 2024 (Bulan ke-6 dalam index js, karena Jan=0)
    const startDate = new Date(2024, 6, 1);
    const currentDate = new Date();
    
    let yearsOfExp = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff = currentDate.getMonth() - startDate.getMonth();
    
    // Jika belum melewati/sampai di bulan awal pada tahun berjalan, kurangi 1 tahun (opsional, tergantung presisi)
    // Di sini asumsi setidaknya sudah 1+ jika lewat Juli 2024, kalau belum 1 tahun penuh tetap 0+
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < startDate.getDate())) {
        yearsOfExp--;
    }

    // Jika tahun berjalan telah lebih dari Juli 2024, jika belum genap setahun tapi mau diset 1+, modifikasi di bawah
    // Namun instruksinya: jika telah melewati bulan tersebut (mengandung bulan lebih dll) + "tanda + tidak bulat"
    // Contoh untuk current date > july 2024 maka bisa diisi manual 1+ jika belum setahun persis.
    let displayYears = yearsOfExp;

    if (currentDate >= startDate) {
        if (yearsOfExp < 1 && (currentDate.getFullYear() > startDate.getFullYear() || currentDate.getMonth() > startDate.getMonth())) {
            // Berlaku misalnya di 2025/2026 tapi hitungan matematiknya 0. Bisa dipaksa 1 jika maksudnya "memasuki tahun pertama"
            displayYears = 1;
        } else if (yearsOfExp < 1) {
            displayYears = 1; // sesuai prompt "ketik saja 1+ karena mulai juli 2024"
        }
    }

    const statExpEl = document.getElementById('stat-experience');
    if (statExpEl) {
        statExpEl.textContent = displayYears + '+';
    }
}

document.addEventListener('DOMContentLoaded', updateAboutStats);

if (commentForm) {
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(commentForm);
        const name = (formData.get('name') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        if (!name || !message) {
            return;
        }

        const comments = getStoredComments();
        comments.unshift({ name, message });
        saveComments(comments);
        commentForm.reset();
        renderComments();
    });
}

renderComments();

// Log ketika halaman selesai dimuat
console.log('Website portfolio dengan wave effect berhasil dimuat!');




