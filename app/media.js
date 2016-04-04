define([
	'backbone'
], function (
	Backbone
) {
	
	var createAudioObj = function (options) {
		var sound = null;
		if(typeof(device) !== 'undefined' && device.platform.toLowerCase() === "android") {
			//use media plugin
			pathPrefix = "/android_asset/www/";
			sound = new Media(pathPrefix + options,
				//function() { console.log("Created media object"); },
				null,
				function(error) { console.log("error creating media object"); console.log(error); });
				
			sound.cleanup = function () {
				sound.stop();
				sound.release();
			};
		
			sound.getProgress = sound.getCurrentPosition;
			sound.setTime = sound.seekTo;
				
		} else {
			//use html5 audio object
            sound = new Audio(options);
			sound.cleanup = function () {
				sound.stop();
			}
			
			sound.getProgress = function () {
				return sound.currentTime;
			}
			sound.setTime = function (time) {
				sound.currentTime = time;
			}
		}
		
		
		
		return sound;
	}
	
	return {
		createAudioObj: createAudioObj,
	};
	
})
