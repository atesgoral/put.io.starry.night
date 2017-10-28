window.onload = function () {
  var stats = new Stats();
  var totalObjectsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));
  document.getElementById('stats').appendChild(stats.domElement);

  setInterval(function () {
    totalObjectsPanel.update(state.totalObjects, 1000);
  }, 100);

  function encodeConfig(config) {
    return JSON.stringify(config)
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
    fps: {
      throttle: true,
      target: 30
    },
    logo: {
      scale: 0.5
    },
    sparkles: {
      enabled: true,
      frequency: 0.04,
      age: 500,
      width: 60,
      height: 100,
      thickness: 0.1,
      minDistance: 0.2,
      maxDistance: 0.95
    },
    meteors: {
      enabled: true,
      frequency: 0.02,
      angle: 0.44,
      age: 500,
      length: 0.75,
      thickness: 14
    },
    dots: {
      minRadius: 5,
      maxRadius: 12
    },
    radial: {
      enabled: true,
      perspective: 2,
      speed: -0.1,
      dotCount: 50,
      minDistance: 0.5,
      maxDistance: 0.95,
      tapering: 0.2
    },
    waves: [{
      enabled: true,
      speed: 0.2,
      horizPos: 0,
      vertPos: 0.3,
      length: 0.5,
      phase: 0.5,
      period: 1,
      amplitude: 0.15,
      amplitudeJitter: 0.25,
      spacingJitter: 0.1,
      tapering: 0.2
    }, {
      enabled: true,
      speed: -0.2,
      horizPos: 0.5,
      vertPos: 0.7,
      length: 0.5,
      phase: 0,
      period: 1,
      amplitude: 0.15,
      amplitudeJitter: 0.25,
      spacingJitter: 0.1,
      tapering: 0.2
    }, {
      enabled: false,
      speed: 0.27,
      horizPos: 0.13,
      vertPos: 0.43,
      length: 0.39,
      phase: 1,
      period: 0.5,
      amplitude: 0.34,
      amplitudeJitter: 0.31,
      spacingJitter: 0.12,
      tapering: 0.2
    }]
  };

  var config = defaultConfig;

  if (document.location.hash) {
    try {
      mixin(config, decodeConfig(document.location.hash.slice(1)));
    } catch (err) {
      try {
        // Try legacy format
        mixin(config, JSON.parse(decodeURIComponent(document.location.hash.slice(1))));
      } catch (err) {
        alert('Invalid config in hash, ignoring and using default config');
        document.location.hash = '';
      }
    }
  }

  function r() {
    return Math.random() * 2 - 1;
  }

  function getRadius(dot) {
    return config.dots.minRadius + (1 + dot.r) * (config.dots.maxRadius - config.dots.minRadius) / 2;
  }

  this.state = {
    sparkles: [],
    meteors: [],
    totalObjects: 0
  };

  function createWaveDots(waveConfig) {
    var x = 0;

    var dots = [];

    var maxX = waveConfig.length * canvas.width;

    while (x < maxX) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = getRadius(dot);
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

  var SCALE = 2; // @todo not used yet
  var canvas = document.getElementById('starry-night');

  var starryNight = new StarryNight(canvas, config, state);

  starryNight.resize();

  window.onresize = starryNight.resize;

  state.waveDots = createAllWaveDots();
  state.radialDots = createRadialDots();

  var ctx = canvas.getContext('2d');

  var logo = new Image();
  logo.src = 'logo.png';

  logo.onload = function () {
    var logoAspectRatio = logo.width / logo.height;

    function repaint(t) {
      stats.begin();

      if (config.fps.throttle) {
        setTimeout(function () {
          requestAnimationFrame(repaint);
        }, 1000 / config.fps.target);
      } else {
        requestAnimationFrame(repaint);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.globalCompositeOperation = 'source-over';

      for (var i = 0; i < state.radialDots.length; i++) {
        var dot = state.radialDots[i];
        var a = dot.a * Math.PI * 2;

        var pos = ((t / 100 * Math.pow(config.radial.speed, 3) % 1) + 1) % 1;
        var dotD = (pos + dot.d) % 1;

        var dotD2 = 1 - dotD;
        var scale = dotD < config.radial.tapering
          ? dotD / config.radial.tapering
          : dotD2 < config.radial.tapering
            ? dotD2 / config.radial.tapering
            : 1;

        dotD = config.radial.minDistance + dotD * (config.radial.maxDistance - config.radial.minDistance);

        var dotR = getRadius(dot);

        if (config.radial.perspective) {
          dotD = Math.pow(dotD, config.radial.perspective);
          dotR *= dotD;
        }

        var dx = Math.cos(a) * dotD;
        var dy = Math.sin(a) * dotD;

        var x = (dx + 1) * canvas.width / 2;
        var y = (dy + 1) * canvas.height / 2;

        ctx.beginPath();
        ctx.arc(x, y, dotR * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var i = 0; i < config.waves.length; i++) {
        var waveConfig = config.waves[i];

        var dots = state.waveDots[i];

        var maxX = waveConfig.length * canvas.width;

        var pos = ((t * Math.pow(waveConfig.speed, 3) % maxX) + maxX) % maxX; // @todo normalize to 1?

        for (var j = 0; j < dots.length; j++) {
          var dot = dots[j];

          var dotX = (pos + dot.p * maxX) % maxX;
          var dotP = dotX / maxX;
          var x = waveConfig.horizPos * canvas.width + dotX;
          var y = (
            (
              Math.sin(
                (dotP * waveConfig.period + waveConfig.phase) * Math.PI * 2
              )
            ) * waveConfig.amplitude + dot.a * waveConfig.amplitudeJitter * waveConfig.amplitudeJitter
            + waveConfig.vertPos
          ) * canvas.height;

          var dotP2 = 1 - dotP;
          var scale = dotP < waveConfig.tapering
            ? dotP / waveConfig.tapering
            : dotP2 < waveConfig.tapering
              ? dotP2 / waveConfig.tapering
              : 1;

          ctx.beginPath();
          ctx.arc(x, y, getRadius(dot) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      var logoW = logo.width * config.logo.scale;
      var logoH = logoW / logoAspectRatio;

      ctx.globalCompositeOperation = 'xor';

      ctx.drawImage(
        logo,
        0, 0, logo.width, logo.height,
        (canvas.width - logoW) / 2, (canvas.height - logoH) / 2, logoW, logoH
      );

      ctx.globalCompositeOperation = 'source-over';

      var halfW = config.sparkles.width / 2;
      var halfH = config.sparkles.height / 2;
      var aspectRatio = config.sparkles.width / config.sparkles.height;
      var foldW = halfW * config.sparkles.thickness;
      var foldH = halfH * config.sparkles.thickness * aspectRatio;

      for (var i = state.sparkles.length; i--;) {
        var sparkle = state.sparkles[i];
        var age = t - sparkle.t;

        if (age > config.sparkles.age) {
          state.sparkles.splice(i, 1);
          state.totalObjects--;
          continue;
        }

        var scale = age / config.sparkles.age;
        scale = 1 - Math.abs(0.5 - scale) * 2;

        var x = (sparkle.x + 1) * canvas.width / 2;
        var y = (sparkle.y + 1) * canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(x, y - halfH * scale);
        ctx.lineTo(x + foldW * scale, y - foldH * scale);
        ctx.lineTo(x + halfW * scale, y);
        ctx.lineTo(x + foldW * scale, y + foldH * scale);
        ctx.lineTo(x, y + halfH * scale);
        ctx.lineTo(x - foldW * scale, y + foldH * scale);
        ctx.lineTo(x - halfW * scale, y);
        ctx.lineTo(x - foldW * scale, y - foldH * scale);
        ctx.fill();
      }

      var r = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
      var tailDuration = canvas.width / config.meteors.length;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(config.meteors.angle * Math.PI * 2);

      for (var i = state.meteors.length; i--;) {
        var meteor = state.meteors[i];
        var age = t - meteor.t;

        if (age > config.meteors.age + tailDuration) {
          state.meteors.splice(i, 1);
          state.totalObjects--;
          continue;
        }

        var x = (age / config.meteors.age - 0.5) * r * 2;
        var y = (meteor.p - 0.5) * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, config.meteors.thickness / 2, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(x - config.meteors.length * canvas.width, y);
        ctx.fill();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      if (config.meteors.enabled && Math.random() < config.meteors.frequency) {
        state.meteors.push({
          p: Math.random(),
          t: t
        });

        state.totalObjects++;
      }

      if (config.sparkles.enabled && Math.random() < config.sparkles.frequency) {
        var a = Math.random() * Math.PI * 2;
        var d = config.sparkles.minDistance + Math.random() * (config.sparkles.maxDistance - config.sparkles.minDistance);

        state.sparkles.push({
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          t: t
        });

        state.totalObjects++;
      }

      stats.end();
    }

    requestAnimationFrame(repaint);
  };

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
    default: function () {
      deleteAllWaveDots();
      deleteRadialDots();
      deleteSparkles();
      deleteMeteors();
      config = defaultConfig;
      state.waveDots = createAllWaveDots();
      state.radialDots = createRadialDots();
      document.location.hash = '';
    },
    share: function () {
      document.location.hash = encodeConfig(config);
    }
  };

  var gui = new dat.GUI();

  gui.add(actions, 'default').name('Default');
  gui.add(actions, 'share').name('Share');

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

  var dotsFolder = gui.addFolder('Dots');
  // dotsFolder.open();
  dotsFolder.add(config.dots, 'minRadius', 0).onFinishChange(function () {
    deleteAllWaveDots();
    state.waveDots = createAllWaveDots();
  });
  dotsFolder.add(config.dots, 'maxRadius', 0).onFinishChange(function () {
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
