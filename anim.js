window.onload = function () {
  var config = {
    logo: {
      scale: 0.5
    },
    // sparkles: {
    //   frequency: 0.5
    // },
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
    paths: [{
      enabled: false,
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
      enabled: false,
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

  var pathDots = [];
  var radialDots = null;
  var sparkles = [];

  function r() {
    return Math.random() * 2 - 1;
  }

  function getRadius(dot) {
    return config.dots.minRadius + (1 + dot.r) * (config.dots.maxRadius - config.dots.minRadius) / 2;
  }

  function createPathDots(path) {
    var x = 0;

    var dots = [];

    var maxX = path.length * canvas.width;

    while (x < maxX) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = getRadius(dot);
      var dotX = x + radius;

      dot.p = dotX / maxX; // phase

      dots.push(dot);

      x += radius * 2 + Math.random() * path.spacingJitter * path.spacingJitter * canvas.width;
    }

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
      setTimeout(function () {
        requestAnimationFrame(repaint);
      }, 1000 / 30);

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
      }

      for (var i = 0; i < config.paths.length; i++) {
        var path = config.paths[i];

        if (!path.enabled) {
          continue;
        }

        var dots = pathDots[i];

        if (!dots) {
          dots = pathDots[i] = createPathDots(path);
        }

        var maxX = path.length * canvas.width;

        var pos = ((t * Math.pow(path.speed, 3) % maxX) + maxX) % maxX; // @todo normalize to 1?

        for (var j = 0; j < dots.length; j++) {
          var dot = dots[j];

          var dotX = (pos + dot.p * maxX) % maxX;
          var x = path.horizPos * canvas.width + dotX;
          var y = (
            (
              Math.sin(
                (dotX / maxX * path.period + path.phase) * Math.PI * 2
              )
            ) * path.amplitude + dot.a * path.amplitudeJitter * path.amplitudeJitter
            + path.vertPos
          ) * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, getRadius(dot), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(repaint);
  };

  function deleteAllPathDots() {
    pathDots = [];
  }

  function deleteRadialDots() {
    radialDots = null;
  }

  var gui = new dat.GUI();

  var logoFolder = gui.addFolder('Logo');
  logoFolder.open();
  logoFolder.add(config.logo, 'scale', 0, 1);

  // var sparklesFolder = gui.addFolder('Sparkles');
  // sparklesFolder.open();
  // sparklesFolder.add(config.sparkles, 'frequency');

  var dotsFolder = gui.addFolder('Dots');
  // dotsFolder.open();
  dotsFolder.add(config.dots, 'minRadius', 0).onChange(deleteAllPathDots);
  dotsFolder.add(config.dots, 'maxRadius', 0).onChange(deleteAllPathDots);

  var radialFolder = gui.addFolder('Radial');
  radialFolder.open();
  radialFolder.add(config.radial, 'enabled');
  radialFolder.add(config.radial, 'perspective', 0);
  radialFolder.add(config.radial, 'speed', -1, 1);
  radialFolder.add(config.radial, 'dotCount', 0).onChange(deleteRadialDots);
  radialFolder.add(config.radial, 'minDistance', 0, 1);
  radialFolder.add(config.radial, 'maxDistance', 0, 1);

  config.paths.forEach(function (path, idx) {
    function deleteDots() {
      pathDots[idx] = null;
    }

    var folder = gui.addFolder('Path ' + (idx + 1));

    if (path.enabled) {
      folder.open();
    }

    folder.add(path, 'enabled');
    folder.add(path, 'speed', -1, 1);
    folder.add(path, 'horizPos', 0, 1);
    folder.add(path, 'vertPos', 0, 1);
    folder.add(path, 'length', 0, 1).onChange(deleteDots);
    folder.add(path, 'phase', 0, 1);
    folder.add(path, 'period', 0, 1);
    folder.add(path, 'amplitude', 0, 1);
    folder.add(path, 'amplitudeJitter', 0, 1);
    folder.add(path, 'spacingJitter', 0, 1).onChange(deleteDots);
  });
};
