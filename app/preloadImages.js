define([
	'backbone'
], function (
	Backbone
) {
	
	var preload = function (view) {
		var images = {
			"trails":[
				"img/maps/upper_gallery_floorplan.jpg",
				"img/objects/navigation/Navigation_cropped.jpg",
				"img/objects/globe/All-Souls-Globe_cropped.jpg",
				"img/maps/entrance_floorplan.jpg",
				"img/objects/moon_globe/Selenographia_cropped.jpg",
				"img/objects/armillary/9061-Armillary-sphere_cropped.jpg",
				"img/maps/basement_floorplan.jpg",
				"img/objects/blackboard/Einstein_cropped.jpg",
				"img/objects/marconi/Marconi_cropped.jpg",
				"img/objects/lodestone/Lodestone_cropped.jpg",
			],

			"trail":[
				"img/find-on-flooplan-button.jpg",
				"img/objects/navigation/navigation-display-main.jpg",
				"img/objects/globe/all-souls-globe-main.jpg",
				"img/objects/moon_globe/selenographia-main.jpg",
				"img/objects/armillary/9061-Armillary-sphere.jpg",
				"img/objects/blackboard/einsteins-blackboard-main.jpg",
				"img/objects/marconi/marconi-main.jpg",
				"img/objects/lodestone/lodestone_main.jpg",
			],

			"navigation":[
				"img/objects/sextant/circle_mask.png",
				"img/objects/sextant/parchment-tan-dark.jpg",
				"img/objects/sextant/sextant_eye_piece.png",
				"img/objects/sextant/latitude.jpg",
				"img/objects/sextant/parchment-tan.jpg",
				"img/objects/sextant/navigation-map.jpg",
				"img/objects/sextant/sextant_angle_reader.png",
				"img/objects/navigation/sextant_arm.png",
				"img/objects/navigation/sextant_frame.png",
				"img/objects/navigation/sextant_ray.png",
				"img/objects/navigation/sextant.png",
				"img/objects/navigation/sky.png",
				"img/objects/navigation/sun.png",
			],
			"globe": [
				"img/objects/globe/earthbump1k.jpg",
				"img/objects/globe/earthmap1k.jpg",
				"img/objects/globe/earthspec1k.jpg",
			],
			"moon_globe": [
			],
			"armillary": [
				"img/objects/lodestone/lodestone-bg.jpg",
				"img/objects/armillary/decimal-clock.png",
				"img/objects/armillary/digital-face.png",
				"img/objects/armillary/stars.png",
				"img/objects/armillary/ten-hr-face-centre.png",
				"img/objects/armillary/ten-hr-face-hand.png",
				"img/objects/armillary/ten-hr-face.png",
				"img/objects/armillary/twelve-hr-centre.png",
				"img/objects/armillary/twelve-hr-face.png",
				"img/objects/armillary/twelve-hr-hour-hand.png",
				"img/objects/armillary/twelve-hr-minute-hand.png",
				"img/objects/globe/earthbump1k.jpg",
				"img/objects/globe/earthmap1k.jpg",
				"img/objects/globe/earthspec1k.jpg",
				
			],
			"blackboard": [
				"img/objects/blackboard/gallery/benn_zoomed.jpg",
				"img/objects/blackboard/gallery/benn.jpg",
				"img/objects/blackboard/gallery/blanc_zoomed.jpg",
				"img/objects/blackboard/gallery/blanc.jpg",
				"img/objects/blackboard/gallery/botton_zoomed.jpg",
				"img/objects/blackboard/gallery/botton.jpg",
				"img/objects/blackboard/gallery/einstein_zoomed.jpg",
				"img/objects/blackboard/gallery/einstein.jpg",
				"img/objects/blackboard/gallery/eno_zoomed.jpg",
				"img/objects/blackboard/gallery/eno.jpg",
				"img/objects/blackboard/gallery/grimshaw_zoomed.jpg",
				"img/objects/blackboard/gallery/grimshaw.jpg",
				"img/objects/blackboard/gallery/harries_zoomed.jpg",
				"img/objects/blackboard/gallery/harries.jpg",
				"img/objects/blackboard/gallery/heath_zoomed.jpg",
				"img/objects/blackboard/gallery/heath.jpg",
				"img/objects/blackboard/gallery/jackson_zoomed.jpg",
				"img/objects/blackboard/gallery/jackson.jpg",
				"img/objects/blackboard/gallery/jardine_zoomed.jpg",
				"img/objects/blackboard/gallery/jardine.jpg",
				"img/objects/blackboard/gallery/macgregor_zoomed.jpg",
				"img/objects/blackboard/gallery/macgregor.jpg",
				"img/objects/blackboard/gallery/may_zoomed.jpg",
				"img/objects/blackboard/gallery/may.jpg",
				"img/objects/blackboard/gallery/parker_zoomed.jpg",
				"img/objects/blackboard/gallery/parker.jpg",
				"img/objects/blackboard/gallery/patten_zoomed.jpg",
				"img/objects/blackboard/gallery/patten.jpg",
				"img/objects/blackboard/gallery/rees_zoomed.jpg",
				"img/objects/blackboard/gallery/rees.jpg",
				"img/objects/blackboard/gallery/robson_zoomed.jpg",
				"img/objects/blackboard/gallery/robson.jpg",
				"img/objects/blackboard/gallery/snow_zoomed.jpg",
				"img/objects/blackboard/gallery/snow.jpg",
				"img/objects/blackboard/gallery/wentworth_zoomed.jpg",
				"img/objects/blackboard/gallery/wentworth.jpg",
			],
			"marconi": [
			],
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
					"img/objects/lodestone/lodestone-bg.jpg",
					"img/objects/lodestone/weight5-in-cradle.png",
					"img/objects/lodestone/crown.png",
					"img/objects/lodestone/weight-cradle.png",
					"img/objects/lodestone/weight5.png",
					"img/objects/lodestone/frame.png",
					"img/objects/lodestone/lodestone.png",
					"img/objects/lodestone/weight20-in-cradle.png",
			],
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
