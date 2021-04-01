var { TweenLite } = require('gsap');

class Slider {
	constructor(className, options) {
		if (!className) throw "Please provide a valid wrapper.";

		this.wrapper = document.querySelector(className);
		this.items = [];

		this.options = Object.assign({
			itemSelector: '.slider-element',
			gutter: 30
		});

		this.init();
	}

	// ---- init ---- //
	init(){
		this.items = this.wrapper.querySelectorAll(this.options.itemSelector);

		this.setGutterWidth();
		this.getXOffsets();
		this.setupSlider();
	}

	// ---- set gutter width ---- //
	setGutterWidth() {
		this.gutterWidth = typeof this.options.gutter == 'number'
			? this.options.gutter
			: this.wrapper.querySelector(this.options.gutter).offsetWidth;
	}

	// ---- setup slider ---- //
	setupSlider(){
		let self = this;

		TweenLite.to(this.items, {
			position: 'absolute',
			left: function(i, el){
				return self.xOffsets[i];
			},
			duration: 0.2
		})
	}

	// ---- get x-offsets ---- //
	getXOffsets(){
		this.xOffsets = [0];
		for(let i = 1; i < this.items.length; i++){
			let x = this.xOffsets[i - 1] + this.items[i - 1].offsetWidth + this.gutterWidth;
			this.xOffsets.push(x);
		}
	}
}

module.exports = Slider