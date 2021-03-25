var { find, throttle, findIndex } = require('lodash');
var { TweenLite } = require('gsap');

class Dragging{
   constructor(wrapper, properties) { 

		this.wrapper = wrapper;
		this.items = properties.items;
		this.itemPositions = [];
		this.dragItem = null;

		// location of drag start
		this.initialX = null;
		this.initialY = null;

		this.startListeners();
		this.getItemPositions();
   }

	// ---- listeners ---- //
	startListeners() {
		let throttleReorder = throttle(ev => this.reorderDOM(ev), 500, { 'trailing': true });

		document.addEventListener('dragover', (ev) => {
			this.dragGhost(this, ev);
			throttleReorder(ev);
		});

		this.wrapper.addEventListener('dragstart', ev => this.dragStart(this, ev));

		this.wrapper.addEventListener('dragend', () => this.dragEnd(this));

		document.addEventListener('out-of-bounds', ev => this.dragNewGroup(ev), false);
	}

	// ---- drag start ---- //
	dragStart(self, ev) {
		self.hideGhostImg(ev);

		// dragged item
		self.dragItem = ev.target.closest('.mood');
		self.dragItem.classList.add('dragging');

		// initial mouse position
		self.initialX = ev.pageX;
		self.initialY = ev.pageY;
	}

	// ---- drag end ---- //
	dragEnd(self) {
		// reset
		if(self.dragItem) self.dragItem.classList.remove('dragging');
		self.dragItem = null;
		self.initialX = null;
		self.initialY = null;
		this.emitReorder();
		self.getItemPositions();
	}

	// ---- make img follow mouse ---- //
	dragGhost(self, ev) {
		if(!self.dragItem || !self.initialX) return;

		let wrapperTop = self.wrapper.getBoundingClientRect().top + window.scrollY;
		
		// get img position relative to initial mouse position
		let oldPos = find(self.itemPositions, { id: self.dragItem.id });
		if(!oldPos) return;

		let mouseOffsetX = self.initialX - oldPos.left;
		let mouseOffsetY = self.initialY - oldPos.top;

		// set img position
		TweenLite.to(self.dragItem, {
			top: ev.pageY - wrapperTop - mouseOffsetY,
			left: ev.pageX - self.wrapper.offsetLeft - mouseOffsetX,
			delay: 0,
			duration: 0.01
		})
	}

	// ---- find new position ---- //
	reorderDOM(ev) {
		if(!this.dragItem) return;

		// find new position
		let newSpot = this.itemPositions.filter(el => {
			return (el.left < ev.pageX && el.right > ev.pageX && el.top < ev.pageY && el.bottom > ev.pageY);
		})[0]

		let wrapper = this.wrapper.closest('.mood-group').getBoundingClientRect();

		// move to new position
		if(newSpot){
			let newIndex = findIndex(this.itemPositions, { id: newSpot.id });
			let oldIndex = findIndex(this.items, this.dragItem);

			// moving down
			if(newIndex > oldIndex){
				// make sure new spot is not the last - if is, append to end
				this.itemPositions[newIndex + 1] && this.itemPositions[newIndex + 1].id != this.dragItem.id
					? this.wrapper.insertBefore(this.dragItem, document.getElementById(this.itemPositions[newIndex + 1].id))
					: this.wrapper.appendChild(this.dragItem)
			}
			
			// moving up
			else if(newIndex < oldIndex){
				this.wrapper.insertBefore(this.dragItem, document.getElementById(newSpot.id))
			}
		}

		// not even inside wrapper
		else if(wrapper.left > ev.pageX || wrapper.right < ev.pageX || (wrapper.top + window.scrollY) > ev.pageY || (wrapper.bottom + window.scrollY) < ev.pageY){
			this.emitOutOfBounds(ev);
		}

		else if(!this.items.length){
			this.wrapper.appendChild(this.dragItem)
		}

		this.emitReorder();
	}

	// ---- dragged to new group ---- //
	dragNewGroup(data){
		let mouse = data.detail.ev;
		let wrapper = this.wrapper.closest('.mood-group').getBoundingClientRect();

		// check if mouse is in this wrapper
		if(
			wrapper.left > mouse.pageX ||
			wrapper.right < mouse.pageX ||
			(wrapper.top + window.scrollY) > mouse.pageY ||
			(wrapper.bottom + window.scrollY) < mouse.pageY
		) return;

		// get data from emitted wrapper
		this.initialX = data.detail.initial.x;
		this.initialY = data.detail.initial.y;
		this.dragItem = data.detail.item;

		if(!find(this.itemPositions, {id: data.detail.oldPos.id})){
			this.itemPositions.push(data.detail.oldPos);
		}

		// emit to old wrapper that dragged element now lives here
		const movedBounds = new CustomEvent('moved-bounds');
		document.dispatchEvent(movedBounds);
	}

	// ---- get positioning of each item ---- //
	getItemPositions() {
		this.itemPositions = [];

		this.items.forEach((el) => {
			let position = el.getBoundingClientRect();

			this.itemPositions.push({
				id: el.id,
				el: el,
				left: position.left,
				right: position.right,
				top: position.top + window.scrollY,
				bottom: position.bottom + window.scrollY
			});
		});
	}

	// ---- hide ghost drag img ---- //
	hideGhostImg(ev) {
		var img = new Image();
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
		ev.dataTransfer.setDragImage(img, 0, 0);
	}

	// ---- emit that element is outside of wrapper ---- //
	emitOutOfBounds(ev) {
		let oldPos = find(this.itemPositions, { id: this.dragItem.id });
		if(!oldPos) return;

		// set up data to send to new wrapper
		const outOfBounds = new CustomEvent('out-of-bounds', {
			detail: {
				ev: ev,
				item: this.dragItem,
				oldPos: oldPos,
				initial: {x: this.initialX, y: this.initialY}
			}
		});
		document.dispatchEvent(outOfBounds);

		// when moved to new wrapper remove it from this wrapper
		document.addEventListener('moved-bounds', () => {
			this.wrapper.dispatchEvent(new CustomEvent('remove'));

			// to stop triggering reorderDOM();
			this.dragItem = null;

			// wait until new group is done with animation to get new positions
			setTimeout(() => this.dragEnd(this), 500);
		}, { once: true });
	}

	// ---- emit that order has changed ---- //
	emitReorder() {
		const reorder = new CustomEvent('reorder', { detail: {wrapper: this.wrapper} });
		document.dispatchEvent(reorder);
	}

	// ---- update the items ---- //
	update(items) {
		this.items = items;
	}
}

module.exports = Dragging