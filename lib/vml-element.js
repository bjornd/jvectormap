/**
 * The following method of VML handling is borrowed from the
 * Raphael library by Dmitry Baranovsky.
 */
jvm.VMLElement = function(name, id){
  if (!jvm.VMLElement.VMLInitialized) {
    jvm.VMLElement.initializeVML();
  }

  jvm.VMLElement.parentClass.apply(this, arguments);
}

jvm.inherits(jvm.VMLElement, jvm.AbstractElement);

jvm.VMLElement.VMLInitialized = false;

jvm.VMLElement.initializeVML = function(){
  try {
    if (!document.namespaces.rvml) {
      document.namespaces.add("rvml","urn:schemas-microsoft-com:vml");
    }
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<rvml:' + tagName + ' class="rvml">');
    };
  } catch (e) {
    jvm.VMLElement.prototype.createElement = function (tagName) {
      return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
    };
  }
  document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
  jvm.VMLElement.VMLInitialized = true;
}

jvm.VMLElement.prototype.getElementCtr = function( ctr ){
  return jvm['VML'+ctr];
}

jvm.VMLElement.prototype.addClass = function( className ){
  $(this.node).addClass(className);
}

jvm.VMLElement.prototype.applyAttr = function( attr, value ){
  this.node[attr] = value;
}

jvm.VMLElement.prototype.getBBox = function(){
  var node = $(this.node);
  return {
    x: node.position().left / this.canvas.scale,
    y: node.position().top / this.canvas.scale,
    width: node.width() / this.canvas.scale,
    height: node.height() / this.canvas.scale
  };
}