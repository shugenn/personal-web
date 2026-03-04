// Smooth scrolling untuk navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animasi untuk tombol CTA
const ctaButton = document.querySelector('.cta-button');

if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const projectsSection = document.querySelector('#projects');
        projectsSection.scrollIntoView({
            behavior: 'smooth'
        });
    });
}

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

// Log ketika halaman selesai dimuat
console.log('Website portfolio dengan wave effect berhasil dimuat!');
