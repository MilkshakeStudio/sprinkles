# Sprinkles

### Features

* Accordion
* Knolling

## Installation & Usage

```
npm install tbd
```

### Accordion
``` html
<div class="accordion-element">
  <div class="show-hide">...</div>
</div>
```

``` js
import { Accordion } from 'tbd;

let accordion = new Accordion('.accordion-element', {
  // options with defaults

  hideable: '.show-hide',
  // hideable content class name

  duration: 0.5
  // duration of toggle animation
});
```

### Knolling

``` js
import { Knolling } from 'tbd';

let wrappers = document.querySelectorAll(".knolling-wrapper");
let knolling = new Knolling(wrappers, {
  // options with defaults

  itemSelector: ".knolling-el",

  layout: 'grid',
  // alignment style
  // options: 'grid' and 'masonry'

  columns: 3,
  // number of columns

  gutter: 30,
  // space between columns and rows
  // accepts number (px) or class selector ('.gutter')

  draggable: false,
  // allow or disable drag functionality

  compact: false,
  // if layout is set to 'masonry', this will make rows as even as possible
});
```

stay tuned for more ...

---

Created by [Milkshake Studio](https://milkshake.studio/)