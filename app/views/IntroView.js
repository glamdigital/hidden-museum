define([
	'backbone', 
	'hbs!app/templates/intro_template'
], function(
	Backbone, 
	introTemplate
) {
  var IntroView = Backbone.View.extend({
		template: introTemplate,
		
		hideIntro: function (event) {
			event.preventDefault();
			
		},

		
		
		events: {
				'click #intro-image': 'hideIntro'
		},
  });
  return IntroView;
});
      
