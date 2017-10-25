window.onload = function () {
  var config = {
    logo: {
      scale: 0.66
    },
    paths: [{
      enabled: true,
      speed: 0.2,
      horizPos: 0,
      vertPos: 0.3,
      length: 0.5,
      phase: 0.5,
      period: 1,
      amplitude: 0.15,
      amplitudeJitter: 0.25,
      horizJitter: 0.1
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
      horizJitter: 0.1
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
      horizJitter: 0.12
    }]
  };

  var MIN_RADIUS = 5;
  var MAX_RADIUS = 12;

  function r() {
    return Math.random() * 2 - 1;
  }

  function getRadius(dot) {
    return MIN_RADIUS + (1 + dot.r) * (MAX_RADIUS - MIN_RADIUS) / 2;
  }

  function createDots(path) {
    var x = 0;

    path.dots = [];

    var maxX = path.length * canvas.width;

    while (x < maxX) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = getRadius(dot);
      var dotX = x + radius;

      dot.p = dotX / maxX; // phase

      path.dots.push(dot);

      x += radius * 2 + Math.random() * path.horizJitter * path.horizJitter * canvas.width;
    }
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

      for (var i = 0; i < config.paths.length; i++) {
        var path = config.paths[i];

        if (!path.enabled) {
          continue;
        }

        if (!path.dots) {
          createDots(path);
        }

        var maxX = path.length * canvas.width;

        var pos = ((t * Math.pow(path.speed, 3) % maxX) + maxX) % maxX;

        for (var j = 0; j < path.dots.length; j++) {
          var dot = path.dots[j];

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

  var gui = new dat.GUI();

  var logoFolder = gui.addFolder('Logo');
  logoFolder.open();
  logoFolder.add(config.logo, 'scale', 0, 1);

  config.paths.forEach(function (path, idx) {
    var folder = gui.addFolder('Path ' + (idx + 1));
    folder.open();
    folder.add(path, 'enabled');
    folder.add(path, 'speed', -1, 1);
    folder.add(path, 'horizPos', 0, 1);
    folder.add(path, 'vertPos', 0, 1);
    folder.add(path, 'length', 0, 1).onChange(function () { path.dots = null; });
    folder.add(path, 'phase', 0, 1);
    folder.add(path, 'period', 0, 1);
    folder.add(path, 'amplitude', 0, 1);
    folder.add(path, 'amplitudeJitter', 0, 1);
    folder.add(path, 'horizJitter', 0, 1).onChange(function () { path.dots = null; });
  });
};
