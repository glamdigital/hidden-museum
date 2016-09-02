define([
	'react'
], function (
	React
) {
	
	var TrailComponent = React.createClass({
		render: function () {
			return(
				<div className="trails-container">
					{this.props.trails.map(function (trail, i) {
						return <div key={trail.slug} id={trail.slug} className="trail-container">
							<h2 id={"trail-title-" + trail.slug} className="trail-title">{trail.title} 
							<span className="active-fa">{trail.current ? <i className="fa fa-chevron-down"></i> : <i className="fa fa-chevron-right"></i>}</span></h2>
							<div className="trail-content">
								<div className="trail-floorplan" id={"floorplan-" + trail.slug}>
									<img className="floorpan" src={"img/" + trail.map} />
									{	trail.topics.map(function (topic, i) {
											return (<a key={topic.slug} href={"#topic/" + topic.slug}><div id={"map-marker-" + topic.slug} className="map-icon on-map">{topic.galleryIndex}</div></a>)
										})
									}
								</div>
								<ul className="objects-list">
									{
										trail.topics.map(function (topic, i) {
											return (
											<a key={"obj-" + topic.slug} href={"#topic/" + topic.slug}>
												<li id={topic.slug} className="topic-list-item" style={{"backgroundImage": "url(img/" + topic.sketch + ")"}}>
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
