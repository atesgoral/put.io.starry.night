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

  var defaultConfig = {
    "pixelDensity": 0,
    "fps": {
      "throttle": true,
      "target": 30
    },
    "logo": {
      "scale": 0.6681539682539683
    },
    "sparkles": {
      "enabled": true,
      "frequency": 4,
      "age": 500,
      "width": 3.1746031746031744,
      "height": 5.291005291005291,
      "thickness": 0.1,
      "minDistance": 0.2,
      "maxDistance": 0.95
    },
    "meteors": {
      "enabled": true,
      "frequency": 0.5,
      "angle": 0.44,
      "age": 500,
      "length": 0.75,
      "thickness": 0.7407407407407408
    },
    "radialDots": {
      "minRadius": 0.26455026455026454,
      "maxRadius": 0.5291005291005291
    },
    "waveDots": {
      "minRadius": 0.26455026455026454,
      "maxRadius": 0.5291005291005291
    },
    "radial": {
      "enabled": true,
      "perspective": 1.5999999999999996,
      "speed": -0.1749095295536791,
      "dotCount": 100,
      "minDistance": 0.5890056867137687,
      "maxDistance": 0.95,
      "tapering": 0.14785455798724798
    },
    "waves": [
      {
        "enabled": true,
        "speed": 1.6176183350000002,
        "horizPos": 0.05962433224194382,
        "vertPos": 0.3353437876960193,
        "length": 0.5779769084956057,
        "phase": 0.7985524728588661,
        "period": 0.9308978114768224,
        "amplitude": 0.15,
        "amplitudeJitter": 0.25,
        "spacingJitter": 0.1,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": -1.6176183350000002,
        "horizPos": 0.5118042391866277,
        "vertPos": 0.6441495778045838,
        "length": 0.5,
        "phase": 0,
        "period": 1,
        "amplitude": 0.15,
        "amplitudeJitter": 0.25,
        "spacingJitter": 0.1,
        "tapering": 0.2
      },
      {
        "enabled": true,
        "speed": 2.1837847519999998,
        "horizPos": 0.13,
        "vertPos": 0.5448905738411166,
        "length": 0.41254523522316044,
        "phase": 0.158883336205411,
        "period": 0.3463725659141823,
        "amplitude": 0.23608478373255212,
        "amplitudeJitter": 0.22505600551438912,
        "spacingJitter": 0.12,
        "tapering": 0.2
      }
    ]
  };

  var config = defaultConfig;

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
    var starryNight = new StarryNightController(canvas, logo, config);

    var model = starryNight.model;

    starryNight.initialize();

    window.onresize = starryNight.view.resize;

    var gui = new StarryNightGui(config, starryNight.model);

    gui.onResetConfig = function () {
      document.location.hash = '';
      document.location.reload();
    };

    gui.onShareConfig = function () {
      document.location.hash = encodeConfig(config);
    };

    gui.onPixelDensityChange = function () {
      starryNight.view.resize();
    };

    var stats = new StarryNightStats(statsContainer, starryNight.model);

    starryNight.view.onBeginRender = stats.begin;
    starryNight.view.onEndRender = stats.end;
  };
};
