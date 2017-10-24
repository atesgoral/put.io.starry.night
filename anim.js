window.onload = function () {
  var MIN_RADIUS = 5;
  var MAX_RADIUS = 12;

  function r() {
    return Math.random() * 2 - 1;
  }

  function getRadius(dot) {
    return MIN_RADIUS + (1 + dot.r) * (MAX_RADIUS - MIN_RADIUS) / 2;
  }

  function createPath(startP, startY, startX, endX, period, amplitute) {
    var path = {
      startP: startP,
      startY: startY,
      startX: startX,
      len: endX - startX,
      period: period,
      amplitute: amplitute,
      dots: []
    };

    var x = 0;

    while (x < path.len) {
      var dot = {
        a: r(), // amplitute
        r: r() // radius
      };

      var radius = getRadius(dot);
      var dotX = x + radius;

      dot.p = dotX / path.len;

      path.dots.push(dot);

      x += radius * 2 + Math.random() * path.len / 50;
    }

    return path;
  }

  var SCALE = 2;
  var canvas = document.getElementById('anim');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;

  var ctx = canvas.getContext('2d');

  var logo = new Image();
  logo.src = 'putio-logo-vektor-transparent.png';

  logo.onload = function () {
    var logoAspectRatio = logo.width / logo.height;

    var paths = [
      createPath(Math.PI, canvas.height * .1, 0, canvas.width / 2, Math.PI * 2, 100),
      createPath(0, canvas.height * .75, canvas.width / 2, canvas.width, Math.PI * 2, 60)
    ];

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'xor';

    function repaint(t) {
      setTimeout(function () {
        requestAnimationFrame(repaint);
      }, 1000 / 30);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        logo,
        0, 0, logo.width, logo.height,
        0, -canvas.height / 2, canvas.width, canvas.width / logoAspectRatio
      );

      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];

        for (var j = 0; j < path.dots.length; j++) {
          var dot = path.dots[j];

          // var x = (t / 10 + dot.p * canvas.width) % canvas.width;
          // var y = (Math.sin(x / 200) + dot.a / 3) * 60 + canvas.height / 2;

          var x = path.startX + (t / 40 + dot.p * path.len) % path.len;
          var y = (Math.sin(x / 200) + dot.a + path.startP) * path.amplitute + path.startY;

          ctx.beginPath();
          ctx.arc(x, y, getRadius(dot), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(repaint);
  };
};
