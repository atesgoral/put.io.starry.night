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

    listeners.onEndRender && listeners.onEndRender();
  }

  requestAnimationFrame(repaint);
}
