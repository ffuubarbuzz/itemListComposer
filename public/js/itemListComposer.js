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

			//initializing:
			//sorting itemsSource
			itemsSource.append(itemsSource.find(settings.item).sort(function(a, b) {
				return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
			}));

			// selectinging by click
			//TODO: add ability to select range with SHIFT
			itemsSource.add(itemReceivers).find(settings.item).click(function(e){
				if(e.shiftKey && undefined != lastSelected) {
					var lower = Math.min($(this).index(),lastSelected.index());

					var items = $(this).siblings().slice(lower, Math.max($(this).index(),lastSelected.index()) );
					items.add(this).addClass(settings.selectedClass);
				}
				else {
					$(this).toggleClass(settings.selectedClass);
				}
				lastSelected = $(this);
			}).on('dragstart', function(){
				console.log('drag started');
			}).on('dragend', function(){
				//removeAcceptors();
			});

			itemReceivers.on('dragover', function(){
				$(this).find(settings.item).last().next(newAcceptor());
			}).on('dragleave', function(e){
				if(e.target === this) {
					console.log(e.target)
					removeAcceptors();
				}
			});

			itemReceivers.find(settings.item).on('dragover', function(e){
				var mouseY = (event.pageY - $(this).offset().top);
				if(mouseY <= $(this).outerHeight() / 2 && !$(this).prev().hasClass(settings.acceptorClass)) {
					$(this).siblings('.'+settings.acceptorClass).remove();
					$(this).before(newAcceptor());
				}
				else {
					$(this).siblings('.'+settings.acceptorClass).remove();
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
