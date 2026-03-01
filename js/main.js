const initApp = () => {

    // 0. PREMIUM INITIAL PRELOADER LOGIC
    const preloader = document.getElementById('preloader');
    const loadingProgress = document.querySelector('.loading-progress');
    const loadingPercentage = document.querySelector('.loading-percentage');

    if (preloader) {
        let progress = 0;
        let isLoaded = false;

        // Listen for actual full page load (including videos, fonts, CSS)
        window.addEventListener('load', () => { isLoaded = true; });
        if (document.readyState === 'complete') { isLoaded = true; }

        const interval = 25;

        const loaderTimer = setInterval(() => {
            if (!isLoaded) {
                // Fake progression up to 90% while waiting for network
                if (progress < 90) {
                    progress += Math.random() * 1.5;
                }
            } else {
                // When network finishes loading, sprint to 100%
                progress += 4;
            }

            if (progress >= 100) {
                progress = 100;
                clearInterval(loaderTimer);
                // Pause for a fraction of a second at 100% before dissolving
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    preloader.style.visibility = 'hidden';
                    preloader.style.pointerEvents = 'none'; // STUCK BUG FAILSAFE
                }, 300);
            }

            if (loadingProgress) loadingProgress.style.width = `${progress}%`;
            if (loadingPercentage) loadingPercentage.innerText = `${Math.floor(progress)}%`;
        }, interval);
    }

    // === LENIS HIGH PERFORMANCE SMOOTH SCROLLING ===
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Integrated RequestAnimationFrame loop for Lenis that runs 60+ fps continuously
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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

    // 5.5 FLIP CARD LOGIC (Click-based flip)
    const flipTriggers = document.querySelectorAll('.flip-trigger');
    const flipCloses = document.querySelectorAll('.flip-close');

    flipTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.flip-card');
            if (card) {
                card.classList.add('flipped');
            }
        });
    });

    flipCloses.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.flip-card');
            if (card) {
                card.classList.remove('flipped');
            }
        });
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

    // 6.5 INTERACTIVE 3D CAROUSEL (Click to spread & Drag to rotate)
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const carouselInner = document.querySelector('.carousel-inner');

    if (carouselWrapper && carouselInner) {
        let isDragging = false;
        let startX = 0;
        let currentRotateY = 0;
        let baseRotateY = 0;

        // Spread the cards on click if not active
        carouselWrapper.addEventListener('click', (e) => {
            // Ignore if clicking the revert button directly
            if (e.target.closest('.revert-stack-btn')) return;

            // Only toggle on the empty space or prompt, handle dragging cleanly
            if (!carouselWrapper.classList.contains('carousel-active')) {
                carouselWrapper.classList.add('carousel-active');
                // Reset rotation when opening
                baseRotateY = 0;
                currentRotateY = 0;
                carouselInner.style.transform = `perspective(1500px) rotateX(-5deg) rotateY(0deg)`;
            }
        });

        // Revert to Stack logic
        const revertBtn = document.querySelector('.revert-stack-btn');
        if (revertBtn) {
            revertBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent wrapper click from instantly re-opening
                carouselWrapper.classList.remove('carousel-active');

                // CRUCIAL BUG FIX: Snap the container rotation back to 0 so the stack isn't viewed from behind!
                baseRotateY = 0;
                currentRotateY = 0;
                carouselInner.style.transition = 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
                carouselInner.style.transform = `perspective(1500px) rotateX(-5deg) rotateY(0deg)`;

                // Optional but highly aesthetic: auto-unflip any flipped cards when stacking
                const flippedCards = carouselWrapper.querySelectorAll('.flip-card.flipped');
                flippedCards.forEach(card => card.classList.remove('flipped'));
            });
        }

        // Mouse Drag Logic
        carouselWrapper.addEventListener('pointerdown', (e) => {
            if (!carouselWrapper.classList.contains('carousel-active')) return;
            isDragging = true;
            startX = e.clientX;
            carouselWrapper.style.cursor = 'grabbing';
            // Disable the CSS transition for immediate drag response
            carouselInner.style.transition = 'none';
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging || !carouselWrapper.classList.contains('carousel-active')) return;

            const xMoved = e.clientX - startX;
            // Adjust sensitivity here (e.g. 0.5)
            currentRotateY = baseRotateY + (xMoved * 0.5);

            carouselInner.style.transform = `perspective(1500px) rotateX(-5deg) rotateY(${currentRotateY}deg)`;
        });

        window.addEventListener('pointerup', () => {
            if (isDragging) {
                isDragging = false;
                carouselWrapper.style.cursor = 'grab';
                baseRotateY = currentRotateY; // Save position for next drag
                // Re-enable smooth transition for releasing
                carouselInner.style.transition = 'transform 0.1s';
            }
        });

        // specific button click logic for arrows
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        const rotateCarouselBy = (degrees) => {
            // Apply a nice smooth CSS transition specifically for button clicks
            carouselInner.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
            currentRotateY += degrees;
            baseRotateY = currentRotateY;
            carouselInner.style.transform = `perspective(1500px) rotateX(-5deg) rotateY(${currentRotateY}deg)`;
        };

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent closing the ring
                rotateCarouselBy(-60); // 360 / 6 cards = 60 degrees
            });
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent closing the ring
                rotateCarouselBy(60);
            });
        }
    }

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
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}