$(function() {

	function lastUpdated() {
		const lastUpdate = new Date(document.lastModified);
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		return lastUpdate.toLocaleDateString('fr-FR', options);
	}

	document.getElementsByClassName('last-update')[0].textContent += ` ${lastUpdated()}`;

	$('.accordion-panel').each(function() {
		$(this).css("display", "none");
	});

	$('.accordion').on('click', '.accordion-control', function() {
		$(this).next('.accordion-panel').not(':animated').slideToggle(200);
	});

});

