(function () {
  var global = this;

  function StarryNight(canvas, config) {
    this.resize = function () {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };

    this.resize();
  }

  global.StarryNight = StarryNight;
})();
