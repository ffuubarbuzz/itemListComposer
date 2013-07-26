(function( $ ) {
	$.fn.itemListComposer = function( options ) {
		var settings = $.extend({
			itemSource: ".source",
			itemReceiver: ".receiver",
			item: 'li',
			selectItem: '.select',
			selectAllitems: '.select-all',
			deselectItem: '.deselect',
			deselectAllitems: '.deselect-all',
			shiftUpButton: '.order-up',
			shiftDownButton: '.order-down',
			acceptorTemplate: '#acceptor',
			acceptorClass: 'acceptor',
			selectedClass: 'selected',
			draggedClass: 'dragged'
		}, options );
		
		return this.each(function() {

			//grabbing objects
			var itemSource = $(this).find(settings.itemSource);
			var itemReceiver = $(this).find(settings.itemReceiver);
			var selectItem = $(this).find(settings.selectItem);
			var selectAllitems = $(this).find(settings.selectAllitems);
			var deselectItem = $(this).find(settings.deselectItem);
			var deselectAllitems = $(this).find(settings.deselectAllitems);
			var shiftUpButton = $(this).find(settings.shiftUpButton);
			var shiftDownButton = $(this).find(settings.shiftDownButton);
			var acceptorTemplate = $($(this).find(settings.acceptorTemplate).get(0).content);

			var that = this;

			var lastSelected;	//for shift-click range selection

			var dragEnteredItem = null;	//fix for handling itemReceiver dragleave event

			var draggedItems = $([]);

			// behaviour objects for itemSource item and itemReceiver item
			// so we can swap item behavior easily when moved from one container to another
			var sourceItemBehavior = {

			}

			var receiverItemBehavior = {
				'dragover' : function(e) {
					e.preventDefault();
					// console.log(e.dataTransfer);//.dropEffect = 'move';
					// var mouseY = (event.pageY - $(this).offset().top);
					var mouseY = e.originalEvent.offsetY;
					if (mouseY <= $(this).outerHeight() / 2 && !$(this).prev().hasClass(settings.acceptorClass)) {
						removeAcceptors(itemReceiver);
						$(this).before(newAcceptor());
					}
					else if (mouseY > $(this).outerHeight() / 2 && !$(this).next().hasClass(settings.acceptorClass)){
						removeAcceptors(itemReceiver);
						$(this).after(newAcceptor());
					}
				}
			}

			//
			//	INITIALIZING:
			// 

			// sorting itemSource
			itemSource.append(itemSource.find(settings.item).sort(function(a, b) {
				return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
			}));
			
			// initial behavior for items
			itemReceiver.find(settings.item).each(function(){
				for(var e in receiverItemBehavior) {
					if(receiverItemBehavior.hasOwnProperty(e)) {
						$(this).on(e, receiverItemBehavior[e]);
					}
				}
			});

			var node = itemReceiver[0];
			['dragstart', 'drag', 'dragenter', 'dragleave', 'dragover', 'drop', 'dragend'].forEach(function(name){
				node.addEventListener(name, function(e){
					// console.log(name, e.target);
					// console.log(dragEnteredItem)
				});
			});

			// selectinging by click
			itemSource.add(itemReceiver).find(settings.item).click(function(e){
				if(e.shiftKey && undefined != lastSelected) {
					var lower = Math.min($(this).index(),lastSelected.index());
					var upper = Math.max($(this).index(),lastSelected.index());
					var items = $(this).siblings().slice(lower, upper);
					items.add(this).addClass(settings.selectedClass);
				}
				else {
					$(this).toggleClass(settings.selectedClass);
				}
				lastSelected = $(this);
			}).on('dragstart', function(e){
				var container = $(this).parents(settings.itemSource);
				if( !container.length ) {
					container = $(this).parents(settings.itemReceiver)
				}
				draggedItems = container.find('.'+settings.selectedClass);
				draggedItems.addClass(settings.draggedClass);
				e.originalEvent.dataTransfer.setData('text/plain', 'Dragndrop now works in stinky bastard FF')
			}).on('dragend', function(){
				draggedItems.removeClass(settings.draggedClass);
			});

			// containers behavior
			// itemSource.on('dragover', function(e){
			// 	e.preventDefault();
			// }).on('dragenter', function(e){
			// 	e.preventDefault();
			// 	dragEnteredItem = e.target;
			// 	if(e.target === this && !$(this).find(settings.acceptorClass).length) {
			// 		$(this).append(newAcceptor());
			// 	}
			// }).on('dragleave', function(e){
			// 	if( !dragEnteredItem || (e.target === this && !$(dragEnteredItem).hasClass(settings.acceptorClass)) ) {
			// 		removeAcceptors(itemReceiver);
			// 	}
			// 	dragEnteredItem = null;
			// }).on('drop', function(){
			// 	removeAcceptors($(this));
			// 	moveItems(draggedItems, itemSource);
			// });

			itemReceiver.add(itemSource).on('dragleave', function(e){
				if( !dragEnteredItem ) {
					// console.log('dragenterdItem')
					removeAcceptors($(this));
				}
				if ((e.target === this && !$(dragEnteredItem).hasClass(settings.acceptorClass))) {
					// console.log('second condition')
					removeAcceptors($(this));
				}
				dragEnteredItem = null;
			}).on('dragenter', function(e){
				dragEnteredItem = e.target;
				if( e.target === this ) {
					var last = $(this).find(settings.item).last();
					if( !last.hasClass(settings.acceptorClass) ) {
						last.after(newAcceptor());
					}
				}
			}).on('dragover', function(e){
				e.preventDefault();
			}).on('drop', function(e){
				e.preventDefault();
				var acceptor = $(this).find('.'+settings.acceptorClass);
				moveItems(draggedItems, $(this));
				if($(this).is(settings.itemReceiver)) {
					acceptor.replaceWith(draggedItems);
				}
				else {
					removeAcceptors($(this));
				}
			});

			selectItem.click(function(){
				var items = itemSource.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemReceiver)
			});

			selectAllitems.click(function(){
				var items = itemSource.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemReceiver);
			});

			deselectItem.click(function(){
				var items = itemReceiver.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemSource);
			});

			deselectAllitems.click(function(){
				var items = itemReceiver.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemSource);
			});

			shiftUpButton.click(function(){
				itemReceiver.find(settings.item + '.'+settings.selectedClass).each(function(){
					shiftUp($(this));
				});
			});

			shiftDownButton.click(function(){
				$(itemReceiver.find(settings.item + '.'+settings.selectedClass).get().reverse()).each(function(){
					shiftDown($(this));
				});
			});


			function moveItems(items, recipient) {
				if( recipient.is(settings.itemSource) ) {
					//sorting, if moving to itemsource
					var clone = recipient.clone(true);
					clone.append(clone.append(items).find(settings.item).sort(function(a, b) {
						return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
					}));
					//swapping item behaviour
					items.each(function(){
						for(var e in receiverItemBehavior) {
							$(this).off(e);
						}
						for(var e in sourceItemBehavior) {
							$(this).on(e, sourceItemBehavior[e]);
						}
					});

					recipient.replaceWith(clone);
				}
				else {
					//swapping item behaviour
					items.each(function(){
						console.log(sourceItemBehavior)
						for(var e in sourceItemBehavior) {
							console.log(e);
							$(this).off(e);
						}
						for(var e in receiverItemBehavior) {
							$(this).on(e, receiverItemBehavior[e]);
						}
					});

					recipient.append(items);
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
				console.log(container.find('.'+settings.acceptorClass));
			}

			function newAcceptor() {
				return acceptorTemplate.clone();
			}
		});
};

}( jQuery ));
