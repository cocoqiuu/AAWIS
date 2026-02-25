// Tab Navigation - run when DOM ready (handles script-at-bottom case where DOMContentLoaded already fired)
function initPage() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const isIndexPage = document.getElementById('home') && document.getElementById('home').classList.contains('tab-content');

    // Tab switching functionality
    function switchTab(tabName) {
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    if (isIndexPage) {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const tabName = this.getAttribute('data-tab');
                if (tabName) {
                    e.preventDefault();
                    switchTab(tabName);
                    window.location.hash = tabName;
                    if (navMenu) navMenu.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                }
            });
        });
    }

    // On index: show the tab from URL (?tab= from profile page, or #hash from same-page). ?tab= is reliable when coming from another page.
    if (isIndexPage) {
        var validTabs = ['home', 'about', 'team', 'events', 'contact'];
        function getTabFromUrl() {
            var params = new URLSearchParams(window.location.search);
            var tabParam = params.get('tab');
            if (tabParam && validTabs.indexOf(tabParam) !== -1 && document.getElementById(tabParam)) return tabParam;
            var hash = (window.location.hash || '').replace(/^#/, '');
            if (hash && validTabs.indexOf(hash) !== -1 && document.getElementById(hash)) return hash;
            return 'home';
        }
        function showTabFromUrl() {
            var tab = getTabFromUrl();
            switchTab(tab);
            if (window.history && window.history.replaceState) {
                var params = new URLSearchParams(window.location.search);
                if (params.has('tab')) {
                    var path = window.location.pathname;
                    if (!path || path === '/') path = '/index.html';
                    path += (tab !== 'home' ? '#' + tab : '');
                    window.history.replaceState(null, '', path);
                }
            }
        }
        showTabFromUrl();
        window.addEventListener('hashchange', showTabFromUrl);
        window.addEventListener('load', showTabFromUrl);
        window.addEventListener('pageshow', function(e) {
            if (e.persisted) showTabFromUrl();
        });
    }

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for same-page # anchors (index only)
    if (isIndexPage) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Form submission handling (Formspree)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nameEl = this.querySelector('[name="name"]');
            const emailEl = this.querySelector('[name="email"]');
            const subjectEl = this.querySelector('[name="subject"]');
            const messageEl = this.querySelector('[name="message"]');
            const name = (nameEl && nameEl.value || '').trim();
            const email = (emailEl && emailEl.value || '').trim();
            const subject = (subjectEl && subjectEl.value || '').trim();
            const message = (messageEl && messageEl.value || '').trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            const formData = new FormData(this);
            formData.append('_replyto', email);

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    console.log('Formspree: submission sent successfully.');
                    alert('Thank you for your message! We\'ll get back to you soon.');
                    this.reset();
                } else {
                    const data = await response.json().catch(() => ({}));
                    console.error('Formspree error:', response.status, data);
                    alert(data.error || 'Something went wrong. Please try again or email us at hello@aawis.org.');
                }
            } catch (err) {
                console.error('Formspree submission failed:', err);
                alert('Something went wrong. Please try again or email us at hello@aawis.org.');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // Button click handlers
    const learnMoreBtn = document.querySelector('.btn-primary');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            switchTab('about');
        });
    }

    const getInvolvedBtn = document.querySelector('.btn-secondary');
    if (getInvolvedBtn) {
        getInvolvedBtn.addEventListener('click', function() {
            switchTab('contact');
        });
    }

    // Event card button handlers
    document.querySelectorAll('.event-card .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventTitle = this.closest('.event-card').querySelector('h3').textContent;
            alert(`Thank you for your interest in "${eventTitle}"! We'll contact you with more details.`);
        });
    });

    // Intersection Observer for animations (optional)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.team-member, .event-card, .stat').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            if (navbar) navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            if (navbar) navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Close mobile menu on resize
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}, 250)); 
