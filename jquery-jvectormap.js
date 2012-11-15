/**
 * jVectorMap version 1.1.1
 *
 * Copyright 2011-2012, Kirill Lebedev
 * Licensed under the MIT license.
 *
 */
(function( $ ){
  var apiParams = {
        set: {
          colors: 1,
          values: 1,
          backgroundColor: 1,
          scaleColors: 1,
          normalizeFunction: 1,
          focus: 1
        },
        get: {
          selectedRegions: 1,
          selectedMarkers: 1,
          mapObject: 1,
          regionName: 1
        }
      };

  $.fn.vectorMap = function(options) {
	if (options === 'addMap') {
	  jvm.WorldMap.maps[arguments[1]] = arguments[2];
	} else {
		var args = arguments;
		$(this).each(function () {
			var map = $(this).children('.jvectormap-container').data('mapObject'),
				methodName,
				event;
		
			if ((options === 'set' || options === 'get') && apiParams[options][args[1]]) {
			  methodName = args[1].charAt(0).toUpperCase()+args[1].substr(1);
			  return map[options+methodName].apply(map, Array.prototype.slice.call(args, 2));
			} else {
			  var myOptions = options || {};
			  myOptions.container = $(this);
			  map = new jvm.WorldMap(myOptions);
			}
		});
	}

    return $(this);
  };
})( jQuery );
