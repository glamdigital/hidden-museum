#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
    "org.apache.cordova.device",
	"https://github.com/mbppower/CordovaCameraPreview.git",
	"https://github.com/thomasforth/MS4Plugin.git",
	"https://github.com/apache/cordova-plugin-camera.git",
	"https://github.com/apache/cordova-plugin-media.git",
	"me.apla.cordova.app-preferences",
	"org.apache.cordova.dialogs",
	"org.apache.cordova.file",
	"org.apache.cordova.media",
	"org.apache.cordova.vibration",
	"https://github.com/gitawego/cordova-screenshot.git",
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
