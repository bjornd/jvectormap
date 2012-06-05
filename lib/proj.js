jvm.Proj = {
  mill: function(lat, lng, c){
    return {
      x: (lng - c) / 360 * jvm.WorldMap.circumference,
      y: - (180 / Math.PI * (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (4 / 5) * lat * Math.PI / 360))) / 360 * jvm.WorldMap.circumference
    }
  },

  // http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html
  aea: function(lat, lng, c){
    var fi0 = 0,
        lambda0 = c / 180 * Math.PI,
        fi1 = 45.5 / 180 * Math.PI,
        fi2 = 29.5 / 180 * Math.PI,
        fi = lat / 180 * Math.PI,
        lambda = lng / 180 * Math.PI ,
        n = (Math.sin(fi1)+Math.sin(fi2)) / 2,
        C = Math.cos(fi1)*Math.cos(fi1)+2*n*Math.sin(fi1),
        theta = n*(lambda-lambda0),
        ro = Math.sqrt(C-2*n*Math.sin(fi))/n,
        ro0 = Math.sqrt(C-2*n*Math.sin(fi0))/n;

    return {
      x: ro*Math.sin(theta) / (2 * Math.PI) * jvm.WorldMap.circumference,
      y: - (ro0 - ro * Math.cos(theta)) / (2 * Math.PI) * jvm.WorldMap.circumference
    }
  }
}