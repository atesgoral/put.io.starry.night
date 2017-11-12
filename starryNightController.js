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

    if (config.meteors.enabled) {
      model.cullMeteors(t);

      if (Math.random() < config.meteors.frequency / 100) {
        model.createMeteor(t);
      }
    }

    if (config.sparkles.enabled) {
      model.cullSparkles(t);

      if (Math.random() < config.sparkles.frequency / 100) {
        model.createSparkle(t);
      }
    }

    listeners.onEndRender && listeners.onEndRender();
  }

  requestAnimationFrame(repaint);
}
