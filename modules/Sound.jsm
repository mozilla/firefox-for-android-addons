/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

this.EXPORTED_SYMBOLS = ["Sound"];

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");

let Log = Cu.import("resource://gre/modules/AndroidLog.jsm", {}).AndroidLog;

// TODO: Watch out for logging security leaks.
const LOGTAG = "Sound.jsm";

const DELAYED_STARTUP = 'browser-delayed-startup-finished';

let audioContext;
let uninitSounds = [];

/**
 * Lazily gets the AudioContext associated with this module. This is necessary
 * because the hidden window object may not be available when the module is
 * first loaded.
 */
function getContext() {
  if (!audioContext) {
    try {
      Log.d(LOGTAG, "Initializing Sound.jsm.");

      let hiddenWindow = Services.appShell.hiddenDOMWindow;
      audioContext = new hiddenWindow.AudioContext();

      uninitSounds.forEach(function (sound) {
        sound._init();
      });
      // Drop the unneeded references.
      uninitSounds = null;

    } catch (ex) {
      if (audioContext) {
        Log.e(LOGTAG, "Unknown exception: " + ex);
        throw ex;
      }

      // TODO: Add an observer for browser-delayed-startup-finished to avoid
      // missing the first sound effect due to initialization.
      Log.w(LOGTAG, "Couldn't get context: " + ex);
      return null;
    }
  }
  return audioContext;
}

function loadURI(uri, onload, onerror) {
  let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].
      createInstance(Ci.nsIXMLHttpRequest);

  xhr.onload = function () {
    Log.d(LOGTAG, "Success reading file: " + uri);
    onload(xhr.response);
  };

  xhr.onerror = function () {
    Log.d(LOGTAG, "Failure reading file: " + uri);
    onerror(); // TODO: Pass in error msg?
  };

  xhr.open("GET", uri, true);
  xhr.responseType = "arraybuffer";
  xhr.send();
}

// Public API
function Sound(path, onload, onerror) {
  this._path = path;
  this._onload = onload;
  this._onerror = onerror;

  if (getContext()) {
    this._init();
  } else {
    uninitSounds.push(this);
  }
}

Sound.prototype = {
  _init: function () {
    // TODO: This could be better with promises. Note that decodeAudioData
    // supposedly supports promises, but "Not enough args to decodeAudioData"
    // is logged instead.
    loadURI(this._path, function (fileData) {
      getContext().decodeAudioData(fileData, function (decodedData) {
        Log.d(LOGTAG, "Success decoding data at: " + this._path);
        this._buffer = decodedData;
        if (this._onload) {
          this._onload();
        }

      }.bind(this), function (err) {
        Log.d(LOGTAG, "Failure decoding data at: " + this._path + "; " + err);
        if (this._onerror) {
          this._onerror(err);
        }
      }.bind(this));

    }.bind(this), function () {
      if (this._onerror) {
        this._onerror();
      }
    });
  },

  play: function (onended) {
    let context = getContext();
    if (!context) {
      Log.w(LOGTAG, "Sound.jsm not yet initialized: cannot play sound: "
          + this._path);
      return;
    }

    if (!this._buffer) {
      Log.e(LOGTAG, "Cannot play to-be-loaded or failed-to-load sound: "
          + this._path);
      return;
    }

    Log.d(LOGTAG, "Playing sound: " + this._path);

    let source = context.createBufferSource();
    source.buffer = this._buffer;
    source.connect(context.destination);

    if (onended) {
      source.onended = onended;
    }

    source.start(0);
  },
};
