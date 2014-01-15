(function( $ ) {
	$.fn.itemListComposer = function( options ) {
		var settings = $.extend({
			itemSource: ".source",
			itemReceiver: ".receiver",
			itemReceiverOrderable: true,
			item: 'li',
			selectItem: '.select',
			selectAllItems: '.select-all',
			deselectItem: '.deselect',
			deselectAllItems: '.deselect-all',
			shiftUpButton: '.order-up',
			shiftDownButton: '.order-down',
			acceptorTemplate: '#acceptor',
			acceptorClass: 'acceptor',
			selectedClass: 'selected',
			draggedClass: 'dragged',
			droppableClass: 'droppable',
			onSelect: function () {},
			onDeselect: function () {}
		}, options );
		
		return this.each(function() {

			//grabbing objects
			var itemSource = $(this).find(settings.itemSource);
			var itemReceiver = $(this).find(settings.itemReceiver);
			var selectItem = $(this).find(settings.selectItem);
			var selectAllItems = $(this).find(settings.selectAllItems);
			var deselectItem = $(this).find(settings.deselectItem);
			var deselectAllItems = $(this).find(settings.deselectAllItems);
			var shiftUpButton = $(this).find(settings.shiftUpButton);
			var shiftDownButton = $(this).find(settings.shiftDownButton);
			var acceptorTemplate = $($(this).find(settings.acceptorTemplate).get(0).content);

			var that = this;

			var lastSelected;	//for shift-click range selection

			var dragEnteredElement = null;	//fix for handling itemReceiver dragleave event

			var draggedItems = $([]);

			//remove all handlers so we can reinitialize the plugin
			itemSource.add(itemReceiver)
			.add(itemSource.find(settings.item))
			.add(itemReceiver.find(settings.item))
			.add(selectItem).add(deselectItem)
			.add(selectAllItems).add(deselectAllItems)
			.add(shiftUpButton).add(shiftDownButton).off('.itemListComposer');

			// behaviour objects for itemSource and itemReceiver items
			// so we can swap item behaviour easily when moved from one container to another
			var sourceItemBehaviour = {
				
			};

			var receiverItemBehaviour = {
				'dragover.itemListComposer' : function(e) {
					e.preventDefault();
					var mouseY = (e.originalEvent.pageY - $(this).offset().top);
					var itemHeight = $(this).outerHeight() / 2;
					if ( settings.itemReceiverOrderable ) {
						if ( mouseY <= itemHeight && !$(this).prev().hasClass(settings.acceptorClass) ) {
							removeAcceptors(itemReceiver);
							$(this).before(newAcceptor());
						}
						else if ( mouseY > itemHeight && !$(this).next().hasClass(settings.acceptorClass) ){
							removeAcceptors(itemReceiver);
							$(this).after(newAcceptor());
						}
					}
				}
			};

			//
			//	INITIALIZING:
			// 

			// sorting itemSource
			itemSource.append(itemSource.find(settings.item).sort(function(a, b) {
				return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
			}));

			// sorting itemReceiver if it isn't orderable
			if( !settings.itemReceiverOrderable ) {
			itemReceiver.append(itemReceiver.find(settings.item).sort(function(a, b) {
				return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
			}));				
			}
			
			// initial behaviour for items
			setItemsBehaviour(itemReceiver.find(settings.item));

			// var node = itemReceiver[0];
			// ['dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend'].forEach(function(name){
			// 	node.addEventListener(name, function(e){
			// 		// console.log(name, e.target);
			// 		// console.log(dragEnteredElement)
			// 	});
			// });

			// common for items behavior
			// selectinging by click
			itemSource.add(itemReceiver).find(settings.item).on('click.itemListComposer', function(e){
				if(e.shiftKey && undefined !== lastSelected) {
					var lower = Math.min($(this).index(),lastSelected.index());
					var upper = Math.max($(this).index(),lastSelected.index());
					var items = $(this).siblings().slice(lower, upper);
					items.add(this).addClass(settings.selectedClass);
				}
				else {
					$(this).toggleClass(settings.selectedClass);
				}
				lastSelected = $(this);
			}).on('dragstart.itemListComposer', function(e){
				//TODO: prevent start dragging with small timeout and do click() instead
				var container = findContainer($(this));
				draggedItems = container.find('.'+settings.selectedClass).add($(this));
				draggedItems.addClass(settings.draggedClass + ' ' + settings.selectedClass);
				e.originalEvent.dataTransfer.setData('text/plain', 'Dragndrop now works in stinky bastard FF');
			}).on('dragend.itemListComposer', function(){
				draggedItems.removeClass(settings.draggedClass);
				itemReceiver.add(itemSource).removeClass(settings.droppableClass);
			}).on('selectstart.itemListComposer', function(){
				//this is for ie9-
				this.dragDrop(); return false;
			});

			// containers behaviour
			itemReceiver.add(itemSource).on('dragleave.itemListComposer', function(e){
				if( !dragEnteredElement || dragEnteredElement === e.target ) {
					$(this).removeClass(settings.droppableClass);
					removeAcceptors($(this));
				}
				dragEnteredElement = null;
			}).on('dragenter.itemListComposer', function(e){
				e.preventDefault();
				dragEnteredElement = e.target;
				var draggedItemsContainer = findContainer(draggedItems.first());
				if( dragEnteredElement === this  && $(this).is(settings.itemReceiver) ) {
					var last = $(this).find(settings.item).last();
					if( !last.hasClass(settings.acceptorClass)
						&& settings.itemReceiverOrderable ) {
						removeAcceptors($(this));
						last.after(newAcceptor());
					}
				}
				if( draggedItemsContainer.is(settings.itemReceiver) || $(this).is(settings.itemReceiver) ) {
					$(this).addClass(settings.droppableClass);
				}
			}).on('dragover.itemListComposer', function(e){
				e.preventDefault();
			}).on('drop.itemListComposer', function(e){
				e.preventDefault();

				//duplicationg for opera not firing dragend when it should
				draggedItems.removeClass(settings.draggedClass);
				itemReceiver.add(itemSource).removeClass(settings.droppableClass);

				if( $(this).is(settings.itemSource) 
					&& findContainer(draggedItems.first()).is(settings.itemSource) ) {
					// removeAcceptors($(this));
					return;
				}

				if( $(this).is(settings.itemReceiver) 
					&& findContainer(draggedItems.first()).is(settings.itemReceiver)
					&& !settings.itemReceiverOrderable ) {
					return;
				}

				var acceptor = $(this).find('.' + settings.acceptorClass);
				moveItems(draggedItems, $(this));
				if( $(this).is(settings.itemReceiver) && settings.itemReceiverOrderable) {
					acceptor.replaceWith(draggedItems);
				}
				else {
					removeAcceptors(itemSource);
				}
			});

			selectItem.on('click.itemListComposer', function(){
				var items = itemSource.find(settings.item + '.' + settings.selectedClass);
				moveItems(items, itemReceiver);
			});

			selectAllItems.on('click.itemListComposer', function(){
				var items = itemSource.find(settings.item);
				moveItems(items, itemReceiver);
			});

			deselectItem.on('click.itemListComposer', function(){
				var items = itemReceiver.find(settings.item + '.' + settings.selectedClass);
				moveItems(items, itemSource);
			});

			deselectAllItems.on('click.itemListComposer', function(){
				var items = itemReceiver.find(settings.item);
				moveItems(items, itemSource);
			});

			if( settings.itemReceiverOrderable ) {
				shiftUpButton.on('click.itemListComposer', function(){
					itemReceiver.find(settings.item + '.' + settings.selectedClass).each(function(){
						shiftUp($(this));
					});
				});

				shiftDownButton.on('click.itemListComposer', function(){
					$(itemReceiver.find(settings.item + '.' + settings.selectedClass).get().reverse()).each(function(){
						shiftDown($(this));
					});
				});
			}



			function moveItems(items, recipient) {
				if( recipient.is(settings.itemSource) ||
					( recipient.is(settings.itemReceiver) && !settings.itemReceiverOrderable ) ) {
					//sorting, if moving to itemsource or if itemreceiver isn't orderable
					var clone = recipient.clone(true);
					clone.append(clone.append(items).find(settings.item).sort(function(a, b) {
						return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
					}));
					recipient.replaceWith(clone);
					setItemsBehaviour(items);
					settings.onDeselect(items);
				}
				else {
					recipient.append(items);
					setItemsBehaviour(items);
					settings.onSelect(items);
				}
				itemSource = $(that).find(settings.itemSource);
				itemReceiver = $(that).find(settings.itemReceiver);
			}

			function shiftUp(item) {
				var prev = $(item).prev();
				if( !prev.hasClass(settings.selectedClass) ) {
					prev.before(item);
				}
			}

			function shiftDown(item) {
				var next = $(item).next();
				if( !next.hasClass(settings.selectedClass) ) {
					next.after(item);
				}
			}

			function removeAcceptors(container) {
				container.find('.'+settings.acceptorClass).remove();
			}

			function newAcceptor() {
				return acceptorTemplate.clone();
			}

			function setItemsBehaviour(items) {
				items.each(function(){
					// assume that items are already in new container and it is itemSource
					var fromBehaviour = receiverItemBehaviour;
					var toBehaviour = sourceItemBehaviour;
					var container = $(this).parents(settings.itemSource);
					if( !container.length ) {
						// container is itemReceiver
						fromBehaviour = sourceItemBehaviour;
						toBehaviour = receiverItemBehaviour;
					}
					for(var e in fromBehaviour) {
						$(this).off(e);
					}
					for(var e in toBehaviour) {
						$(this).on(e+'.itemListComposer', receiverItemBehaviour[e]);
					}
				});
			}

			function findContainer(item) {
				var container = item.parents(settings.itemSource);
				if( !container.length ) {
					container = item.parents(settings.itemReceiver);
				}
				return container;
			}
		});
	};
}( jQuery ));
