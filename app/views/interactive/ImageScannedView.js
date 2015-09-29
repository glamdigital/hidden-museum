/**
 * Created by ahaith on 21/09/15.
 */
define(["backbone", "underscore", "hbs!app/templates/interactive/image_scanned"],
		function(Backbone, _, itemTemplate) {

			App = window.App || {};

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
				},

				events: {
					"click video": "makeFullScreen",
					"play video": "makeFullScreen",
					"click #play-video": "makeFullScreen"
				},

				makeFullScreen: function(ev) {
					$('video').show();
					$('video')[0].webkitEnterFullscreen();
					$('video')[0].play();
					$('.scanned-view').css('background', 'white');
				},

				onVideoEnded: function(ev) {
					$('video')[0].webkitExitFullscreen();
				}
			});

			return ItemScannedView;
		}
);