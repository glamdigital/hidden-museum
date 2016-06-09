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
                if (typeof ble !== 'undefined') {
                    ble.startScan(
                        [],
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
                console.log("connecting:", device);
                if (device.name == "BlendMicro") {
                    console.log("connecting to BlendMicro");
                    var connectionHandler = _.bind(this.handleDeviceConnected, this);
                    ble.connect(
                        device.id,
                        connectionHandler,
                        function(errorCode)
                        {
                            console.log('BLE connect error: ' + errorCode);
                        }
                    );
                    clearTimeout(this.scanTimer);
                    ble.stopScan();
                    this.successCallback();
                }

            },
            handleScanTimeOut: function() {
                console.log("scan timed out" + this.deviceHandle);
                if (!this.deviceHandle) {
                    ble.stopScan();
                    this.errorCallback();
                }
            },
            handleDeviceConnected: function(info) {
                console.log("handleDeviceConnected", info);
                this.deviceHandle = info.id;
                this.handleServices(info.characteristics);
            }, 
            handleServices: function(characteristics) {
                _.each(characteristics, function (characteristic) {
                  if (characteristic.characteristic == '713D0002-503E-4C75-BA94-3148F18D941E' ||
                    characteristic.characteristic == '713d0002-503e-4c75-ba94-3148f18d941e') {
                    this.characteristicNotify = characteristic.characteristic;
                  } else if (characteristic.characteristic == '713D0003-503E-4C75-BA94-3148F18D941E' ||
                    characteristic.characteristic == '713d0003-503e-4c75-ba94-3148f18d941e') {
                    this.characteristicWrite = characteristic.characteristic;
                    this.characteristicService = characteristic.service;
                  }
                }.bind(this));

                if (this.characteristicNotify && this.characteristicWrite ) {
                    console.log('RX/TX services found.');
                    var arrayBuffer = this.stringToBytes("1");
                    this.writeData(arrayBuffer);
                } else {
                    console.log('ERROR: RX/TX services not found!');
                    this.errorCallback();
                }

            },
            stringToBytes:function (string) {
               var array = new Uint8Array(string.length);
               for (var i = 0, l = string.length; i < l; i++) {
                   array[i] = string.charCodeAt(i);
                }
                return array.buffer;
            },

            writeData: function(value) {
              console.log("writeData", value);
                var successHandler = _.bind(this.handleWriteSuccess, this);
                var errorHandler = _.bind(this.handleWriteError, this);
                ble.writeWithoutResponse(
                  this.deviceHandle,
                  this.characteristicService,
                  this.characteristicWrite,
                  value,
                  successHandler,
                  errorHandler
                );
                _.delay(_.bind(this.close,this), 1000);
            },
            handleWriteSuccess: function()
            {
                console.log('write: ' + this.deviceHandle + ' success.');
            },
            handleWriteError:    function(errorCode)
            {
                console.log('write: ' + this.deviceHandle + ' error: ' + errorCode);
            },
            close:function() {
              if (typeof ble !== 'undefined') {
                console.log("closing connection");
                ble.disconnect(
                  this.deviceHandle,
                  function () {
                    console.log("closing connection success");
                  },
                  function () {
                    console.log("closing connection fail");
                  }
                );
                this.deviceHandle = 0;
              }
            }
        },
        
        warningButtonHandler: function(){
          console.log("warningButtonHandler");
          $("#full-screen-warning").hide();
        },
        
        events: {
          "click #wireless-button": "wirelessButtonHandler",
          "click #ok-button": "warningButtonHandler"
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
            this.wirelessButtonClicks = 0;
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
            $('#header').hide();
        },
        wirelessButtonHandler: function(ev) {
            this.wirelessButtonClicks++;
            if (this.wirelessButtonClicks > 5) {
              $("#warning-message").html("You pressed the button 5 times. If you are not hearing a bell then something might be wrong with the exhibit.");
              $("#full-screen-warning").show();
              this.wirelessButtonClicks = 0;
            } else {
              var scanSuccessCallback = _.bind(this.scanSuccessCallback, this);
              var scanErrorCallback = _.bind(this.scanErrorCallback, this);
              this.blecontroller.initialize(
                  scanSuccessCallback,
                  scanErrorCallback
              );
              this.startChargingAnimation();
            }
        },
        scanSuccessCallback: function() {
            console.log("BLE Success" + this.humSound);
            clearTimeout(this.transmitTimer);
            this.stopChargingAnimation();
        },
        // you pressed the button 10 times . if you are not hearing a sound the something might be wrong with the exhibit
        scanErrorCallback: function() {
            console.log("BLE Failure" + this);
            if (this.scanErrors < 2) {
                this.scanErrors++
                this.transmitTimer = setTimeout(_.bind(this.wirelessButtonHandler, this), 3000);
            }
            else {
                this.scanErrors = 0;
                this.stopChargingAnimation();
                $("#warning-message").html("This exhibit doesn't work right now. Try again later.");
                $("#full-screen-warning").show();
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
            if (typeof ble !== 'undefined') {
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
