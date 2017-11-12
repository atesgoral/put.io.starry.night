function StarryNightStats(model, container) {
  var stats = new Stats();
  var totalObjectsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));

  container.appendChild(stats.domElement);

  setInterval(function () {
    totalObjectsPanel.update(model.getTotalObjects(), 1000);
  }, 100);

  this.begin = stats.begin;
  this.end = stats.end;
}
