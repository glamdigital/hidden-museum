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
			unlockSound: mediaUtil.createAudioObj('audio/ir_unlock.mp3'),

			initialize: function(params) {
				this.item = params.item;
				//set appropriate orientation
				this.orientation = params.orientation;
				this.gallery = params.gallery;
				this.overlayInitialize({ displayOnArrival: true });
				this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
				$("body").addClass("transparent-background");
			},

			serialize: function() {
				data = this.item.toJSON();
				data.gallery = this.gallery;
				return data;
			},

			afterRender: function() {
				if(typeof(MS4Plugin) !== 'undefined') {
					this.initRecognition(this.item.attributes.slug);
				}
				
				var contentHeight = $('.content').height();
				$('.scan-container').height(contentHeight);
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
								this.onFoundItem();
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
			
			goToFoundItem: function () {
				this.unlockSound.play();
				this.onFoundItem();
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
