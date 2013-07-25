(function( $ ) {
	$.fn.itemListComposer = function( options ) {
		var settings = $.extend({
			itemSource: ".source",
			itemReceiver: ".receiver",
			item: 'li',
			selectitem: '.select',
			selectAllitems: '.select-all',
			deselectitem: '.deselect',
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
			var selectitem = $(this).find(settings.selectitem);
			var selectAllitems = $(this).find(settings.selectAllitems);
			var deselectitem = $(this).find(settings.deselectitem);
			var deselectAllitems = $(this).find(settings.deselectAllitems);
			var shiftUpButton = $(this).find(settings.shiftUpButton);
			var shiftDownButton = $(this).find(settings.shiftDownButton);
			var acceptorTemplate = $($(this).find(settings.acceptorTemplate).get(0).content);

			var that = this;

			var lastSelected;	//for shift-click range selection

			var dragEntered = false;	//fix for handling itemReceiver dragleave event

			var draggedItems = $([]);

			// behaviour objects for itemSource item and itemReceiver item
			// so we can swap item behavior easily when moved from one container to another
			sourceItemBehavior = {

			}

			var receiverItemBehavior = {
				'dragover' : function(e) {
					e.preventDefault();
					// console.log(e.dataTransfer);//.dropEffect = 'move';
					// var mouseY = (event.pageY - $(this).offset().top);
					var mouseY = e.originalEvent.layerY;
					console.log(e.originalEvent.pageX);
					if (mouseY <= $(this).outerHeight() / 2 && !$(this).prev().hasClass(settings.acceptorClass)) {
						removeAcceptors();
						$(this).before(newAcceptor());
					}
					else if (mouseY > $(this).outerHeight() / 2 && !$(this).next().hasClass(settings.acceptorClass)){
						removeAcceptors();
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
				// removeAcceptors();
				draggedItems.removeClass(settings.draggedClass);
			});

			itemReceiver.on('dragleave', function(e){
				if( !dragEntered || e.target === this ) {
					removeAcceptors();
				}
				dragEntered = false;
			}).on('dragenter', function(e){
				dragEntered = true;
				if( e.target === this ) {
					var last = $(this).find(settings.item).last();
					if( !last.hasClass(settings.acceptorClass) ) {
						last.after(newAcceptor());
					}
				}
			}).on('drop', function(e){
				e.preventDefault();
				var acceptor = $(this).find('.'+settings.acceptorClass);
				console.log(acceptor)
				//removeAcceptors();
				acceptor.replaceWith(draggedItems);
			});

			selectitem.click(function(){
				var items = itemSource.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemReceiver)
			});

			selectAllitems.click(function(){
				var items = itemSource.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemReceiver);
			});

			deselectitem.click(function(){
				var items = itemReceiver.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemSource, true);
			});

			deselectAllitems.click(function(){
				var items = itemReceiver.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemSource, true);
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


			function moveItems(items, recepient, sort) {
				if( ("boolean" === typeof sort)  && sort) {
					var clone = recepient.clone(true);
					clone.append(clone.append(items).find(settings.item).sort(function(a, b) {
						return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
					}));
					recepient.replaceWith(clone)
				}
				else {
					recepient.append(items);
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

			function removeAcceptors() {
				itemReceiver.find('.'+settings.acceptorClass).remove();
			}

			function newAcceptor() {
				return acceptorTemplate.clone();
			}
		});
};

}( jQuery ));
