define([
	'react'
], function (
	React
) {
	
	var TrailComponent = React.createClass({
		render: function () {
			var contentHeight = $('.content').height();
			var mapWidth = $('.content').width();
			var mapHeight = 360/750 * (mapWidth + 4);
			
			
			var trailTitleHeight = 45;
			var trailTitlePadding = 10;
			
			var itemHeight = contentHeight - mapHeight - 3*(trailTitleHeight);
			//set height params for each item
			_.each(this.props.trails, function (trail) {
				var topicHeight = itemHeight/trail.topics.length;
				_.each(trail.topics, function (topic) {
					topic.height = topicHeight;
				})
			});
			
			return(
				<div className="trails-container">
					{this.props.trails.map(function (trail, i) {
						return <div key={trail.slug} id={trail.slug} className="trail-container">
							<h2 id={"trail-title-" + trail.slug} className="trail-title" style={{height:trailTitleHeight, padding:trailTitlePadding}}>{trail.title} 
							<span className="active-fa">{trail.current ? <i className="fa fa-chevron-down"></i> : <i className="fa fa-chevron-right"></i>}</span></h2>
							<div className="trail-content" style={{display: trail.current ? 'block':'none'}}>
								<div className="trail-floorplan" id={"floorplan-" + trail.slug} style={{height: mapHeight}}>
									<img className="floorpan" src={"img/" + trail.map} />
									{	trail.topics.map(function (topic, i) {
											return (<a key={topic.slug} href={"#topic/" + topic.slug}>
														<div id={"map-marker-" + topic.slug} className="map-icon on-map" style={{top: (mapHeight * topic.mapY) + 'px', left: (mapWidth * topic.mapX) + 'px'}}>
															{topic.galleryIndex}
														</div>
													</a>)
										})
									}
								</div>
								<ul className="objects-list">
									{
										trail.topics.map(function (topic, i) {
											return (
											<a key={"obj-" + topic.slug} href={"#topic/" + topic.slug}>
												<li id={topic.slug} className="topic-list-item" 
													style={{
														"backgroundImage": "url(img/" + topic.sketch + ")",
														height: topic.height
													}}
													>
													<div className="title">
														{topic.action_title}
													</div>
													<div id={"index-marker-" + topic.slug} className="map-icon">
														{topic.galleryIndex}
													</div>
													<div className="title-chevron">
														<i className="fa fa-chevron-right"></i>
													</div>
												</li>
											</a> )
										})
									}
								</ul>
							</div>
						</div>
					})}
				</div>
			)
		}
	});
	
	return TrailComponent;
	
});
