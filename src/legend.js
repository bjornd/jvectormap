jvm.Legend = function(params) {
  this.params = params || {};
  this.map = this.params.map;
  this.series = this.params.series;
  this.body = $('<div/>');
  this.body.addClass('jvectormap-legend');

  if (params.vertical) {
    this.map.legendCntVertical.append( this.body );
  } else {
    this.map.legendCntHorizontal.append( this.body );
  }

  this.render();
}

jvm.Legend.prototype.render = function(){
  var ticks = this.series.scale.getTicks(),
      i,
      sampleValue,
      inner = $('<div/>').addClass('jvectormap-legend-inner'),
      tick,
      sample;

  this.body.html('');
  this.body.append(inner);

  for (i = 0; i < ticks.length; i++) {
    tick = $('<div/>').addClass('jvectormap-legend-tick');
    sample = $('<div/>')
      .addClass('jvectormap-legend-tick-sample')
      .css('background', ticks[i].value);
    tick.append( sample );
    tick.append( $('<div>'+ticks[i].label+' </div>').addClass('jvectormap-legend-tick-text') );
    inner.append(tick);
  }
  inner.append( $('<div/>').css('clear', 'both') );
}