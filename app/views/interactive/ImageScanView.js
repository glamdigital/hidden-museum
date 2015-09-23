define(['backbone', 'hbs!app/templates/interactive/image_scanning'],
	function(Backbone, imageScanningTemplate) {

		//'targets' is a dictionary mapping matching images
		initRecognition = function(item_slug) {

			var doSync = function(onSuccess) {
				MS4Plugin.sync(onSuccess, function(error) { console.log("error"); });
			};

			var doOpen = function(onSuccess) {
				MS4Plugin.open(onSuccess, function(error) { console.log("error"); }, 'museum');
			};

			var startScan = function() {

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
					function(result) {
						console.log("scan successful! " + result.value);
						console.log(result);

						//match if slug is a subset of the moodstocks image id
						var match = result.value.indexOf(item_slug) >= 0;
						if(match) {
							//vibrate
					        if(navigator.notification) {
					            navigator.notification.vibrate(200);
					        }
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
			};

			//open the museum bundle
			if(!MS4Plugin.hiddenmuseum_opened) {
				//TODO check whether this needs to be done each time, or just once
				MS4Plugin.open(
					//success
					function () {
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
							)
						}

					},
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
					console.log("Cleaning up Scan View.", "Dismissing MS4Plugin");
					MS4Plugin.dismiss();
				}
			}
		});

		return ScanView;

	});