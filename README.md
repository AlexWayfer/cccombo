# Cccombo

Make select-box or combo-box by one module!

## Installation

Just download `cccombo.js` and `cccombo.css` files
and include in your application.

## Usage

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

### Group items

Add `group` class to group-header elements.
Group-header items become unselectable.

```html
<ul>
  <li class="group">The first group</li>
  <li>The first option</li>
  <li>The second option</li>
  <li>The third option</li>
  <li class="group">The second group</li>
  <li>Another option</li>
  <li>One more option</li>
</ul>
```

### Default selected item

Add `selected` class to the desired item:

```html
<ul>
  <li>Now I'm not selected</li>
  <li class="selected">I'll be selected!</li>
  <li>Good luck another time</li>
</ul>
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

### Listen a change event

`change` event is dispatched to a `button` or `input` element,
depends on the type of Cccombo usage.

Please note, that `change` event is not dispatched to the hidden `input`,
added by Cccombo for `button` type of usage.

### Programmatically select item

Cccombo assign the `cccombo` property with a Cccombo-instance value
to all initialized elements. So, you can call any Cccombo functions from
this property.

`select()` can receive a String argument (`value` of the desired item)
or an instance of `CccomboItem`.

```html
<div id="cccombo" class="cccombo">
  <button type="button"></button>
  <ul>
    <li data-value="USD">$</li>
    <li data-value="EUR">€</li>
    <li data-value="RUB">₽</li>
  </ul>
</div>
```

```javascript
document.querySelector('#cccombo').cccombo.select('EUR');
```
