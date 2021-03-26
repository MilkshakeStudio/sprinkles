var { last, filter, isEqual } = require('lodash');
var { TweenLite } = require('gsap');
var dragging = require('./dragging');

class Knolling{
   constructor(wrapper, options) { 
      if (!wrapper) throw "Please provide a valid wrapper."

      this.wrapper = wrapper;
      this.items = [];
      this.initialItems = this.wrapper.querySelectorAll(options.itemSelector);

      this.options = Object.assign({
         layout: 'masonry',
         columns: 4,
         gutter: 30,
         itemSelector: '.item',
         compact: false,
         draggable: false
      }, options);

      this.init();

      document.addEventListener('resize', () => this.resize());
   }

   // ---- init ---- //
   init(updatingLayout) {
      this.items = this.wrapper.querySelectorAll(this.options.itemSelector);

      this.setGutterWidth();
      this.setColumnWidth();
      this.getXOffsets();
      this.setItemHeights();

      this.options.layout == 'grid'
         ? this.setupGrid(updatingLayout)
         : this.options.compact
            ? this.setupCompactMasonry(updatingLayout)
            : this.setupMasonry(updatingLayout);
   }

   // ---- set gutter width ---- //
   setGutterWidth() {
      this.gutterWidth = typeof this.options.gutter == 'number'
         ? this.options.gutter
         : this.wrapper.querySelector(this.options.gutter).offsetWidth;
   }

   // ---- set column width ---- //
   setColumnWidth() {
      this.columnWidth = this.options.columnWidth
         ? this.wrapper.querySelector(this.options.columnWidth).offsetWidth
         : (this.wrapper.offsetWidth - ((this.options.columns - 1) * this.gutterWidth)) / this.options.columns;
   }

   // ---- set item heights ---- //
   setItemHeights() {
      this.items.forEach(el => {
         el.style.height = this.options.layout == 'grid'
            ? `${this.columnWidth}px`
            : 'auto'
      });
   }

   // ---- configure element positions for grid ---- //
   setupGrid(updatingLayout) {

      // get y-offsets
      this.yOffsets = [0];
      for(let i = 1; i < Math.ceil(this.items.length/this.options.columns); i++){
         let y = (this.columnWidth * i) + (this.gutterWidth * i);
         this.yOffsets.push(y);
      }

      let self = this;

      TweenLite.to(this.items, {
         width: this.columnWidth,
         position: 'absolute',
         left: function(i, el){
            let xGroup = i % self.options.columns;
            if(!el.classList.contains('dragging')) return self.xOffsets[xGroup];
         },
         top: function(i, el){
            let yGroup = i === 0 ? 0 : Math.floor(i / self.options.columns);
            if(!el.classList.contains('dragging')) return self.yOffsets[yGroup];
         },
         duration: 0.2,
         onComplete: () => {
            this.setWrapperHeight();
            updatingLayout ? this.updateDrag() : this.setupDrag();
         }
      });
   }

   // ---- configure element positions for masonry - not compact ---- //
   setupMasonry(updatingLayout) {
      let self = this;

      TweenLite.to(this.items, {
         width: this.columnWidth,
         position: 'absolute',
         left: function(i, el){
            let xGroup = i % self.options.columns;
            if(!el.classList.contains('dragging')) return self.xOffsets[xGroup];
         },
         top: function(i, el){
            let aboveEl = self.items[i - self.options.columns];
            let top = aboveEl
               ? parseInt(aboveEl.style.top, 10) + aboveEl.getBoundingClientRect().height + self.gutterWidth
               : 0;
            if(!el.classList.contains('dragging')) return top;
         },
         duration: 0.2,
         stagger: { amount: 0.1 },
         onComplete: () => {
            this.setWrapperHeight();
            updatingLayout ? this.updateDrag() : this.setupDrag();
         }
      });
   }

