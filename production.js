window.onload = function () {
  var canvas = document.getElementById('starry-night');

  var logo = new Image();
  logo.src = 'logo.png';

  logo.onload = function () {
    var config = new StarryNightConfig();
    var model = new StarryNightModel(config);
    var view = new StarryNightView(model, canvas, logo, config);
    var controller = new StarryNightController(model, view, config);

    window.onresize = view.resize;
  };
};
