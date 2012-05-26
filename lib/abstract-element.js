jvm.AbstractElement = function(name, id){
  this.node = this.createElement(name);

  this.name = name;
  if (id) {
    this.node.id = id;
  }
}