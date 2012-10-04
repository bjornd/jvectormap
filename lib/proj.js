/**
 * Contains methods for transforming point on sphere to
 * Cartesian coordinates using various projections.
 * @class
 */
jvm.Proj = {
  /**
   * Converts point on sphere to the Cartesian coordinates using Miller projection
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  mill: function(lat, lng, c){
    return {
      x: (lng - c) / 360 * jvm.WorldMap.circumference,
      y: - (180 / Math.PI * (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (4 / 5) * lat * Math.PI / 360))) / 360 * jvm.WorldMap.circumference
    }
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Mercator projection
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  merc: function(lat, lng, c){
    return {
      x: (lng - c) / 360 * jvm.WorldMap.circumference,
      y: - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / 360 * jvm.WorldMap.circumference
    }
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Albers Equal-Area Conic
   * projection
   * @see <a href="http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html">Albers Equal-Area Conic projection</a>
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  aea: function(lat, lng, c){
    var fi0 = 0,
        lambda0 = c / 180 * Math.PI,
        fi1 = 29.5 / 180 * Math.PI,
        fi2 = 45.5 / 180 * Math.PI,
        fi = lat / 180 * Math.PI,
        lambda = lng / 180 * Math.PI ,
        n = (Math.sin(fi1)+Math.sin(fi2)) / 2,
        C = Math.cos(fi1)*Math.cos(fi1)+2*n*Math.sin(fi1),
        theta = n*(lambda-lambda0),
        ro = Math.sqrt(C-2*n*Math.sin(fi))/n,
        ro0 = Math.sqrt(C-2*n*Math.sin(fi0))/n;

    return {
      x: ro * Math.sin(theta) / (2 * Math.PI) * jvm.WorldMap.circumference,
      y: - (ro0 - ro * Math.cos(theta)) / (2 * Math.PI) * jvm.WorldMap.circumference
    }
  },

  /**
   * Converts point on sphere to the Cartesian coordinates using Lambert conformal
   * conic projection
   * @see <a href="http://mathworld.wolfram.com/LambertConformalConicProjection.html">Lambert Conformal Conic Projection</a>
   * @param {Number} lat Latitude in degrees
   * @param {Number} lng Longitude in degrees
   * @param {Number} c Central meridian in degrees
   */
  lcc: function(lat, lng, c){
    var fi0 = 0,
        lambda0 = c / 180 * Math.PI,
        lambda = lng / 180 * Math.PI,
        fi1 = 33 / 180 * Math.PI,
        fi2 = 45 / 180 * Math.PI,
        fi = lat / 180 * Math.PI
        n = Math.log( Math.cos(fi1) * (1 / Math.cos(fi2)) ) / Math.log( Math.tan( Math.PI / 4 + fi2 / 2) * (1 / Math.tan( Math.PI / 4 + fi1 / 2) ) ),
        F = ( Math.cos(fi1) * Math.pow( Math.tan( Math.PI / 4 + fi1 / 2 ), n ) ) / n,
        ro = F * Math.pow( 1 / Math.tan( Math.PI / 4 + fi / 2 ), n ),
        ro0 = F * Math.pow( 1 / Math.tan( Math.PI / 4 + fi0 / 2 ), n );

    return {
      x: ro * Math.sin( n * (lambda - lambda0) ) / (2 * Math.PI) * jvm.WorldMap.circumference,
      y: - (ro0 - ro * Math.cos( n * (lambda - lambda0) ) ) / (2 * Math.PI) * jvm.WorldMap.circumference
    }
  }
};