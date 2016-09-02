define([
	'react'
], function (
	React
) {
	
	var TrailsComponent = React.createClass({
		render: function () {
			var trails = this.props.trails;
			return(
				<div className="trails-list-container">
					{this.props.trails.map(function (trail, i) {
						return (
						<a key={trail.slug} href={'#trail/' + trail.slug}>
							<img src={"img/" + trail.photograph}/>
							<div className="label">
								<div className="background" id={trail.slug + "-background"}></div>
								<span>{trail.title} <i className="fa fa-chevron-right"></i></span>
							</div>
						</a>)
					})}
				</div>
			)
		}
	});
	
	return TrailsComponent;
	
});
