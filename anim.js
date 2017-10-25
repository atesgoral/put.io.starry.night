window.onload = function () {
  var stats = new Stats();
  var thingsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));
  document.getElementById('stats').appendChild(stats.domElement);

  var things = 0;

  setInterval(function () {
    thingsPanel.update(things, 1000);
  }, 100);

  var config = {
    fpsCap: 30,
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
      maxDistance: 0.95
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
      spacingJitter: 0.1
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
      spacingJitter: 0.1
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
      spacingJitter: 0.12
    }]
  };

  if (document.location.hash) {
    try {
      config = JSON.parse(document.location.hash.slice(1));
    } catch (err) {
      alert('Invalid config in hash, ignoring and using default config');
      document.location.hash = '';
    }
  }

  var waveDots = [];
  var radialDots = null;
  var sparkles = [];

  function r() {
    return Math.random() * 2 - 1;
  }

  function getRadius(dot) {
    return config.dots.minRadius + (1 + dot.r) * (config.dots.maxRadius - config.dots.minRadius) / 2;
  }

  function createWaveDots(wave) {
    var x = 0;

    var dots = [];

    var maxX = wave.length * canvas.width;

    while (x < maxX) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = getRadius(dot);
      var dotX = x + radius;

      dot.p = dotX / maxX; // phase

      dots.push(dot);

      x += radius * 2 + Math.random() * wave.spacingJitter * wave.spacingJitter * canvas.width;
    }

    things += dots.length;

    return dots;
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

    things += dots.length;

    return dots;
  }

  var SCALE = 2; // @todo not used yet
  var canvas = document.getElementById('anim');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;

  var ctx = canvas.getContext('2d');

  var logo = new Image();
  logo.src = 'logo.png';

  logo.onload = function () {
    var logoAspectRatio = logo.width / logo.height;

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'xor';

    function repaint(t) {
      stats.begin();

      if (config.fpsCap < 60) {
        setTimeout(function () {
          requestAnimationFrame(repaint);
        }, 1000 / config.fpsCap);
      } else {
        requestAnimationFrame(repaint);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var logoW = logo.width * config.logo.scale;
      var logoH = logoW / logoAspectRatio;

      ctx.drawImage(
        logo,
        0, 0, logo.width, logo.height,
        (canvas.width - logoW) / 2, (canvas.height - logoH) / 2, logoW, logoH
      );

      if (config.radial.enabled) {
        if (!radialDots) {
          radialDots = createRadialDots();
        }

        for (var i = 0; i < radialDots.length; i++) {
          var dot = radialDots[i];
          var a = dot.a * Math.PI * 2;

          var pos = ((t / 100 * Math.pow(config.radial.speed, 3) % 1) + 1) % 1;
          var dotD = (pos + dot.d) % 1;
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
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        deleteRadialDots();
      }

      for (var i = 0; i < config.waves.length; i++) {
        var wave = config.waves[i];

        if (!wave.enabled) {
          deleteWaveDots(i);
          continue;
        }

        var dots = waveDots[i];

        if (!dots) {
          dots = waveDots[i] = createWaveDots(wave);
        }

        var maxX = wave.length * canvas.width;

        var pos = ((t * Math.pow(wave.speed, 3) % maxX) + maxX) % maxX; // @todo normalize to 1?

        for (var j = 0; j < dots.length; j++) {
          var dot = dots[j];

          var dotX = (pos + dot.p * maxX) % maxX;
          var x = wave.horizPos * canvas.width + dotX;
          var y = (
            (
              Math.sin(
                (dotX / maxX * wave.period + wave.phase) * Math.PI * 2
              )
            ) * wave.amplitude + dot.a * wave.amplitudeJitter * wave.amplitudeJitter
            + wave.vertPos
          ) * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, getRadius(dot), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (config.sparkles.enabled) {
        var halfW = config.sparkles.width / 2;
        var halfH = config.sparkles.height / 2;
        var aspectRatio = config.sparkles.width / config.sparkles.height;
        var foldW = halfW * config.sparkles.thickness;
        var foldH = halfH * config.sparkles.thickness * aspectRatio;

        for (var i = sparkles.length; i--;) {
          var sparkle = sparkles[i];
          var age = t - sparkle.t;

          if (age > config.sparkles.age) {
            sparkles.splice(i, 1);
            things--;
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

        if (Math.random() < config.sparkles.frequency) {
          var a = Math.random() * Math.PI * 2;
          var d = config.sparkles.minDistance + Math.random() * (config.sparkles.maxDistance - config.sparkles.minDistance);

          sparkles.push({
            x: Math.cos(a) * d,
            y: Math.sin(a) * d,
            t: t
          });

          things++;
        }
      } else {
        deleteSparkles();
      }

      stats.end();
    }

    requestAnimationFrame(repaint);
  };

  function deleteWaveDots(idx) {
    if (waveDots[idx]) {
      things -= waveDots[idx].length;
    }
    waveDots[idx] = null;
  }

  function deleteAllWaveDots() {
    if (waveDots) {
      for (var i = 0; i < waveDots.length; i++) {
        deleteWaveDots(i);
      }
    }
  }

  function deleteRadialDots() {
    if (radialDots) {
      things -= radialDots.length;
    }
    radialDots = null;
  }

  function deleteSparkles() {
    things -= sparkles.length;
    sparkles = [];
  }

  var actions = {
    default: function () {
      document.location.hash = '';
    },
    share: function () {
      document.location.hash = JSON.stringify(config);
    }
  };

  var gui = new dat.GUI();

  gui.add(actions, 'default').name('Default');
  gui.add(actions, 'share').name('Share');

  gui.add(config, 'fpsCap', 1, 60);

  var logoFolder = gui.addFolder('Logo');
  logoFolder.open();
  logoFolder.add(config.logo, 'scale', 0, 1);

  var sparklesFolder = gui.addFolder('Sparkles');
  sparklesFolder.open();
  sparklesFolder.add(config.sparkles, 'enabled');
  sparklesFolder.add(config.sparkles, 'frequency', 0, 1);
  sparklesFolder.add(config.sparkles, 'age', 0);
  sparklesFolder.add(config.sparkles, 'width', 0);
  sparklesFolder.add(config.sparkles, 'height', 0);
  sparklesFolder.add(config.sparkles, 'thickness', 0, 1);
  sparklesFolder.add(config.sparkles, 'minDistance', 0, 1);
  sparklesFolder.add(config.sparkles, 'maxDistance', 0, 1);

  var dotsFolder = gui.addFolder('Dots');
  // dotsFolder.open();
  dotsFolder.add(config.dots, 'minRadius', 0).onFinishChange(deleteAllWaveDots);
  dotsFolder.add(config.dots, 'maxRadius', 0).onFinishChange(deleteAllWaveDots);

  var radialFolder = gui.addFolder('Radial');
  radialFolder.open();
  radialFolder.add(config.radial, 'enabled');
  radialFolder.add(config.radial, 'perspective', 0);
  radialFolder.add(config.radial, 'speed', -1, 1);
  radialFolder.add(config.radial, 'dotCount', 0).onFinishChange(deleteRadialDots);
  radialFolder.add(config.radial, 'minDistance', 0, 1);
  radialFolder.add(config.radial, 'maxDistance', 0, 1);

  config.waves.forEach(function (wave, idx) {
    function deleteDots() {
      deleteWaveDots(idx);
    }

    var folder = gui.addFolder('Wave ' + (idx + 1));

    if (wave.enabled) {
      folder.open();
    }

    folder.add(wave, 'enabled');
    folder.add(wave, 'speed', -1, 1);
    folder.add(wave, 'horizPos', 0, 1);
    folder.add(wave, 'vertPos', 0, 1);
    folder.add(wave, 'length', 0, 1).onFinishChange(deleteDots);
    folder.add(wave, 'phase', 0, 1);
    folder.add(wave, 'period', 0, 1);
    folder.add(wave, 'amplitude', 0, 1);
    folder.add(wave, 'amplitudeJitter', 0, 1);
    folder.add(wave, 'spacingJitter', 0, 1).onFinishChange(deleteDots);
  });
};
