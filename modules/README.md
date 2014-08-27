modules
=======

Here are some JS modules you can include in your Firefox for Android add-ons.

Sound.jsm
---------
A basic module to play sounds using the HTML5 audio APIs:

```
Components.utils.import("resource://gre/modules/Sound.jsm");
let sound = new Sound('/path/to/sound.fmt');
sound.play();
```

### Known issues
* The AudioContext may be lazily loaded and thus sounds may need to load, and
  not play audio, the first time they are run (via `Sound.play()`).
