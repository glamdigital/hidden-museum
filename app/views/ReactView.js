define([
	'backbone',
	'react',
	'react-dom'
], function (
	Backbone,
	React,
	ReactDOM
) {
	
	//Base React-based view, with an interface similar to Layout Manager
	
	var ReactView = Backbone.View.extend({
		
		component: React.createClass({
			render: function () {
				return null;
			}
		}),
		
		serialize: function () {
			//stub function
			return {};
		},
		
		beforeRender: function () {
			// stub function
		},
		
		afterRender: function () {
			//stub function
		},
		
		render: function () {
			this.beforeRender();
			
			ReactDOM.render(React.createElement(this.component, this.serialize()), this.el);
			
			this.afterRender();
		},
		
		cleanup: function () {
			//stub function
			console.log('cleanup react view');
			
			//TODO unmount the component
		}
		
	});
	
	return ReactView;
	
})
