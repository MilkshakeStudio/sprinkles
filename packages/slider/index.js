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
		this.startListeners();
	}

	// ---- init ---- //
	init(){
		this.items = this.wrapper.querySelectorAll(this.options.itemSelector);

		this.setGutterWidth();
		this.getXOffsets();
		this.wrapperSetup();
		this.setupSlider();
	}

	// ---- start listeners ---- //
	startListeners() {
		this.wrapper.addEventListener('dragstart', ev => this.hideGhostImg(ev));
		this.wrapper.addEventListener('drag', ev => this.dragging(this, ev));
	}

	// ---- dragging ---- //
	dragging(self, ev) {
		console.log('dragging', ev)
	}

	// ---- set gutter width ---- //
	setGutterWidth() {
		this.gutterWidth = typeof this.options.gutter == 'number'
			? this.options.gutter
			: this.wrapper.querySelector(this.options.gutter).offsetWidth;
	}

	// ---- get x-offsets ---- //
	getXOffsets(){
		this.xOffsets = [0];
		this.maxHeight = 0;

		for(let i = 1; i < this.items.length; i++){
			let x = this.xOffsets[i - 1] + this.items[i - 1].offsetWidth + this.gutterWidth;
			this.xOffsets.push(x);

			if(this.items[i].offsetHeight > this.maxHeight) this.maxHeight = this.items[i].offsetHeight;
		}
	}

	// ---- wrapper setup ---- //
	wrapperSetup(){
		this.wrapper.style.position = 'relative';
		this.wrapper.style.overflow = 'hidden';
		this.wrapper.style.maxWidth = '100vw';
		this.wrapper.style.height = `${this.maxHeight}px`;
		this.wrapper.setAttribute('draggable', true);
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

	// ---- hide ghost drag img ---- //
	hideGhostImg(ev) {
		var img = new Image();
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
		ev.dataTransfer.setDragImage(img, 0, 0);
	}
}

module.exports = Slider