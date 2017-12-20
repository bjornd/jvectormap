/**
 * Created by fdominik
 */
jvm.Line = function(config){
  var text,name,points;

  this.config = config;
  this.map = this.config.map;

  this.isImage = !!this.config.style.initial.image;
  this.createShape();

  text = this.getLabelText(config.index);
  if (this.config.label && text) {
    this.offsets = this.getLabelOffsets(config.index);
    this.labelX = this.config.sx + this.offsets[0];// / this.map.scale - this.map.transX;
    this.labelY = this.config.sy + this.offsets[1];// / this.map.scale - this.map.transY;
    this.label = config.canvas.addText({
      text: text,
      'data-index': config.index,
      dy: "0.6ex",
      x: this.labelX,
      y: this.labelY
    }, config.labelStyle, config.labelsGroup);

    this.label.addClass('jvectormap-line jvectormap-element');
  }
};

jvm.inherits(jvm.Line, jvm.MapObject);

jvm.Line.prototype.createShape = function(){
  var that = this;

  if (this.shape) {
    this.shape.remove();
  }
  this.shape = this.config.canvas.addPath({
    d: this.config.path,
      'data-index':this.config.index
  }, this.config.style, this.config.group);

  this.shape.addClass('jvectormap-line jvectormap-element');

  if (this.isImage) {
    jvm.$(this.shape.node).on('imageloaded', function(){
      that.updateLabelPosition();
    });
  }
};

jvm.Line.prototype.updateLabelPosition = function(){
  if (this.label) {
    this.label.set({
        x: this.labelX * this.map.scale + this.map.transX * this.map.scale,
        y: this.labelY * this.map.scale + this.map.transY * this.map.scale
    });
  }
};