class Arrows {
	constructor(wrapper, gutterWidth) {
		if (!wrapper) return;

		this.wrapper = wrapper;
		this.gutterWidth = gutterWidth;

		this.init();
	}

	// ---- init ---- //
	init() {
		this.createArrows('prev');
		this.createArrows('next');
	}

	// ---- create arrows ---- //
	createArrows(type) {
		let arrow = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		arrow.style.height = '18px';
		arrow.style.width = '10px';
		arrow.style.position = 'absolute';
		arrow.style.top = '50%';
		type == 'prev'
			? arrow.style.left = `${this.gutterWidth}px`
			: arrow.style.right = `${this.gutterWidth}px`;

		let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		type == 'prev'
			? path.setAttribute("d","M9.5 17.5L1.5 9L9.5 0.5")
			: path.setAttribute("d","M0.499999 0.5L8.5 9L0.5 17.5");
		path.style.stroke = "black";
		path.style.fill = "transparent";
		path.style.strokeWidth = "2";
		arrow.appendChild(path);
		this.wrapper.appendChild(arrow);
	}
}

module.exports = Arrows;