window.onload = function () {
  var stats = new Stats();
  var totalObjectsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));
  document.getElementById('stats').appendChild(stats.domElement);

  setInterval(function () {
    totalObjectsPanel.update(state.totalObjects, 1000);
  }, 100);

  function encodeConfig(config) {
    return JSON.stringify(Object.assign({ v: 1 }, config))
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

  function mixin(target, obj) {
    for (var p in obj) {
      var value = obj[p];

      if (value instanceof Object) {
        mixin(target[p], value);
      } else {
        target[p] = value;
      }
    }
  }

  var defaultConfig = {
    "pixelDensity": 2,
    "fps": {
      "throttle": true,
      "target": 30
    },
    "logo": {
      "scale": 0.6 / 1890 * 2251
    },
    "sparkles": {
      "enabled": true,
      "frequency": 0.05,
      "age": 600,
      "width": 60 / 945 / 2,
      "height": 100 / 945 / 2,
      "thickness": 0.2,
      "minDistance": 0.5,
      "maxDistance": 0.9
    },
    "meteors": {
      "enabled": true,
      "frequency": 0.005,
      "angle": 0.44,
      "age": 500,
      "length": 0.75,
      "thickness": 14 / 945
    },
    "radialDots": {
      "minRadius": 3 / 945 / 2,
      "maxRadius": 10 / 945 / 2
    },
    "waveDots": {
      "minRadius": 3 / 945 / 2,
      "maxRadius": 10 / 945 / 2
    },
    "radial": {
      "enabled": true,
      "perspective": 1.6,
      "speed": -0.13,
      "dotCount": 100,
      "minDistance": 0.58,
      "maxDistance": 0.95,
      "tapering": 0.2
    },
    "waves": [
      {
        "enabled": true,
        "speed": Math.pow(0.29, 3) / 945 / 2,
        "horizPos": 0.1368,
        "vertPos": 0.31,
        "length": 0.56,
        "phase": 1,
        "period": 0.9,
        "amplitude": 0.13,
        "amplitudeJitter": 0.28,
        "spacingJitter": 0.03,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": Math.pow(-0.24, 3) / 945 / 2,
        "horizPos": 0.43460279165948645,
        "vertPos": 0.8978114768223333,
        "length": 0.3794589005686714,
        "phase": 0.6992934688953989,
        "period": 0.3353437876960193,
        "amplitude": 0.26917111838704116,
        "amplitudeJitter": 0.21,
        "spacingJitter": 0.13,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": Math.pow(0.27, 3) / 945 / 2,
        "horizPos": 0.07,
        "vertPos": 0.71,
        "length": 0.5,
        "phase": 0.6,
        "period": 0.89,
        "amplitude": 0.14,
        "amplitudeJitter": 0.25,
        "spacingJitter": 0.12,
        "tapering": 0.2
      }
    ]
  };

  var config = defaultConfig;

  if (document.location.hash) {
    try {
      mixin(config, decodeConfig(document.location.hash.slice(1)));
    } catch (err) {
      console.error(err);
      try {
        // Try legacy format
        mixin(config, JSON.parse(decodeURIComponent(document.location.hash.slice(1))));
      } catch (err) {
        console.error(err);
        alert('Invalid config in hash, ignoring and using default config');
        document.location.hash = '';
      }
    }

    if (config.v !== 2) {
      Object.assign(config.radialDots, config.dots);
      Object.assign(config.waveDots, config.dots);
      config.sparkles.width /= 945 * 2;
      config.sparkles.height /= 945 * 2;
      config.meteors.thickness /= 945 * 2;
      config.radialDots.minRadius /= 945 * 2;
      config.radialDots.maxRadius /= 945 * 2;
      config.waveDots.minRadius /= 945 * 2;
      config.waveDots.maxRadius /= 945 * 2;
      config.waves.speed /= 945 * 2;
    }
  }

  console.log(JSON.stringify(config, null, 2));

  function r() {
    return Math.random() * 2 - 1;
  }

  this.state = {
    waveDots: [],
    radialDots: [],
    sparkles: [],
    meteors: [],
    totalObjects: 0
  };

  function createWaveDots(waveConfig) {
    var x = 0;

    var dots = [];

    // @todo remove * canvas.width

    var maxX = waveConfig.length * canvas.width;

    while (x < maxX) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = (config.waveDots.minRadius + (1 + dot.r) * (config.waveDots.maxRadius - config.waveDots.minRadius) / 2) * canvas.width;

      var dotX = x + radius;

      dot.p = dotX / maxX; // phase

      dots.push(dot);

      x += radius * 2 + Math.random() * waveConfig.spacingJitter * waveConfig.spacingJitter * canvas.width;
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
  sparklesFolder.add(config.sparkles, 'frequency', 0, 1);
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
  meteorsFolder.add(config.meteors, 'frequency', 0, 1);
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
  radialFolder.add(config.radial, 'dotCount', 0).onFinishChange(deleteRadialDots);
  radialFolder.add(config.radial, 'minDistance', 0, 1);
  radialFolder.add(config.radial, 'maxDistance', 0, 1);
  radialFolder.add(config.radial, 'tapering', 0, 1);

  config.waves.forEach(function (waveConfig, idx) {
    function deleteDots() {
      deleteWaveDots(idx);
    }

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
    folder.add(waveConfig, 'speed', -1, 1);
    folder.add(waveConfig, 'horizPos', 0, 1);
    folder.add(waveConfig, 'vertPos', 0, 1);
    folder.add(waveConfig, 'length', 0, 1).onFinishChange(deleteDots);
    folder.add(waveConfig, 'phase', 0, 1);
    folder.add(waveConfig, 'period', 0, 1);
    folder.add(waveConfig, 'amplitude', 0, 1);
    folder.add(waveConfig, 'amplitudeJitter', 0, 1);
    folder.add(waveConfig, 'spacingJitter', 0, 1).onFinishChange(deleteDots);
    folder.add(waveConfig, 'tapering', 0, 1);
  });
};
