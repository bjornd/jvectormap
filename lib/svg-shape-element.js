jvm.SVGShapeElement = function(name, config){
  jvm.SVGShapeElement.parentClass.call(this, name, config.id);
  delete config.id;
  this.properties = {};
  this.set(config);
}

jvm.inherits(jvm.SVGShapeElement, jvm.SVGElement);
jvm.mixin(jvm.SVGShapeElement, jvm.AbstractShapeElement);

/**
 * fill
 * fill-opacity
 * stroke
 * stroke-weight
 * stroke-opacity
 */