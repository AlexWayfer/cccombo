/*
	Cccombo

	Make select-box or combo-box by one module!

	Author: Alexander Popov <alex.wayfer@gmail.com>
	License: MIT
	Version: 1.3.2

	https://github.com/AlexWayfer/cccombo
*/

// Helpers functions
function dispatchCustomEvent(element, event_name) {
	var event;
	try {
		event = new Event(event_name, { 'bubbles': true, 'cancelable': true });
	} catch(e) {
		event = document.createEvent('Event');
		// Define that the event name is 'build'.
		event.initEvent(event_name, true, true);
	}

	// target can be any Element or other EventTarget.
	element.dispatchEvent(event);
}

// Cccombo Item of List class
function CccomboItem(element) {
	// Constructor
	this.element = element;
	this._fromDataWithDefault(
		'label',
		(this.element.querySelector('*[data-label]') || this.element).innerHTML
	);
	this._fromDataWithDefault('value');
}

CccomboItem.prototype = {
	hideClass: 'hidden',
	hoverClass: 'hover',
	selectClass: 'selected',

	_fromDataWithDefault: function(key, defaultValue) {
		if (defaultValue === undefined) defaultValue = this.element.innerHTML;
		var dataValue = this.element.getAttribute('data-' + key);
		return (
			this[key] = (dataValue !== null) ? dataValue : defaultValue
		);
	},

	_isHidden: function() {
		return this.element.classList.contains(this.hideClass);
	},

	_isHovered: function() {
		return this.element.classList.contains(this.hoverClass);
	},

	_isSelected: function() {
		return this.element.classList.contains(this.selectClass);
	},

	_hide: function() {
		this.element.classList.add(this.hideClass);
	},

	_show: function() {
		this.element.classList.remove(this.hideClass);
	},

	_hover: function() {
		this.element.classList.add(this.hoverClass);
	},

	_unhover: function() {
		this.element.classList.remove(this.hoverClass);
	},

	_select: function() {
		this.element.classList.add(this.selectClass);
	},

	_unselect: function() {
		this.element.classList.remove(this.selectClass);
	}
};

// Cccombo List class
function CccomboList(cccombo) {
	// Constructor
	this.cccombo = cccombo;
	this.element = this.cccombo.element.getElementsByTagName('ul')[0];
	var liArray = this.element.querySelectorAll('li:not(.group)');
	this.items = [].map.call(liArray, function(item) {
		return new CccomboItem(item);
	});
}

CccomboList.prototype = {
	visibleItems: function() {
		return this.items.filter(function(item) {
			return !item._isHidden();
		});
	},

	hideItem: function(index) {
		var item = this.items[index];
		if (item._isHovered()) this.hover(null);
		if (item._isSelected()) this.selectItem(null);
		item._hide();
	},

	showItem: function(index) {
		this.items[index]._show();
	},

	filterItems: function(callback) {
		var list = this;
		this.items.forEach(function(item, index) {
			if (callback(item, index)) {
				list.showItem(index);
			} else {
				list.hideItem(index);
			}
		});
		// Hide empty list
		this.cccombo.open();
		// if (this.visibleItems().length === 0) {
		// 	this.cccombo.close();
		// }
	},

	hoveredItem: function() {
		return this.items.filter(function(item) {
			return item._isHovered();
		})[0];
	},

	hover: function(item) {
		var hoveredItem = this.hoveredItem();
		if (hoveredItem) hoveredItem._unhover();
		if (item) item._hover();
	},

	hoverMove: function(delta) {
		var visibleItems = this.visibleItems();
		var index = visibleItems.indexOf(this.hoveredItem()) + delta;
		if (
			(index >= visibleItems.length && delta == 1) ||
			(index < 0 && delta != -1)
		) {
			index = 0;
		} else if (
			(index >= visibleItems.length && delta != 1) ||
			(index < 0 && delta == -1)
		) {
			index = visibleItems.length - 1;
		}
		this.hover(visibleItems[index]);
	},

	hoverNext: function() {
		this.hoverMove(+1);
	},

	hoverPrev: function() {
		this.hoverMove(-1);
	},

	hoverFirst: function() {
		this.hover(this.visibleItems()[0]);
	},

	selectedItem: function() {
		return this.items.filter(function(item) {
			return item._isSelected();
		})[0];
	},

	selectItem: function(item) {
		var selectedItem = this.selectedItem();
		if (selectedItem) selectedItem._unselect();
		if (item) item._select();
	}
};

// Cccombo class
function Cccombo(element) {
	// Constructor
	this.element = element;
	this.input =
		this.element.querySelector('.cccombo > input:not([type="hidden"])');
	this.button = this.element.querySelector('button');
	this.input_or_button = (this.input || this.button);
	this.list = new CccomboList(this);
}

