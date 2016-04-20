define(["backbone", "hbs!app/templates/interactive/marconiWireless", "app/mixins/overlay",
        "hbs!app/templates/overlay_interactive_inner", "app/views/interactive/ImageScanView", 'app/media', 'move'],
    function(Backbone, marconiWirelessTemplate, overlayMixin,
        interactiveInnerTemplate, ImageScanView, mediaUtil, move) {


    var MarconiWirelessView = Backbone.View.extend({
        template: marconiWirelessTemplate,

        transmitSound: mediaUtil.createAudioObj('audio/marconi/zap.mp3'),
        humSound: mediaUtil.createAudioObj('audio/marconi/charging.mp3'),

        blecontroller: {
            deviceHandle: 0,
            characteristicWrite: 0,
            characteristicRead: 0,
            descriptorNotification: 0,
            initialize: function(success, error) {
                this.successCallback = success;
                this.errorCallback = error;
                var connectDevice = _.bind(this.connectDevice, this);
                var timeOutHandler = _.bind(this.handleScanTimeOut, this);
                if (typeof evothings !== 'undefined') {
                    evothings.ble.startScan(
                        connectDevice,
                        function(errorCode)
                        {
                            console.log('BLE startScan error: ' + errorCode);
                        }
                    );
                    //need to cancel if successful
                    this.scanTimer = setTimeout(timeOutHandler, 1000);
                }

            },
            connectDevice: function(device) {
                console.log(device);
                if (device.name == "BlendMicro") {
                    console.log("connecting to BlendMicro");
                    var connectionHandler = _.bind(this.handleDeviceConnected, this);
                    evothings.ble.connect(
                        device.address,
                        connectionHandler,
                        function(errorCode)
                        {
                            console.log('BLE connect error: ' + errorCode);
                        }
                    );
                    clearTimeout(this.scanTimer);
                    evothings.ble.stopScan();
                    this.successCallback();
                }

            },
            handleScanTimeOut: function() {
                console.log("scan timed out" + this.deviceHandle);
                if (!this.deviceHandle) {
                    evothings.ble.stopScan();
                    this.errorCallback();
                }
            },
            handleDeviceConnected: function(info) {
                this.deviceHandle = info.deviceHandle;
                if (info.state == 2) {
                    console.log("handledConnection");
                    var servicesHandler = _.bind(this.handleServices, this);
                    evothings.ble.readAllServiceData(
                        this.deviceHandle,
                        servicesHandler, 
                        function(errorCode)
                        {
                            console.log('readAllServiceData error: ' + errorCode);
                        }
                    );
                }
            }, 
            handleServices: function(services) {
                // Find handles for characteristics and descriptor needed.
                for (var si in services)
                {
                    var service = services[si];
                    console.log(service);

                    for (var ci in service.characteristics)
                    {
                        var characteristic = service.characteristics[ci];

                        if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e')
                        {
                            this.characteristicRead = characteristic.handle;
                        }
                        else if (characteristic.uuid == '713d0003-503e-4c75-ba94-3148f18d941e')
                        {
                            this.characteristicWrite = characteristic.handle;
                        }

                        for (var di in characteristic.descriptors)
                        {
                            var descriptor = characteristic.descriptors[di];

                            if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e' &&
                                descriptor.uuid == '00002902-0000-1000-8000-00805f9b34fb')
                            {
                                this.descriptorNotification = descriptor.handle;
                            }
                        }
                    }
                }

                if (this.characteristicRead && this.characteristicWrite && this.descriptorNotification)
                {
                    console.log('RX/TX services found.');
                    this.writeData(new Uint8Array([1]));
                }
                else
                {
                    console.log('ERROR: RX/TX services not found!');
                    this.errorCallback();
                }

            },

            writeData: function(value) {
                var successHandler = _.bind(this.handleWriteSuccess, this);
                var errorHandler = _.bind(this.handleWriteError, this);
                evothings.ble.writeCharacteristic(
                    this.deviceHandle,
                    this.characteristicWrite,
                    value,
                    successHandler,
                    errorHandler
                );
            },
            handleWriteSuccess: function()
            {
                console.log('write: ' + this.deviceHandle + ' success.');
                this.close();
            },
            handleWriteError:    function(errorCode)
            {
                console.log('write: ' + this.deviceHandle + ' error: ' + errorCode);
                this.close();
            },
            close:function() {
                console.log("closing connection");
                evothings.ble.close(this.deviceHandle);
                this.deviceHandle = 0;
            }
        },

        events: {
          "click #wireless-button": "wirelessButtonHandler"
        },

        serialize: function() {
            return this.item.toJSON();
        },

        initialize: function(params) {
            this.item = params.item;
            this.model = params.model;
            this.overlayInitialize({ displayOnArrival: false});
            this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            $('#content').css("background-color", "transparent");
            this.scanErrors = 0;
        },
        afterRender: function() {
            $('#controls').hide();
            $('#feedback').hide();
            this.irView = new ImageScanView({
                                    el: $('#ir-view'),
                                    model: this.item,
                                    item: this.item,
                                    target: 'marconi', //a substring in the title of all relevant reference images in the moodstocks library
                                    gallery: 'basement',
                                    onFoundItem: _.bind(function() {
                                        this.showControls();
                                    }, this)
                                });
            this.irView.render();
        },
        showControls: function() { 
            $('#controls').show();
            $('#feedback').show();
            $('.preview').hide();

        },
        wirelessButtonHandler: function(ev) {
            var scanSuccessCallback = _.bind(this.scanSuccessCallback, this);
            var scanErrorCallback = _.bind(this.scanErrorCallback, this);
            this.blecontroller.initialize(
                scanSuccessCallback,
                scanErrorCallback
            );
            this.startChargingAnimation();
        },
        scanSuccessCallback: function() {
            console.log("BLE Success" + this.humSound);
            clearTimeout(this.transmitTimer);
            this.stopChargingAnimation();        
        },
        scanErrorCallback: function() {
            console.log("BLE Failure" + this);           
            if (this.scanErrors < 2) {
                this.scanErrors++
                this.transmitTimer = setTimeout(_.bind(this.wirelessButtonHandler, this), 3000);
            }
            else {
                this.scanErrors = 0;
                this.stopChargingAnimation();
            }
        },
        startChargingAnimation: function() {
            this.humSound.play();
            move('#charging-text')
                .duration(0)
                .y(-40)
                .end();
            move('#charging-indicator')
                .duration(7000)
                .set('height', '400px')               
                .end();           
        },
        stopChargingAnimation: function () {
            this.humSound.pause();
            this.humSound.currentTime = 0;
            move('#charging-text')
                .duration(0)    
                .y(40)
                .end();
            move('#charging-indicator')
                .set('height', 0)
                .end();
            this.spark();
        },
        spark: function() {
            if( navigator.notification ) { navigator.notification.vibrate(100); }
            this.transmitSound.play();
            move('#marconi')
                .duration(100)
                .set('background-color', 'rgba(255,255,255,0.8)')
                .then()
                    .duration(100)
                    .set('background-color', 'transparent')
                    .then()
                        .duration(100)
                        .set('background-color', 'rgba(255,255,255,0.5)')
                        .then()
                            .duration(100)
                            .set('background-color', 'transparent')
                            .pop()
                        .pop()
                    .pop()
                .end();

        },
	    cleanup: function() {
            if (typeof evothings !== 'undefined') {
                this.blecontroller.close();
            }
            this.transmitSound.cleanup();
            this.humSound.cleanup();
            this.overlayCleanup();
            this.irView.remove();
            clearTimeout(this.transmitTimer);
	    },
    });

     _.extend(MarconiWirelessView.prototype, overlayMixin);

    return MarconiWirelessView;

});
