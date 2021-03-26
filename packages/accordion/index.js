var { TweenLite } = require('gsap');

class Accordion {
	constructor(className, options) {
		if (!className) return;

		this.items = document.querySelectorAll(className);

		this.options = Object.assign({
			hideable: '.show-hide',
			duration: 0.5
		}, options);

		this.initialHide();
		this.bindEvents();
	}

	initialHide() {
		this.items.forEach(item => {
			let showHide = item.querySelector(this.options.hideable);
			showHide.style.height = 0;
			showHide.style.overflow = 'hidden';
		})
	}

	bindEvents(){
		this.items.forEach(item => {
			item.addEventListener('click', () => {
				this.toggle(item)
			});
		})
	}

	toggle(el){
		let showHide = el.querySelector(this.options.hideable);
		let height = el.classList.contains('open')
			? 0
			: this.calcHeight(showHide);

		el.classList.contains('open')
			? el.classList.remove('open')
			: el.classList.add('open');

		TweenLite.to(showHide, {
			height: height,
			duration: this.options.duration,
			delay: 0,
			ease: "Power1.inOut"
		})
	}

	calcHeight(el){
		let innerHeight = 0;
		Array.from(el.childNodes).forEach(el => {
			if(!el.offsetHeight) return;
			innerHeight += el.offsetHeight;
		})
		return innerHeight;
	}
}

module.exports = Accordion