// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const dropdownMenu = document.querySelector('.dropdown-menu');

if (hamburger && dropdownMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = dropdownMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        dropdownMenu.setAttribute('aria-hidden', !isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            dropdownMenu.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            dropdownMenu.setAttribute('aria-hidden', 'true');
        }
    });

    // On mobile, inject main nav links into dropdown
    function handleMobileNav() {
        const navMenu = document.querySelector('.nav-menu');
        const existingMobileMenu = dropdownMenu.querySelector('.nav-menu-mobile');

        if (window.innerWidth <= 768) {
            if (!existingMobileMenu && navMenu) {
                const mobileList = document.createElement('ul');
                mobileList.className = 'nav-menu-mobile';
                navMenu.querySelectorAll('.nav-link').forEach(link => {
                    const li = document.createElement('li');
                    const a = link.cloneNode(true);
                    li.appendChild(a);
                    mobileList.appendChild(li);
                });
                dropdownMenu.insertBefore(mobileList, dropdownMenu.firstChild);
            }
        } else {
            if (existingMobileMenu) {
                existingMobileMenu.remove();
            }
            // Close menu when resizing to desktop
            dropdownMenu.classList.remove('open');
            hamburger.classList.remove('active');
        }
    }

    handleMobileNav();
    window.addEventListener('resize', handleMobileNav);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            if (dropdownMenu) {
                dropdownMenu.classList.remove('open');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Add active state to navigation on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});
