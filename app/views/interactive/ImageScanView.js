define(['backbone', 'hbs!app/templates/interactive/image_scanning'],
	function(Backbone, imageScanningTemplate) {

		//'targets' is a dictionary mapping matching images
		var initRecognition = function(item_slug) {

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

							//match if slug is a subset of the moodstocks image id
							var match = result.value.indexOf(item_slug) >= 0;
							//if(item_slug == result.value) {
							if(match) {
								Backbone.history.navigate('#/scanned/' + item_slug);
							}
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
				this.item = params.item;
			},

			serialize: function() {

			},

			afterRender: function() {
				initRecognition(this.item.attributes.slug);
			},

			cleanup: function() {
				if(typeof(MS4Plugin) !== 'undefined')
				{
					MS4Plugin.dismiss();
				}
			}
		});

		return ScanView;

	});