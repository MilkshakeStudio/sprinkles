var { TweenLite } = require('gsap');

class Accordion {
	constructor(className) {
		if (!className) return;

		this.items = document.querySelectorAll(className);

		this.initialHide();
		this.bindEvents();
	}

	initialHide() {
		this.items.forEach(item => {
			let showHide = item.querySelector('.show-hide');
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
		let showHide = el.querySelector('.show-hide');
		let height = el.classList.contains('open')
			? 0
			: this.calcHeight(showHide);

		el.classList.contains('open')
			? el.classList.remove('open')
			: el.classList.add('open');

		TweenLite.to(showHide, {
			height: height,
			duration: 0.5,
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