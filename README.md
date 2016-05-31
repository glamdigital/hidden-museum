# Pocket Curator

## Developer

### Setup

Assuming that `npm` is installed:

    npm install

    bower install

### Generate settings bundle
In order to generate the settings bundle to enable picking of trail in iOS settings, run the following command.

```
node plugins/me.apla.cordova.app-preferences/bin/build-app-settings.js
```
This takes settings from app-settings.json and creates a settings bundle platforms/ios. This bundle must be added to the xcode project's Resources folder.

### Integrating image recognition library
The Moodstocks image recognition must be integrated as follows:
 - Download the framework from the moodstocks website.
 - Drag the Moodstocks Framework into the Frameworks folder of XCode.
 - Modify Classes/webViewDidFinishLoad to look like the following
```
- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor clearColor];
    theWebView.opaque = NO;

    return [super webViewDidFinishLoad:theWebView];
}
```
 - Modify Plugins/MS4Plugin.m to include the appropriate API key and secret.

### Building and running

```
grunt localbuild:ios
cordova run ios []--device]
```

### Importing data

The data for the app comes from the spreadsheet HiddenMuseumData on Google docs.

This sheet should be exported to .csv into a folder named HiddenMuseumData.

The following task then converts the data to the json format read by the app

    grunt convertData


### Cordova plugins
Cordova plugins can be installed using the grunt task `grunt plugins`


## Moodstocks plugin
The moodstocks plugin requires some modification of the generated iOS/Android projects as follows:
N.B. We use a [branched version](http://github.com/ox-it/MS4Plugin) of the plugin which works with cordova 5.4

### iOS
As outlined in [this video](https://www.youtube.com/watch?v=ZuDFnf8S4NY)

open ```[project path]/platforms/ios/The Hidden Museum.xcodeproj```

Drag the moodstocks.framework file from the project repository into the project in XCode
Our branch of the plugin doesn't require modifying the cordova-generated MainViewController.m - as the web view is made transparent within the plugin code.

### Android
As outlined in [this video](https://www.youtube.com/watch?v=TgIBX6r1nl4)

Plugin has been modified as described in [this issue](https://github.com/thomasforth/MS4Plugin/issues/6) to achieve 5.x compatibility.

Steps from scratch:
 - [Install Eclipse IDE for Java developers](https://eclipse.org/downloads/)
 - [Configure Eclipse for android development](http://www.instructables.com/id/How-To-Setup-Eclipse-for-Android-App-Development/?ALLSTEPS)
 - Ensure that in Preferences>Android, the SDK path is the same as your system's $ANDROID_HOME.
 - Create a new android project: 
   - File>New>Project
   - select Android/'Android project from existing code'
   - Click 'browse' and select `[project path]/platforms/android`
 - Drag the file `MainActivity/src/com.moodstock.phonegap.plugin/MainActivity.java` into `MainActivity/src/uk.ac.ox.museums.hiddenmuseum`. 
 - Accept to overwrite the file when prompted.
 - Add the moodstocks libraries by dragging the `moodstocks-eclipse-4.x.x/libs` folder onto the root MainActivity folder.
 - Accept to overwrite when prompted.
 - Add the API key and secret to MS4Plugin.java
 - Build/Run the project by right-clicking on the root MainActivity and selecting 'Run As > Android Application'

N.B. I initially encountered an issue whereby the project's javascript plugin files weren't being correctly added. It may be necessary to clean and rebuild the project, and it may also help to add the ['Hybrid Mobile' plugin](https://github.com/eclipse/thym) to Eclipse.
