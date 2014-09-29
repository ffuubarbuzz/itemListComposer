itemListComposer is a jQuery plugin for composing ordered list of items from pre-defined full item list

Usage
=========
Just call itemListComposer method on jQery object of proper markup. Like that:

    $('.item-list-composer').itemListComposer();

itemListComposer method can accept settings objects as an argument. Like that:

    $('.item-list-composer').itemListComposer({
      key: value
    });

Options
=========
Possible options, passed as comma-separated list of ```key: value``` pairs:


    itemSource: ".source"

Selector for list of all existing options (can be not full on initialization).

    itemReceiver: ".receiver"

Selector for list of selected options (can be not empty on initialization).

    itemReceiverOrderable: true

If true, user would be able to order list of selected items manually.

    item: 'li'

Selector for single option in both itemSource and itemReceiver.

    selectItem: '.select'

Selector for button, that moves selected items from itemSource to itemReceiver.

    selectAllItems: '.select-all'

Selector for button, that moves all items from itemSource to itemReceiver.

    deselectItem: '.deselect'
    
Selector for button, that moves selected items from itemReceiver to itemSource.

    deselectAllItems: '.deselect-all'
    
Selector for button, that moves all items from itemReceiver to itemSource.

    shiftUpButton: '.order-up'
    
Selector for button, that moves selected items in itemReceiver up in order.

    shiftDownButton: '.order-down'
    
Selector for button, that moves selected items in itemReceiver down in order.

    acceptorTemplate: '#acceptor'
    
Selector for template of element, that represents a place where drag-n-dropped item will be placed.

    acceptorClass: 'acceptor'
    
Selector for acceptor element, that represents a place where drag-n-dropped item will be placed.

    selectedClass: 'selected'

Class, that selected elements will have.

    draggedClass: 'dragged'

Class, that dragged elements will have.

    droppableClass: 'droppable'

Class, that container receiving dragged elements will have.

Callbacks
=========

Callbacks are passed as options. Existing callbacks:

    onSelect: function (items) {}

Function, called when any item is moved to itemReceiver.

    onDeselect: function () {}

Function, called when any item is moved to itemSource.

Features
=========

* User can select/deselect range of items holding <kbd>SHIFT</kbd>
