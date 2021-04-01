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

		// location of drag start
		this.initialX = null;
		this.xOffsets = null;
		this.updatedXOffsets = null;

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
		this.wrapper.addEventListener('dragstart', ev => this.dragStart(this, ev));
		this.wrapper.addEventListener('dragover', ev => this.dragging(this, ev));
		this.wrapper.addEventListener('dragend', () => this.dragEnd(this));
	}

	// ---- drag start ---- //
	dragStart(self, ev) {
		self.hideGhostImg(ev);

		// initial mouse position
		self.initialX = ev.pageX;
	}

	// ---- dragging ---- //
	dragging(self, ev) {
		if(!this.xOffsets) return;

		let delta = self.initialX - ev.pageX;
		
		self.updatedXOffsets = this.xOffsets.map(pos => pos - delta);

		self.checkForEnds();
	}

	// ---- drag end ---- //
	dragEnd(self) {
		self.xOffsets = self.updatedXOffsets;
		self.updatedXOffsets = null;
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
		let offsets = this.updatedXOffsets ? this.updatedXOffsets : this.xOffsets;
		
		TweenLite.to(this.items, {
			position: 'absolute',
			left: function(i, el){
				return offsets[i];
			},
			duration: 0.2
		});
	}

	// ---- hide ghost drag img ---- //
	hideGhostImg(ev) {
		var img = new Image();
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
		ev.dataTransfer.setDragImage(img, 0, 0);
	}

	// ---- check for ends ---- //
	checkForEnds() {
		// dragged too far right
		if(this.updatedXOffsets[0] > 0){
			this.updatedXOffsets = this.updatedXOffsets.map(pos => pos - this.updatedXOffsets[0]);
		}
		
		// dragged too far left
		else if(this.updatedXOffsets[this.updatedXOffsets.length - 1] < window.innerWidth){
			let offDistance = window.innerWidth - this.updatedXOffsets[this.updatedXOffsets.length - 1];
			this.updatedXOffsets = this.updatedXOffsets.map(pos => pos + offDistance);
		}

		this.setupSlider();
	}
}

module.exports = Slider