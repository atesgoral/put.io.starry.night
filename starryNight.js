function StarryNight(canvas, config) {
  this.canvas = canvas;
  //this.state
  this.resize();
}

StarryNight.prototype.resize = function () {
  this.canvas.width = this.canvas.offsetWidth * 2;
  this.canvas.height = this.canvas.offsetHeight * 2;
};
