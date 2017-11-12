function StarryNightStats(container, model) {
  var stats = new Stats();
  var totalObjectsPanel = stats.addPanel(new Stats.Panel('T', '#ff8', '#221'));

  container.appendChild(stats.domElement);

  setInterval(function () {
    totalObjectsPanel.update(model.totalObjects, 1000);
  }, 100);

  this.begin = stats.begin;
  this.end = stats.end;
}
