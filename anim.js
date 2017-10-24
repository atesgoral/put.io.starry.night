window.onload = function () {
  var SCALE = 2;
  var canvas = document.getElementById('anim');

  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;

  var ctx = canvas.getContext('2d');

  var logo = new Image();
  logo.src = 'putio-logo-vektor-transparent.png';

  logo.onload = function () {
    var logoAspectRatio = logo.width / logo.height;

    var dots = [];

    for (var i = 0; i < 200; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        r: 10
      });
    }

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'xor';

    function repaint() {
      setTimeout(function () {
        requestAnimationFrame(repaint);
      }, 1000 / 30);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        logo,
        0, 0, logo.width, logo.height,
        0, -canvas.height / 2, canvas.width, canvas.width / logoAspectRatio
      );

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];

        dot.x = (dot.x + dot.vx) % canvas.width;
        dot.y = (dot.y + dot.vy) % canvas.height;
      }
    }

    repaint();
  };
};
