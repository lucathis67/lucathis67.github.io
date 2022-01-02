$(function() {

	const lastUpdated = (function() {
		if (Date.parse(document.lastModified) != 0) {
			const lastUpdate = new Date(document.lastModified);
			const options = { year: 'numeric', month: 'long', day: 'numeric' };
			return lastUpdate.toLocaleDateString('fr-FR', options);
		} else {
			return false;
		}
	})();

	if (lastUpdated) {
		document.getElementsByClassName('last-update')[0].textContent = `Mis à jour le ${lastUpdated}`;
	}

	jQuery.fn.switchSign = function(handle) {
		window.setTimeout(function() {
			handle.textContent === "+" ? handle.textContent = "-" : handle.textContent = "+";
		}, 300);
	}

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
});