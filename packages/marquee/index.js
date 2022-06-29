import { animate } from "motion"

export default class Marquee {
   constructor(parent, directionRight = false) {
      this.parent = parent
      this.directionRight = directionRight;
      this.children = Array.from(this.parent.children)

      window.addEventListener('resize', () => {
         this.buildMarquee(this.parent, this.children, this.directionRight)
      })
      this.buildMarquee(this.parent, this.children, directionRight)
   }
   // BUILD IT
   buildMarquee(parent, children, reverse) {
      // save original Height
      const originalH = this.parent.offsetHeight

      // wrap parent in marquee
      const wrapper = document.createElement('div')
      wrapper.classList.add('marquee')
      wrapper.style.cssText += `
         position: relative;
         width: 100vw;
         `
         // height: ${originalH}px;
      parent.parentNode.insertBefore(wrapper, parent)
      wrapper.appendChild(parent)

      // assign base style for parent
      parent.style.cssText += `
         display: flex;
         flex-direction: row;
         flex-wrap: nowrap;
         width: max-content;
         position: absolute;
         top: 0;
         ${reverse ? 'right' : 'left'}: 0;
      `

      // get base width of single set
      const originalW = this.parent.offsetWidth

      // loop through set till the children cover double screen width
      do {
         children.forEach(child => {
            let clone = child.cloneNode(true)
            parent.appendChild(clone)
         })
      } while (this.parent.offsetWidth < window.innerWidth * 2)

      const slideX = reverse ? originalW : -originalW
      animate(this.parent, {
         x: slideX
      }, {
         duration: originalW / 30, // divide by lower number to slow down
         easing: 'linear',
         repeat: Infinity
      })
   }
}