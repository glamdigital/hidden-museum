define(["backbone", "hbs!app/templates/interactive/marconiWireless", "app/mixins/overlay",
        "hbs!app/templates/overlay_interactive_inner"],
    function(Backbone, marconiWirelessTemplate, overlayMixin,
        interactiveInnerTemplate) {


    var MarconiWirelessView = Backbone.View.extend({
        template: marconiWirelessTemplate,

        getBleController: function() {
            return {
                deviceHandle: 0,
                characteristicWrite: 0,
                characteristicRead: 0,
                descriptorNotification: 0,
                initialize: function () {

                    var connectDevice = _.bind(this.connectDevice, this);
                    if (typeof evothings !== 'undefined') {
                        evothings.ble.startScan(
                            connectDevice,
                            function (errorCode) {
                                //console.log('BLE startScan error: ' + errorCode);
                            }
                        );
                    }

                },
                connectDevice: function (device) {
                    console.log(device);
                    if (device.name == "BlendMicro") {
                        console.log("connecting to BlendMicro");
                        var connectionHandler = _.bind(this.handleDeviceConnected, this);
                        evothings.ble.connect(
                            device.address,
                            connectionHandler,
                            function (errorCode) {
                                //console.log('BLE connect error: ' + errorCode);
                            }
                        );
                        evothings.ble.stopScan();
                    }

                },
                closeConnection: function () {
                    evothings.ble.close();
                },
                handleDeviceConnected: function (info) {
                    this.deviceHandle = info.deviceHandle;
                    if (info.state == 2) {
                        //console.log("handledConnection");
                        var servicesHandler = _.bind(this.handleServices, this);
                        evothings.ble.readAllServiceData(
                            this.deviceHandle,
                            servicesHandler,
                            function (errorCode) {
                                //console.log('readAllServiceData error: ' + errorCode);
                            }
                        );
                    }
                },
                handleServices: function (services) {
                    // Find handles for characteristics and descriptor needed.
                    for (var si in services) {
                        var service = services[si];
                        console.log(service);

                        for (var ci in service.characteristics) {
                            var characteristic = service.characteristics[ci];

                            if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e') {
                                this.characteristicRead = characteristic.handle;
                            }
                            else if (characteristic.uuid == '713d0003-503e-4c75-ba94-3148f18d941e') {
                                this.characteristicWrite = characteristic.handle;
                            }

                            for (var di in characteristic.descriptors) {
                                var descriptor = characteristic.descriptors[di];

                                if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e' &&
                                    descriptor.uuid == '00002902-0000-1000-8000-00805f9b34fb') {
                                    this.descriptorNotification = descriptor.handle;
                                }
                            }
                        }
                    }

                    if (this.characteristicRead && this.characteristicWrite && this.descriptorNotification) {
                        console.log('RX/TX services found.');
                    }
                    else {
                        console.log('ERROR: RX/TX services not found!');
                    }

                },

                writeData: function (value) {
                    evothings.ble.writeCharacteristic(
                        this.deviceHandle,
                        this.characteristicWrite,
                        value,
                        function () {
                            console.log('write: ' + handle + ' success.');
                        },
                        function (errorCode) {
                            console.log('write: ' + handle + ' error: ' + errorCode);
                        });
                },
                turnOnLed: function () {
                    this.writeData(new Uint8Array([1]));
                },
                turnOffLed: function () {
                    this.writeData(new Uint8Array([0]));
                }
            };
        },

        events: {
          "click #wireless-button": "wirelessButtonHandler"
        },

        serialize: function() {
            return this.item.toJSON();
        },

        initialize: function(params) {
            this.item = params.item;
            this.overlayInitialize({ displayOnArrival: true});
            this.overlaySetTemplate(interactiveInnerTemplate, this.model.toJSON());
            this.blecontroller = this.getBleController();
            this.blecontroller.initialize();
        },
        afterRender: function() {
        },
        setup: function() {              
        },
        wirelessButtonHandler: function(ev) {
            var $target = $(ev.target);
            this.blecontroller.turnOnLed();
        },
	    cleanup: function() {
            this.overlayCleanup();
            this.blecontroller.closeConnection();
	    },
    });

     _.extend(MarconiWirelessView.prototype, overlayMixin);

    return MarconiWirelessView;

});