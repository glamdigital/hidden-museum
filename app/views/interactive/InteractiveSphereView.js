define([
        'backbone',
        'three',
        'hbs!app/templates/interactive/sphere'
    ],
    
    function(
        Backbone,
        three,
        sphereTemplate
    )
{
    ROTATE_PAN_RATIO = 0.3;     //points of drag to degrees of rotation
    MIN_DELTA_Y = 0;       //minimum y-distance for touch to move before tilting the globe

    var InteractiveSphereView = Backbone.View.extend({
        template: sphereTemplate,

        initialize: function(params) {
            this.texture = params.texture;
            this.numTouches = 0;
            //this.defaultRotX = 17 * Math.PI/180;
            this.extraRotX = 0;
            this.canRotateUpDown = params.canRotateUpDown || false;
            //this.defaultRotX = params.tiltTowardCam * Math.PI/180 | 0.1;
            this.defaultRotX = params.tiltTowardCam ? (params.tiltTowardCam * Math.PI/180) : 0.1;
            this.defaultRotY = params.defaultRotY || 0;
            this.panRatio = params.panRatio || 1;
            this.lightFromSun = params.lightFromSun || false;
            this.stopped = false;

            //used for 'momentum' spin
            this.lastDeltaX = 0;

            //initialise angle
            this.model.set({angle:this.defaultRotY});

        },

        afterRender: function () {
            var $container = $('.sphere-container', this.$el);
            $container.height(this.$el.height());
            this.camera = new three.PerspectiveCamera(25, $container.width()/$container.height(), 0.1, 150);
            this.camera.position.z = 80;
            this.scene = new three.Scene();

            var texture  = three.ImageUtils.loadTexture(this.texture);
            var bump     = this.bump ? three.ImageUtils.loadTexture(this.bump) : null;
            var specular = this.specular ? three.ImageUtils.loadTexture(this.specular) : null;

            this.globeRadius = 15;
            var geometry = new three.SphereGeometry(this.globeRadius, 32, 32);
            var material;
            var matspec = {
                map: texture
            };
                
            if (this.lightFromSun) {
                material = new three.MeshLambertMaterial(matspec);
                var sun = new three.DirectionalLight(0xfffffff, 2);
                sun.position.set(50, 0, 25);
                sun.target.lookAt(0,0,0);
                this.scene.add(sun);

                var ambientLight = new three.AmbientLight(0xff040469);
                this.scene.add(ambientLight);
            }
            else {
                if (bump) {
                    matspec.bumpMap = bump;
                    matspec.bumpScale = 1;
                }
                
                if (specular) {
                    matspec.specularMap = specular;
                    matspec.specular = new THREE.Color('grey');
                }
                
                //just use a basic material;
                material = new three.MeshPhongMaterial(matspec);
                var sun = new three.DirectionalLight(0xfffffff, 0.3);
                sun.position.set(100, 100, 50);
                sun.target.lookAt(0,0,0);
                this.scene.add(sun);

                var ambientLight = new three.AmbientLight(0xffffffff);
                this.scene.add(ambientLight);
            }

            this.mesh = new three.Mesh(geometry, material);

            //tilt on axis, then spin
            this.mesh.rotation.z = 10.5 * Math.PI/180;  //the earth's tilt
            this.mesh.rotation.x = this.defaultRotX;     // a little inclination towards the camera, for aesthetics
            this.mesh.rotation.order = "XZY";

            this.scene.add( this.mesh );

            renderer = new three.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize($container.width(), $container.height());
            $container.append(renderer.domElement);

            //this.animate();
            this.animReq = requestAnimationFrame(_.bind(this.animate, this) );

            if(this.markers) {
                this._addMarkers(this.markers);
            }
            
        },

        _addMarkers: function(markers) {
            var color = (typeof this.markerColor === 'number') ? this.markerColor : 0xff0000;
            var radius = (typeof this.markerRadius === 'number') ? this.markerRadius : 1.0;

            var markerMaterial = new three.MeshBasicMaterial({
                color: color
            });
            var markerGeometry = new three.SphereGeometry(radius, 1, 1);

            //position
            markerGeometry.translate(this.globeRadius, 0,0);

            _.each(markers, _.bind(function(marker) {
                var markerMesh = new three.Mesh( markerGeometry, markerMaterial);
                //lat/lng
                markerMesh.rotateY((marker.lng) * Math.PI/180);
                markerMesh.rotateZ(marker.lat* Math.PI/180);
                this.mesh.add(markerMesh);
            },this));
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
            this.lastDeltaX = 0;

            this.startExtraRotX = this.extraRotX;
        },

        onTouchMove: function(ev) {
            var xPos = ev.originalEvent.touches[0].clientX;
            var deltaX = xPos - this.touchPrevX;
            var newAngle = this.mesh.rotation.y + deltaX * this.panRatio * Math.PI/180;
            //update the model
            var newAngleDeg = newAngle * 180/Math.PI;
            this.model.set({angle: newAngleDeg});
            this.model.trigger('force-change', this.model);

            this.touchPrevX = xPos;
            this.lastDeltaX = deltaX;

            if(this.canRotateUpDown) {
                var yPos = ev.originalEvent.touches[0].clientY;
                var deltaY = yPos - this.touchStartY;
                if (Math.abs(deltaY) > MIN_DELTA_Y) {
                    var extraDist = deltaY - Math.sign(deltaY) * MIN_DELTA_Y;
                    this.extraRotX = this.startExtraRotX + extraDist * this.panRatio * Math.PI / 180;
                }
            }
        },

        onTouchEnd: function(ev) {
            this.numTouches--;
        },
        animate: function() {
            if(!this.stopped) {
                this.animReq = requestAnimationFrame(_.bind(this.animate, this));

                //tilt
                this.mesh.rotation.x = this.defaultRotX + this.extraRotX;
                //turn
                this.mesh.rotation.y = this.model.attributes.angle * Math.PI/180;


                renderer.render(this.scene, this.camera);

                //drift back to default tilt if not touching
                if(this.numTouches == 0) {
                    if(Math.abs(this.extraRotX) > 0.01) {
                        this.extraRotX -= Math.sign(this.extraRotX) * 0.02;
                    }

                    if(this.lastDeltaX !== 0 ) {
                        //spin with momentum
                        this.model.set({angle: this.model.attributes.angle + this.lastDeltaX * 0.2});
                        this.model.trigger('force-change', this.model);
                    }
                }
            }
        },

        cleanup: function() {
            this.stopped = true;
            delete(this.scene);
            delete(this.renderer);
            delete(this.mesh);
        }
    });

    return InteractiveSphereView;
});
