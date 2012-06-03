/**
 * Render map, bind events.
 * @constructor
 * @param {Object} params
 */
jvm.WorldMap = function(params) {
  var map = this;

  params = params || {};

  this.params = params;
  this.mapData = jvm.WorldMap.maps[params.map];

  this.container = params.container;

  this.defaultWidth = this.mapData.width;
  this.defaultHeight = this.mapData.height;

  this.setBackgroundColor(params.backgroundColor);

  $(window).resize(function(){
    map.setSize();
  });

  this.canvas = new jvm.VectorCanvas(params.container[0], this.width, this.height);

  if ( ('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch) ) {
    this.bindContainerTouchEvents();
  } else {
    this.bindContainerEvents();
  }
  this.bindElementEvents();
  this.createLabel();
  this.bindZoomButtons();
  this.createRegions();
  if (params.markers) {
    this.createMarkers(params.markers);
  }

  this.setColors(params.colors);

  this.colorScale = new jvm.ColorScale(params.scaleColors, params.normalizeFunction, params.valueMin, params.valueMax);
  if (params.values) {
    this.values = params.values;
    this.setValues(params.values);
  }

  this.setSize();
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

  setColors: function(key, color) {
    var colors = key,
        code;

    if (typeof key == 'string') {
      this.regions[key].setStyle('fill', color);
    } else {
      for (code in colors) {
        if (this.regions[code]) {
          this.regions[code].setStyle('fill', colors[code]);
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
        colors[cc] = this.params.regionStyle.initial.fill;
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

  setSize: function(){
    this.width = this.container.width();
    this.height = this.container.height();
    this.resize();
    this.canvas.setSize(this.width, this.height);
    this.applyTransform();
  },

  reset: function() {
    this.countryTitle.reset();
    for(var key in this.regions) {
      this.regions[key].setStyle('fill', jvm.WorldMap.defaultColor);
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

  bindContainerEvents: function(){
    var mouseDown = false,
        oldPageX,
        oldPageY,
        map = this;

    this.container.mousemove(function(e){
      if (mouseDown) {
        map.transX -= (oldPageX - e.pageX) / map.scale;
        map.transY -= (oldPageY - e.pageY) / map.scale;

        map.applyTransform();

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

    if (this.params.zoomOnScroll) {
      this.container.mousewheel(function(event, delta, deltaX, deltaY) {
        var centerX = event.pageX - $(map.container).position().left,
            centerY = event.pageY - $(map.container).position().top,
            zoomStep = Math.pow(1.3, deltaY);

        map.label.hide();

        map.setScale(map.scale * zoomStep, centerX, centerY);
        event.preventDefault();
      });
    }
  },

  bindContainerTouchEvents: function(){
    var touchStartScale,
        touchStartTransX,
        touchStartTransY,
        map = this,
        touchX,
        touchY,
        centerTouchX,
        centerTouchY;

    $(this.container).bind('gesturestart', function(e){
      touchStartScale = map.scale;
      touchStartTransX = map.transX;
      touchStartTransY = map.transY;
      return false;
    });
    $(this.container).bind('gesturechange', function(e){
      var zoomStep;

      if (touchStartScale * e.originalEvent.scale > map.maxScale) {
        zoomStep = map.maxScale / touchStartScale;
      } else if (touchStartScale * e.originalEvent.scale < map.baseScale) {
        zoomStep = map.baseScale/touchStartScale;
      } else {
        zoomStep = e.originalEvent.scale;
      }

      map.transX = touchStartTransX - centerTouchX / touchStartScale + (map.width / (touchStartScale * zoomStep)) / 2;
      map.transY = touchStartTransY - centerTouchY / touchStartScale + (map.height / (touchStartScale * zoomStep)) / 2;
      map.setScale(touchStartScale * zoomStep);
      return false;
    });
    $(this.container).bind('touchstart', function(e){
      var touches = e.originalEvent.touches;
      if (touches.length == 2) {
        if (touches[0].pageX > touches[1].pageX) {
          centerTouchX = touches[1].pageX + (touches[0].pageX - touches[1].pageX) / 2;
        } else {
          centerTouchX = touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2;
        }
        if (touches[0].pageY > touches[1].pageY) {
          centerTouchY = touches[1].pageY + (touches[0].pageY - touches[1].pageY) / 2;
        } else {
          centerTouchY = touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2;
        }
      }
      touchX = e.originalEvent.touches[0].pageX;
      touchY = e.originalEvent.touches[0].pageY;
    });
    $(this.container).bind('touchmove', function(e){
      var touch;
      if (e.originalEvent.touches.length == 1 && touchX && touchY) {
        touch = e.originalEvent.touches[0];

        map.transX -= (touchX - touch.pageX) / map.scale;
        map.transY -= (touchY - touch.pageY) / map.scale;

        map.applyTransform();

        touchX = touch.pageX;
        touchY = touch.pageY;
      } else {
        touchX = false;
        touchY = false;
      }
      return false;
    });
  },

  bindElementEvents: function(){
    var map = this,
        mouseMoved;

    this.container.mousemove(function(){
      mouseMoved = true;
    });

    this.container.delegate('.jvectormap-region, .jvectormap-marker', 'mouseover mouseout', function(e){
      var path = this,
          type = $(this).attr('class').indexOf('jvectormap-region') === -1 ? 'marker' : 'region',
          code = type == 'region' ? $(this).attr('data-code') : $(this).attr('data-index'),
          element = type == 'region' ? map.regions[code] : map.markers[code].element,
          labelText = type == 'region' ? map.mapData.paths[code].name : (map.markers[code].config.name || ''),
          labelShowEvent = $.Event(type+'LabelShow.jvectormap'),
          overEvent = $.Event(type+'Over.jvectormap');

      if (e.type == 'mouseover') {
        map.container.trigger(overEvent, [code]);
        if (!overEvent.isDefaultPrevented()) {
          element.setHovered(true);
        }

        map.label.text(labelText);
        map.container.trigger(labelShowEvent, [map.label, code]);
        if (!labelShowEvent.isDefaultPrevented()) {
          map.label.show();
          map.labelWidth = map.label.width();
          map.labelHeight = map.label.height();
        }
      } else {
        element.setHovered(false);
        map.label.hide();
        map.container.trigger(type+'Out.jvectormap', [code]);
      }
    });

    this.container.delegate('.jvectormap-region, .jvectormap-marker', 'mousedown', function(e){
      mouseMoved = false;
    });

    this.container.delegate('.jvectormap-region, .jvectormap-marker', 'mouseup', function(e){
      var path = this,
          type = $(this).attr('class').indexOf('jvectormap-region') === -1 ? 'marker' : 'region',
          code = type == 'region' ? $(this).attr('data-code') : $(this).attr('data-index'),
          clickEvent = $.Event(type+'Click.jvectormap'),
          element = type == 'region' ? map.regions[code] : map.markers[code].element;

      if (!mouseMoved) {
        map.container.trigger(clickEvent, [code]);
        if ((type === 'region' && map.params.regionsSelectable) || (type === 'marker' && map.params.markersSelectable)) {
          if (!clickEvent.isDefaultPrevented()) {
            element.setSelected(!element.isSelected);
            map.container.trigger(
              type+(element.isSelected ? 'Select' : 'Deselect')+'.jvectormap',
              [code, type === 'marker' ? map.getSelectedMarkers() : map.getSelectedRegions()]
            );
          }
        }
      }
    });
  },

  bindZoomButtons: function() {
    var map = this;

    $('<div/>').addClass('jvectormap-zoomin').text('+').appendTo(this.container);
    $('<div/>').addClass('jvectormap-zoomout').html('&#x2212;').appendTo(this.container);

    this.container.find('.jvectormap-zoomin').click(function(){
      map.setScale(map.scale * map.params.zoomStep, map.width / 2, map.height / 2);
    });
    this.container.find('.jvectormap-zoomout').click(function(){
      map.setScale(map.scale / map.params.zoomStep, map.width / 2, map.height / 2);
    });
  },

  createLabel: function(){
    var map = this;

    this.label = $('<div/>').addClass('jvectormap-label').appendTo($('body'));

    this.container.mousemove(function(e){
      if (map.label.is(':visible')) {
        map.label.css({
          left: e.pageX-15-map.labelWidth,
          top: e.pageY-15-map.labelHeight
        })
      }
    });
  },

  setScale: function(scale, anchorX, anchorY, isCentered) {
    var zoomStep;

    if (scale > this.params.zoomMax * this.baseScale) {
      scale = this.params.zoomMax * this.baseScale;
    } else if (scale < this.params.zoomMin * this.baseScale) {
      scale = this.params.zoomMin * this.baseScale;
    }

    if (typeof anchorX != 'undefined' && typeof anchorY != 'undefined') {
      zoomStep = scale / this.scale;
      if (isCentered) {
        this.transX = anchorX + this.defaultWidth * (this.width / (this.defaultWidth * scale)) / 2;
        this.transY = anchorY + this.defaultHeight * (this.height / (this.defaultHeight * scale)) / 2;
      } else {
        this.transX -= (zoomStep - 1) / scale * anchorX;
        this.transY -= (zoomStep - 1) / scale * anchorY;
      }
    }

    this.scale = scale;
    this.applyTransform();
  },

  setFocus: function(scale, centerX, centerY){
    var bbox;

    if (typeof scale === 'string') {
      if (this.regions[scale]) {
        bbox = this.regions[scale].getBBox();
        this.setScale(
          Math.min(this.width / bbox.width, this.height / bbox.height),
          - (bbox.x + bbox.width / 2),
          - (bbox.y + bbox.height / 2),
          true
        );
      } else {
        return false;
      }
    } else {
      this.setScale(scale, - centerX * this.defaultWidth, - centerY * this.defaultHeight, true);
    }
  },

  getCountryPath: function(cc) {
    return $('#'+cc)[0];
  },

  getSelectedRegions: function(){
    var key,
        selected = [];

    for (key in this.regions) {
      if (this.regions[key].isSelected) {
        selected.push(key);
      }
    }
    return selected;
  },

  getSelectedMarkers: function(){
    var i,
        selected = [];

    for (i = 0; i < this.markers.length; i++) {
      if (this.markers[i].element.isSelected) {
        selected.push(i);
      }
    }
    return selected;
  },

  createRegions: function(){
    var key;

    for(key in this.mapData.paths) {
      this.regions[key] = this.canvas.addPath({
        d: this.mapData.paths[key].path,
        "data-code": key
      }, $.extend({}, this.params.regionStyle));
      this.regions[key].addClass('jvectormap-region');
    }
  },

  createMarkers: function(markers) {
    var group = this.canvas.addGroup(),
        i,
        marker,
        point,
        markerConfig;

    this.markers = [];

    for (i = 0; i < markers.length; i++) {
      markerConfig = markers[i] instanceof Array ? {latLng: markers[i]} : markers[i];
      point = this.latLngToPoint.apply(this, markerConfig.latLng || [0, 0]);

      marker = this.canvas.addCircle({
        "data-index": i,
        cx: point.x,
        cy: point.y
      }, $.extend(true, {}, this.params.markerStyle, {initial: markerConfig.style || {}}), group);
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
        this.markers[i].element.setStyle({cx: point.x, cy: point.y});
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
    y = (180 / Math.PI * (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (4 / 5) * -lat * Math.PI / 360))) / 360 * jvm.WorldMap.circumference;

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

jvm.WorldMap.maps = {};
jvm.WorldMap.circumference = 40075017;