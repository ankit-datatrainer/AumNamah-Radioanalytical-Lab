/* =====================================================================
 * AumNamah Radioanalytical Lab — Chatbot Widget
 * Rule-based · No AI · Self-mounting · Session-persistent
 *
 * Drop-in usage:
 *     <link rel="stylesheet" href="assets/css/chatbot.css">
 *     <script src="assets/js/chatbot.js" defer></script>
 *
 * The widget builds its own DOM on DOMContentLoaded and attaches itself
 * to <body>. No further markup is needed in the host page.
 * ===================================================================== */

(function () {
    'use strict';

    /* -----------------------------------------------------------------
     * Knowledge base / business facts
     * ----------------------------------------------------------------- */
    var BRAND = {
        name: 'AumNamah Radioanalytical Lab',
        shortName: 'AumNamah RAL',
        botName: 'AumNamah Assistant',
        logo: 'assets/images/logo.png',
        phone1: '+91-8920723168',
        phone1Tel: '+918920723168',
        phone2: '+91-9717686925',
        phone2Tel: '+919717686925',
        email: 'info@aumnamahral.com',
        email2: 'aumnamah.testing@gmail.com',
        address: 'CC-1, First Floor, Community Centre, Lawrence Road Industrial Area, Keshav Puram, New Delhi-110035',
        hours: 'Monday - Saturday: 09:00 - 18:00 IST',
        gstin: '07ACHFA5663Q1ZR'
    };

    var STORAGE_KEY = 'rl_chatbot_session_v1';
    var OPEN_KEY    = 'rl_chatbot_open_v1';
    var MAX_HISTORY = 80;   // cap stored messages per session
    var TYPING_MIN  = 350;  // ms
    var TYPING_MAX  = 900;  // ms

    /* -----------------------------------------------------------------
     * Intent definitions
     *
     * Each intent has:
     *   id       - string id
     *   patterns - array of RegExp (matched against lowercased input)
     *   reply    - string OR function(input) -> string (HTML allowed)
     *   chips    - array of suggested quick replies (label -> sends as user)
     *   priority - higher wins on ties (default 0)
     * ----------------------------------------------------------------- */
    var INTENTS = [
        {
            id: 'greeting',
            patterns: [
                /\b(hi|hii+|hello|hey+|namaste|namaskar|hola|yo|hiya)\b/,
                /\bgood\s*(morning|afternoon|evening|day)\b/,
                /^\s*(start|begin)\s*$/
            ],
            reply: function () {
                return 'Hello! 👋 Welcome to <strong>AumNamah Radioanalytical Laboratory</strong>. ' +
                       'I can help you with our <strong>testing services</strong>, <strong>certification</strong>, sample submission, and contact details. ' +
                       'How may I assist you today?';
            },
            chips: ['Our services', 'Certification', 'Contact info', 'Operating hours']
        },

        {
            id: 'thanks',
            patterns: [/\b(thanks|thank\s*you|thx|thnx|ty|appreciate)\b/],
            reply: 'You\'re most welcome! 🙏 Please select an option below to continue.',
            chips: ['Our services', 'Contact info', 'Book appointment']
        },

        {
            id: 'bye',
            patterns: [/\b(bye|goodbye|see\s*you|cya|later|good\s*night)\b/],
            reply: 'Thank you for visiting AumNamah RAL. Have a precise and productive day! ⚛️',
            chips: ['Our services', 'Book appointment']
        },

        {
            id: 'who_bot',
            patterns: [
                /\bwho\s*(are\s*you|r\s*u|is\s*this)\b/,
                /\b(your|ur)\s*name\b/,
                /\bwhat\s*are\s*you\b/
            ],
            reply: 'I\'m the <strong>AumNamah Assistant</strong> — an automated guide for our website. ' +
                   'For technical or commercial queries, please reach out to our team directly.',
            chips: ['Contact info', 'Our services']
        },

        /* -------- Hours / availability -------- */
        {
            id: 'hours',
            patterns: [
                /\b(hour|hours|timing|timings|open|opening|close|closing|when\s*(open|closed)|working\s*(hour|day))\b/,
                /\bare\s*you\s*open\b/,
                /\b(weekend|sunday|saturday|holiday)\b/
            ],
            reply: '<strong>Operating hours</strong><br>' +
                   '🕘 ' + BRAND.hours + '<br>' +
                   'Closed on Sundays and public holidays. For urgent matters outside hours, please email ' +
                   '<a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a> or <a href="mailto:' + BRAND.email2 + '">' + BRAND.email2 + '</a>.',
            chips: ['Address', 'Contact info', 'Book appointment']
        },

        /* -------- Address / location -------- */
        {
            id: 'location',
            patterns: [
                /\b(where|address|location|located|find\s*you|reach\s*you|directions?|map|office|lab\s*location)\b/,
                /\b(visit|come\s*over)\b/
            ],
            reply: '<strong>Laboratory HQ</strong><br>' + BRAND.address + '<br>' +
                   '<a href="https://www.google.com/maps/search/?api=1&query=AumNamah+Radioanalytical+Laboratory+Keshav+Puram+New+Delhi" target="_blank" rel="noopener">📍 Open in Google Maps</a>',
            chips: ['Operating hours', 'Phone number', 'Book appointment']
        },

        /* -------- Phone -------- */
        {
            id: 'phone',
            patterns: [
                /\b(phone|call|telephone|mobile|contact\s*number|whats?app|number)\b/
            ],
            reply: 'You can reach us by phone:<br>' +
                   '📞 <a href="tel:' + BRAND.phone1Tel + '">' + BRAND.phone1 + '</a><br>' +
                   '📞 <a href="tel:' + BRAND.phone2Tel + '">' + BRAND.phone2 + '</a><br>' +
                   'Available ' + BRAND.hours + '.',
            chips: ['Email', 'Address', 'Book appointment']
        },

        /* -------- Email -------- */
        {
            id: 'email',
            patterns: [/\b(email|e-?mail|mail\s*id|write\s*to|contact\s*us\s*via\s*mail)\b/],
            reply: '✉️ Drop us a line at <a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a> or <a href="mailto:' + BRAND.email2 + '">' + BRAND.email2 + '</a> — ' +
                   'we typically respond within 1 business day.',
            chips: ['Phone number', 'Book appointment', 'Get a quote']
        },

        /* -------- General contact -------- */
        {
            id: 'contact',
            patterns: [
                /\b(contact|reach|get\s*in\s*touch|talk\s*to|speak\s*to|representative|support|help\s*desk|customer\s*care)\b/,
                /\b(human|person|agent|someone)\b/
            ],
            reply: '<strong>Get in touch</strong><br>' +
                   '📞 <a href="tel:' + BRAND.phone1Tel + '">' + BRAND.phone1 + '</a> &nbsp;|&nbsp; <a href="tel:' + BRAND.phone2Tel + '">' + BRAND.phone2 + '</a><br>' +
                   '✉️ <a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a><br>' +
                   '✉️ <a href="mailto:' + BRAND.email2 + '">' + BRAND.email2 + '</a><br>' +
                   '📍 ' + BRAND.address + '<br>' +
                   'Or use our <a href="./Contact-Us.html">online contact form</a> to send us a request.',
            chips: ['Open contact page', 'Phone number', 'Operating hours']
        },

        /* -------- Services overview -------- */
        {
            id: 'services',
            patterns: [
                /\b(service|services|testing|tests|capabilit|offer|provide|do\s*you\s*test|what.*(test|do|offer))\b/,
                /\bwhat.*(can|do)\s*you\b/
            ],
            reply: 'We offer a comprehensive radioanalytical & life-science testing portfolio:' +
                   '<ul>' +
                   '<li>☢️ <strong>Radiological Testing</strong> — isotope &amp; radiation analysis</li>' +
                   '<li>🥗 Food &amp; Agricultural Products</li>' +
                   '<li>💧 Water Quality (drinking, ground, industrial)</li>' +
                   '<li>🌿 Environmental (soil, air)</li>' +
                   '<li>🏭 Industrial &amp; Manufactured Goods</li>' +
                   '</ul>' +
                   'Which area would you like to explore?',
            chips: ['Radiological', 'Water', 'Food', 'All services']
        },        /* -------- Radiological -------- */
        {
            id: 'radiological',
            patterns: [
                /\b(radio|radiolog|radioactive|radiation|isotope|gamma|alpha|beta|uranium|cesium|cs-?13[47]|radon|nuclear)\b/
            ],
            reply: '<strong>Radiological Testing</strong><br>' +
                   'Quantitative analysis of natural and artificial radionuclides — gamma spectrometry, alpha/beta counting, ' +
                   'radon assessment, and isotope identification (e.g. Cs-134, Cs-137, K-40, U-238, Th-232).<br>' +
                   '👉 See full scope on the <a href="Radiological_Testing.html">Radiological Testing page</a>.',
            chips: ['Get a quote', 'Sample submission', 'Turnaround time', 'All services']
        },



        /* -------- Water -------- */
        {
            id: 'water',
            patterns: [/\b(water|drinking\s*water|potable|ground\s*water|tap\s*water|borewell|ro|mineral\s*water)\b/],
            reply: '<strong>Water Quality Testing</strong><br>' +
                   'Drinking, ground, packaged, industrial and waste-water analysis covering physicochemical, microbiological ' +
                   'and radiological parameters as per IS 10500 and other standards.<br>' +
                   '👉 More on our <a href="Services.html">Services page</a>.',
            chips: ['Get a quote', 'Sample submission', 'All services']
        },

        /* -------- Food -------- */
        {
            id: 'food',
            patterns: [/\b(food|edible|grain|spice|milk|dairy|meat|seafood|fssai|agri|agricultur)\b/],
            reply: '<strong>Food &amp; Agricultural Testing</strong><br>' +
                   'Nutritional, microbiological, pesticide-residue, mycotoxin, and radiological analysis for food, ' +
                   'spices, dairy, grains, and agricultural produce — aligned with FSSAI / Codex standards.<br>' +
                   '👉 See the <a href="Services.html">Services page</a>.',
            chips: ['Get a quote', 'Sample submission', 'All services']
        },

        /* -------- Environmental -------- */
        {
            id: 'environmental',
            patterns: [/\b(environment|enviro|soil|air\s*quality|effluent|pollut|emission)\b/],
            reply: '<strong>Environmental Testing</strong><br>' +
                   'Soil, ambient &amp; stack air, noise, and effluent analysis for compliance and impact assessment.<br>' +
                   '👉 Refer to our <a href="Services.html">Services page</a>.',
            chips: ['Get a quote', 'Sample submission', 'All services']
        },

        /* -------- Industrial -------- */
        {
            id: 'industrial',
            patterns: [/\b(industrial|manufactur|product\s*test|raw\s*material|qa\/qc|qaqc)\b/],
            reply: '<strong>Industrial &amp; Product Testing</strong><br>' +
                   'Material characterisation, contamination screening and regulatory compliance for industrial and ' +
                   'manufactured goods.<br>' +
                   '👉 Browse <a href="Services.html">all services</a>.',
            chips: ['Get a quote', 'Sample submission', 'All services']
        },

        /* -------- Certifications / Accreditation -------- */
        {
            id: 'certifications',
            patterns: [
                /\b(certif|accredit|nabl|aerb|iso|iec|17025|license|licence|approval|recognis|recognized)\b/
            ],
            reply: 'Opening Certifications page...',
            navigate: './Certifications.html',
            chips: ['Our services', 'Contact info']
        },



        /* -------- Quote / pricing -------- */
        {
            id: 'quote',
            patterns: [
                /\b(price|cost|charge|charges|fee|fees|rate|rates|quote|quotation|estimate|how\s*much|pricing)\b/
            ],
            reply: 'Pricing depends on the test type, parameters, sample matrix and turnaround required. ' +
                   'For an accurate quote please share your requirement via:<br>' +
                   '✉️ <a href="mailto:' + BRAND.email + '?subject=Quotation%20Request">' + BRAND.email + '</a><br>' +
                   '✉️ <a href="mailto:' + BRAND.email2 + '?subject=Quotation%20Request">' + BRAND.email2 + '</a><br>' +
                   '📞 <a href="tel:' + BRAND.phone1Tel + '">' + BRAND.phone1 + '</a><br>' +
                   'Or use our <a href="Contact-Us.html">request form</a> — we usually reply within 1 business day.',
            chips: ['Open contact form', 'Email us', 'Sample submission']
        },

        /* -------- Sample submission -------- */
        {
            id: 'sample',
            patterns: [
                /\b(sample|specimen|submit|submission|send.*sample|drop.*sample|deliver|courier|how.*send|how.*submit)\b/
            ],
            reply: '<strong>How to submit a sample</strong>' +
                   '<ul>' +
                   '<li>Pack samples in clean, leak-proof, properly labelled containers.</li>' +
                   '<li>Include your contact details &amp; the parameters required.</li>' +
                   '<li>Drop off at our lab during ' + BRAND.hours + ', or send via courier.</li>' +
                   '</ul>' +
                   'Please email <a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a> or <a href="mailto:' + BRAND.email2 + '">' + BRAND.email2 + '</a> first so we can ' +
                   'share matrix-specific instructions and a sample-submission form.',
            chips: ['Address', 'Get a quote', 'Turnaround time']
        },

        /* -------- Turnaround / TAT -------- */
        {
            id: 'turnaround',
            patterns: [
                /\b(turnaround|tat|how\s*long|how\s*many\s*days|delivery\s*time|report.*(time|when|ready)|when.*(report|result))\b/,
                /\b(urgent|express|rush|priority)\b/
            ],
            reply: '<strong>Typical turnaround</strong>' +
                   '<ul>' +
                   '<li>Standard chemistry / microbiology: <strong>5 – 7 working days</strong></li>' +
                   '<li>Radiological (gamma spectrometry): <strong>7 – 10 working days</strong></li>' +
                   '<li>Express / priority service available on request</li>' +
                   '</ul>' +
                   'Exact TAT is confirmed at the time of sample registration.',
            chips: ['Sample submission', 'Get a quote', 'Email us']
        },

        /* -------- Reports -------- */
        {
            id: 'report',
            patterns: [/\b(report|result|results|findings|certificate|test\s*certificate|coa)\b/],
            reply: 'Test reports are issued in PDF and (on request) hard copy, with full traceability, ' +
                   'method references and analyst signatures. Status updates are available by phone or email. ' +
                   'Need a copy of an existing report? Please email <a href="mailto:' + BRAND.email + '">' + BRAND.email + '</a> or <a href="mailto:' + BRAND.email2 + '">' + BRAND.email2 + '</a> ' +
                   'with your job ID.',
            chips: ['Email us', 'Phone number', 'Turnaround time']
        },

        /* -------- About / who -------- */
        {
            id: 'about',
            patterns: [
                /\b(about|company|history|who.*(you|aumnamah)|tell.*about|introduction)\b/
            ],
            reply: '<strong>About AumNamah Radioanalytical Laboratory</strong><br>' +
                   'A New-Delhi based, AERB-accredited facility specialising in radiological ' +
                   'analysis with laboratory-grade precision and modern instrumentation.<br>' +
                   '👉 Read more on the <a href="About-Us.html">About Us</a> page.',
            chips: ['Our services', 'Certifications', 'Contact info']
        },

        {
            id: 'appointment',
            patterns: [
                /\b(appoint|book|booking|schedule|reservation|register|reserve|consult|meeting)\b/
            ],
            reply: '<strong>Book an appointment</strong><br>' +
                   'Request an appointment or analysis via our ' +
                   '<a href="Contact-Us.html">online form</a>, or call ' +
                   '<a href="tel:' + BRAND.phone1Tel + '">' + BRAND.phone1 + '</a>. ' +
                   'Please mention the test type, sample details and your preferred date.',
            chips: ['Book appointment', 'Phone number', 'Email us']
        },

        /* -------- Privacy / Terms -------- */
        {
            id: 'privacy',
            patterns: [/\b(privacy|policy|gdpr|data\s*protection|cookies?)\b/],
            reply: 'You can review our data-handling practices on the <a href="Privacy-Policy.html">Privacy Policy</a> page.',
            chips: ['Terms & Conditions', 'Contact info']
        },
        {
            id: 'terms',
            patterns: [/\b(terms|conditions|t&c|tnc|legal|agreement)\b/],
            reply: 'Our service terms are listed on the <a href="Terms-Conditions.html">Terms &amp; Conditions</a> page.',
            chips: ['Privacy Policy', 'Contact info']
        },

        /* -------- Help / what can you do -------- */
        {
            id: 'help',
            patterns: [
                /\bhelp\b/,
                /\bwhat\s*can\s*(you|u)\s*do\b/,
                /\boptions?\b/,
                /\bmenu\b/
            ],
            reply: 'Here is what I can help you with — please tap an option below:' +
                   '<ul>' +
                   '<li>Testing services (radiological, water, food)</li>' +
                   '<li>Operating hours, address &amp; contact details</li>' +
                   '<li>Sample submission &amp; turnaround time</li>' +
                   '<li>Quotations &amp; appointment requests</li>' +
                   '<li>Certifications &amp; accreditations</li>' +
                   '</ul>',
            chips: ['Our services', 'Certification', 'Operating hours', 'Book appointment', 'Certifications']
        }
    ];

    /* -----------------------------------------------------------------
     * Quick-reply chip → user-message label resolver
     * Some chips are short labels; map them to richer queries to maximise
     * intent matches when the user clicks them.
     * ----------------------------------------------------------------- */
    var CHIP_QUERY_MAP = {
        'Our services':             'What services do you offer?',
        'Contact info':             'How can I contact you?',
        'Operating hours':          'What are your operating hours?',
        'Address':                  'Where are you located?',
        'Phone number':             'phone number',
        'Email':                    'email',
        'Email us':                 'email',
        'Get a quote':              'How much does it cost? quotation',
        'Sample submission':        'How do I submit a sample?',
        'Turnaround time':          'What is your turnaround time?',
        'Radiological':             'Tell me about radiological testing',
        'Water':                    'Tell me about water testing',
        'Food':                     'Tell me about food testing',
        'Radiological testing':     'Tell me about radiological testing',
        'Water testing':            'Tell me about water testing',
        'Food testing':             'Tell me about food testing'
    };

    /* Page navigation chips (label → URL) so clicking actually navigates.
     * Keys MUST match chip labels exactly (case-sensitive).
     * Values MUST match the actual filenames exactly (case-sensitive). */
    var CHIP_NAV_MAP = {
        'View Services page':       './Services.html',
        'Open Services page':       './Services.html',
        'Open services page':       './Services.html',
        'All services':             './Services.html',
        'Open contact page':        './Contact-Us.html',
        'Open contact form':        './Contact-Us.html',
        'Book appointment':         './Contact-Us.html',
        'Open Certifications page': './Certifications.html',
        'Certifications':           './Certifications.html',
        'Certification':            './Certifications.html',
        'Privacy Policy':           './Privacy-Policy.html',
        'Terms & Conditions':       './Terms-Conditions.html',
        'About Us':                 './About-Us.html'
    };

    /* -----------------------------------------------------------------
     * Default suggestions shown when nothing else fits
     * ----------------------------------------------------------------- */
    var DEFAULT_CHIPS = ['Our services', 'Certification', 'Operating hours', 'Contact info'];

    var FALLBACK_REPLIES = [
        'Please choose an option from the menu below:',
        'I can help with the topics listed below — please tap one:',
        'Please select an option from the suggestions below:'
    ];

    /* -----------------------------------------------------------------
     * Intent matcher
     * ----------------------------------------------------------------- */
    function normalize(s) {
        return String(s || '').toLowerCase().trim();
    }

    function matchIntent(text) {
        var t = normalize(text);
        if (!t) return null;

        // Direct "open X.html" handling for chip nav.
        // IMPORTANT: match against the original (non-lowercased) text to preserve
        // the exact filename case (e.g. Contact-Us.html, not contact-us.html).
        var navMatchRaw = text.match(/open\s+((?:\.\/)?[A-Za-z0-9_\-]+\.html)/i);
        if (navMatchRaw) {
            var targetFile = navMatchRaw[1]; // preserve original case
            return {
                id: '__navigate',
                reply: 'Opening page…',
                chips: DEFAULT_CHIPS,
                navigate: targetFile
            };
        }

        var best = null;
        var bestScore = 0;

        for (var i = 0; i < INTENTS.length; i++) {
            var intent = INTENTS[i];
            for (var j = 0; j < intent.patterns.length; j++) {
                if (intent.patterns[j].test(t)) {
                    var m = t.match(intent.patterns[j]);
                    var score = (m && m[0]) ? m[0].length : 1;
                    score += (intent.priority || 0) * 100;
                    if (score > bestScore) {
                        bestScore = score;
                        best = intent;
                    }
                    break;
                }
            }
        }
        return best;
    }

    function getReply(intent, rawText) {
        if (!intent) {
            var msg = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
            return { html: msg, chips: ['Our services', 'Certification', 'Operating hours', 'Contact info', 'Help'] };
        }
        var html = (typeof intent.reply === 'function') ? intent.reply(rawText) : intent.reply;
        return {
            html: html,
            chips: intent.chips || DEFAULT_CHIPS,
            navigate: intent.navigate || null
        };
    }

    /* -----------------------------------------------------------------
     * Storage helpers (sessionStorage; safe-fail)
     * ----------------------------------------------------------------- */
    function safeGet(key) {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSet(key, val) {
        try { sessionStorage.setItem(key, val); } catch (e) { /* quota / disabled */ }
    }
    function loadHistory() {
        var raw = safeGet(STORAGE_KEY);
        if (!raw) return [];
        try {
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.slice(-MAX_HISTORY) : [];
        } catch (e) { return []; }
    }
    function saveHistory(history) {
        safeSet(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    }

    /* -----------------------------------------------------------------
     * DOM utilities
     * ----------------------------------------------------------------- */
    function el(tag, className, attrs) {
        var n = document.createElement(tag);
        if (className) n.className = className;
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

    function nowTime() {
        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12; if (h === 0) h = 12;
        return h + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
    }

    /* -----------------------------------------------------------------
     * Widget
     * ----------------------------------------------------------------- */
    var Widget = {
        root: null,
        body: null,
        quick: null,
        panel: null,
        history: [],
        isTyping: false,

        mount: function () {
            // Avoid double-mount
            if (document.querySelector('.rl-chatbot')) return;

            var root = el('div', 'rl-chatbot', {
                role: 'region',
                'aria-label': 'AumNamah Lab chat assistant',
                'data-open': 'false'
            });

            // FAB
            var fab = el('button', 'rl-chatbot__fab', {
                type: 'button',
                'aria-label': 'Open chat assistant',
                'aria-expanded': 'false'
            });
            fab.appendChild(el('span', 'rl-chatbot__fab-pulse'));
            fab.appendChild(el('span', 'rl-chatbot__fab-badge', { 'aria-hidden': 'true' }));
            fab.appendChild(el('span', 'material-symbols-outlined', { text: 'chat' }));
            root.appendChild(fab);

            // Panel
            var panel = el('div', 'rl-chatbot__panel', {
                role: 'dialog',
                'aria-label': BRAND.botName,
                'aria-modal': 'false'
            });

            // Header
            var header = el('header', 'rl-chatbot__header');
            var avatar = el('div', 'rl-chatbot__avatar', { 'aria-hidden': 'true' });
            var avatarImg = el('img', null, { src: BRAND.logo, alt: '' });
            avatarImg.addEventListener('error', function () {
                avatar.innerHTML = '<span class="material-symbols-outlined" style="color:#fff;font-size:22px;">science</span>';
            });
            avatar.appendChild(avatarImg);
            header.appendChild(avatar);

            var title = el('div', 'rl-chatbot__title');
            title.appendChild(el('div', 'rl-chatbot__title-name', { text: BRAND.botName }));
            title.appendChild(el('div', 'rl-chatbot__title-status', { text: 'Online' }));
            header.appendChild(title);

            var closeBtn = el('button', 'rl-chatbot__close', {
                type: 'button',
                'aria-label': 'Close chat'
            });
            closeBtn.appendChild(el('span', 'material-symbols-outlined', { text: 'close' }));
            header.appendChild(closeBtn);

            panel.appendChild(header);

            // Body
            var body = el('div', 'rl-chatbot__body', {
                role: 'log',
                'aria-live': 'polite',
                'aria-relevant': 'additions'
            });
            panel.appendChild(body);

            // Quick replies (the ONLY interaction method — no free-text input)
            var quick = el('div', 'rl-chatbot__quick', { 'aria-label': 'Quick replies' });
            panel.appendChild(quick);

            // Footer hint
            var footer = el('div', 'rl-chatbot__footer');
            footer.appendChild(el('span', null, { text: 'AumNamah RAL · automated assistant' }));
            panel.appendChild(footer);

            root.appendChild(panel);
            document.body.appendChild(root);

            // Cache references
            this.root = root;
            this.panel = panel;
            this.body = body;
            this.quick = quick;

            // Wire events
            var self = this;
            fab.addEventListener('click', function () { self.open(); });
            closeBtn.addEventListener('click', function () { self.close(); });

            // Close on ESC
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && root.getAttribute('data-open') === 'true') {
                    self.close();
                }
            });

            // Restore session history
            this.history = loadHistory();
            if (this.history.length === 0) {
                // First-time greeting (not yet pushed; will be pushed on first open)
                this._needsGreeting = true;
            } else {
                this.renderHistory();
            }

            // Always start closed; user must click FAB to open.
            // (We deliberately do NOT restore the open state across page navigations
            //  to prevent the panel from covering the page on mobile.)
            safeSet(OPEN_KEY, '0');
        },

        renderHistory: function () {
            this.body.innerHTML = '';
            for (var i = 0; i < this.history.length; i++) {
                var m = this.history[i];
                this.appendMessage(m.role, m.html, m.time, true);
            }
            // restore last quick replies if stored
            var lastBot = null;
            for (var j = this.history.length - 1; j >= 0; j--) {
                if (this.history[j].role === 'bot') { lastBot = this.history[j]; break; }
            }
            if (lastBot && lastBot.chips) this.renderChips(lastBot.chips);
            else this.renderChips(DEFAULT_CHIPS);
            this.scrollToEnd(true);
        },

        open: function (skipFocus) {
            this.root.setAttribute('data-open', 'true');
            var fab = this.root.querySelector('.rl-chatbot__fab');
            if (fab) fab.setAttribute('aria-expanded', 'true');
            safeSet(OPEN_KEY, '1');

            if (this._needsGreeting) {
                this._needsGreeting = false;
                var self = this;
                setTimeout(function () {
                    self.botSay(
                        'Hello and welcome to <strong>AumNamah Radioanalytical Laboratory</strong>! 👋<br>' +
                        'I\'m your virtual assistant. Explore our <strong>services</strong> or view our <strong>certification</strong> — ' +
                        'I can also help with contact info, sample submission, pricing, and more. How may I help you today?',
                        ['Our services', 'Certification', 'Operating hours', 'Contact info', 'Get a quote']
                    );
                }, 280);
            }

            if (!skipFocus) {
                var input = this.input;
                setTimeout(function () { try { input.focus(); } catch (e) {} }, 320);
            }
        },

        close: function () {
            this.root.setAttribute('data-open', 'false');
            var fab = this.root.querySelector('.rl-chatbot__fab');
            if (fab) fab.setAttribute('aria-expanded', 'false');
            safeSet(OPEN_KEY, '0');
        },

        handleUserInput: function (text) {
            var trimmed = String(text || '').trim();
            if (!trimmed) return;
            this.userSay(trimmed);
            this.processQuery(trimmed);
        },

        userSay: function (text) {
            var time = nowTime();
            // user input must be plain-text, never HTML
            var safe = document.createElement('div');
            safe.textContent = text;
            var html = safe.innerHTML;
            this.history.push({ role: 'user', html: html, time: time });
            saveHistory(this.history);
            this.appendMessage('user', html, time);
            this.clearChips();
        },

        botSay: function (html, chips, navigate) {
            var time = nowTime();
            this.history.push({ role: 'bot', html: html, time: time, chips: chips || DEFAULT_CHIPS });
            saveHistory(this.history);
            this.appendMessage('bot', html, time);
            this.renderChips(chips || DEFAULT_CHIPS);
            if (navigate) {
                // small delay so the user sees the message before navigation
                setTimeout(function () { window.location.href = navigate; }, 700);
            }
        },

        processQuery: function (text) {
            var self = this;
            this.showTyping();
            var delay = TYPING_MIN + Math.random() * (TYPING_MAX - TYPING_MIN);
            setTimeout(function () {
                self.hideTyping();
                var intent = matchIntent(text);
                var reply = getReply(intent, text);
                self.botSay(reply.html, reply.chips, reply.navigate || null);
            }, delay);
        },

        appendMessage: function (role, html, time, skipScroll) {
            var msg = el('div', 'rl-chatbot__msg rl-chatbot__msg--' + role);

            var avatar = el('div', 'rl-chatbot__msg-avatar', { 'aria-hidden': 'true' });
            if (role === 'bot') {
                var img = el('img', null, { src: BRAND.logo, alt: '' });
                img.addEventListener('error', function () {
                    avatar.innerHTML = '<span class="material-symbols-outlined">science</span>';
                });
                avatar.appendChild(img);
            } else {
                avatar.appendChild(el('span', 'material-symbols-outlined', { text: 'person' }));
            }

            var content = el('div', 'rl-chatbot__msg-content');
            var bubble = el('div', 'rl-chatbot__bubble', { html: html });
            var t = el('div', 'rl-chatbot__time', { text: time || nowTime() });
            content.appendChild(bubble);
            content.appendChild(t);

            msg.appendChild(avatar);
            msg.appendChild(content);
            this.body.appendChild(msg);

            if (!skipScroll) this.scrollToEnd();
        },

        showTyping: function () {
            if (this.isTyping) return;
            this.isTyping = true;
            var msg = el('div', 'rl-chatbot__msg rl-chatbot__msg--bot');
            msg.id = 'rl-chatbot-typing-row';
            var avatar = el('div', 'rl-chatbot__msg-avatar', { 'aria-hidden': 'true' });
            var img = el('img', null, { src: BRAND.logo, alt: '' });
            img.addEventListener('error', function () {
                avatar.innerHTML = '<span class="material-symbols-outlined">science</span>';
            });
            avatar.appendChild(img);

            var typing = el('div', 'rl-chatbot__typing', { 'aria-label': 'Assistant is typing' });
            typing.appendChild(el('span'));
            typing.appendChild(el('span'));
            typing.appendChild(el('span'));

            msg.appendChild(avatar);
            msg.appendChild(typing);
            this.body.appendChild(msg);
            this.scrollToEnd();
        },

        hideTyping: function () {
            this.isTyping = false;
            var row = document.getElementById('rl-chatbot-typing-row');
            if (row && row.parentNode) row.parentNode.removeChild(row);
        },

        clearChips: function () {
            this.quick.innerHTML = '';
        },

        renderChips: function (chips) {
            this.clearChips();
            if (!chips || !chips.length) return;
            var self = this;
            for (var i = 0; i < chips.length; i++) {
                (function (label) {
                    var btn = el('button', 'rl-chatbot__chip', { type: 'button' });
                    btn.textContent = label;
                    btn.addEventListener('click', function () {
                        // Hard-navigate chips
                        if (CHIP_NAV_MAP[label]) {
                            self.userSay(label);
                            self.processQuery('open ' + CHIP_NAV_MAP[label]);
                            return;
                        }
                        var query = CHIP_QUERY_MAP[label] || label;
                        self.userSay(label);
                        self.processQuery(query);
                    });
                    self.quick.appendChild(btn);
                })(chips[i]);
            }
        },

        scrollToEnd: function (instant) {
            var b = this.body;
            if (!b) return;
            if (instant) b.scrollTop = b.scrollHeight;
            else {
                // double rAF to ensure layout settled
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        b.scrollTop = b.scrollHeight;
                    });
                });
            }
        }
    };

    /* -----------------------------------------------------------------
     * Boot
     * ----------------------------------------------------------------- */
    function boot() {
        try {
            Widget.mount();
        } catch (e) {
            // Never let the widget break the host page
            if (window && window.console) console.warn('[chatbot] mount failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
