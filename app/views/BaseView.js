define([
	'backbone'
], function (
	Backbone
) {
	
	var BaseView = Backbone.View.extend({
		template: function () {
			return "<div></div>";
		},
		
		beforeRender: function () {
			
		},
		
		afterRender: function () {
			
		},
		
		serialize: function () {
			
		},
		
		doRender: function () {
			this.$el.html(this.template(this.serialize()));
		},
		
		render: function () {
			this.beforeRender();
			this.doRender();
			this.afterRender();
		}
	});
	
	return BaseView;
	
})
