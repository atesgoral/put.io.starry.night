function StarryNightController(model, view) {
  view.initialize();

  model.createRadialDots();
  model.createAllWaveDots();
}
