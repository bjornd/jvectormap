/**
 * Render map, bind events.
 * @constructor
 * @param {Object} params
 */
jvm.WorldMap = function(params) {
  var map = this,
      mapData = jvm.WorldMap.maps[params.map];

  params = params || {};

  this.params = params;

  this.container = params.container;

  this.defaultWidth = mapData.width;
  this.defaultHeight = mapData.height;

  this.color = params.color;
  this.hoverColor = params.hoverColor;
  this.setBackgroundColor(params.backgroundColor);

  this.width = params.container.width();
  this.height = params.container.height();

  this.resize();

  $(window).resize(function(){
    map.width = params.container.width();
    map.height = params.container.height();
    map.resize();
    map.canvas.setSize(map.width, map.height);
    map.applyTransform();
  });

  this.canvas = new jvm.VectorCanvas(params.container[0], this.width, this.height);

  this.makeDraggable();

  this.index = jvm.WorldMap.mapIndex;
  this.label = $('<div/>').addClass('jvectormap-label').appendTo($('body'));
  $('<div/>').addClass('jvectormap-zoomin').text('+').appendTo(params.container);
  $('<div/>').addClass('jvectormap-zoomout').html('&#x2212;').appendTo(params.container);

  for(var key in mapData.paths) {
    map.regions[key] = this.canvas.addPath({
      d: mapData.paths[key].path,
      fill: this.color,
      "data-code": key
    });
    map.regions[key].addClass('jvectormap-region');
  }

  $(params.container).delegate('.jvectormap-region, .jvectormap-marker', 'mouseover mouseout', function(e){
    var path = this,
        type = $(this).attr('class').indexOf('jvectormap-region') === -1 ? 'marker' : 'region',
        code = type == 'region' ? $(this).attr('data-code') : $(this).attr('data-index'),
        element = type == 'region' ? map.regions[code] : map.markers[code].element,
        labelText = type == 'region' ? mapData.paths[code].name : (map.markers[code].config.name || ''),
        labelShowEvent = $.Event(type+'LabelShow.jvectormap'),
        overEvent = $.Event(type+'Over.jvectormap');

    if (e.type == 'mouseover') {
      $(params.container).trigger(overEvent, [code]);
      if (!overEvent.isDefaultPrevented()) {
        if (params.hoverOpacity) {
          element.set('fill-opacity', params.hoverOpacity);
        }
        if (params.hoverColor) {
          element.currentFillColor = element.get('fill');
          element.set('fill', params.hoverColor);
        }
      }

      map.label.text(labelText);
      $(params.container).trigger(labelShowEvent, [map.label, code]);
      if (!labelShowEvent.isDefaultPrevented()) {
        map.label.show();
        map.labelWidth = map.label.width();
        map.labelHeight = map.label.height();
      }
    } else {
      if (params.hoverOpacity) {
        element.set('fill-opacity', 1);
      }
      if (element.currentFillColor) {
        element.set('fill', element.currentFillColor);
      }
      map.label.hide();
      $(params.container).trigger(type+'Out.jvectormap', [code]);
    }
  });

  $(params.container).delegate('.jvectormap-region, .jvectormap-marker', 'click', function(e){
    var path = this,
        type = $(this).attr('class').indexOf('jvectormap-region') === -1 ? 'marker' : 'region',
        code = type == 'region' ? $(this).attr('data-code') : $(this).attr('data-index');

    $(params.container).trigger(type+'Click.jvectormap', [code]);
  });

  params.container.mousemove(function(e){
    if (map.label.is(':visible')) {
      map.label.css({
        left: e.pageX-15-map.labelWidth,
        top: e.pageY-15-map.labelHeight
      })
    }
  });

  this.setColors(params.colors);

  if (params.markers) {
    this.createMarkers(params.markers);
  }

  this.colorScale = new jvm.ColorScale(params.scaleColors, params.normalizeFunction, params.valueMin, params.valueMax);
  if (params.values) {
    this.values = params.values;
    this.setValues(params.values);
  }

  this.bindZoomButtons();

  this.canvas.setSize(this.width, this.height);
  this.applyTransform();

  jvm.WorldMap.mapIndex++;
}

