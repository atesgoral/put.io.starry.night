function StarryNightModel(config) {
  this.waveDots = [];
  this.radialDots = [];
  this.sparkles = [];
  this.meteors = [];

  this.getTotalObjects = function () {
    return this.waveDots.reduce(function (total, dots) { return total + dots.length; }, 0)
      + this.radialDots.length
      + this.sparkles.length
      + this.meteors.length;
  };

  this.createRadialDots = function () {
    var dots = [];

    for (var i = 0; i < config.radial.dotCount; i++) {
      dots.push({
        a: Math.random(), // angle
        d: Math.random(), // distance from center
        r: Math.random() * 2 - 1
      });
    }

    this.radialDots = dots;
  };

  this.createWaveDots = function (idx) {
    var waveConfig = config.waves[idx];
    var dots = [];

    var x = 0;

    while (x < waveConfig.length) {
      var dot = {
        a: Math.random() * 2 - 1, // amplitute
        r: Math.random() * 2 - 1 // radius
      };

      var radius = (config.waveDots.minRadius + (1 + dot.r) * (config.waveDots.maxRadius - config.waveDots.minRadius) / 2) / 100;

      dot.p = (x + radius) / waveConfig.length; // phase

      dots.push(dot);

      x += radius * 2 + Math.random() * waveConfig.spacingJitter * waveConfig.spacingJitter;
    }

    this.waveDots[idx] = dots;
  };

  this.createAllWaveDots = function () {
    for (var idx = 0; idx < config.waves.length; idx++) {
      if (config.waves[idx].enabled) {
        this.createWaveDots(idx);
      } else {
        this.waveDots[idx] = [];
      }
    }
  };

  this.createMeteor = function (t) {
    this.meteors.push({
      p: Math.random(),
      t: t
    });
  };

  this.createSparkle = function (t) {
    var a = Math.random() * Math.PI * 2;
    var d = config.sparkles.minDistance + Math.random() * (config.sparkles.maxDistance - config.sparkles.minDistance);

    this.sparkles.push({
      x: Math.cos(a) * d,
      y: Math.sin(a) * d,
      t: t
    });
  };

  this.cullMeteors = function (t) {
    this.meteors = this.meteors.filter(function (meteor) {
      return t - meteor.t <= config.meteors.age * (1 + config.meteors.length);
    });
  };

  this.cullSparkles = function (t) {
    this.sparkles = this.sparkles.filter(function (sparkle) {
      return t - sparkle.t <= config.sparkles.age;
    });
  };

  this.deleteRadialDots = function () {
    this.radialDots = [];
  };

  this.deleteWaveDots = function (idx) {
    this.waveDots[idx] = [];
  };

  this.deleteAllWaveDots = function () {
    for (var i = 0; i < this.waveDots.length; i++) {
      this.deleteWaveDots(i);
    }
  };

  this.deleteSparkles = function () {
    this.sparkles = [];
  };

  this.deleteMeteors = function () {
    this.meteors = [];
  };
}
