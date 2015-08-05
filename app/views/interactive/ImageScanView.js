define(['backbone', 'hbs!app/templates/interactive/image_scanning'],
	function(Backbone, imageScanningTemplate) {

		var initRecognition = function() {

			//start the MS4Plugin
			MS4Plugin.sync(
					//success
					function() {
						console.log("successfully synced recognition images");
						//open the museum bundle
						MS4Plugin.open(
							//success
							function() {
								console.log("successfully opened bundle");

								var scanOptions = {
									'image': true
								};

								var scanFlags = {
									//useDeviceOrientation: true,
									//noPartialMatching: true,
									//smallTargetSupport: true,
									//returnQueryFrame: true,
								};

								//start scanning
								MS4Plugin.scan(
									//success
									function() {
										console.log("scan successful!");
									},
									//error
									function(err) {
										console.log("error scanning");
										console.log("err");
									},
									scanOptions,
									scanFlags
								);

							},
							//error
							function(err) {
								console.log("error opening bundle");
								console.log(err);
							},
							'museum'
						)
					},
					//error
					function(err) {
						console.log("error syncing recognition images");
						console.log(err);
					}
				);


		};

		var ScanView = Backbone.View.extend({
			template: imageScanningTemplate,

			initialize: function(params) {

			},

			serialize: function() {

			},

			afterRender: function() {
				initRecognition();
			},

			cleanup: function() {

			}
		});

		return ScanView;

	});