jvm.WorldMap.prototype = {
  transX: 0,
  transY: 0,
  scale: 1,
  baseTransX: 0,
  baseTransY: 0,
  baseScale: 1,

  width: 0,
  height: 0,
  regions: {},
  regionsColors: {},
  regionsData: {},
  zoomStep: 1.4,
  zoomMaxStep: 4,
  zoomCurStep: 1,

  setColors: function(key, color) {
    var colors = key,
        code;

    if (typeof key == 'string') {
      this.regions[key].set('fill', color);
    } else {
      for (code in colors) {
        if (this.regions[code]) {
          this.regions[code].set('fill', colors[code]);
        }
      }
    }
  },

  setValues: function(values) {
    var max = 0,
      min = Number.MAX_VALUE,
      val;

    for (var cc in values) {
      val = parseFloat(values[cc]);
      if (val > max) max = values[cc];
      if (val && val < min) min = val;
    }
    this.colorScale.setMin(min);
    this.colorScale.setMax(max);

    var colors = {};
    for (cc in values) {
      val = parseFloat(values[cc]);
      if (val) {
        colors[cc] = this.colorScale.getColor(val);
      } else {
        colors[cc] = this.color;
      }
    }
    this.setColors(colors);
    this.values = values;
  },

  setBackgroundColor: function(backgroundColor) {
    this.container.css('background-color', backgroundColor);
  },

  setScaleColors: function(colors) {
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
  },

  resize: function() {
    var curBaseScale = this.baseScale;
    if (this.width / this.height > this.defaultWidth / this.defaultHeight) {
      this.baseScale = this.height / this.defaultHeight;
      this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale);
    } else {
      this.baseScale = this.width / this.defaultWidth;
      this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale);
    }
    this.scale *= this.baseScale / curBaseScale;
    this.transX *= this.baseScale / curBaseScale;
    this.transY *= this.baseScale / curBaseScale;
  },

  reset: function() {
    this.countryTitle.reset();
    for(var key in this.regions) {
      this.regions[key].set('fill', jvm.WorldMap.defaultColor);
    }
    this.scale = this.baseScale;
    this.transX = this.baseTransX;
    this.transY = this.baseTransY;
    this.applyTransform();
  },

  applyTransform: function() {
    var maxTransX, maxTransY, minTransX, maxTransY;
    if (this.defaultWidth * this.scale <= this.width) {
      maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
      minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
    } else {
      maxTransX = 0;
      minTransX = (this.width - this.defaultWidth * this.scale) / this.scale;
    }

    if (this.defaultHeight * this.scale <= this.height) {
      maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
      minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
    } else {
      maxTransY = 0;
      minTransY = (this.height - this.defaultHeight * this.scale) / this.scale;
    }

    if (this.transY > maxTransY) {
      this.transY = maxTransY;
    } else if (this.transY < minTransY) {
      this.transY = minTransY;
    }
    if (this.transX > maxTransX) {
      this.transX = maxTransX;
    } else if (this.transX < minTransX) {
      this.transX = minTransX;
    }

    this.canvas.applyTransformParams(this.scale, this.transX, this.transY);

    if (this.markers) {
      this.repositionMarkers();
    }
  },

  makeDraggable: function(){
    var mouseDown = false;
    var oldPageX, oldPageY;
    var self = this;
    this.container.mousemove(function(e){
      if (mouseDown) {
        var curTransX = self.transX;
        var curTransY = self.transY;

        self.transX -= (oldPageX - e.pageX) / self.scale;
        self.transY -= (oldPageY - e.pageY) / self.scale;

        self.applyTransform();

        oldPageX = e.pageX;
        oldPageY = e.pageY;
      }
      return false;
    }).mousedown(function(e){
      mouseDown = true;
      oldPageX = e.pageX;
      oldPageY = e.pageY;
      return false;
    }).mouseup(function(){
      mouseDown = false;
      return false;
    });
  },

  bindZoomButtons: function() {
    var map = this;
    var sliderDelta = ($('#zoom').innerHeight() - 6*2 - 15*2 - 3*2 - 7 - 6) / (this.zoomMaxStep - this.zoomCurStep);
    this.container.find('.jvectormap-zoomin').click(function(){
      if (map.zoomCurStep < map.zoomMaxStep) {
        var curTransX = map.transX;
        var curTransY = map.transY;
        var curScale = map.scale;
        map.transX -= (map.width / map.scale - map.width / (map.scale * map.zoomStep)) / 2;
        map.transY -= (map.height / map.scale - map.height / (map.scale * map.zoomStep)) / 2;
        map.setScale(map.scale * map.zoomStep);
        map.zoomCurStep++;
        $('#zoomSlider').css('top', parseInt($('#zoomSlider').css('top')) - sliderDelta);
      }
    });
    this.container.find('.jvectormap-zoomout').click(function(){
      if (map.zoomCurStep > 1) {
        var curTransX = map.transX;
        var curTransY = map.transY;
        var curScale = map.scale;
        map.transX += (map.width / (map.scale / map.zoomStep) - map.width / map.scale) / 2;
        map.transY += (map.height / (map.scale / map.zoomStep) - map.height / map.scale) / 2;
        map.setScale(map.scale / map.zoomStep);
        map.zoomCurStep--;
        $('#zoomSlider').css('top', parseInt($('#zoomSlider').css('top')) + sliderDelta);
      }
    });
  },

  setScale: function(scale) {
    this.scale = scale;
    this.applyTransform();
  },

  getCountryPath: function(cc) {
    return $('#'+cc)[0];
  },

  createMarkers: function(markers) {
    var group = this.canvas.addGroup(),
        i,
        marker,
        point,
        markerConfig,
        defaultConfig = {latLng: [0, 0], r: 5, fill: 'white', stroke: '#505050'};

    this.markers = [];

    for (i = 0; i < markers.length; i++) {
      markerConfig = markers[i] instanceof Array ? {latLng: markers[i]} : markers[i];
      markerConfig = $.extend({}, defaultConfig, this.params.markerDefaults, markerConfig);
      point = this.latLngToPoint.apply(this, markerConfig.latLng);
      $.extend(markerConfig, {cx: point.x, cy: point.y});

      marker = this.canvas.addCircle($.extend({
        "data-index": i
      }, markerConfig), group);
      marker.addClass('jvectormap-marker');
      this.markers.push({element: marker, config: markerConfig});
    }
  },

  repositionMarkers: function() {
    var i,
        point;

    if (this.markers instanceof Array) {
      for (i = 0; i < this.markers.length; i++) {
        point = this.latLngToPoint.apply(this, this.markers[i].config.latLng);
        this.markers[i].element.set({cx: point.x, cy: point.y});
      }
    }
  },

  latLngToPoint: function(lat, lng) {
    var x,
        y,
        centralMeridian = jvm.WorldMap.maps[this.params.map].projection.centralMeridian,
        width = this.width - this.baseTransX * 2 * this.baseScale,
        height = this.height - this.baseTransY * 2 * this.baseScale,
        inset,
        bbox,
        scaleFactor = this.scale / this.baseScale;

    if (lng < (-180 + centralMeridian)) {
      lng += 360;
    }

    x = (lng - centralMeridian) / 360 * jvm.WorldMap.circumference,
    y = (180 / Math.PI * (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (4 / 5) * lat * Math.PI / 360))) / 360 * jvm.WorldMap.circumference;

    inset = this.getInsetForPoint(x, y);
    if (inset) {
      bbox = inset.bbox;

      x = (x - bbox[0].x) / (bbox[1].x - bbox[0].x) * inset.width * this.scale;
      y = (y - bbox[0].y) / (bbox[1].y - bbox[0].y) * inset.height * this.scale;

      return {
        x: x + this.transX*this.scale + inset.left*this.scale,
        y: y + this.transY*this.scale + inset.top*this.scale
      };
     } else {
       return {x: 0, y: 0};
     }
  },

  getInsetForPoint: function(x, y){
    var insets = jvm.WorldMap.maps[this.params.map].insets,
        i,
        bbox;

    for (i = 0; i < insets.length; i++) {
      bbox = insets[i].bbox;
      if (x > bbox[0].x && x < bbox[1].x && y > bbox[0].y && y < bbox[1].y) {
        return insets[i];
      }
    }
  }
},

jvm.WorldMap.xlink = "http://www.w3.org/1999/xlink";
jvm.WorldMap.mapIndex = 1;
jvm.WorldMap.maps = {};
jvm.WorldMap.circumference = 40075017;