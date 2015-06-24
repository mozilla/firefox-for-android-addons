"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// An example of how to create a string bundle for localization.
XPCOMUtils.defineLazyGetter(this, "Strings", function() {
  return Services.strings.createBundle("chrome://youraddon/locale/youraddon.properties");
});

// An example of how to import a helper module.
XPCOMUtils.defineLazyGetter(this, "Helper", function() {
  let sandbox = {};
  Services.scriptloader.loadSubScript("chrome://youraddon/content/helper.js", sandbox);
  return sandbox["Helper"];
});

function showToast(aWindow) {
  aWindow.NativeWindow.toast.show(Strings.GetStringFromName("toast.message"), "short");
}

function showDoorhanger(aWindow) {
  let buttons = [
    {
      label: "Button 1",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 1 was tapped", "short");
      }
    } , {
      label: "Button 2",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 2 was tapped", "short");
      }
    }];

  aWindow.NativeWindow.doorhanger.show("Showing a doorhanger with two button choices.", "doorhanger-test", buttons);
}

function copyLink(aWindow, aTarget) {
  let url = aWindow.NativeWindow.contextmenus._getLinkURL(aTarget);
  aWindow.NativeWindow.toast.show("Todo: copy > " + url, "short");
}

var gToastMenuId = null;
var gDoorhangerMenuId = null;
var gContextMenuId = null;

function loadIntoWindow(window) {
  gToastMenuId = window.NativeWindow.menu.add("Show Toast", null, function() { showToast(window); });
  gDoorhangerMenuId = window.NativeWindow.menu.add("Show Doorhanger", null, function() { showDoorhanger(window); });
  gContextMenuId = window.NativeWindow.contextmenus.add("Copy Link", window.NativeWindow.contextmenus.linkOpenableContext, function(aTarget) { copyLink(window, aTarget); });
}

function unloadFromWindow(window) {
  window.NativeWindow.menu.remove(gToastMenuId);
  window.NativeWindow.menu.remove(gDoorhangerMenuId);
  window.NativeWindow.contextmenus.remove(gContextMenuId);
}

/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    function loadListener() {
      domWindow.removeEventListener("load", loadListener, false);
      loadIntoWindow(domWindow);
    };
    domWindow.addEventListener("load", loadListener, false);
  },
  
  onCloseWindow: function(aWindow) {
  },
  
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN) {
    return;
  }

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
