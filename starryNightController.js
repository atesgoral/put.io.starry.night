function StarryNightController(model, view, config) {
  var listeners = this; // Treat it as a facade

  view.resize();

  model.createRadialDots();
  model.createAllWaveDots();

  function repaint(t) {
    listeners.onBeginRender && listeners.onBeginRender();

    if (config.fps.throttle) {
      setTimeout(function () {
        requestAnimationFrame(repaint);
      }, 1000 / config.fps.target);
    } else {
      requestAnimationFrame(repaint);
    }

    view.repaint(t);

    // @todo model.cullMeteors()
    if (config.meteors.enabled) {
      model.meteors = model.meteors.filter(function (meteor) {
        return t - meteor.t <= config.meteors.age * (1 + config.meteors.length);
      });
    }

    // @todo model.createMeteor()
    if (config.meteors.enabled && Math.random() < config.meteors.frequency / 100) {
      model.meteors.push({
        p: Math.random(),
        t: t
      });
    }

    // @todo model.cullSparkles()
    if (config.sparkles.enabled) {
      model.sparkles = model.sparkles.filter(function (sparkle) {
        return t - sparkle.t <= config.sparkles.age;
      });
    }

    // @todo model.createSparkle()
    if (config.sparkles.enabled && Math.random() < config.sparkles.frequency / 100) {
      var a = Math.random() * Math.PI * 2;
      var d = config.sparkles.minDistance + Math.random() * (config.sparkles.maxDistance - config.sparkles.minDistance);

      model.sparkles.push({
        x: Math.cos(a) * d,
        y: Math.sin(a) * d,
        t: t
      });
    }

    listeners.onEndRender && listeners.onEndRender();
  }

  requestAnimationFrame(repaint);
}
