jvm.DataSeries = function(params, elements) {
  var scaleConstructor;

  params = params || {};
  params.attribute = params.attribute || 'fill';
  params.scale = params.scale || ['#C8EEFF', '#0071A4'];

  scaleConstructor = params.attribute === 'fill' || params.attribute === 'stroke' ? jvm.ColorScale : jvm.NumericScale

  this.elements = elements;
  this.params = params;

  if (params.attributes) {
    this.setAttributes(params.attributes);
  }

  this.scale = new scaleConstructor(params.scale, params.normalizeFunction, params.min, params.max);
  if (params.values) {
    this.values = params.values;
    this.setValues(params.values);
  }
}

jvm.DataSeries.prototype = {
  setAttributes: function(key, attr){
    var attrs = key,
        code;

    if (typeof key == 'string') {
      this.elements[key].setStyle(this.params.attribute, attr);
    } else {
      for (code in attrs) {
        if (this.elements[code]) {
          this.elements[code].element.setStyle(this.params.attribute, attrs[code]);
        }
      }
    }
  },

  setValues: function(values) {
    var max = Number.MIN_VALUE,
        min = Number.MAX_VALUE,
        val,
        cc,
        attrs = {};

    if (!this.params.min || !this.params.max) {
      for (cc in values) {
        val = parseFloat(values[cc]);
        if (val > max) max = values[cc];
        if (val < min) min = val;
      }
    }
    if (!this.params.min) {
      this.scale.setMin(min);
    }
    if (!this.params.max) {
      this.scale.setMax(max);
    }

    for (cc in values) {
      val = parseFloat(values[cc]);
      if (val) {
        attrs[cc] = this.scale.getValue(val);
      } else {
        attrs[cc] = this.elements[cc].element.style.initial[this.params.attribute];
      }
    }
    this.setAttributes(attrs);
    this.values = values;
  },

  setScale: function(colors) {
    this.colorScale.setColors(colors);
    if (this.values) {
      this.setValues(this.values);
    }
  },

  setNormalizeFunction: function(f) {
    this.colorScale.setNormalizeFunction(f);
    if (this.values) {
      this.setValues(this.values);
    }
  }
}