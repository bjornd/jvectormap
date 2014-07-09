jvm.Region = function(config){
  var bbox,
      text;

  this.config = config;

  this.shape = config.canvas.addPath({
    d: config.path,
    'data-code': config.code
  }, config.style, config.canvas.rootElement);
  this.shape.addClass('jvectormap-region jvectormap-element');

  bbox = this.shape.getBBox();

  text = this.getLabelText(config.code);
  if (this.config.label && text) {
    this.labelX = bbox.x + bbox.width / 2;
    this.labelY = bbox.y + bbox.height / 2;
    this.label = config.canvas.addText({
      text: text,
      'font-family': 'Verdana',
      'font-size': '12',
      'font-weight': 'bold',
      cursor: 'default',
      'text-anchor': 'middle',
      'alignment-baseline': 'central',
      x: this.labelX,
      y: this.labelY,
      'data-code': config.code
    }, {}, config.labelsGroup);
    this.label.addClass('jvectormap-region jvectormap-element');
  }
};

jvm.inherits(jvm.Region, jvm.MapObject);

jvm.Region.prototype.updateLabelPosition = function(transX, transY, scale){
  if (this.label) {
    this.label.set({
      x: this.labelX * scale + transX * scale,
      y: this.labelY * scale + transY * scale
    });
  }
}