jvm.SVGPathElement = function(config){
  jvm.SVGPathElement.parentClass.call(this, 'path', config);
  this.node.setAttribute('fill-rule', 'evenodd');
}

jvm.inherits(jvm.SVGPathElement, jvm.SVGShapeElement);