window.onload = function () {
  var stats = new Stats();
  var totalObjectsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));
  document.getElementById('stats').appendChild(stats.domElement);

  setInterval(function () {
    totalObjectsPanel.update(state.totalObjects, 1000);
  }, 100);

  function mixin(target, obj) {
    for (var p in obj) {
      var value = obj[p];

      if (value instanceof Array) {
        target[p] = target[p] || [];
        mixin(target[p], value);
      } else if (value instanceof Object) {
        target[p] = target[p] || {};
        mixin(target[p], value);
      } else {
        target[p] = value;
      }
    }
  }

  function encodeConfig(config) {
    return JSON.stringify(Object.assign({ v: 2 }, config))
      .replace(/"(\w+)":/g, '$1=')
      .replace(/,/g, '&')
      .replace(/{/g, '(')
      .replace(/}/g, ')');
  }

  function decodeConfig(encoded) {
    return JSON.parse(
      encoded
        .replace(/(\w+)=/g, '"$1":')
        .replace(/\&/g, ',')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
    );
  }

  function normalizeConfig(config) {
    if (config.v !== 2) {
      config.logo.scale /= 945 * 2 / 2251;

      config.radialDots = Object.assign({}, config.dots);
      config.waveDots = Object.assign({}, config.dots);
      delete config.dots;

      config.sparkles.frequency *= 100;
      config.sparkles.width = config.sparkles.width / 945 / 2 * 100;
      config.sparkles.height = config.sparkles.height / 945 / 2 * 100;
      config.meteors.frequency *= 100;
      config.meteors.thickness = config.meteors.thickness / 945 / 2 * 100;
      config.radialDots.minRadius = config.radialDots.minRadius / 945 / 2 * 100;
      config.radialDots.maxRadius = config.radialDots.maxRadius / 945 / 2 * 100;
      config.waveDots.minRadius = config.waveDots.minRadius / 945 / 2 * 100;
      config.waveDots.maxRadius = config.waveDots.maxRadius / 945 / 2 * 100;
      config.waves.forEach(function (wave) {
        wave.speed = Math.pow(Math.pow(wave.speed, 3) / 945 / 2, 1 / 3) * 100;
      });
    }

    return config;
  }

  var defaultConfig = {
    "pixelDensity": 0,
    "fps": {
      "throttle": true,
      "target": 30
    },
    "logo": {
      "scale": 0.6681539682539683
    },
    "sparkles": {
      "enabled": true,
      "frequency": 4,
      "age": 500,
      "width": 3.1746031746031744,
      "height": 5.291005291005291,
      "thickness": 0.1,
      "minDistance": 0.2,
      "maxDistance": 0.95
    },
    "meteors": {
      "enabled": true,
      "frequency": 0.5,
      "angle": 0.44,
      "age": 500,
      "length": 0.75,
      "thickness": 0.7407407407407408
    },
    "radialDots": {
      "minRadius": 0.26455026455026454,
      "maxRadius": 0.5291005291005291
    },
    "waveDots": {
      "minRadius": 0.26455026455026454,
      "maxRadius": 0.5291005291005291
    },
    "radial": {
      "enabled": true,
      "perspective": 1.5999999999999996,
      "speed": -0.1749095295536791,
      "dotCount": 100,
      "minDistance": 0.5890056867137687,
      "maxDistance": 0.95,
      "tapering": 0.14785455798724798
    },
    "waves": [
      {
        "enabled": true,
        "speed": 1.6176183350000002,
        "horizPos": 0.05962433224194382,
        "vertPos": 0.3353437876960193,
        "length": 0.5779769084956057,
        "phase": 0.7985524728588661,
        "period": 0.9308978114768224,
        "amplitude": 0.15,
        "amplitudeJitter": 0.25,
        "spacingJitter": 0.1,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": -1.6176183350000002,
        "horizPos": 0.5118042391866277,
        "vertPos": 0.6441495778045838,
        "length": 0.5,
        "phase": 0,
        "period": 1,
        "amplitude": 0.15,
        "amplitudeJitter": 0.25,
        "spacingJitter": 0.1,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": 2.1837847519999998,
        "horizPos": 0.13,
        "vertPos": 0.5448905738411166,
        "length": 0.41254523522316044,
        "phase": 0.158883336205411,
        "period": 0.3463725659141823,
        "amplitude": 0.23608478373255212,
        "amplitudeJitter": 0.22505600551438912,
        "spacingJitter": 0.12,
        "tapering": 0.2
      }
    ]
  };

  var config = defaultConfig;

  if (document.location.hash) {
    try {
      mixin(config, normalizeConfig(decodeConfig(document.location.hash.slice(1))));
    } catch (err) {
      console.error(err);
      try {
        // Try legacy format
        mixin(config, normalizeConfig(JSON.parse(decodeURIComponent(document.location.hash.slice(1)))));
      } catch (err) {
        console.error(err);
        alert('Invalid config in hash, ignoring and using default config');
        document.location.hash = '';
      }
    }
  }

  console.log(JSON.stringify(config, null, 2));

  function r() {
    return Math.random() * 2 - 1;
  }

  var state = {
    waveDots: [],
    radialDots: [],
    sparkles: [],
    meteors: [],
    totalObjects: 0
  };

  function createWaveDots(waveConfig) {
    var dots = [];

    var x = 0;

    while (x < waveConfig.length) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = (config.waveDots.minRadius + (1 + dot.r) * (config.waveDots.maxRadius - config.waveDots.minRadius) / 2) / 100;

      dot.p = (x + radius) / waveConfig.length; // phase

      dots.push(dot);

      x += radius * 2 + Math.random() * waveConfig.spacingJitter * waveConfig.spacingJitter;
    }

    state.totalObjects += dots.length;

    return dots;
  }

  function createAllWaveDots() {
    var waveDots = [];

    for (var i = 0; i < config.waves.length; i++) {
      waveDots[i] = config.waves[i].enabled
        ? createWaveDots(config.waves[i])
        : [];
    }

    return waveDots;
  }

  function createRadialDots() {
    var dots = [];

    for (var i = 0; i < config.radial.dotCount; i++) {
      dots.push({
        a: Math.random(), // angle
        d: Math.random(), // distance from center
        r: r()
      });
    }

    state.totalObjects += dots.length;

    return dots;
  }

  var canvas = document.getElementById('starry-night');

  var starryNight = new StarryNight(canvas, config, state, stats);

  starryNight.resize();

  state.waveDots = createAllWaveDots();
  state.radialDots = createRadialDots();

  window.onresize = starryNight.resize;

  function deleteWaveDots(idx) {
    if (state.waveDots[idx]) {
      state.totalObjects -= state.waveDots[idx].length;
    }
    state.waveDots[idx] = [];
  }

  function deleteAllWaveDots() {
    if (state.waveDots) {
      for (var i = 0; i < state.waveDots.length; i++) {
        deleteWaveDots(i);
      }
    }
  }

  function deleteRadialDots() {
    if (state.radialDots) {
      state.totalObjects -= state.radialDots.length;
    }
    state.radialDots = [];
  }

  function deleteSparkles() {
    state.totalObjects -= state.sparkles.length;
    state.sparkles = [];
  }

  function deleteMeteors() {
    state.totalObjects -= state.meteors.length;
    state.meteors = [];
  }

  var actions = {
    reset: function () {
      document.location.hash = '';
      document.location.reload();
    },
    share: function () {
      document.location.hash = encodeConfig(config);
    }
  };

  var gui = new dat.GUI();

  gui.add(actions, 'reset').name('Reset');
  gui.add(actions, 'share').name('Share');

  gui.add(config, 'pixelDensity', 0).onFinishChange(starryNight.resize);

  var fpsFolder = gui.addFolder('FPS');
  fpsFolder.open();
  fpsFolder.add(config.fps, 'throttle');
  fpsFolder.add(config.fps, 'target', 1, 60);

  var logoFolder = gui.addFolder('Logo');
  logoFolder.open();
  logoFolder.add(config.logo, 'scale', 0, 1);

  var sparklesFolder = gui.addFolder('Sparkles');
  sparklesFolder.open();
  sparklesFolder.add(config.sparkles, 'enabled').onFinishChange(function (enabled) {
    if (!enabled) {
      deleteSparkles();
    }
  });
  sparklesFolder.add(config.sparkles, 'frequency', 0, 100);
  sparklesFolder.add(config.sparkles, 'age', 0);
  sparklesFolder.add(config.sparkles, 'width', 0);
  sparklesFolder.add(config.sparkles, 'height', 0);
  sparklesFolder.add(config.sparkles, 'thickness', 0, 1);
  sparklesFolder.add(config.sparkles, 'minDistance', 0, 1);
  sparklesFolder.add(config.sparkles, 'maxDistance', 0, 1);

  var meteorsFolder = gui.addFolder('Meteors');
  meteorsFolder.open();
  meteorsFolder.add(config.meteors, 'enabled').onFinishChange(function (enabled) {
    if (!enabled) {
      deleteMeteors();
    }
  });
  meteorsFolder.add(config.meteors, 'frequency', 0, 100);
  meteorsFolder.add(config.meteors, 'angle', 0, 1);
  meteorsFolder.add(config.meteors, 'age', 0);
  meteorsFolder.add(config.meteors, 'length', 0);
  meteorsFolder.add(config.meteors, 'thickness', 0);

  var radialDotsFolder = gui.addFolder('Radial Dots');
  // radialDotsFolder.open();
  radialDotsFolder.add(config.radialDots, 'minRadius', 0);
  radialDotsFolder.add(config.radialDots, 'maxRadius', 0);

  var waveDotsFolder = gui.addFolder('Wave Dots');
  // waveDotsFolder.open();
  waveDotsFolder.add(config.waveDots, 'minRadius', 0).onFinishChange(function () {
    deleteAllWaveDots();
    state.waveDots = createAllWaveDots();
  });
  waveDotsFolder.add(config.waveDots, 'maxRadius', 0).onFinishChange(function () {
    deleteAllWaveDots();
    state.waveDots = createAllWaveDots();
  });

  var radialFolder = gui.addFolder('Radial');
  radialFolder.open();
  radialFolder.add(config.radial, 'enabled').onFinishChange(function (enabled) {
    if (enabled) {
      state.radialDots = createRadialDots();
    } else {
      deleteRadialDots();
    }
  });
  radialFolder.add(config.radial, 'perspective', 0);
  radialFolder.add(config.radial, 'speed', -1, 1);
  radialFolder.add(config.radial, 'dotCount', 0).onFinishChange(function () {
    deleteRadialDots();
    state.radialDots = createRadialDots();
  });
  radialFolder.add(config.radial, 'minDistance', 0, 1);
  radialFolder.add(config.radial, 'maxDistance', 0, 1);
  radialFolder.add(config.radial, 'tapering', 0, 1);

  config.waves.forEach(function (waveConfig, idx) {
    var folder = gui.addFolder('Wave ' + (idx + 1));

    if (waveConfig.enabled) {
      folder.open();
    }

    folder.add(waveConfig, 'enabled').onFinishChange(function (enabled) {
      if (enabled) {
        state.waveDots[idx] = createWaveDots(waveConfig);
      } else {
        deleteWaveDots(idx);
      }
    });
    folder.add(waveConfig, 'speed');
    folder.add(waveConfig, 'horizPos', 0, 1);
    folder.add(waveConfig, 'vertPos', 0, 1);
    folder.add(waveConfig, 'length', 0, 1).onFinishChange(function () {
      deleteWaveDots(idx);
      state.waveDots[idx] = waveConfig.enabled
        ? createWaveDots(waveConfig)
        : [];
    });
    folder.add(waveConfig, 'phase', 0, 1);
    folder.add(waveConfig, 'period', 0, 1);
    folder.add(waveConfig, 'amplitude', 0, 1);
    folder.add(waveConfig, 'amplitudeJitter', 0, 1);
    folder.add(waveConfig, 'spacingJitter', 0, 1).onFinishChange(function () {
      deleteWaveDots(idx);
      state.waveDots[idx] = waveConfig.enabled
        ? createWaveDots(waveConfig)
        : [];
    });
    folder.add(waveConfig, 'tapering', 0, 1);
  });
};
