jvm.Region = function(config){
  var bbox;

  this.shape = config.canvas.addPath({
    d: config.path,
    'data-code': config.code
  }, config.style, config.canvas.rootElement);

  bbox = this.shape.getBBox();

  this.labelX = bbox.x + bbox.width / 2;
  this.labelY = bbox.y + bbox.height / 2;
  this.text = config.canvas.addText({
    text: config.code,
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

  this.shape.addClass('jvectormap-region jvectormap-element');
  this.text.addClass('jvectormap-region jvectormap-element');
};

jvm.inherits(jvm.Region, jvm.MapObject);

jvm.Region.prototype.updateLabelPosition = function(transX, transY, scale){
  this.text.set({
    x: this.labelX * scale + transX * scale,
    y: this.labelY * scale + transY * scale
  });
}