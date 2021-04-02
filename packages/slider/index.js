const { TweenLite } = require('gsap');
const arrows = require('./arrows');

class Slider {
	constructor(className, options) {
		if (!className) throw "Please provide a valid wrapper.";

		this.wrapper = document.querySelector(className);
		this.items = [];

		this.options = Object.assign({
			itemSelector: '.slider-element',
			gutter: 30,
			arrows: true
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

		if(this.options.arrows){
			// console.log(arrows.default)
			arrows.default.init(this.wrapper);
		}
	}

	// ---- start listeners ---- //
	startListeners() {
		// not wide enough to be draggable
		if(this.xOffsets[this.xOffsets.length - 1] < window.innerWidth) {
			this.wrapper.style.cursor = 'default';
			return;
		};

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
		let delta = self.initialX - ev.pageX;
		
		self.updatedXOffsets = this.xOffsets.map(pos => pos - delta);

		self.checkForEnds();
	}

	// ---- drag end ---- //
	dragEnd(self) {
		if(!self.updatedXOffsets) return;
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
		this.xOffsets = [this.gutterWidth];
		this.maxHeight = 0;

		for(let i = 0; i < this.items.length; i++){
			let x = this.xOffsets[i] + this.items[i].offsetWidth + this.gutterWidth;
			this.xOffsets.push(x);

			if(this.items[i].offsetHeight > this.maxHeight) this.maxHeight = this.items[i].offsetHeight;
		}
	}

	// ---- wrapper setup ---- //
	wrapperSetup(){
		this.wrapper.style.position = 'relative';
		this.wrapper.style.overflow = 'hidden';
		this.wrapper.style.maxWidth = '100vw';
		this.wrapper.style.cursor = 'grab';
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

	// ---- setup arrows ---- //
	setupArrows(){
		let right = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		right.style.height = '18px';
		right.style.width = '10px';
		right.style.position = 'absolute';
		right.style.right = '20px';
		right.style.top = '50%';
		let nextPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		nextPath.setAttribute("d","M0.499999 0.5L8.5 9L0.5 17.5");
		nextPath.style.stroke = "black";
		nextPath.style.fill = "transparent";
		nextPath.style.strokeWidth = "2";
		right.appendChild(nextPath);
		this.wrapper.appendChild(right);

		let left = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		left.style.height = '18px';
		left.style.width = '10px';
		left.style.position = 'absolute';
		left.style.left = '20px';
		left.style.top = '50%';
		let prevPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		prevPath.setAttribute("d","M9.5 17.5L1.5 9L9.5 0.5");
		prevPath.style.stroke = "black";
		prevPath.style.fill = "transparent";
		prevPath.style.strokeWidth = "2";
		left.appendChild(prevPath);
		this.wrapper.appendChild(left);
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
		if(this.updatedXOffsets[0] > this.gutterWidth){
			this.updatedXOffsets = this.updatedXOffsets.map(pos => pos - this.updatedXOffsets[0] + this.gutterWidth);
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