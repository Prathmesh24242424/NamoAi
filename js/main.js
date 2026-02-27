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

    // 3. SCROLL PROGRESS
    const scrollProgress = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        scrollProgress.style.width = progress + '%';
    }, { passive: true });

    // 4. NAVBAR GLASS EFFECT
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            document.body.classList.add('scrolled-toggles');
        } else {
            navbar.classList.remove('scrolled');
            document.body.classList.remove('scrolled-toggles');
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

    // 8. PARTICLE CANVAS BACKGROUND
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let width, height;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            // Randomly choose between white, amber, and coral
            const colors = ['rgba(255,255,255,0.3)', 'rgba(229,231,235,0.4)', 'rgba(156,163,175,0.3)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > width) this.x = 0;
            else if (this.x < 0) this.x = width;

            if (this.y > height) this.y = 0;
            else if (this.y < 0) this.y = height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // More particles on larger screens
        const particleCount = Math.floor(width * height / 8000);
        for (let i = 0; i < Math.min(particleCount, 200); i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        // Connect close particles with lines
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 1000})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // Re-init particles on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initParticles();
        }, 200);
    });
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
});