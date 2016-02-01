define([
	'backbone', 
	'hbs!app/templates/intro_template'
], function(
	Backbone, 
	introTemplate
) {
  var IntroView = Backbone.View.extend({
		template: introTemplate,
  });
  return IntroView;
});
      
