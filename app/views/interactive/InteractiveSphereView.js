define([
        'backbone',
        'three',
    ], function(
        Backbone,
        three
    )
{
    var InteractiveSphereView = Backbone.View.extend({
        initialize: function(params) {
            this.texture = params.texture;
        },
        afterRender: function () {
            this.camera = new three.PerspectiveCamera(35, this.$el.width()/this.$el.height(), 0.1, 150);
            this.camera.position.z = 80;
            thecamera = this.camera;
            this.scene = new three.Scene();

            var texture = three.ImageUtils.loadTexture(this.texture);

            var geometry = new three.SphereGeometry(15, 50, 50);
            var material = new three.MeshBasicMaterial( {
                map: texture,
                //color: 0xfff00,
            });

            this.mesh = new three.Mesh( geometry, material);
            //tilt on axis, then spin
            this.mesh.rotation.z = 23.5 * Math.PI/180;  //the earth's tilt
            this.mesh.rotation.x = 17 * Math.PI/180;     // a little inclination towards the camera, for aesthetics
            this.mesh.rotation.order = "ZXY";


            this.scene.add( this.mesh );

            renderer = new three.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize(this.$el.width(), this.$el.height());
            this.$el.append(renderer.domElement);

            //window.addEventListener( 'resize', _.bind(this.onWindowResize, this), false );

            this.animate();
        },

        animate: function() {
            requestAnimationFrame(_.bind(this.animate, this) );

            //this.mesh.rotation.x += 0.005;
            this.mesh.rotation.y += 0.01;

            renderer.render(this.scene, this.camera);
        },

        onWindowResize: function(ev) {

            renderer.setSize( window.innerWidth, window.innerHeight );
        },

        cleanup: function() {

        },

    });

    return InteractiveSphereView;
});