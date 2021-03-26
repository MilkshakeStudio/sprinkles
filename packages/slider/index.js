var { TweenLite } = require('gsap');

class Slider {
	constructor(className, options) {
		if (!className) throw "Please provide a valid wrapper.";

		this.wrapper = document.querySelector(className);
		this.items = [];

		this.options = Object.assign({
			itemSelector: '.slider-element'
		});

		this.init();
	}

	// ---- init ---- //
	init(){
		this.items = this.wrapper.querySelectorAll(this.options.itemSelector);
	}
}

module.exports = Slider