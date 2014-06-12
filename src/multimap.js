/**
 * Creates map with drill-down functionality.
 * @constructor
 * @param {Object} params Parameters to initialize map with.
 * @param {Number} params.maxLevel Maximum number of levels user can go through
 * @param {Object} params.main Config of the main map. See <a href="./jvm-map/">jvm.Map</a> for more information.
 */
jvm.MultiMap = function(params) {
  this.maps = {};
  this.params = params;
  this.history = [ this.addMap(params.main.map, params.main) ];
};

jvm.MultiMap.prototype = {
  addMap: function(name, config){
    var cnt = $('<div/>').css({
      width: '100%',
      height: '100%'
    });

    this.params.container.append(cnt);

    this.maps[name] = new jvm.Map($.extend(config, {container: cnt}));
    this.maps[name].container.on('regionClick.jvectormap', {scope: this}, function(e, code){
      var multimap = e.data.scope,
          mapName = 'us_tx_lcc_en';

      multimap.goDown(mapName);
    })

    return this.maps[name];
  },

  goDown: function(name){
    this.history[this.history.length - 1].params.container.hide();
    if (!this.maps[name]) {
      this.addMap(name, {map: name});
    } else {
      this.maps[name].params.container.show();
    }
    this.history.push( this.maps[name] );
  }
};

jvm.MultiMap.defaultParams = {

};
