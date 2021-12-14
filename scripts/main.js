$(function() {

	jQuery.fn.switchSign = function(handle) {
		window.setTimeout(function() {
			handle.textContent === "+" ? handle.textContent = "-" : handle.textContent = "+";
		}, 300);
	}

	const lastUpdated = (function() {
		const lastUpdate = new Date(document.lastModified);
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return lastUpdate.toLocaleDateString('fr-FR', options);
	})();

	$('.accordion').on('click', '.accordion-control', function(e) {
		e.stopImmediatePropagation();
		const handle = $(this).find('.accordion-handle')[0];
		const panel = $(this).next('.accordion-panel');

		if (panel.is(':animated')) {
			return false;
		} else {
			panel.slideToggle(300).switchSign(handle);
		}
	});

	document.getElementsByClassName('last-update')[0].textContent += ` ${lastUpdated}`;
});