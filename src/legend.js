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
  var ticks = this.getTicks(),
      i,
      sampleValue,
      inner = $('<div/>').addClass('jvectormap-legend-inner'),
      tick,
      sample;

  this.body.html('');
  this.body.append(inner);

  for (i = 0; i < ticks.length; i++) {
    tick = $('<div/>').addClass('jvectormap-legend-tick');
    if (i == 0) {
      sampleValue = this.series.scale.clearMinValue;
    } else if (i == ticks.length - 1) {
      sampleValue = this.series.scale.clearMaxValue;
    } else {
      sampleValue = ticks[i];
    }
    sample = $('<div/>')
      .addClass('jvectormap-legend-tick-sample')
      .css('background', this.series.scale.getValue(sampleValue));
    tick.append( sample );
    tick.append( $('<div>'+ticks[i]+' </div>').addClass('jvectormap-legend-tick-text') );
    inner.append(tick);
  }
  inner.append( $('<div/>').css('clear', 'both') );
}

/* Derived from d3 implementation https://github.com/mbostock/d3/blob/master/src/scale/linear.js#L94 */
jvm.Legend.prototype.getTicks = function(){
  var m = 5,
      extent = [this.series.scale.clearMinValue, this.series.scale.clearMaxValue],
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step,
      ticks = [],
      tick;

  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  extent[0] = Math.floor(extent[0] / step) * step;
  extent[1] = Math.ceil(extent[1] / step) * step;

  tick = extent[0];
  while (tick <= extent[1]) {
    ticks.push(tick);
    tick += step;
  }

  return ticks;
}