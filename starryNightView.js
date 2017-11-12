function StarryNightView(model, canvas, logo, config) {
  this.resize = function () {
    var pixelDensity = config.pixelDensity || window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * pixelDensity;
    canvas.height = canvas.offsetHeight * pixelDensity;
  };

  this.repaint = function (t) {
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'source-over';

    for (var i = 0; i < model.radialDots.length; i++) {
      var dot = model.radialDots[i];
      var a = dot.a * Math.PI * 2;

      var pos = t / 100 * Math.pow(config.radial.speed, 3) % 1;

      if (pos < 0) {
        pos += 1;
      }

      var dotD = (pos + dot.d) % 1;

      var dotD2 = 1 - dotD;
      var scale = dotD < config.radial.tapering
        ? dotD / config.radial.tapering
        : dotD2 < config.radial.tapering
          ? dotD2 / config.radial.tapering
          : 1;

      dotD = config.radial.minDistance + dotD * (config.radial.maxDistance - config.radial.minDistance);

      var dotR = (config.radialDots.minRadius + (1 + dot.r) * (config.radialDots.maxRadius - config.radialDots.minRadius) / 2) / 100 * canvas.width;

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

      var dots = model.waveDots[i] || [];

      var maxX = waveConfig.length * canvas.width;

      var pos = (t * Math.pow(waveConfig.speed / 100, 3) * canvas.width) % maxX;

      if (pos < 0) {
        pos += maxX;
      }

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
        var radius = (config.waveDots.minRadius + (1 + dot.r) * (config.waveDots.maxRadius - config.waveDots.minRadius) / 2) / 100 * canvas.width

        ctx.beginPath();
        ctx.arc(x, y, radius * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var logoAspectRatio = logo.width / logo.height;
    var logoW = canvas.width * config.logo.scale;
    var logoH = logoW / logoAspectRatio;

    ctx.globalCompositeOperation = 'xor';

    ctx.drawImage(
      logo,
      0, 0, logo.width, logo.height,
      (canvas.width - logoW) / 2, (canvas.height - logoH) / 2, logoW, logoH
    );

    ctx.globalCompositeOperation = 'source-over';

    var halfW = config.sparkles.width / 100 / 2 * canvas.width;
    var halfH = config.sparkles.height / 100 / 2 * canvas.width;
    var aspectRatio = config.sparkles.width / config.sparkles.height;
    var foldW = halfW * config.sparkles.thickness;
    var foldH = halfH * config.sparkles.thickness * aspectRatio;

    for (var i = model.sparkles.length; i--;) {
      var sparkle = model.sparkles[i];
      var age = t - sparkle.t;

      if (age > config.sparkles.age) {
        model.sparkles.splice(i, 1);
        model.totalObjects--;
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

    for (var i = model.meteors.length; i--;) {
      var meteor = model.meteors[i];
      var age = t - meteor.t;

      if (age > config.meteors.age + tailDuration) {
        model.meteors.splice(i, 1);
        model.totalObjects--;
        continue;
      }

      var x = (age / config.meteors.age - 0.5) * r * 2;
      var y = (meteor.p - 0.5) * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, config.meteors.thickness / 100 / 2 * canvas.width, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(x - config.meteors.length * canvas.width, y);
      ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (config.meteors.enabled && Math.random() < config.meteors.frequency / 100) {
      model.meteors.push({
        p: Math.random(),
        t: t
      });

      model.totalObjects++;
    }

    if (config.sparkles.enabled && Math.random() < config.sparkles.frequency / 100) {
      var a = Math.random() * Math.PI * 2;
      var d = config.sparkles.minDistance + Math.random() * (config.sparkles.maxDistance - config.sparkles.minDistance);

      model.sparkles.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        t: t
      });

      model.totalObjects++;
    }
  };
}
