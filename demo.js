window.onload = function () {
  function mixin(target, obj) {
    for (var p in obj) {
      var value = obj[p];

      if (value instanceof Array) {
        target[p] = target[p] || [];
        mixin(target[p], value);
      } else if (value instanceof Object) {
        target[p] = target[p] || {};
        mixin(target[p], value);
      } else {
        target[p] = value;
      }
    }
  }

  function encodeConfig(config) {
    return JSON.stringify(Object.assign({ v: 2 }, config))
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

  function normalizeConfig(config) {
    if (config.v !== 2) {
      config.logo.scale /= 945 * 2 / 2251;

      config.radialDots = Object.assign({}, config.dots);
      config.waveDots = Object.assign({}, config.dots);
      delete config.dots;

      config.sparkles.frequency *= 100;
      config.sparkles.width = config.sparkles.width / 945 / 2 * 100;
      config.sparkles.height = config.sparkles.height / 945 / 2 * 100;
      config.meteors.frequency *= 100;
      config.meteors.thickness = config.meteors.thickness / 945 / 2 * 100;
      config.radialDots.minRadius = config.radialDots.minRadius / 945 / 2 * 100;
      config.radialDots.maxRadius = config.radialDots.maxRadius / 945 / 2 * 100;
      config.waveDots.minRadius = config.waveDots.minRadius / 945 / 2 * 100;
      config.waveDots.maxRadius = config.waveDots.maxRadius / 945 / 2 * 100;
      config.waves.forEach(function (wave) {
        wave.speed = Math.pow(Math.pow(wave.speed, 3) / 945 / 2, 1 / 3) * 100;
      });
    }

    return config;
  }

  var config = new StarryNightConfig();

  if (document.location.hash) {
    try {
      mixin(config, normalizeConfig(decodeConfig(document.location.hash.slice(1))));
    } catch (err) {
      console.error(err);
      try {
        // Try legacy format
        mixin(config, normalizeConfig(JSON.parse(decodeURIComponent(document.location.hash.slice(1)))));
      } catch (err) {
        console.error(err);
        alert('Invalid config in hash, ignoring and using default config');
        document.location.hash = '';
      }
    }
  }

  console.log(JSON.stringify(config, null, 2));

  var canvas = document.getElementById('starry-night');
  var statsContainer = document.getElementById('stats');

  var logo = new Image();
  logo.src = 'logo.png';

  logo.onload = function () {
    var model = new StarryNightModel(config);
    var view = new StarryNightView(model, canvas, logo, config);
    var controller = new StarryNightController(model, view, config);

    window.onresize = view.resize;

    var gui = new StarryNightGui(model, config);

    gui.onResetConfig = function () {
      document.location.hash = '';
      document.location.reload();
    };

    gui.onShareConfig = function () {
      document.location.hash = encodeConfig(config);
    };

    gui.onPixelDensityChange = function () {
      view.resize();
    };

    var stats = new StarryNightStats(model, statsContainer);

    controller.onBeginRender = stats.begin;
    controller.onEndRender = stats.end;
  };
};
