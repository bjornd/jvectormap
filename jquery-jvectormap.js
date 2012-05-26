/**
 * jVectorMap version 0.2
 *
 * Copyright 2011-2012, Kirill Lebedev
 * Licensed under the MIT license.
 *
 */
(function( $ ){
  var apiParams = {
        colors: 1,
        values: 1,
        backgroundColor: 1,
        scaleColors: 1,
        normalizeFunction: 1
      },
      apiEvents = {
        onLabelShow: 'labelShow',
        onRegionOver: 'regionOver',
        onRegionOut: 'regionOut',
        onRegionClick: 'regionClick',
        onMarkerLabelShow: 'markerLabelShow',
        onMarkerOver: 'markerOver',
        onMarkerOut: 'markerOut',
        onMarkerClick: 'markerClick'
      };

  $.fn.vectorMap = function(options) {
    var defaultParams = {
          map: 'world_en',
          backgroundColor: '#505050',
          color: '#ffffff',
          hoverColor: 'black',
          scaleColors: ['#b6d6ff', '#005ace'],
          normalizeFunction: 'linear'
        },
        map,
        methodName,
        event;

    if (options === 'addMap') {
      jvm.WorldMap.maps[arguments[1]] = arguments[2];
    } else if (options === 'set' && apiParams[arguments[1]]) {
      methodName = arguments[1].charAt(0).toUpperCase()+arguments[1].substr(1);
      this.data('mapObject')['set'+methodName].apply(this.data('mapObject'), Array.prototype.slice.call(arguments, 2));
    } else {
      $.extend(defaultParams, options);
      defaultParams.container = this;
      this.css({
        position: 'relative',
        overflow: 'hidden'
      });
      map = new jvm.WorldMap(defaultParams);
      this.data('mapObject', map);
      for (event in apiEvents) {
        if (defaultParams[event]) {
          this.bind(apiEvents[event]+'.jvectormap', defaultParams[event]);
        }
      }
    }
  };

})( jQuery );
