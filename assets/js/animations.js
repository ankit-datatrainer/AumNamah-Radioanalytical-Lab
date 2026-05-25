/* ============================================================
   AumNamah Lab — Premium Scroll Animation Engine
   - IntersectionObserver-driven reveals via [data-anim]
   - Kinetic word splitter for hero headlines
   - Lightweight parallax via [data-parallax]
   - Count-up numbers via [data-count-to]
   - Scroll progress bar
   - Magnetic-hover for .magnetic CTAs
   No external dependencies. Plays nicely with Tailwind CDN.
   ============================================================ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Word splitter for kinetic headlines ---------- */
    function splitKinetic(el) {
        if (el.dataset.kineticReady === '1') return;
        const html = el.innerHTML;
        // Wrap each whitespace-separated token, preserving inline tags.
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).forEach((token) => {
                    if (!token) return;
                    if (/^\s+$/.test(token)) {
                        frag.appendChild(document.createTextNode(token));
                    } else {
                        const w = document.createElement('span');
                        w.className = 'word';
                        const inner = document.createElement('span');
                        inner.textContent = token;
                        w.appendChild(inner);
                        frag.appendChild(w);
                    }
                });
                node.parentNode.replaceChild(frag, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach(walk);
            }
        };
        Array.from(tmp.childNodes).forEach(walk);
        el.innerHTML = tmp.innerHTML;

        // Apply per-word stagger
        const words = el.querySelectorAll('.word > span');
        words.forEach((w, i) => {
            w.style.transitionDelay = (i * 70) + 'ms';
        });
        el.dataset.kineticReady = '1';
    }

    /* ---------- 2. IntersectionObserver for reveals ---------- */
    function setupReveals() {
        const items = document.querySelectorAll('[data-anim]');
        if (!items.length) return;

        // Pre-process kinetic headlines
        items.forEach((el) => {
            if (el.getAttribute('data-anim') === 'kinetic-words') splitKinetic(el);
        });

        if (prefersReduced) {
            items.forEach((el) => el.classList.add('is-in'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    if (entry.target.getAttribute('data-anim-once') !== 'false') {
                        io.unobserve(entry.target);
                    }
                } else if (entry.target.getAttribute('data-anim-once') === 'false') {
                    entry.target.classList.remove('is-in');
                }
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        items.forEach((el) => io.observe(el));
    }

    /* ---------- 3. Count-up numbers ---------- */
    function setupCountUp() {
        const els = document.querySelectorAll('[data-count-to]');
        if (!els.length) return;
        if (prefersReduced) {
            els.forEach((el) => { el.textContent = el.dataset.countTo; });
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.countTo);
                const duration = parseInt(el.dataset.countDuration || '1800', 10);
                const decimals = parseInt(el.dataset.countDecimals || '0', 10);
                const suffix = el.dataset.countSuffix || '';
                const prefix = el.dataset.countPrefix || '';
                const start = performance.now();

                const tick = (now) => {
                    const p = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                    const value = target * eased;
                    el.textContent = prefix + value.toFixed(decimals) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = prefix + target.toFixed(decimals) + suffix;
                };
                requestAnimationFrame(tick);
                io.unobserve(el);
            });
        }, { threshold: 0.4 });
        els.forEach((el) => io.observe(el));
    }

    /* ---------- 4. Lightweight parallax ---------- */
    function setupParallax() {
        if (prefersReduced) return;
        const els = Array.from(document.querySelectorAll('[data-parallax]'));
        if (!els.length) return;

        let ticking = false;
        const update = () => {
            const vh = window.innerHeight;
            els.forEach((el) => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
                const rect = el.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const offset = (center - vh / 2) * -speed;
                el.style.setProperty('--p-y', offset.toFixed(1) + 'px');
            });
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
    }

    /* ---------- 5. Scroll progress bar ---------- */
    function setupScrollProgress() {
        let bar = document.querySelector('.scroll-progress');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'scroll-progress';
            document.body.appendChild(bar);
        }
        const onScroll = () => {
            const h = document.documentElement;
            const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
            bar.style.width = (Math.min(1, Math.max(0, scrolled)) * 100) + '%';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- 6. Magnetic hover for CTAs ---------- */
    function setupMagnetic() {
        if (prefersReduced) return;
        document.querySelectorAll('.magnetic').forEach((el) => {
            const strength = parseFloat(el.dataset.magnetStrength || '0.25');
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ---------- 7. Smooth anchor scrolling ---------- */
    function setupSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (!id || id === '#' || id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- Bootstrap ---------- */
    function init() {
        setupReveals();
        setupCountUp();
        setupParallax();
        setupScrollProgress();
        setupMagnetic();
        setupSmoothAnchors();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
