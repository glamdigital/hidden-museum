define(['backbone',
		'hbs!app/templates/interactive/image_scanning',
		'app/mixins/overlay',
		'app/media',
		'hbs!app/templates/overlay_interactive_inner'
	],
	function(
		Backbone,
		imageScanningTemplate,
		overlayMixin,
		mediaUtil,
		interactiveInnerTemplate
	) {

		App = window.App || {};

		var ScanView = Backbone.View.extend({
			template: imageScanningTemplate,

			initialize: function(params) {
				this.item = params.item;
				//set appropriate orientation
				this.orientation = params.orientation;
				this.gallery = params.gallery;
				this.overlayInitialize({ displayOnArrival: true });
				this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
				
				$("body").addClass("transparent-background");
				
				//sounds
				this.unlockSound = mediaUtil.createAudioObj('audio/ir_unlock.mp3');
				
				this.listenTo(this.overlayView, 'overlayDismissed', this.onOverlayDismissed)
			},

			serialize: function() {
				data = this.item.toJSON();
				data.gallery = this.gallery;
				if (this.useLandscapeImage) {
					// inject "_landscape" in image name
					var imgName = data.IRTargetImage;
					var pos = imgName.lastIndexOf(".")
					data.IRTargetImage = [imgName.slice(0, pos), "_landscape", imgName.slice(pos)].join('');
				}
				return data;
			},

			afterRender: function() {
				var contentHeight = $('.content').height();
				$('.scan-container').height(contentHeight);
			},
			
			onOverlayDismissed: function () {
				if(typeof(navigator.VuforiaPlugin) !== 'undefined') {
					this.initRecognition_vuforia(this.item.attributes.slug);
				}
			},

			//'targets' is a dictionary mapping matching images
			initRecognition: function(item_slug) {

				var doSync = function(onSuccess) {
					MS4Plugin.sync(onSuccess, function(error) { console.log("error"); });
				};

				var doOpen = function(onSuccess) {
					MS4Plugin.open(onSuccess, function(error) { console.log("error"); }, 'museum');
				};

				var startScan = _.bind(function() {

					var scanOptions = {
						'scanType': 'auto',
						'image': true
					};

					var scanFlags = {
						//possible options listed below taken from plugin source code

						//useDeviceOrientation: true,
						//noPartialMatching: true,
						//smallTargetSupport: true,
						//returnQueryFrame: true,
					};

					MS4Plugin.scan(
						//success
						_.bind(function(result) {
							console.log("scan successful! " + result.value);
							console.log(result);

							//match if slug is a subset of the moodstocks image id
							var match = result.value.indexOf(this.target) >= 0;
							if(match) {
								//vibrate
								if(navigator.notification) {
									navigator.notification.vibrate(200);
								}
								console.log("found our target");
								this.unlockSound.play();
								setTimeout(function () {
									this.onFoundItem();
								}.bind(this), 210);
							}
						}, this),
						//error
						function(err) {
							console.log("error scanning");
							console.log(err);
						},
						scanOptions,
						scanFlags
					);
				},this);

				//open the museum bundle
				if(!MS4Plugin.hiddenmuseum_opened) {
					//TODO check whether this needs to be done each time, or just once
					MS4Plugin.open(
						//success
						_.bind(function () {
							MS4Plugin.hiddenmuseum_opened = true;
							console.log("successfully opened bundle");

							//start scanning
							startScan();

							if (!MS4Plugin.hiddenmuseum_synced) {
								//initialise sync after a small delay so that the scanner is fully open
								MS4Plugin.sync(
									//success
									function () {
										console.log("image recognition sync successful.");
										MS4Plugin.hiddenmuseum_synced = true;
									},
									//error
									function (err) {
										console.warn("image recognition sync failed");
										console.log(err);
									}
								);
							}

						},this),
						//error
						function (err) {
							console.log("error opening bundle");
							console.log(err);
						},
						'museum'
					);
				}
				else {
					//already opened, just start scan
					startScan();
				}

			},
			
			initRecognition_vuforia: function (item_slug) {
				navigator.VuforiaPlugin.startVuforia(
				  'www/targets/PocketCurator.xml',
				  ['globe_interact'],
				  this.item.attributes.title,
				  'AfOrSYL/////AAAAAXGVS+ob7UQ6gKHlPNX5+C9b6gQCj7opl93dY/TdsQiIGScyH24PHQrvYADcmydL9mXuDebbJ3bXWMzW+f3NgA/zeIXx4LpxoRIGp7YWDqREULzbnavwwX9iV2tcaP3eCYXGaLChIZhlwRMqm2pTpNWh1eY1MGdTWCgIA0X+IljNhju2/1v6gHDQ3Zu43cmCG5N+4tej2dJhAiUTeL2fF5lIM765MGF7TPSwzFuDQxElyUwpO9Xkjg4j0TBvngzYPXeHEpus6pqEdlZUZyyoTCWYmcGzU2JdFvW9GCD8OXOEAdhCPZEJKtrU3V8G5tkN6Eb7srID2Y/oTHTrlNtCJW9ocF7Ic82OL8dhJw8otsMH',
				  this.item.attributes.IRTargetImage,
				  {R:113, G:180, B:178},
				  function(data){
				    console.log(data);
				    alert("Image found: "+data.imageName);
				  },
				  function(data) {
				    alert("Error: " + data);
				  }
				);
			},
			
			goToFoundItem: function () {
				this.unlockSound.play();
				setTimeout(function () {
					this.onFoundItem();
				}.bind(this), 210);
			},
			
			events: {
					"click .skip-image-recognition": "goToFoundItem"
			},
			
			cleanup: function() {
				this.unlockSound.cleanup();
				this.overlayCleanup();
				$("body").removeClass("transparent-background");
				if(typeof(MS4Plugin) !== 'undefined')
				{
					console.log("Cleaning up Scan View.", "Dismissing MS4Plugin");
					MS4Plugin.dismiss();
				}
			}
		});

		_.extend(ScanView.prototype, overlayMixin);


		return ScanView;

	});
