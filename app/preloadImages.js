define([
	'backbone'
], function (
	Backbone
) {
	// var images = {
	// 	"lodestone": "tst.png",
	// },
	
	var preload = function (view) {
		var images = {
			"lodestone": [
					"img/objects/lodestone/BrassPlate.jpg",
					"img/objects/lodestone/lodestone_main.jpg",
					"img/objects/lodestone/weight20.png",
					"img/objects/lodestone/Lodestone_cropped.jpg",
					"img/objects/lodestone/imu-media.jpg",
					"img/objects/lodestone/ratchet-arm.png",
					"img/objects/lodestone/weight40-in-cradle.png",
					"img/objects/lodestone/RatchetHandle.png",
					"img/objects/lodestone/key.png",
					"img/objects/lodestone/ratchet-handle.png",
					"img/objects/lodestone/weight40.png",
					"img/objects/lodestone/lodestone-bg.png",
					"img/objects/lodestone/weight5-in-cradle.png",
					"img/objects/lodestone/crown.png",
					"img/objects/lodestone/weight-cradle.png",
					"img/objects/lodestone/weight5.png",
					"img/objects/lodestone/frame.png",
					"img/objects/lodestone/lodestone.png",
					"img/objects/lodestone/weight20-in-cradle.png",
			], "floo": [
							"img/objects/lodestone/Be.jpg",
			]
		};
		var urls = images[view];
		_.each(urls, function(url) {
			var img = new Image();
			img.src = url;
		});
		return true;
	}
	
	return {
		preload: preload,
	};
})
