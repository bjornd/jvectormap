jvm.SVGElement = function(name, id){
  jvm.SVGElement.parentClass.apply(this, arguments);
}

jvm.inherits(jvm.SVGElement, jvm.AbstractElement);

jvm.SVGElement.svgns = "http://www.w3.org/2000/svg";

jvm.SVGElement.prototype.createElement = function( tagName ){
  return document.createElementNS( jvm.SVGElement.svgns, tagName );
}

jvm.SVGElement.prototype.addClass = function( className ){
  this.node.setAttribute('class', className);
}

jvm.SVGElement.prototype.getElementCtr = function( ctr ){
  return jvm['SVG'+ctr];
}