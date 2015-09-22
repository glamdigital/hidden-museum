/**
 * Created by ahaith on 21/09/15.
 */
define(["backbone", "underscore", "hbs!app/templates/interactive/image_scanned"],
		function(Backbone, _, itemTemplate) {

			var ItemScannedView = Backbone.View.extend({
				template: itemTemplate,

				serialize: function() {
					var output = this.item.toJSON();

					output.nextURL = this.nextURL;

					return output;
				},

				initialize: function(params) {
					this.item = params.item;
					this.nextURL = params.nextURL;
				},

				afterRender: function() {
					$('video').on('ended', this.onVideoEnded.bind(this));
					this.makeFullScreen();
				},

				events: {
					"click video": "makeFullScreen",
					"play video": "makeFullScreen"
				},

				makeFullScreen: function(ev) {
					$('video')[0].webkitEnterFullscreen();
					$('video')[0].play();
				},

				onVideoEnded: function(ev) {
					$('video')[0].webkitExitFullscreen();
				}
			});

			return ItemScannedView;
		}
);