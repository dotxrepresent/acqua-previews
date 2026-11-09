/* Savuti Capital: private preview lock. Same password check and session memory as the original preview. */
(function () {
	'use strict';
	var cfg = window.savutiGate;
	if (!cfg || !cfg.hash) return;
	var KEY = 'sc-preview-access';
	var root = document.documentElement;

	function hash(t, e) {
		e = e || 7;
		var a = 3735928559 ^ e, l = 1103547991 ^ e;
		for (var n = 0; n < t.length; n++) {
			var i = t.charCodeAt(n);
			a = Math.imul(a ^ i, 2654435761);
			l = Math.imul(l ^ i, 1597334677);
		}
		a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(l ^ (l >>> 13), 3266489909);
		l = Math.imul(l ^ (l >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
		return (4294967296 * (2097151 & l) + (a >>> 0)).toString(16);
	}
	function unlocked() {
		try { return sessionStorage.getItem(KEY) === cfg.hash; } catch (e) { return false; }
	}
	if (unlocked()) return;

	root.classList.add('sc-locked');
	var pageTitle = document.title;
	document.title = 'Savuti Capital | Website preview';

	var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

	function mount() {
		var gate = document.createElement('div');
		gate.className = 'sc-gate';
		gate.innerHTML =
			'<form class="sc-gate__card">' +
			'<img class="sc-gate__logo" alt="Savuti Capital" width="1182" height="286" src="' + cfg.logo + '">' +
			'<p class="sc-gate__label">Website preview</p>' +
			'<p class="sc-gate__text">This preview is private. Please enter the password to continue.</p>' +
			'<label for="sc-gate-pw" class="sc-gate__field-label">Password</label>' +
			'<input id="sc-gate-pw" autocomplete="current-password" aria-invalid="false" type="password" value="">' +
			'<button type="submit" class="sc-btn sc-btn--gold">Continue ' + ARROW + '</button>' +
			'</form>';
		document.body.insertBefore(gate, document.body.firstChild);
		var form = gate.querySelector('form');
		var input = gate.querySelector('#sc-gate-pw');
		var err = null;
		input.focus();
		input.addEventListener('input', function () {
			input.setAttribute('aria-invalid', 'false');
			input.removeAttribute('aria-describedby');
			if (err) { err.remove(); err = null; }
		});
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			if (hash(input.value.trim()) === cfg.hash) {
				try { sessionStorage.setItem(KEY, cfg.hash); } catch (x) {}
				gate.remove();
				root.classList.remove('sc-locked');
				document.title = pageTitle;
				window.scrollTo(0, 0);
			} else {
				input.setAttribute('aria-invalid', 'true');
				input.setAttribute('aria-describedby', 'sc-gate-err');
				if (!err) {
					err = document.createElement('p');
					err.id = 'sc-gate-err';
					err.className = 'sc-gate__error';
					err.textContent = 'That password is not correct. Please try again.';
					form.insertBefore(err, form.querySelector('button'));
				}
			}
		});
	}
	if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
