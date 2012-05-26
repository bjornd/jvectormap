jvm.AbstractShapeElement = function(){
}

jvm.AbstractShapeElement.prototype.set = function(property, value){
  var key;

  if (typeof property === 'object') {
    for (key in property) {
      this.properties[key] = property[key];
      this.applyAttr(key, property[key]);
    }
  } else {
    this.properties[property] = value;
    this.applyAttr(property, value);
  }
}

jvm.AbstractShapeElement.prototype.applyAttr = function(property, value){
  this.node.setAttribute(property, value);
}

jvm.AbstractShapeElement.prototype.get = function(property){
  return this.properties[property];
}