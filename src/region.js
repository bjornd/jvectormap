jvm.Region = function(config){
	this.element = config.canvas.addGroup( config.canvas.rootElement );
	this.element.set('data-code', config.code);

  this.shape = config.canvas.addPath({
    d: config.path
  }, config.style, this.element);

  this.element.addClass('jvectormap-region jvectormap-element');
};

jvm.inherits(jvm.Region, jvm.MapObject);