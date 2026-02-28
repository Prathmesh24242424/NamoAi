document.addEventListener('DOMContentLoaded', () => {

    // NAVBAR TOGGLE
    const navToggle = document.getElementById('nav-toggle');
    const navBar = document.getElementById('navbar');
    const body = document.body;

    // Initialize mobile state
    function handleResize() {
        if (window.matchMedia('(max-width: 1024px)').matches) {
            body.classList.add('nav-collapsed');
            navBar.classList.add('collapsed');
        } else {
            body.classList.remove('nav-collapsed');
            navBar.classList.remove('collapsed');
        }
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    navToggle.addEventListener('click', () => {
        body.classList.toggle('nav-collapsed');
        navBar.classList.toggle('collapsed');
        if (!navBar.classList.contains('collapsed')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close nav when clicking a link on mobile
    document.querySelectorAll('.nav-link, .nav-container .btn').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                body.classList.add('nav-collapsed');
                navBar.classList.add('collapsed');
                body.style.overflow = '';
            }
        });
    });

    // 1. STAGGERED HEADLINE ANIMATION
    const headline = document.querySelector('.hero-title');
    // Exclude the span with text-gradient from splitting to preserve HTML structure
    const textNodes = Array.from(headline.childNodes).filter(node => node.nodeType === 3);
    textNodes.forEach(node => {
        const text = node.textContent;
        if (text.trim() === '') return;

        let charIndex = 0;
        const splitText = text.split(/(\s+)/).map(word => {
            if (word.trim() === '') {
                charIndex += word.length;
                return word;
            }
            return `<span style="white-space: nowrap;">` + word.split('').map(char => {
                const delay = charIndex * 0.05;
                charIndex++;
                return `<span class="char" style="animation-delay: ${delay}s">${char}</span>`;
            }).join('') + `</span>`;
        }).join('');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = splitText;
        headline.insertBefore(tempDiv, node);
        headline.removeChild(node);

        // Unwrap the div
        while (tempDiv.firstChild) {
            headline.insertBefore(tempDiv.firstChild, tempDiv);
        }
        headline.removeChild(tempDiv);
    });

    // Make the span letters fade in too
    const gradientSpan = headline.querySelector('.text-gradient');
    if (gradientSpan) {
        const spanText = gradientSpan.textContent;
        let charIndex = 0;
        const splitSpan = spanText.split(/(\s+)/).map(word => {
            if (word.trim() === '') {
                charIndex += word.length;
                return word;
            }
            return `<span style="white-space: nowrap;">` + word.split('').map(char => {
                const delay = (charIndex * 0.05) + 0.5;
                charIndex++;
                return `<span class="char" style="animation-delay: ${delay}s">${char}</span>`;
            }).join('') + `</span>`;
        }).join('');
        gradientSpan.innerHTML = splitSpan;
    }

    // Magnetic Buttons
    const magnetBtns = document.querySelectorAll('.magnet-btn');
    magnetBtns.forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'translate(0px, 0px)';
        });
    });

    // 3 & 4. OPTIMIZED HIGH-PERFORMANCE SCROLL OBSERVER
    const scrollProgress = document.getElementById('scroll-progress');
    const navbar = document.getElementById('navbar');
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // Task A: Scroll Progress Bar (width scaling is cheaper than full repaints)
                const totalHeight = document.body.scrollHeight - window.innerHeight;
                const progress = (window.scrollY / totalHeight) * 100;
                scrollProgress.style.transform = `scaleX(${progress / 100})`;
                scrollProgress.style.transformOrigin = 'left center';

                // Task B: Navbar Glass Transition
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                    document.body.classList.add('scrolled-toggles');
                } else {
                    navbar.classList.remove('scrolled');
                    document.body.classList.remove('scrolled-toggles');
                }

                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // 5. INTERSECTION OBSERVER FOR REVEALS & TIMELINE
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else if (entry.boundingClientRect.top > 0) {
                // Remove active class to allow re-trigger on scroll ONLY when scrolling back above
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, #timeline').forEach(el => {
        observer.observe(el);
    });

    // 6. 3D TILT EFFECT FOR CARDS
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = ((y - centerY) / centerY) * -10; // max 10deg rotation
            const tiltY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    // 7. COUNTER UP ANIMATION
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    if (counter.animationComplete) return;

                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // ms
                    const step = target / (duration / 16); // 60fps
                    let current = 0;

                    if (counter.animationId) {
                        cancelAnimationFrame(counter.animationId);
                    }

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            counter.animationId = requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                            counter.animationComplete = true;
                        }
                    };
                    updateCounter();
                });
            } else if (entry.boundingClientRect.top > 0) {
                // Reset counters to 0 to re-trigger on next scroll ONLY when scrolling back above
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    counter.animationComplete = false;
                    if (counter.animationId) {
                        cancelAnimationFrame(counter.animationId);
                    }
                    counter.innerText = '0';
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('stats-section');
    if (statsSection) counterObserver.observe(statsSection);

    // 8. BACKGROUND VIDEO SMOOTH PARALLAX & SLOW MOTION
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
        // Force slow motion optimally on the video element
        bgVideo.playbackRate = 0.5;

    }
    // 9. INTERACTIVE 3D CORE IN ABOUT SECTION
    const aboutWrapper = document.querySelector('.about-img-wrapper');
    const interactiveCore = document.getElementById('interactive-core');

    if (aboutWrapper && interactiveCore) {
        aboutWrapper.addEventListener('mousemove', (e) => {
            const rect = aboutWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Multiply for intensity of rotation
            const rotateX = (y / (rect.height / 2)) * -25;
            const rotateY = (x / (rect.width / 2)) * 25;

            interactiveCore.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        aboutWrapper.addEventListener('mouseleave', () => {
            interactiveCore.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    // 10. WHATSAPP FORM INTEGRATION
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get button to show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Connecting...';
            submitBtn.style.opacity = '0.8';

            // Gather data
            const name = this.querySelector('#form-name').value;
            const email = this.querySelector('#form-email').value;
            const mobile = this.querySelector('#form-mobile').value;
            const location = this.querySelector('#form-location').value;
            const service = this.querySelector('#form-service').value;
            const message = this.querySelector('#form-message').value;

            // Format message neatly for WhatsApp (WhatsApp supports *bold* and _italic_)
            const text = `*New Project Inquiry* 🚀\n\n` +
                `*Name:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Mobile:* ${mobile}\n` +
                `*Location:* ${location}\n` +
                `*Service Required:* ${service}\n\n` +
                `*Message:*\n${message}`;

            const encodedText = encodeURIComponent(text);
            const whatsappUrl = `https://wa.me/919579057085?text=${encodedText}`;

            // Reset button and open WhatsApp
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.opacity = '1';
                window.open(whatsappUrl, '_blank');
                contactForm.reset();
            }, 600); // Tiny delay so user feels the "Connecting..." interaction
        });
    }
});