define(['backbone', 'hbs!app/templates/interactive/image_scanning'],
	function(Backbone, imageScanningTemplate) {

		var initRecognition = function() {

			var doSync = function(onSuccess) {
				MS4Plugin.sync(onSuccess, function(error) { console.log("error"); });
			};

			var doOpen = function(onSuccess) {
				MS4Plugin.open(onSuccess, function(error) { console.log("error"); }, 'museum');
			};

			//open the museum bundle
			//TODO check whether this needs to be done each time, or just once
			MS4Plugin.open(
				//success
				function() {
					console.log("successfully opened bundle");

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

					//start scanning
					MS4Plugin.scan(
						//success
						function(result) {
							console.log("scan successful! " + result.value);
							console.log(result);
							//alert("Recognised item: " + result.value);
							Backbone.history.navigate('#/item/' + result.value);
							MS4Plugin.dismiss();
						},
						//error
						function(err) {
							console.log("error scanning");
							console.log("err");
						},
						scanOptions,
						scanFlags
					);

					if(!MS4Plugin.hiddenmuseum_synced) {
						//initialise sync after a small delay so that the scanner is fully open
						MS4Plugin.sync(
							//success
							function() {
								console.log("image recognition sync successful.");
								MS4Plugin.hiddenmuseum_synced = true;
							},
							//error
							function(err) {
								console.warn("image recognition sync failed");
								console.log(err);
							}
						)
					}

				},
				//error
				function(err) {
					console.log("error opening bundle");
					console.log(err);
				},
				'museum'
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
				MS4Plugin.dismiss();
			}
		});

		return ScanView;

	});