Cccombo.prototype = {
	openClass: 'open',

	init: function() {
		var cccombo = this;

		// Add hidden input for button
		if (this.button) {
			// Init node
			this.hidden_input = document.createElement('input');
			this.hidden_input.setAttribute('type', 'hidden');
			['name', 'value', 'form'].forEach(function(attr) {
				var value = cccombo.button.getAttribute(attr);
				if (value) cccombo.hidden_input.setAttribute(attr, value);
			});
			// Events for node
			this.button.addEventListener('change', function(event) {
				cccombo.buttonOnChange();
			});
			// Append node
			this.element.insertBefore(this.hidden_input, this.list.element);
		}

		// Open and close by focus
		if (this.input) this.input.addEventListener('focus', function(event) {
			cccombo.open();
		});

		if (this.button) this.button.addEventListener('click', function(event) {
			cccombo.toggle();
			event.preventDefault();
		});

		this.input_or_button.addEventListener('blur', function(event) {
			if (cccombo.element.querySelector(':hover') !== cccombo.list.element) {
				cccombo.close();
			}
		});

		this.list.items.forEach(function(item) {
			// Hover item event
			item.element.addEventListener('mouseenter', function(event) {
				cccombo.list.hover(item);
			});
			item.element.addEventListener('mouseleave', function(event) {
				cccombo.list.hover(null);
			});

			// Select item event
			item.element.addEventListener('click', function(event) {
				cccombo.select(item);
				if (cccombo.button) cccombo.button.focus();
			});

			// Select selected item
			if (item._isSelected()) cccombo.select(item);
		});

		// Filtering items on input
		if (this.input) this.input.addEventListener('input', function(event) {
			// Hide items
			var input_value = this.value.toLowerCase();
			cccombo.list.filterItems(function(item) {
				var item_value = item.element.innerHTML.toLowerCase();
				return (item_value.indexOf(input_value) >= 0);
			});
			var selectedItem = cccombo.list.selectedItem();
			if (selectedItem && selectedItem.value != this.value) {
				selectedItem._unselect();
			}
		});

		// Moving for items
		this.input_or_button.addEventListener('keydown', function(event) {
			// console.log(event.keyCode);
			var arrow  = { up: 38, down: 40 },
			    page   = { up: 33, down: 34 },
			    escape =   27,
			    enter  =   13;
			if (cccombo.isOpen()) {
				switch (event.keyCode) {
					case arrow.up:
						cccombo.list.hoverPrev();
						break;
					case arrow.down:
						cccombo.list.hoverNext();
						break;
					case page.up:
						cccombo.list.hoverMove(-5);
						break;
					case page.down:
						cccombo.list.hoverMove(5);
						break;
					case escape:
						cccombo.close();
						break;
					case enter:
						cccombo.select();
						break;

					default: return; // exit
				}
			} else {
				switch (event.keyCode) {
					case enter:
					case arrow.up:
					case arrow.down:
					case page.up:
					case page.down:
						cccombo.open();
						break;

					default: return; // exit
				}
			}

			event.preventDefault();
		});

		// window.addEventListener('resize', function(event) {
		// 	// Make width of button same as list width
		// 	if (cccombo.button) {
		// 		var bordeWidth = parseInt(
		// 			getComputedStyle(
		// 				cccombo.input_or_button, null
		// 			).getPropertyValue('border-width')
		// 		);
		// 		cccombo.element.style.width = (
		// 			cccombo.list.element.offsetWidth + bordeWidth * 2 + 'px'
		// 		);
		// 	}
		// });
		// dispatchCustomEvent(window, 'resize');
	},

	buttonOnChange: function() {
		this.hidden_input.value = this.button.value;
	},

	open: function() {
		if (this.list.visibleItems().length === 0) {
			this.close();
			return false;
		}
		this.element.classList.add(this.openClass);
		var selectedItem = this.list.selectedItem();
		if (!selectedItem) {
			this.list.hoverFirst();
		} else {
			this.list.hover(selectedItem);
		}
	},

	close: function() {
		this.element.classList.remove(this.openClass);
		this.list.hover(null);
	},

	isOpen: function() {
		return this.element.classList.contains(this.openClass);
	},

	toggle: function() {
		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	},

	select: function(item) {
		if (item === undefined) {
			item = this.list.hoveredItem();
		}

		this.list.selectItem(item);

		this.input_or_button.value = item.value;
		if (this.input) dispatchCustomEvent(this.input, 'input');
		if (this.button) {
			var label = (this.button.querySelector('*[data-label]') || this.button);
			label.innerHTML = item.label;
		}
		dispatchCustomEvent(this.input_or_button, 'change');
		// Hidden input has no value from button
		// because disabled button doesn't recieve events (on Firefox)
		// https://bugzilla.mozilla.org/show_bug.cgi?id=329509
		if (this.button && this.button.getAttribute('disabled') !== undefined) {
			this.buttonOnChange();
		}
		this.close();
	},

	selectFirst: function() {
		this.select(this.list.visibleItems()[0]);
	}

};
