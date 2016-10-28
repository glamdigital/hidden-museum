#!/usr/bin/env node

'use strict';

const fs = require('fs');
const plist = require('plist');


// here add plist entries that need to be copied to the *-info.plist file
let plistEntries = [
  {key: "NSBluetoothPeripheralUsageDescription", string :"Used to communicate with the Marconi wireless exhibit"},
  {key: "NSCameraUsageDescription", string :"Used for image recognition and for interactive features"},
  {key: "NSLocationWhenInUseUsageDescription", string :"Used to save and read screenshots for the sextant demonstration"},
  {key: "NSPhotoLibraryUsageDescription", string :"Used to save and "},
];
module.exports = function (context) {
  const plistPath = context.opts.projectRoot + '/platforms/ios/Pocket Curator/Pocket Curator-Info.plist';

  var xml = fs.readFileSync(plistPath, 'utf8');
  var iosPlist = plist.parse(xml);
  let plistRoot, dictRoot;
  

  if (iosPlist && plistEntries.length > 0) {
    plistEntries.forEach(
      entry => {
        if (!iosPlist[entry.key]) {
          iosPlist[entry.key] = entry.string
          console.log("BeforeBuild Hook: added entry: ", entry.key);
        } else {
          iosPlist[entry.key] = entry.string
          console.log("BeforeBuild Hook: replaced entry: ", entry.key);
        }
      }
    );
    xml = plist.build(iosPlist);
    fs.writeFileSync(plistPath, xml, { encoding: 'utf8' });
  }
};
