jvm.AbstractShapeElement = function(name, config, style){
  this.style = style || {};
  this.style.current = {};
  this.isHovered = false;
  this.isSelected = false;
  this.updateStyle();
}

jvm.AbstractShapeElement.prototype.setHovered = function(isHovered){
  if (this.isHovered !== isHovered) {
    this.isHovered = isHovered;
    this.updateStyle();
  }
}

jvm.AbstractShapeElement.prototype.setSelected = function(isSelected){
  if (this.isSelected !== isSelected) {
    this.isSelected = isSelected;
    this.updateStyle();
  }
}

jvm.AbstractShapeElement.prototype.setStyle = function(property, value){
  var styles = {};

  if (typeof property === 'object') {
    styles = property;
  } else {
    styles[property] = value;
  }
  $.extend(this.style.current, styles);
  this.updateStyle();
}


jvm.AbstractShapeElement.prototype.updateStyle = function(){
  var attrs = {};

  $.extend(attrs, this.style.initial || {});
  $.extend(attrs, this.style.current || {});
  if (this.isHovered) {
    $.extend(attrs, this.style.hover || {});
  }
  if (this.isSelected) {
    $.extend(attrs, this.style.selected || {});
    if (this.isHovered) {
      $.extend(attrs, this.style.selectedHover || {});
    }
  }
  this.set(attrs);
}