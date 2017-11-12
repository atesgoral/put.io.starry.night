function StarryNightController(model, view) {
  this.initialize = function () {
    view.initialize();

    model.createRadialDots();
    model.createAllWaveDots();
  };
}
