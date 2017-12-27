# What is it?

A small library implementing spoilers.
A spoiler is a block with a head and a body — when you click on a head, body disappears.
When you click again — it appears again.
It's that easy.
Spoilers can be grouped into... emmmm... a group.
A spoiler group behaves much like accordions from other component libraries.

# Installation

```
npm i --save @zcomp/spoilers
```

# Usage

```javascript
const spoilers = require('@zcomp/spoilers');
spoilers.SpoilerFactory.init(); // it will not give you spoilers for the next Game of Thrones season, sorry
spoilers.SpoilerGroupFactory.init();
```

Note that SpoilerGroupFactory.init requires SpoilerFactory.init to be called beforehand.
HTML markup:

```html
<div class="js-spoiler">
  <button class="js-spoiler__head">
    Click me
  </button>

  <div class="js-spoiler__body">
    Some content
  </div>
</div>
```

The library does not actually hides body, it just adds classes on root element.
You should manually add styles to your css files to hide body element.
For example:

```css
.js-spoiler--closed .js-spoiler__body {
  display: none;
}
```

When spoiler is opened, root element has `js-spoiler--opened` class.
When it is closed, `js-spoiler--closed` class is added.
After spoiler component initialized, `js-spoiler--inited` class will be present on root element.

You can make spoiler to be opened initially just by adding `js-spoiler--opened` class in HTML.

To create spoiler group, insert the following markup:

```html
<div class="js-spoiler-group">
  <div class="js-spoiler"></div>
  <div class="js-spoiler"></div>
  <div class="js-spoiler"></div>
</div>
```

The only purpose for spoiler group to exists is to manage opened/closed state of its children spoilers.
If spoiler group is _exclusive_, it allows only one spoiler to be opened at the same time.
By default, spoiler groups are not exclusive.
You should either add `data-spoiler-group-exclusive` attribute to root element, of set `defaultExclusive` property of options object to `true` to make it exclusive (see @zcomp/base documentation for details).
If spoiler is exclusive, and you have several initially opened spoilers inside, only the first one will remain opened after initializing, others will be closed.
If you have no initially opened spoilers, all spoilers will be closed after group initializes.
But you can force a spoiler with particular index inside a group to be opened initially by adding `data-spoiler-group-opened-index` to the root element.
This attribute should contain a number depicting index of the spoiler that should be opened on init.
The same can be done with `defaultOpenedIndex` property of options object.
Attributes always have priority over options.
If this index is negative (or just invalid), no spoilers will be opened.

## Events

Some events are fired on root element of the component.
All these events bubble.
`before-spoiler-change-state` is fired before spoiler changes state.
You can cancel it by calling `preventDefault` method on event object.
`after-spoiler-change-state` is fired after spoiler changes state.

