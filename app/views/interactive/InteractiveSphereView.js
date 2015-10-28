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
    MIN_DELTA_Y = 30;       //minimum y-distance for touch to move before tilting the globe

    var InteractiveSphereView = Backbone.View.extend({
        template: sphereTemplate,

        initialize: function(params) {
            this.texture = params.texture;
            this.numTouches = 0;
            //this.defaultRotX = 17 * Math.PI/180;
            this.extraRotX = 0;
            this.canRotateUpDown = params.canRotateUpDown | true;
            //this.defaultRotX = params.tiltTowardCam * Math.PI/180 | 0.1;
            this.defaultRotX = params.tiltTowardCam ? (params.tiltTowardCam * Math.PI/180) : 0.1;
            this.lightFromSun = params.lightFromSun | false;
        },

        afterRender: function () {
            var $container = $('.sphere-container', this.$el);
            this.camera = new three.PerspectiveCamera(35, $container.width()/$container.height(), 0.1, 150);
            this.camera.position.z = 80;
            this.scene = new three.Scene();

            var texture = three.ImageUtils.loadTexture(this.texture);

            var geometry = new three.SphereGeometry(15, 50, 50);
            var material;
            if(this.lightFromSun) {
                material = new three.MeshPhongMaterial({
                    map: texture,
                });
                var sun = new three.DirectionalLight(0xfffffff, 2);
                sun.position.set(50, 0, 0);
                sun.target.lookAt(0,0,0);
                this.scene.add(sun);

                var ambientLight = new three.AmbientLight(0xff040439);
                this.scene.add(ambientLight);
            } else {
                //just use a basic material;
                material = new three.MeshBasicMaterial({
                    map: texture,
                });
            }

            this.mesh = new three.Mesh( geometry, material);

            //tilt on axis, then spin
            this.mesh.rotation.z = 10.5 * Math.PI/180;  //the earth's tilt
            this.mesh.rotation.x = this.defaultRotX;     // a little inclination towards the camera, for aesthetics
            this.mesh.rotation.order = "XZY";

            this.scene.add( this.mesh );

            renderer = new three.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize($container.width(), $container.height());
            $container.append(renderer.domElement);

            this.animate();
        },

        events: {
            "touchstart .sphere-container" : "onTouchStart",
            "touchmove .sphere-container" : "onTouchMove",
            "touchend .sphere-container" : "onTouchEnd"
        },

        onTouchStart: function(ev) {
            this.touchPrevX = ev.originalEvent.touches[0].clientX;
            this.touchStartY = ev.originalEvent.touches[0].clientY;

            this.numTouches++;
        },

        onTouchMove: function(ev) {
            var xPos = ev.originalEvent.touches[0].clientX;
            var deltaX = xPos - this.touchPrevX;
            this.mesh.rotation.y += deltaX * ROTATE_PAN_RATIO * Math.PI/180;
            this.touchPrevX = xPos;

            if(this.canRotateUpDown) {
                var yPos = ev.originalEvent.touches[0].clientY;
                var deltaY = yPos - this.touchStartY;
                if (Math.abs(deltaY) > MIN_DELTA_Y) {
                    var extraDist = deltaY - Math.sign(deltaY) * MIN_DELTA_Y;
                    this.extraRotX = extraDist * ROTATE_PAN_RATIO * Math.PI / 180;
                }
            }
        },

        onTouchEnd: function(ev) {
            this.numTouches--;
        },

        animate: function() {
            requestAnimationFrame(_.bind(this.animate, this) );

            this.mesh.rotation.x = this.defaultRotX + this.extraRotX;

            renderer.render(this.scene, this.camera);

            if(this.numTouches == 0) {
                if(Math.abs(this.extraRotX) > 0.01) {
                    this.extraRotX -= Math.sign(this.extraRotX) * 0.02;
                }
            }
        },

        cleanup: function() {
            //todo cleanup
        },

    });

    return InteractiveSphereView;
});