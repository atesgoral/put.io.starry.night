function StarryNightController(canvas, logo, config) {
  var model = new StarryNightModel(config);
  var view = new StarryNightView(canvas, logo, config, model);

  this.model = model;
  this.view = view;

  this.initialize = function () {
    view.initialize();

    model.createRadialDots();
    model.createAllWaveDots();
  };
}
