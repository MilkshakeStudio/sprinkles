# Sprinkles

### Features

* Accordion
* Knolling

## Installation & Usage

```
npm install tbd
```

### Accordion

```
import { Accordion } from 'tbd;
let accordion = new Accordion('.accordion-element');
```

### Knolling

```
import { Knolling } from 'tbd';

let wrappers = document.querySelectorAll(".knolling-wrapper");
let knolling = new Knolling(wrappers, {
  itemSelector: ".knolling-el",
  layout: 'grid,
  columns: 3,
  gutter:".gutter",
  draggable: true
});
```

#### Options
```
let knolling = new Knolling( wrappers {
  // options with defaults

  layout: 'grid',
  // alignment style
  // options: 'grid' and 'masonry'

  columns: 4,
  // number of columns

  gutter: 30,
  // space between columns and rows
  // accepts number (px) or class selector ('.gutter')

  draggable: false,
  // allow or disable drag functionality

  compact: true,
  // if layout is set to 'masonry', this will make rows as even as possible
});
```

stay tuned for more ...