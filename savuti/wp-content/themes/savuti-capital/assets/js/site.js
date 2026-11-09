/* Savuti Capital: navigation, cookie preferences, testimonials and the contact form. */
(function () {
	'use strict';
	var cfg = window.savutiSite || { email: 'info@savuticapital.com', cookiesUrl: '/cookies/' };
	var ICON_OPEN = '<path d="M4 7h16M4 12h16M4 17h16"></path>';
	var ICON_CLOSE = '<path d="M6 6l12 12M18 6L6 18"></path>';

	/* Header: solid on scroll, mobile menu */
	var nav = document.querySelector('.sc-nav');
	var toggle = document.querySelector('.sc-nav__toggle');
	var menu = document.getElementById('sc-mobile-menu');
	var open = false;
	function paint() {
		if (nav) nav.classList.toggle('is-solid', open || window.scrollY > 24);
	}
	function setMenu(state) {
		open = state;
		if (menu) menu.classList.toggle('is-open', open);
		if (toggle) {
			toggle.setAttribute('aria-expanded', String(open));
			toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
			var svg = toggle.querySelector('svg');
			if (svg) svg.innerHTML = open ? ICON_CLOSE : ICON_OPEN;
		}
		document.body.style.overflow = open ? 'hidden' : '';
		paint();
	}
	if (toggle) toggle.addEventListener('click', function () { setMenu(!open); });
	if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
	window.addEventListener('scroll', paint, { passive: true });
	paint();

	/* Hero: the photo shifts slightly with the pointer, like looking through a window */
	var hero = document.querySelector('.sc-hero--living, .sc-hero--window');
	var heroImg = hero && hero.querySelector('.sc-hero__photo img');
	var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (hero && heroImg && !still) {
		hero.addEventListener('pointermove', function (e) {
			if (e.pointerType !== 'mouse') return;
			var r = hero.getBoundingClientRect();
			var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
			heroImg.style.translate = (x * -14).toFixed(1) + 'px ' + (y * -10).toFixed(1) + 'px';
		});
		hero.addEventListener('pointerleave', function () { heroImg.style.translate = ''; });
	}

	/* Testimonials: read full testimonial */
	document.querySelectorAll('.sc-quote .sc-link-btn[aria-controls]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var text = document.getElementById(btn.getAttribute('aria-controls'));
			var isOpen = btn.getAttribute('aria-expanded') !== 'true';
			btn.setAttribute('aria-expanded', String(isOpen));
			btn.textContent = isOpen ? 'Show less' : 'Read full testimonial';
			if (text) text.classList.toggle('is-open', isOpen);
		});
	});

	/* Pedigree: click or tap a mandate to keep it lifted; Enter or Space does the same from the keyboard */
	document.querySelectorAll('.sc-mandates li').forEach(function (li) {
		li.setAttribute('tabindex', '0');
		li.setAttribute('aria-pressed', 'false');
		function flip() {
			var on = !li.classList.contains('is-open');
			li.classList.toggle('is-open', on);
			li.setAttribute('aria-pressed', String(on));
		}
		li.addEventListener('click', flip);
		li.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
		});
	});

	/* Cookie preferences */
	function consent() {
		var m = document.cookie.match(/(?:^|; )sc_consent=(all|essential)/);
		return m ? m[1] : null;
	}
	function setConsent(v) {
		var secure = location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = 'sc_consent=' + v + '; Max-Age=31536000; Path=/; SameSite=Lax' + secure;
		window.scConsent = v;
		window.dispatchEvent(new CustomEvent('sc:consent', { detail: v }));
	}
	var banner = null;
	function showBanner() {
		if (banner) return;
		banner = document.createElement('div');
		banner.className = 'sc-cookie';
		banner.setAttribute('role', 'dialog');
		banner.setAttribute('aria-label', 'Cookie preferences');
		banner.setAttribute('aria-live', 'polite');
		banner.innerHTML =
			'<p class="sc-cookie__title">Cookies</p>' +
			'<p class="sc-cookie__text">We use essential cookies to make this website work. With your consent we would also use analytics cookies to understand how the site is used. <a href="' + cfg.cookiesUrl + '">Cookies Policy</a></p>' +
			'<div class="sc-cookie__actions">' +
			'<button type="button" class="sc-btn sc-btn--navy sc-btn--sm" data-v="all">Accept all</button>' +
			'<button type="button" class="sc-btn sc-btn--line sc-btn--sm" data-v="essential">Essential only</button>' +
			'</div>';
		banner.addEventListener('click', function (e) {
			var b = e.target.closest('button[data-v]');
			if (!b) return;
			setConsent(b.getAttribute('data-v'));
			banner.remove();
			banner = null;
		});
		(document.getElementById('root') || document.body).appendChild(banner);
	}
	if (consent()) window.scConsent = consent(); else showBanner();
	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-sc-cookie-settings]')) showBanner();
	});

	/* Contact form: opens the visitor's email with the enquiry ready to send */
	document.querySelectorAll('form.sc-form').forEach(function (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var hp = form.querySelector('[name="website"]');
			if (hp && hp.value) return;
			var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
			var subject = 'Website enquiry from ' + v('name');
			var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nCompany: ' + v('company') + '\n\nMessage:\n' + v('message');
			window.location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
			var foot = form.querySelector('.sc-form__foot');
			if (foot && !foot.querySelector('.sc-form__note')) {
				var p = document.createElement('p');
				p.className = 'sc-form__note';
				p.textContent = 'Your email application will open with the message ready to send.';
				foot.appendChild(p);
			}
		});
	});
})();
