import json
import shapely.wkb
import shapely.geometry
import shapely.ops
import codecs
import os
import inspect
from osgeo import ogr
from osgeo import osr

infile = "/Users/kirilllebedev/Maps/ne_110m_admin_0_map_units/ne_110m_admin_0_map_units.shp"
outfile = "/Users/kirilllebedev/Maps/continents_wb/continents_wb.shp"

regions = [{
  'name': 'Americas',
  'code': 'AM',
  'where': 'region_wb = "Latin America & Caribbean" OR region_wb = "North America"'
},{
  'name': 'Europe',
  'code': 'EU',
  'where': 'region_wb = "Europe & Central Asia"'
},{
  'name': 'Asia Pacific and MEIA',
  'code': 'AP',
  'where': 'region_wb = "East Asia & Pacific"'
},{
  'name': ' India and Africa',
  'code': 'AF',
  'where': 'region_wb = "Middle East & North Africa" OR region_wb = "South Asia" OR region_wb = "Sub-Saharan Africa"'
}]

in_ds = ogr.Open( infile, update = 0 )
in_layer = in_ds.GetLayer( 0 )
in_defn = in_layer.GetLayerDefn()

shp_driver = ogr.GetDriverByName( 'ESRI Shapefile' )
if os.path.exists( outfile ):
  shp_driver.DeleteDataSource( outfile )
shp_ds = shp_driver.CreateDataSource( outfile )
shp_layer = shp_ds.CreateLayer( in_defn.GetName(),
                                geom_type = in_defn.GetGeomType(),
                                srs = in_layer.GetSpatialRef() )

fd = ogr.FieldDefn( 'code', 4 )
fd.SetWidth( 5 )
shp_layer.CreateField( fd )

fd = ogr.FieldDefn( 'name', 4 )
fd.SetWidth( 254 )
shp_layer.CreateField( fd )

for region in regions:
  in_layer.SetAttributeFilter( region['where'] )
  geometries = []
  for feature in in_layer:
    geometry = feature.GetGeometryRef()
    if geometry.GetGeometryType() == ogr.wkbPolygon or geometry.GetGeometryType() == ogr.wkbMultiPolygon:
      geometry = shapely.wkb.loads( geometry.ExportToWkb() )
      geometry = geometry.buffer(0.000000001, 1)
      geometries.append( geometry )
  region['geometry'] = shapely.ops.cascaded_union( geometries )
  region['geometry'] = region['geometry'].buffer(-0.000000001, 1)
  in_layer.ResetReading()

for region in regions:
  out_feat = ogr.Feature( feature_def = shp_layer.GetLayerDefn() )
  out_feat.SetField(0, region['code'])
  out_feat.SetField(1, region['name'])
  out_feat.SetGeometryDirectly(
    ogr.CreateGeometryFromWkb(
      shapely.wkb.dumps(
        region['geometry']
      )
    )
  )
  shp_layer.CreateFeature( out_feat )
  out_feat.Destroy()

# Cleanup
shp_ds.Destroy()
in_ds.Destroy()