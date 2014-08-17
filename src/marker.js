jvm.Marker = function(config){
  var text;

  this.config = config;

  this.isImage = !!this.config.style.initial.image;
  this.createShape();

  text = this.getLabelText(config.index);
  if (this.config.label && text) {
    this.labelX = config.cx;
    this.labelY = config.cy;
    this.label = config.canvas.addText({
      text: text,
      'data-index': config.index,
      'alignment-baseline': 'central',
      x: this.labelX,
      y: this.labelY
    }, config.labelStyle, config.labelsGroup);

    this.label.addClass('jvectormap-marker jvectormap-element');
  }
};

jvm.inherits(jvm.Marker, jvm.MapObject);

jvm.Marker.prototype.createShape = function(){
  var that = this;

  if (this.shape) {
    this.shape.remove();
  }
  this.shape = this.config.canvas[this.isImage ? 'addImage' : 'addCircle']({
    "data-index": this.config.index,
    cx: this.config.cx,
    cy: this.config.cy
  }, this.config.style, this.config.group);

  this.shape.addClass('jvectormap-marker jvectormap-element');

  if (this.isImage) {
    jvm.$(this.shape.node).on('imageloaded', function(){
      that.updateLabelPosition();
    });
  }
}

jvm.Marker.prototype.updateLabelPosition = function(transX, transY, scale){
  if (this.label) {
    if (typeof transX === 'undefined') {
      transX = this.transX;
      transY = this.transY;
      scale = this.scale;
    } else {
      this.transX = transX;
      this.transY = transY;
      this.scale = scale;
    }
    this.label.set({
      x: this.labelX * scale + transX * scale + 5 + (this.isImage ? (this.shape.width || 0) / 2 : this.shape.properties.r),
      y: this.labelY * scale + transY * scale
    });
  }
}

jvm.Marker.prototype.setStyle = function(property, value){
  var isImage;

  jvm.Marker.parentClass.prototype.setStyle.apply(this, arguments);

  if (property === 'r') {
    this.updateLabelPosition();
  }

  isImage = !!this.shape.get('image');
  if (isImage != this.isImage) {
    this.isImage = isImage;
    this.config.style = jvm.$.extend(true, {}, this.shape.style);
    this.createShape();
  }
}