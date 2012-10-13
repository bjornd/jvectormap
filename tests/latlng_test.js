// http://kartoweb.itc.nl/geometrics/Introduction/introduction.html
// http://kartoweb.itc.nl/geometrics/Publications/Map%20Projections%20-%20A%20Working%20manual%20-%20by%20J.P.%20Snyder.pdf
// miller projection: page 88 and 287

var DEGRAD = 180 / Math.PI;
var RADDEG = Math.PI / 180;
var R = 6378137;

// miller: Neither equal-area nor conformal, cylindrical, sphere only
function latLngToPointMiller(lat, lng, c) {
	return {
		x: R * (lng - c) * RADDEG,
		y: -R * Math.log(Math.tan((45 + 0.4 * lat) * RADDEG)) / 0.8  // 45° equals Math.PI/4; invert origin/latitude
	};
}

function pointToLatLngMiller(x, y, c) {
	return {
		lat: (2.5 * Math.atan(Math.exp(0.8 * y / R)) - 5 * Math.PI / 8) * DEGRAD,
		lng: (c * RADDEG + x / R) * DEGRAD
	};
}

// proj.js
function mill(lat, lng, c){
  return {
    x: (lng - c) / 360 * (R * Math.PI * 2),
    y: - (180 / Math.PI * (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (4 / 5) * lat * Math.PI / 360))) / 360 * (R * Math.PI * 2)
  };
}

// latitude, longitude, central meridian
var centralMeridian = 10.8;
var lat1 = 48.04;
var lng1 = 10.71;


// add 360° if (lambda - lambda0) exceeds the +-180° range
if (lng1 < (-180 + centralMeridian)) {
  console.log("adding 360° to longitude");
	lng1 += 360;
}

console.log("Radius: " + R);

// convert geodetic point on sphere to Cartesian coordinates
var p1 = latLngToPointMiller(lat1, lng1, centralMeridian);
console.log("latLngToPoint(" + lat1 + ", " + lng1 + ", " + centralMeridian + ") =", p1);

var p2 = mill(lat1, lng1, centralMeridian);
console.log("mill(" + lat1 + ", " + lng1 + ", " + centralMeridian + ") =", p2);

//convert Cartesian coordinates to geodetic point on sphere
var latlng1 = pointToLatLngMiller(p1.x, p1.y, centralMeridian);
console.log("pointToLatLng(" + p1.x + ", " + p1.y + ", " + centralMeridian + ") =", latlng1);
