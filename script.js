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
// CAROUSEL FUNCTIONALITY WITH WAVE EFFECT
// ============================================

const carousel = document.querySelector('.portfolio-carousel');
const carouselCards = document.querySelectorAll('.portfolio-card');

// Data project dengan Lorem Ipsum
const projectData = [
    {
        title: 'Lorem Ipsum Dolor Sit',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        image: 'https://via.placeholder.com/500x500/5f3475/ffffff?text=Project+1',
        link: '#'
    },
    {
        title: 'Consectetur Adipiscing',
        description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
        image: 'https://via.placeholder.com/500x500/708d81/ffffff?text=Project+2',
        link: '#'
    },
    {
        title: 'Sed Do Eiusmod Tempor',
        description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
        image: 'https://via.placeholder.com/500x500/893172/ffffff?text=Project+3',
        link: '#'
    },
    {
        title: 'Incididunt Ut Labore',
        description: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
        image: 'https://via.placeholder.com/500x500/213885/ffffff?text=Project+4',
        link: '#'
    },
    {
        title: 'Magna Aliqua Enim',
        description: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.',
        image: 'https://via.placeholder.com/500x500/081849/ffffff?text=Project+5',
        link: '#'
    }
];

// Fungsi untuk update wave effect berdasarkan posisi scroll
function updateCardsWaveEffect() {
    const carouselRect = carousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;
    
    let centerCardIndex = -1;
    let minDistance = Infinity;
    
    // Cari card yang paling dekat dengan center
    carouselCards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - carouselCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            centerCardIndex = index;
        }
    });
    
    // Apply classes berdasarkan posisi
    carouselCards.forEach((card, index) => {
        card.classList.remove('center', 'adjacent');
        
        if (index === centerCardIndex) {
            card.classList.add('center');
        } else if (Math.abs(index - centerCardIndex) === 1) {
            card.classList.add('adjacent');
        }
    });
}

// Update wave effect saat scroll
carousel.addEventListener('scroll', updateCardsWaveEffect);

// Initial update
setTimeout(() => {
    updateCardsWaveEffect();
}, 100);

// Tambahkan event listener untuk klik di setiap card
carouselCards.forEach((card, index) => {
    card.addEventListener('click', function() {
        // Hanya buka modal jika card adalah center card
        if (this.classList.contains('center')) {
            openProjectModal(index);
        } else {
            // Scroll ke card yang diklik
            scrollToCard(index);
        }
    });
});

// Fungsi untuk scroll ke card tertentu
function scrollToCard(index) {
    const cardWidth = carouselCards[0].offsetWidth;
    const overlap = 120; // margin-left overlap
    const scrollPosition = index * (cardWidth - overlap);
    
    carousel.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

function openProjectModal(index) {
    const modal = document.getElementById('projectModal');
    const project = projectData[index];
    
    // Update modal content
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    document.getElementById('modalLink').href = project.link;
    document.getElementById('modalImage').src = project.image;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
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

// Update wave effect saat window resize
window.addEventListener('resize', () => {
    updateCardsWaveEffect();
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
