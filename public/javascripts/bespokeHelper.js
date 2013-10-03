(function() {
	'use strict';

	var themes,
		selectedThemeIndex,
		instructionsTimeout,
		deck;

	function init() {
		deck = bespoke.horizontal.from('article');
		initInstructions();
	}

	init();

	function initInstructions() {
		if (isTouch()) {
			document.getElementById('input-method').innerHTML = 'Swipe left and right';
		}

		instructionsTimeout = setTimeout(showInstructions, 5000);
	}

	function showInstructions() {
		document.querySelectorAll('header p')[0].className = 'visible';
	}

	function hideInstructions() {
		clearTimeout(instructionsTimeout);
		document.querySelectorAll('header p')[0].className = 'hidden';
	}

	function isTouch() {
		return !!('ontouchstart' in window) || navigator.msMaxTouchPoints;
	}

	function modulo(num, n) {
		return ((num % n) + n) % n;
	}

}());