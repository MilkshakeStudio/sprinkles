const arrows = {
	init: function(wrapper){
		arrows.createArrows('prev', wrapper);
		arrows.createArrows('next', wrapper);
	},

	createArrows: function(type, wrapper) {
		let arrow = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		arrow.style.height = '18px';
		arrow.style.width = '10px';
		arrow.style.position = 'absolute';
		arrow.style.top = '50%';
		type == 'prev'
			? arrow.style.left = '20px'
			: arrow.style.right = '20px';

		let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		type == 'prev'
			? path.setAttribute("d","M9.5 17.5L1.5 9L9.5 0.5")
			: path.setAttribute("d","M0.499999 0.5L8.5 9L0.5 17.5");
		path.style.stroke = "black";
		path.style.fill = "transparent";
		path.style.strokeWidth = "2";
		arrow.appendChild(path);
		wrapper.appendChild(arrow);
	}
}

export default arrows;