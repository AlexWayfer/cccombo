# Cccombo

Make select-box or combo-box by one module!

## Install

Just download `cccombo.js` and `cccombo.css` files
and include in your application.

## Usage

### Main (and common) script

```javascript
var cccomboArray = document.getElementsByClassName('cccombo');
[].forEach.call(cccomboArray, function(element) {
  var cccombo = new Cccombo(element);
  cccombo.init();
});
```

### Select-box

```html
<div class="cccombo">
  <button type="button"></button>
  <ul>
    <li>The first option</li>
    <li>The second option</li>
    <li>The third option</li>
  </ul>
</div>
```

### Combo-box

```html
<div class="cccombo">
  <input type="text" />
  <ul>
    <li>The first option</li>
    <li>The second option</li>
    <li>The third option</li>
  </ul>
</div>
```

### Insert the label (HTML-content) of the selected item into the custom element

Just add `data-label` attribute to the target element inside `<button>`.

```html
<button type="button">
  <span data-label></span>
</button>
```

### Insert the custom label of the selected item

Just add `data-label` attribute to the `li` element:

```html
<li data-label="The first">
  The first option
</li>
```

Or to its child element with the necessary label-content
(helpful for custom HTML-labels):

```html
<li>
  <span data-label><img src="icon.png" /></span> The second option
</li>
```

### Define custom values for items

Just add `data-value` attribute to `<li>` elements.

```html
<li data-value="1">The first option</li>
<li data-value="2">The second option</li>
<li data-value="3">The third option</li>
```

### Filter the list of items

```javascript
cccombo.list.filterItems(function(item, index) {
  return (
    item.element.dataset.foo > 0 &&
      item.element.dataset.bar == 'baz'
  );
});
```
