jvm.AbstractElement = function(name, config){
  this.node = this.createElement(name);

  this.name = name;
  this.properties = {};
  this.set(config);
}

jvm.AbstractElement.prototype.set = function(property, value){
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

jvm.AbstractElement.prototype.get = function(property){
  return this.properties[property];
}

jvm.AbstractElement.prototype.applyAttr = function(property, value){
  this.node.setAttribute(property, value);
}