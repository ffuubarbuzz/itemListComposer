(function( $ ) {
	$.fn.itemListComposer = function( options ) {
		var settings = $.extend({
			itemsSource: ".source",
			itemReceivers: ".receiver",
			item: 'li',
			selectitem: '.select',
			selectAllitems: '.select-all',
			deselectitem: '.deselect',
			deselectAllitems: '.deselect-all',
			shiftUpButton: '.order-up',
			shiftDownButton: '.order-down',
			acceptorTemplate: '#acceptor',
			acceptorClass: 'acceptor',
			selectedClass: 'selected'
		}, options );
		
		return this.each(function() {

			//grabbing objects
			var itemsSource = $(this).find(settings.itemsSource);
			var itemReceivers = $(this).find(settings.itemReceivers);
			var selectitem = $(this).find(settings.selectitem);
			var selectAllitems = $(this).find(settings.selectAllitems);
			var deselectitem = $(this).find(settings.deselectitem);
			var deselectAllitems = $(this).find(settings.deselectAllitems);
			var shiftUpButton = $(this).find(settings.shiftUpButton);
			var shiftDownButton = $(this).find(settings.shiftDownButton);
			var acceptorTemplate = $($(this).find(settings.acceptorTemplate).get(0).content);

			var that = this;

			var lastSelected;	//for shift-click range selection

			var enteredItem = false;

			//initializing:
			//sorting itemsSource
			itemsSource.append(itemsSource.find(settings.item).sort(function(a, b) {
				return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
			}));

			// selectinging by click
			itemsSource.add(itemReceivers).find(settings.item).click(function(e){
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
			}).on('dragstart', function(){
				
			}).on('dragend', function(){
				removeAcceptors();
			});

			// TODO: make different behaviour objects for itemSource item and itemReceivers item
			// so we can swap item behavior easily when moved from one container to another

			itemReceivers.on('dragover', function(){
			}).on('dragleave', function(e){
				if(!enteredItem) {
					removeAcceptors();
				}
				enteredItem = false;
			}).on('dragenter', function(e){
				enteredItem = true;
				if(e.target === this) {
					var last = $(this).find(settings.item).last();
					if( !last.hasClass(settings.acceptorClass) ) {
						last.after(newAcceptor());
					}
				}
			});

			itemReceivers.find(settings.item).on('dragover', function(e){
				var mouseY = (event.pageY - $(this).offset().top);
				if (mouseY <= $(this).outerHeight() / 2 && !$(this).prev().hasClass(settings.acceptorClass)) {
					removeAcceptors();
					$(this).before(newAcceptor());
				}
				else if (mouseY > $(this).outerHeight() / 2 && !$(this).next().hasClass(settings.acceptorClass)){
					removeAcceptors();
					$(this).after(newAcceptor());
				}
			});

			selectitem.click(function(){
				var items = itemsSource.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemReceivers)
			});

			selectAllitems.click(function(){
				var items = itemsSource.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemReceivers);
			});

			deselectitem.click(function(){
				var items = itemReceivers.find(settings.item + '.'+settings.selectedClass);
				moveItems(items, itemsSource, true);
			});

			deselectAllitems.click(function(){
				var items = itemReceivers.find(settings.item);
				items.addClass(settings.selectedClass);
				moveItems(items, itemsSource, true);
			});

			shiftUpButton.click(function(){
				itemReceivers.find(settings.item + '.'+settings.selectedClass).each(function(){
					shiftUp($(this));
				});
			});

			shiftDownButton.click(function(){
				$(itemReceivers.find(settings.item + '.'+settings.selectedClass).get().reverse()).each(function(){
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
				itemsSource = $(that).find(settings.itemsSource);
				itemReceivers = $(that).find(settings.itemReceivers);
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
				itemReceivers.find('.'+settings.acceptorClass).remove();
			}

			function newAcceptor() {
				return acceptorTemplate.clone();
			}
		});
};

}( jQuery ));
