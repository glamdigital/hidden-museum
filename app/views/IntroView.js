define([
	'backbone', 
	'hbs!app/templates/intro_template'
], function(
	Backbone, 
	introTemplate
) {
  var IntroView = Backbone.View.extend({
		template: introTemplate,

		afterRender: function (params) {
			setTimeout(function(){
				console.log("timeout");
				this.hideIntro();
	    }.bind(this), 3000)
		},

		hideIntro: function (event) {
			console.log("go to trails");
			Backbone.history.navigate('#/trails');
		},
		
		events: {
				'click #intro-image': 'hideIntro'
		},
  });
  return IntroView;
});
      
