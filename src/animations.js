/* 
  animations.js
  JavaScript logic for scroll detection and numerical count-ups.
  Import this in LandingPage.jsx.
*/

export const initAnimations = () => {
    // 1. Scroll-Triggered reveals using IntersectionObserver
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // If it's a count-up element, trigger it
                if (entry.target.classList.contains('count-trigger')) {
                    startCountUp(entry.target);
                }

                // No need to unobserve if we want it to trigger once
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => {
        // Set stagger index for CSS
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children);
            const sIndex = siblings.indexOf(el);
            el.style.setProperty('--stagger-index', sIndex);
        }
        observer.observe(el);
    });

    // 2. Sticky Header scroll detection
    const handleScroll = () => {
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 60) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 3. Count-up Animation logic
    function startCountUp(el) {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const duration = 2000; // 2 seconds
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing out function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(start + (target - start) * easeProgress);

            el.textContent = currentCount;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target; // Ensure exact final value
            }
        }

        requestAnimationFrame(update);
    }

    // Cleanup function
    return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
    };
};
