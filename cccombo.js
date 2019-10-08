/*
	Cccombo

	Make select-box or combo-box by one module!

	Author: Alexander Popov <alex.wayfer@gmail.com>
	License: MIT
	Version: 2.0.0

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
function CccomboList(cccombo, element) {
	// Constructor
	this.cccombo = cccombo;
	this.element = element;
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
		if (item._isHovered()) this._hover(null);
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

	_hoveredItem: function() {
		var found = null;
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if (item._isHovered()) {
				found = item;
				break;
			}
		}
		return found;
	},

	_hover: function(target_item) {
		var hoveredItem = this._hoveredItem();
		if (hoveredItem) hoveredItem._unhover();
		if (target_item) {
			this.items.forEach(function(item) {
				if (item.value == target_item.value) {
					item._hover();
				}
			});
		}
	},

	_hoverMove: function(delta) {
		var visibleItems = this.visibleItems();
		var index = visibleItems.indexOf(this._hoveredItem()) + delta;
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
		this._hover(visibleItems[index]);
	},

	_selectedItem: function() {
		var found = null;
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if (item._isSelected()) {
				found = item;
				break;
			}
		}
		return found;
	},

	selectItem: function(item) {
		var selectedItem = this._selectedItem();
		if (selectedItem) {
			if (item && selectedItem.value == item.value) return;
			selectedItem._unselect();
		}
		if (item) item._select();
	},

	isMain: function() {
		return this.element.dataset.main == 'true';
	}
};

// Cccombo class
function Cccombo(element) {
	var cccombo = this;

	// Constructor
	this.element = element;
	this.input =
		this.element.querySelector('.cccombo > input:not([type="hidden"])');
	this.button = this.element.querySelector('button');
	this.input_or_button = (this.input || this.button);
	this.lists = [].map.call(
		this.element.querySelectorAll('ul'), function(list_element) {
			return new CccomboList(cccombo, list_element);
		}
	);
	var main_lists = this.lists.filter(function(list) {
		return list.isMain();
	});
	if (main_lists.length > 1) {
		console.error('There are more than 1 main list for Cccombo:');
		console.error(main_lists);
	}
	this.main_list = (main_lists.length > 0 ? main_lists : this.lists)[0];
	this.dropdown =
		this.element.querySelector('.cccombo > ul, .cccombo > .dropdown');
}

Cccombo.container = function() {
	return document.body;
};

Cccombo.prototype = {
	openClass: 'open',

	hoveredItems: function() {
		this.lists.map(function(list) {
			return list._hoveredItem();
		});
	},

	selectedItem: function() {
		return this.main_list._selectedItem();
	},

	hover: function(item) {
		this.lists.forEach(function(list) {
			list._hover(item);
		});
	},

	hoverMove: function(delta) {
		this.main_list._hoverMove(delta);
		this.hover(this.main_list._hoveredItem());
	},

	hoverFirst: function() {
		this.hover(this.main_list.visibleItems()[0]);
	},

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
			this.element.insertBefore(
				this.hidden_input, this.button.nextSibling
			);
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
			if (!cccombo.element.querySelector('ul:hover')) {
				cccombo.close();
			}
		});

		// Filtering items on input
		if (this.input) this.input.addEventListener('input', function(event) {
			var value = this.value;
			// Hide items
			var input_value = value.toLowerCase();
			cccombo.lists.forEach(function(list) {
				list.filterItems(function(item) {
					var item_value = item.element.innerHTML.toLowerCase();
					return (item_value.indexOf(input_value) >= 0);
				});
				var selectedItem = list._selectedItem();
				if (selectedItem && selectedItem.value != value) {
					selectedItem._unselect();
				}
			});
		});

		// Moving for items
		this.input_or_button.addEventListener('keydown', function(event) {
			// console.log(event.keyCode);
			var
				arrow  = { up: 38, down: 40 },
				page   = { up: 33, down: 34 },
				escape =   27,
				enter  =   13;
			if (cccombo.isOpen()) {
				switch (event.keyCode) {
					case arrow.up:
						cccombo.hoverMove(-1);
						break;
					case arrow.down:
						cccombo.hoverMove(+1);
						break;
					case page.up:
						cccombo.hoverMove(-5);
						break;
					case page.down:
						cccombo.hoverMove(5);
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

		this.lists.forEach(function(list) {
			list.items.forEach(function(item) {
				// Hover item event
				item.element.addEventListener('mouseenter', function(event) {
					cccombo.hover(item);
				});
				item.element.addEventListener('mouseleave', function(event) {
					cccombo.hover(null);
				});

				// Select item event
				item.element.addEventListener('click', function(event) {
					cccombo.select(item);
					if (cccombo.button) cccombo.button.focus();
				});

				// Select selected item
				if (item._isSelected()) {
					item._unselect();
					cccombo.select(item);
				}
			});
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
		if (
			this.lists.every(function(list) {
				return list.visibleItems().length === 0;
			})
		) {
			this.close();
			return false;
		}

		this.dropdown.style.visibility = 'hidden';
		this.element.classList.add(this.openClass);

		var
			dropdown_bounding = this.dropdown.getBoundingClientRect(),
			container = Cccombo.container(this.element),
			container_bounding = container.getBoundingClientRect(),
			body_bounding = document.body.getBoundingClientRect();

		if (dropdown_bounding.bottom > body_bounding.bottom) {
			this.dropdown.style.bottom = '100%';
		}

		if (dropdown_bounding.right > container_bounding.right) {
			this.dropdown.style.left =
				'calc(' +
					window.getComputedStyle(this.dropdown).left +
					' - ' +
					window.getComputedStyle(container).paddingRight +
					' + ' +
					(container_bounding.right - dropdown_bounding.right + 'px') +
				')';
		}

		this.dropdown.style.visibility = '';

		var selectedItem = this.selectedItem();
		if (!selectedItem) {
			this.hoverFirst();
		} else {
			this.hover(selectedItem);
		}
	},

	close: function() {
		this.element.classList.remove(this.openClass);
		this.hover(null);
		this.dropdown.style.bottom = '';
		this.dropdown.style.left = '';
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
		var
			original_item_value = typeof item == 'string' ? item : item.value,
			previous_selected_item = this.selectedItem();

		this.lists.forEach(function(list) {
			var list_item = null;

			var visibleItems = list.visibleItems();
			visibleItems.some(function(visibleItem) {
				if (visibleItem.value == original_item_value) {
					return item = list_item = visibleItem;
				} else {
					return;
				}
			});

			list.selectItem(list_item);
		});

		if (item == undefined) {
			item = this.hoveredItems()[0];
		}

		this.input_or_button.value = item.value;

		if (this.button) {
			var label = (this.button.querySelector('*[data-label]') || this.button);
			label.innerHTML = item.label;
		}
		// Hidden input has no value from button
		// because disabled button doesn't recieve events (on Firefox)
		// https://bugzilla.mozilla.org/show_bug.cgi?id=329509
		if (this.button && this.button.getAttribute('disabled') !== undefined) {
			this.buttonOnChange();
		}

		if (!previous_selected_item || item.value != previous_selected_item.value) {
			if (this.input) dispatchCustomEvent(this.input, 'input');
			dispatchCustomEvent(this.input_or_button, 'change');
		}

		this.close();
	}
};
