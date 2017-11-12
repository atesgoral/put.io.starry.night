function StarryNightModel(config) {
  this.waveDots = [];
  this.radialDots = [];
  this.sparkles = [];
  this.meteors = [];
  this.totalObjects = 0;

  this.createRadialDots = function () {
    var dots = [];

    for (var i = 0; i < config.radial.dotCount; i++) {
      dots.push({
        a: Math.random(), // angle
        d: Math.random(), // distance from center
        r: Math.random() * 2 - 1
      });
    }

    this.totalObjects += dots.length;

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

    this.totalObjects += dots.length;

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

  this.deleteRadialDots = function () {
    if (this.radialDots) {
      this.totalObjects -= this.radialDots.length;
    }
    this.radialDots = [];
  };

  this.deleteWaveDots = function (idx) {
    if (this.waveDots[idx]) {
      this.totalObjects -= this.waveDots[idx].length;
    }
    this.waveDots[idx] = [];
  };

  this.deleteAllWaveDots = function () {
    if (this.waveDots) {
      for (var i = 0; i < this.waveDots.length; i++) {
        this.deleteWaveDots(i);
      }
    }
  };

  this.deleteSparkles = function () {
    this.totalObjects -= this.sparkles.length;
    this.sparkles = [];
  };

  this.deleteMeteors = function () {
    this.totalObjects -= this.meteors.length;
    this.meteors = [];
  };
}
