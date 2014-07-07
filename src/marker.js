jvm.Marker = function(config){
  var addMethod = config.style.initial['image'] ? 'addImage' : 'addCircle',
      that = this;

  this.isImage = !!config.style.initial['image'];

  this.shape = config.canvas[addMethod]({
    "data-index": config.index,
    cx: config.cx,
    cy: config.cy
  }, config.style, config.group);

  if (this.isImage) {
    jvm.$(this.shape.node).on('imageloaded', function(){
      that.updateLabelPosition();
    });
  }

  this.labelX = config.cx;
  this.labelY = config.cy;
  this.text = config.canvas.addText({
    text: 'Marker ' + config.index,
    'data-index': config.index,
    'font-family': 'Verdana',
    'font-size': '12',
    'font-weight': 'bold',
    cursor: 'default',
    'alignment-baseline': 'central',
    x: this.labelX,
    y: this.labelY
  }, {}, config.labelsGroup);

  this.text.addClass('jvectormap-marker jvectormap-element');
  this.shape.addClass('jvectormap-marker jvectormap-element');
};

jvm.inherits(jvm.Marker, jvm.MapObject);

jvm.Marker.prototype.updateLabelPosition = function(transX, transY, scale){
  if (typeof transX === 'undefined') {
    transX = this.transX;
    transY = this.transY;
    scale = this.scale;
  } else {
    this.transX = transX;
    this.transY = transY;
    this.scale = scale;
  }
  this.text.set({
    x: this.labelX * scale + transX * scale + 5 + (this.isImage ? (this.shape.width || 0) / 2 : this.shape.properties.r),
    y: this.labelY * scale + transY * scale
  });
}

jvm.Marker.prototype.setStyle = function(name){
  jvm.Marker.parentClass.prototype.setStyle.apply(this, arguments);

  if (name === 'r') {
    this.updateLabelPosition();
  }
}