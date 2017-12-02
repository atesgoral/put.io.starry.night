function StarryNightGui(model, config) {
  var listeners = this;

  var actions = {
    reset: function () {
      listeners.onResetConfig && listeners.onResetConfig();
    },
    share: function () {
      listeners.onShareConfig && listeners.onShareConfig();
    }
  };

  var gui = new dat.GUI();

  gui.add(actions, 'reset').name('Reset');
  gui.add(actions, 'share').name('Share');

  gui.add(config, 'pixelRatio', 0).onFinishChange(function () {
    listeners.onPixelRatioChange && listeners.onPixelRatioChange();
  });

  var fpsFolder = gui.addFolder('FPS');
  fpsFolder.open();
  fpsFolder.add(config.fps, 'throttle');
  fpsFolder.add(config.fps, 'target', 1, 60);

  var logoFolder = gui.addFolder('Logo');
  logoFolder.open();
  logoFolder.add(config.logo, 'scale', 0, 1);

  var sparklesFolder = gui.addFolder('Sparkles');
  sparklesFolder.open();
  sparklesFolder.add(config.sparkles, 'enabled').onFinishChange(function (enabled) {
    if (!enabled) {
      model.deleteSparkles();
    }
  });
  sparklesFolder.add(config.sparkles, 'frequency', 0, 100);
  sparklesFolder.add(config.sparkles, 'age', 0);
  sparklesFolder.add(config.sparkles, 'width', 0);
  sparklesFolder.add(config.sparkles, 'height', 0);
  sparklesFolder.add(config.sparkles, 'thickness', 0, 1);
  sparklesFolder.add(config.sparkles, 'minDistance', 0, 1);
  sparklesFolder.add(config.sparkles, 'maxDistance', 0, 1);

  var meteorsFolder = gui.addFolder('Meteors');
  meteorsFolder.open();
  meteorsFolder.add(config.meteors, 'enabled').onFinishChange(function (enabled) {
    if (!enabled) {
      model.deleteMeteors();
    }
  });
  meteorsFolder.add(config.meteors, 'frequency', 0, 100);
  meteorsFolder.add(config.meteors, 'angle', 0, 1);
  meteorsFolder.add(config.meteors, 'age', 0);
  meteorsFolder.add(config.meteors, 'length', 0);
  meteorsFolder.add(config.meteors, 'thickness', 0);

  var radialDotsFolder = gui.addFolder('Radial Dots');
  // radialDotsFolder.open();
  radialDotsFolder.add(config.radialDots, 'minRadius', 0);
  radialDotsFolder.add(config.radialDots, 'maxRadius', 0);

  var waveDotsFolder = gui.addFolder('Wave Dots');
  // waveDotsFolder.open();
  waveDotsFolder.add(config.waveDots, 'minRadius', 0).onFinishChange(function () {
    model.deleteAllWaveDots();
    model.createAllWaveDots();
  });
  waveDotsFolder.add(config.waveDots, 'maxRadius', 0).onFinishChange(function () {
    model.deleteAllWaveDots();
    model.createAllWaveDots();
  });

  var radialFolder = gui.addFolder('Radial');
  radialFolder.open();
  radialFolder.add(config.radial, 'enabled').onFinishChange(function (enabled) {
    if (enabled) {
      model.createRadialDots();
    } else {
      model.deleteRadialDots();
    }
  });
  radialFolder.add(config.radial, 'perspective', 0);
  radialFolder.add(config.radial, 'speed', -1, 1);
  radialFolder.add(config.radial, 'dotCount', 0).onFinishChange(function () {
    model.deleteRadialDots();
    model.createRadialDots();
  });
  radialFolder.add(config.radial, 'minDistance', 0, 1);
  radialFolder.add(config.radial, 'maxDistance', 0, 1);
  radialFolder.add(config.radial, 'tapering', 0, 1);

  config.waves.forEach(function (waveConfig, idx) {
    var folder = gui.addFolder('Wave ' + (idx + 1));

    if (waveConfig.enabled) {
      folder.open();
    }

    folder.add(waveConfig, 'enabled').onFinishChange(function (enabled) {
      if (enabled) {
        model.createWaveDots(idx);
      } else {
        model.deleteWaveDots(idx);
      }
    });
    folder.add(waveConfig, 'speed');
    folder.add(waveConfig, 'horizPos', 0, 1);
    folder.add(waveConfig, 'vertPos', 0, 1);
    folder.add(waveConfig, 'length', 0, 1).onFinishChange(function () {
      if (waveConfig.enabled) {
        model.deleteWaveDots(idx);
        model.createWaveDots(idx);
      }
    });
    folder.add(waveConfig, 'phase', 0, 1);
    folder.add(waveConfig, 'period', 0, 1);
    folder.add(waveConfig, 'amplitude', 0, 1);
    folder.add(waveConfig, 'amplitudeJitter', 0, 1);
    folder.add(waveConfig, 'spacingJitter', 0, 1).onFinishChange(function () {
      if (waveConfig.enabled) {
        model.deleteWaveDots(idx);
        model.createWaveDots(idx);
      }
    });
    folder.add(waveConfig, 'tapering', 0, 1);
  });
}
