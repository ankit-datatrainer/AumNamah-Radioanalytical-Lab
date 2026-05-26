/* ============================================================
   AumNamah Radioanalytical Lab — Clean Preloader Engine
   --------------------------------------------------------
   - Shows ONCE per browser session (sessionStorage flag).
   - Smooth 0 → 100% progress with eased curve.
   - Cycles clean status messages.
   - Minimal, professional — white & blue theme.
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'rl_preloader_shown';
    var MIN_DURATION = 2400;
    var MAX_DURATION = 5000;
    var EXIT_DURATION = 700;

    var prefersReduced = false;
    try {
        prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}

    /* Skip if already flagged */
    if (document.documentElement.classList.contains('rl-preloader-skip')) {
        return;
    }

    /* SessionStorage check */
    try {
        if (sessionStorage.getItem(STORAGE_KEY) === '1') {
            document.documentElement.classList.add('rl-preloader-skip');
            return;
        }
    } catch (_) {}

    /* Lock scroll */
    document.documentElement.classList.add('rl-preloader-active');

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    ready(function init() {
        var root = document.getElementById('rlPreloader');
        if (!root) {
            document.documentElement.classList.remove('rl-preloader-active');
            return;
        }

        var percentEl = root.querySelector('.rl-pl-percent');
        var statusEl  = root.querySelector('.rl-pl-status');
        var fillEl    = root.querySelector('.rl-pl-bar-fill');

        /* Status messages */
        var MESSAGES = [
            'Preparing laboratory systems',
            'Initializing instruments',
            'Calibrating detectors',
            'Loading analytical data',
            'Verifying quality standards',
            'Almost ready'
        ];
        var msgIndex = 0;

        function cycleStatus() {
            if (!statusEl || finishing) return;
            statusEl.classList.add('is-fading');
            setTimeout(function () {
                if (finishing) return;
                msgIndex = Math.min(msgIndex + 1, MESSAGES.length - 1);
                statusEl.textContent = MESSAGES[msgIndex];
                statusEl.classList.remove('is-fading');
            }, 220);
        }

        if (statusEl) statusEl.textContent = MESSAGES[0];

        var msgTimer = null;
        if (!prefersReduced) {
            msgTimer = setInterval(cycleStatus, 550);
        }

        /* Progress animation */
        var startTime = performance.now();
        var pageLoaded = (document.readyState === 'complete');
        window.addEventListener('load', function () { pageLoaded = true; }, { once: true });

        var progress = 0;
        var rafId = 0;

        function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

        function step(now) {
            var elapsed = now - startTime;
            var autoT = Math.min(1, elapsed / MIN_DURATION);
            var autoVal = easeOutQuart(autoT) * 92;

            var doneEnough = pageLoaded && elapsed >= MIN_DURATION;
            var hardTimeout = elapsed >= MAX_DURATION;

            if (doneEnough || hardTimeout) {
                progress = Math.min(100, progress + 2);
            } else {
                progress = Math.max(progress, autoVal);
            }

            if (fillEl)    fillEl.style.width = progress.toFixed(1) + '%';
            if (percentEl) percentEl.textContent = Math.round(progress) + '%';

            if (progress >= 100) {
                progress = 100;
                if (fillEl)    fillEl.style.width = '100%';
                if (percentEl) percentEl.textContent = '100%';
                finish();
                return;
            }

            rafId = requestAnimationFrame(step);
        }
        rafId = requestAnimationFrame(step);

        /* Finish sequence */
        var finishing = false;
        function finish() {
            if (finishing) return;
            finishing = true;

            if (msgTimer) clearInterval(msgTimer);

            if (statusEl) {
                statusEl.classList.remove('is-fading');
                statusEl.classList.add('is-success');
                statusEl.textContent = 'Ready';
            }
            if (percentEl) {
                percentEl.classList.add('is-success');
                percentEl.textContent = '100%';
            }
            if (fillEl) {
                fillEl.classList.add('is-success');
            }

            setTimeout(function () {
                root.classList.add('is-leaving');

                setTimeout(function () {
                    document.documentElement.classList.remove('rl-preloader-active');
                    if (root && root.parentNode) {
                        root.parentNode.removeChild(root);
                    }
                    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
                    document.dispatchEvent(new CustomEvent('rl:preloader:done'));
                }, EXIT_DURATION);
            }, prefersReduced ? 200 : 500);
        }

        /* Safety net */
        setTimeout(function () {
            if (!finishing) {
                progress = 100;
                if (fillEl)    fillEl.style.width = '100%';
                if (percentEl) percentEl.textContent = '100%';
                finish();
            }
        }, MAX_DURATION + 500);
    });
})();
