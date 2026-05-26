/* =====================================================================
 * AumNamah Radioanalytical Lab — Global Mobile Nav
 *
 * Self-mounting drawer that wires the existing
 * <button class="md:hidden ..."> hamburger on every page to a fully
 * functional slide-in navigation panel. Skips pages that already have
 * their own working drawer (e.g. Certifications.html).
 *
 * Drop-in usage:
 *     <link rel="stylesheet" href="assets/css/responsive.css">
 *     <script src="assets/js/mobile-nav.js" defer></script>
 * ===================================================================== */

(function () {
    'use strict';

    /* Brand-aware navigation set, used to build the drawer dynamically. */
    var NAV_LINKS = [
        { href: 'index.html',                label: 'Home',           icon: 'home' },
        { href: 'About-Us.html',             label: 'About Us',       icon: 'info' },
        { href: 'Services.html',             label: 'Services',       icon: 'science' },
        { href: 'Radiological_Testing.html', label: 'Radiological',   icon: 'radio' },
        { href: 'Chemical_Testing.html',     label: 'Chemical',       icon: 'experiment' },
        { href: 'Biological_Testing.html',   label: 'Biological',     icon: 'biotech' },
        { href: 'Certifications.html',       label: 'Certifications', icon: 'verified' },
        { href: 'Contact-Us.html',           label: 'Contact',        icon: 'mail' }
    ];

    var BRAND = {
        logo: 'assets/images/logo.png',
        ctaHref: 'Contact-Us.html',
        ctaLabel: 'Request Analysis',
        phone: '+91-8920723168',
        phoneTel: '+918920723168',
        email: 'info@aumnamahral.com'
    };

    function currentFile() {
        var p = (location.pathname || '').split('/').pop() || 'index.html';
        if (!p || p === '') p = 'index.html';
        return p.toLowerCase();
    }

    function el(tag, cls, attrs) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (attrs) {
            for (var k in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                    if (k === 'text') n.textContent = attrs[k];
                    else if (k === 'html') n.innerHTML = attrs[k];
                    else n.setAttribute(k, attrs[k]);
                }
            }
        }
        return n;
    }

    function buildDrawer() {
        var here = currentFile();

        var root = el('div', 'rl-mnav', {
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': 'Mobile navigation',
            'data-open': 'false'
        });

        var backdrop = el('div', 'rl-mnav__backdrop');
        root.appendChild(backdrop);

        var panel = el('aside', 'rl-mnav__panel');

        // Head: logo + close button
        var head = el('div', 'rl-mnav__head');
        var logoLink = el('a', null, { href: 'index.html', 'aria-label': 'AumNamah Radioanalytical Lab — Home' });
        var logoImg = el('img', null, { src: BRAND.logo, alt: 'AumNamah Lab Logo' });
        logoLink.appendChild(logoImg);
        head.appendChild(logoLink);

        var closeBtn = el('button', 'rl-mnav__close', {
            type: 'button',
            'aria-label': 'Close navigation'
        });
        closeBtn.appendChild(el('span', 'material-symbols-outlined', { text: 'close' }));
        head.appendChild(closeBtn);

        panel.appendChild(head);

        // Nav list
        var list = el('nav', 'rl-mnav__list', { 'aria-label': 'Site navigation' });
        for (var i = 0; i < NAV_LINKS.length; i++) {
            var item = NAV_LINKS[i];
            var attrs = { href: item.href };
            if (item.href.toLowerCase() === here) attrs['aria-current'] = 'page';
            var a = el('a', 'rl-mnav__link', attrs);
            a.appendChild(el('span', null, { text: item.label }));
            a.appendChild(el('span', 'material-symbols-outlined', { text: 'chevron_right' }));
            list.appendChild(a);
        }
        panel.appendChild(list);

        // CTA
        var ctaWrap = el('div', 'rl-mnav__cta');
        var cta = el('a', 'rl-mnav__cta-btn', { href: BRAND.ctaHref });
        cta.appendChild(document.createTextNode(BRAND.ctaLabel + ' '));
        cta.appendChild(el('span', 'material-symbols-outlined', { text: 'arrow_forward' }));
        ctaWrap.appendChild(cta);

        // Contact (mini)
        var contact = el('div', 'rl-mnav__contact');
        contact.innerHTML =
            '<div>📞 <a href="tel:' + BRAND.phoneTel + '">' + BRAND.phone + '</a></div>' +
            '<div>✉️ <a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a></div>';
        ctaWrap.appendChild(contact);

        panel.appendChild(ctaWrap);
        root.appendChild(panel);

        // Wire close behaviours
        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', close);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && root.getAttribute('data-open') === 'true') close();
        });

        // Auto-close when a nav link is tapped on a same-page anchor
        list.addEventListener('click', function (e) {
            var t = e.target;
            while (t && t !== list && t.tagName !== 'A') t = t.parentNode;
            if (t && t.tagName === 'A') {
                // Closing instantly is fine — navigation will follow
                close();
            }
        });

        function open() {
            root.setAttribute('data-open', 'true');
            document.body.classList.add('rl-mnav-open');
            // Focus the close button for keyboard users
            setTimeout(function () { try { closeBtn.focus(); } catch (e) {} }, 50);
        }

        function close() {
            root.setAttribute('data-open', 'false');
            document.body.classList.remove('rl-mnav-open');
        }

        return { root: root, open: open, close: close };
    }

    function findHamburger() {
        // Match the hamburger button on every page in this codebase
        var candidates = document.querySelectorAll('header button.md\\:hidden, header .md\\:hidden button');
        for (var i = 0; i < candidates.length; i++) {
            var b = candidates[i];
            // Heuristic: it has the material 'menu' icon inside
            if (b.querySelector('.material-symbols-outlined')) return b;
        }
        // Fallback: any button with menu icon in <header>
        var icons = document.querySelectorAll('header .material-symbols-outlined');
        for (var j = 0; j < icons.length; j++) {
            if ((icons[j].textContent || '').trim() === 'menu') {
                var btn = icons[j].closest('button');
                if (btn) return btn;
            }
        }
        return null;
    }

    function alreadyHasNativeDrawer() {
        // If a previously authored drawer with onclick="openMobileMenu()" exists,
        // skip injection on that page (e.g. Certifications.html)
        return !!document.getElementById('mobileMenuDrawer');
    }

    function boot() {
        try {
            if (alreadyHasNativeDrawer()) {
                return; // page handles its own mobile nav
            }

            var btn = findHamburger();
            if (!btn) return; // page doesn't have a hamburger — nothing to wire

            var drawer = buildDrawer();
            document.body.appendChild(drawer.root);

            // Make the hamburger interactive even if no inline handler exists
            btn.setAttribute('aria-haspopup', 'true');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'rl-mobile-nav');
            btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Open navigation menu');
            drawer.root.id = 'rl-mobile-nav';

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                drawer.open();
                btn.setAttribute('aria-expanded', 'true');
            });

            // When close happens by any means, sync aria-expanded
            var observer = new MutationObserver(function () {
                btn.setAttribute(
                    'aria-expanded',
                    drawer.root.getAttribute('data-open') === 'true' ? 'true' : 'false'
                );
            });
            observer.observe(drawer.root, { attributes: true, attributeFilter: ['data-open'] });
        } catch (e) {
            if (window && window.console) console.warn('[mobile-nav] failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
