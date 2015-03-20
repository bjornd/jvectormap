import sys
import json
import csv
import shapely.wkb
import shapely.geometry
import shapely.ops
import codecs
import os
import inspect
from osgeo import ogr
from osgeo import osr
from booleano.parser import Grammar, EvaluableParseManager, SymbolTable, Bind
from booleano.operations import Variable


class Geometry:
  def __init__(self, geometry, properties):
    self.geom = geometry
    self.properties = properties


class GeometryProperty(Variable):
  operations = set(["equality", "membership"])

  def __init__(self, name):
    self.name = name

  def equals(self, value, context):
    return context[self.name] == value

  def belongs_to(self, value, context):
    return value in context[self.name]

  def is_subset(self, value, context):
    return set(value).issubset(set(context[self.name]))

  def to_python(self, value):
    return unicode(value[self.name])


class DataSource:
  def __init__(self, config):
    self.config = config

  def load_data(self):
    self.source = ogr.Open( self.config['file_name'], update = 0 )
    self.layer = self.source.GetLayer(0)
    self.layer_dfn = self.layer.GetLayerDefn()

    self.fields = []
    field_count = self.layer_dfn.GetFieldCount()
    for field_index in range(field_count):
      field = self.layer_dfn.GetFieldDefn( field_index )
      self.fields.append({
        'name': field.GetName(),
        'type': field.GetType(),
        'width': field.GetWidth(),
        'precision': field.GetPrecision()
      })

    self.geometries = []

    for feature in self.layer:
      geometry = feature.GetGeometryRef()
      feature.GetFieldAsString
      geometry = shapely.wkb.loads( geometry.ExportToWkb() )
      properties = {}
      for field in self.fields:
        properties[field['name']] = feature.GetFieldAsString(field['name'])
      self.geometries.append( Geometry(geometry, properties) )

    self.layer.ResetReading()

    self.create_grammar()

  def create_grammar(self):
    root_table = SymbolTable("root",
      map( lambda f: Bind(f['name'], GeometryProperty(f['name'])), self.fields )
    )

    tokens = {
      'not': "not",
      'eq': "==",
      'ne': "!=",
      'belongs_to': "in",
      'is_subset': "are included in"
    }
    grammar = Grammar(**tokens)
    self.parse_manager = EvaluableParseManager(root_table, grammar)

  def output(self, output):
    driver = ogr.GetDriverByName( 'ESRI Shapefile' )
    if os.path.exists( output['file_name'] ):
      driver.DeleteDataSource( output['file_name'] )
    source = driver.CreateDataSource( output['file_name'] )
    layer = source.CreateLayer( self.layer_dfn.GetName(),
                                geom_type = self.layer_dfn.GetGeomType(),
                                srs = self.layer.GetSpatialRef() )

    for field in self.fields:
      fd = ogr.FieldDefn( str(field['name']), field['type'] )
      fd.SetWidth( field['width'] )
      if 'precision' in field:
        fd.SetPrecision( field['precision'] )
      layer.CreateField( fd )

    for geometry in self.geometries:
      feature = ogr.Feature( feature_def = layer.GetLayerDefn() )
      for index, field in enumerate(self.fields):
        feature.SetField( index, str(geometry.properties[field['name']]) )
      feature.SetGeometryDirectly(
        ogr.CreateGeometryFromWkb(
          shapely.wkb.dumps(
            geometry.geom
          )
        )
      )
      layer.CreateFeature( feature )
      feature.Destroy()

    source.Destroy()


class Processor:
  def __init__(self, config):
    self.config = config

  def process(self):
    data_source = DataSource(self.config['sources'][0])
    data_source.load_data()
    for action in self.config['actions']:
      getattr(self, action['name'])( action, data_source )
    data_source.output(self.config['output'])

  def union(self, config, data_source):
    groups = {}
    geometries = []
    for geometry in data_source.geometries:
      if geometry.properties[config['by']] in groups:
        groups[geometry.properties[config['by']]]['geoms'].append(geometry.geom)
      else:
        groups[geometry.properties[config['by']]] = {
          'geoms': [geometry.geom],
          'properties': geometry.properties
        }
    for key in groups:
      geometries.append( Geometry(shapely.ops.cascaded_union( groups[key]['geoms'] ), groups[key]['properties']) )
    data_source.geometries = geometries

  def merge(self, config, data_source):
    new_geometries = []
    for rule in config['rules']:
      expression = data_source.parse_manager.parse( rule['where'] )
      geometries = filter(lambda g: expression(g.properties), data_source.geometries)
      geometries = map(lambda g: g.geom, geometries)
      new_geometries.append( Geometry(shapely.ops.cascaded_union( geometries ), rule['fields']) )
    data_source.fields = config['fields']
    data_source.geometries = new_geometries

  def join_data(self, config, data_source):
    field_names = [f['name'] for f in config['fields']]
    data_file = open(config['file_name'], 'rb')
    data_reader = csv.reader(data_file, delimiter='\t', quotechar='"')
    data = {}
    for row in data_reader:
      row_dict = dict(zip(field_names, row))
      data[row_dict.pop(config['on'])] = row_dict
    for geometry in data_source.geometries:
      geometry.properties.update( data[geometry.properties[config['on']]] )
    data_source.fields = data_source.fields + filter(lambda f: f['name'] != config['on'], config['fields'])

  def remove_fields(self, config, data_source):
    data_source.fields = filter(lambda f: f.name not in config['fields'], data_source.fields)

  def remove_other_fields(self, config, data_source):
    data_source.fields = filter(lambda f: f['name'] in config['fields'], data_source.fields)


args = {}
if len(sys.argv) > 1:
  paramsJson = open(sys.argv[1], 'r').read()
else:
  paramsJson = sys.stdin.read()
paramsJson = json.loads(paramsJson)

processor = Processor(paramsJson)
processor.process()