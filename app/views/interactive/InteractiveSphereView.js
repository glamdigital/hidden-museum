define([
        'backbone',
        'three',
        'hbs!app/templates/interactive/sphere'
    ], function(
        Backbone,
        three,
        sphereTemplate
    )
{
    ROTATE_PAN_RATIO = 0.3;     //points of drag to degrees of rotation

    var InteractiveSphereView = Backbone.View.extend({
        template: sphereTemplate,

        initialize: function(params) {
            this.texture = params.texture;
        },

        afterRender: function () {
            var $container = $('.sphere-container', this.$el);
            this.camera = new three.PerspectiveCamera(35, $container.width()/$container.height(), 0.1, 150);
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
            renderer.setSize($container.width(), $container.height());
            $container.append(renderer.domElement);

            //window.addEventListener( 'resize', _.bind(this.onWindowResize, this), false );

            this.animate();

        },

        events: {
            //"click .sphere-container": "foo",
            "touchstart .sphere-container" : "onTouchStart",
            "touchmove .sphere-container" : "onTouchMove"
        },

        //foo: function(ev) {
        //    console.log("clicked on the canvas");
        //},

        onTouchStart: function(ev) {
            this.touchPrevX = ev.originalEvent.touches[0].clientX;
        },

        onTouchMove: function(ev) {
            var xPos = ev.originalEvent.touches[0].clientX;
            var deltaX = xPos - this.touchPrevX;
            console.log('new pos:', xPos, ". delta:", deltaX);
            this.mesh.rotation.y += deltaX * ROTATE_PAN_RATIO * Math.PI/180;

            this.touchPrevX = xPos;
        },

        animate: function() {
            requestAnimationFrame(_.bind(this.animate, this) );

            //this.mesh.rotation.x += 0.005;
            //this.mesh.rotation.y += 0.01;

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