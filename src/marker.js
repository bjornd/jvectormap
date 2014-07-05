jvm.Marker = function(config){
  var addMethod = config.style.initial['image'] ? 'addImage' : 'addCircle';

	this.element = config.canvas.addGroup( config.group );
	this.element.set('data-index', config.index);

  this.shape = config.canvas[addMethod]({
    "data-index": config.index,
    cx: config.cx,
    cy: config.cy
  }, config.style, this.element);

  this.element.addClass('jvectormap-marker jvectormap-element');
};

jvm.inherits(jvm.Marker, jvm.MapObject);