   // ---- configure element positions for masonry - compact ---- //
   setupCompactMasonry(updatingLayout) {
      let self = this;

      // create obj for y-indexes
      let columnY = {}
      for(let i = 0; i < this.options.columns; i++){
         columnY[i] = [];
      }

      TweenLite.to(this.items, {
         width: this.columnWidth,
         position: 'absolute',
         left: function(i, el){
            let shortestColumn = self.getShortestColumn(columnY);
            if(!el.classList.contains('dragging')) return self.xOffsets[shortestColumn];
         },
         top: function(i, el){
            let shortestColumn = self.getShortestColumn(columnY);
            let top = columnY[shortestColumn].length
               ? last(columnY[shortestColumn]).top + last(columnY[shortestColumn]).el.getBoundingClientRect().height + self.gutterWidth
               : 0;
            columnY[shortestColumn].push({ el, top });
            if(!el.classList.contains('dragging')) return top;
         },
         duration: 0.2,
         stagger: { amount: 0.1 },
         onComplete: () => {
            this.setWrapperHeight();
            updatingLayout ? this.updateDrag() : this.setupDrag();

            // reset order based on new positions
            this.resetOrder(columnY);
         }
      })
   }

   // ---- set wrapper height ---- //
   setWrapperHeight() {
      if(!this.items.length){
         this.wrapper.style.height = `0px`;
         return;
      }
      
      let top = this.items[0].getBoundingClientRect().top + window.scrollY;

      // don't account for draggg
      let nonDrag = filter(this.items, el => !el.classList.contains('dragging'));
      let lastRow = Array.from(nonDrag).slice(Math.max(this.items.length - this.options.columns, 0));
      let bottom = 0;

      lastRow.forEach(el => {
         if((el.getBoundingClientRect().bottom + window.scrollY) > bottom) bottom = el.getBoundingClientRect().bottom + window.scrollY
      });

      this.wrapper.style.height = `${bottom - top}px`;
   }

   // ---- reset order from masonry ---- //
   resetOrder(splitColumns){
      let i = 0;
      let newOrder = [];

      while (newOrder.length < this.items.length){
         for(let column in splitColumns){
            if(splitColumns[column][i]){
               newOrder.push(splitColumns[column][i].el);
            }
         }
         i++;
      }
   }

   // ---- get x-offsets ---- //
   getXOffsets() {
      this.xOffsets = [0];
      for(let i = 1; i < this.options.columns; i++){
         let x = (this.columnWidth * i) + (this.gutterWidth * i);
         this.xOffsets.push(x);
      }
   }

   // ---- setup drag ---- //
   setupDrag() {
      if (!this.options.draggable) return;

      if(!this.drag){
         this.drag = new dragging(this.wrapper, { items: this.items });
   
         this.dragListeners();
      }
   }

   // ---- update drag ---- //
   updateDrag() {
      this.drag.update(this.items);
      this.drag.getItemPositions();
   }

   // ---- masonry ---- //
   masonry() {
      this.options.layout = 'masonry';
      this.init(true);
   }

   // ---- grid ---- //
   grid() {
      this.options.layout = 'grid';
      this.init(true);
   }

   // ---- resize ---- //
   resize() {
      this.init();

      if(this.drag) this.drag.getItemPositions();
   }

   // ---- update ---- //
   update() { this.init(true); }

   // ---- drag listeners ---- //
   dragListeners() {
      document.addEventListener('reorder', () => {
         if(!isEqual(Array.from(this.initialItems), Array.from(this.items))){
            const updateOrder = new CustomEvent('update-order', {
               detail: { items: Array.from(this.items) }
            });
            this.wrapper.dispatchEvent(updateOrder);
         }
         this.init();
         this.drag.update(this.items);
      }, false);

      this.wrapper.addEventListener('remove', () => {
         this.items = this.wrapper.querySelectorAll(this.options.itemSelector);
         this.updateDrag();
      }, false);
   }

   // ---- find shortest column ---- //
   getShortestColumn(columnY){
      let shortestColumn = 0;

      for(let column in columnY){
         if(columnY[column].length && columnY[shortestColumn].length){
            // if the last el's top is less than the current shortestColumn's last top then it should be set to shortestColumn
            if(last(columnY[column]).top < last(columnY[shortestColumn]).top){
               shortestColumn = column;
            }
         }
         
         // if columnY[column] is empty it should be the shorted column
         else if (columnY[column].length == 0) shortestColumn = column;
      }
      return shortestColumn;
   }
}

module.exports = Knolling