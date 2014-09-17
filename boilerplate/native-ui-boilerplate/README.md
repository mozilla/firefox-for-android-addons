# Native UI Boilerplate

This code supplies the basic bits and pieces needed to build a simple,
restartless add-on for Firefox on Android, which uses a native widget UI.
Since Firefox on Android does not use XUL for the UI, building an add-on is a
little different than building an add-on for desktop Firefox.

For more information about building mobile add-ons, please see:
https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android

## Using the Native UI Boilerplate

1. Edit the `install.rdf`: Please change the ALL CAPS areas with text specific to your add-on.

2. Add code to `bootstrap.js`: The current code adds some menus, doorhangers and context menus that don't do very much right now.

3. Edit `build`: Update this file to specify a file name for your XPI, as well which version of Firefox you want to use to test the XPI file.

4. Run `./build`: This creates the XPI and optionally pushes it to your device. You must have [adb](http://developer.android.com/tools/help/adb.html) installed for the push step to work.
