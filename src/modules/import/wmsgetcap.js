goog.module('ngeo.wmsGetCapDirective');
goog.module.declareLegacyNamespace();

goog.require('ol.format.WMSCapabilities');


/**
 * @constructor
 * @param {Window} $window The window.
 * @param {gettext} gettext Gettext.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {string|function(!angular.JQLite=, !angular.Attributes=)}
 *     ngeoWmsGetCapTemplateUrl The template url.
 * @ngInject
 */
exports = function($window, gettext, gettextCatalog, ngeoWmsGetCapTemplateUrl) {

  // Get the layer extent defines in the GetCapabilities
  let getLayerExtentFromGetCap = function(getCapLayer, proj) {
    let wgs84 = 'EPSG:4326';
    let layer = getCapLayer;
    let projCode = proj.getCode();

    if (layer['BoundingBox']) {
      for (let i = 0, ii = layer['BoundingBox'].length; i < ii; i++) {
        let bbox = layer['BoundingBox'][i];
        let code = bbox['crs'] || bbox['srs'];
        if (code && code.toUpperCase() == projCode.toUpperCase()) {
          return bbox['extent'];
        }
      }
    }

    let wgs84Extent = layer['EX_GeographicBoundingBox'] || layer['LatLonBoundingBox'];
    if (wgs84Extent) {
      // If only an extent in wgs 84 is available, we use the
      // intersection between proj extent and layer extent as the new
      // layer extent. We compare extients in wgs 84 to avoid
      // transformations errors of large wgs 84 extent like
      // (-180,-90,180,90)
      let projWgs84Extent = ol.proj.transformExtent(proj.getExtent(), projCode, wgs84);
      let layerWgs84Extent = ol.extent.getIntersection(projWgs84Extent, wgs84Extent);
      if (layerWgs84Extent) {
        return ol.proj.transformExtent(layerWgs84Extent, wgs84, projCode);
      }
    }
  };

  // Test if the layer can be displayed with a specific projection
  let canUseProj = function(layer, projCode) {
    let projCodeList = layer['CRS'] || layer['SRS'] || [];
    return (projCodeList.indexOf(projCode.toUpperCase()) != -1 ||
        projCodeList.indexOf(projCode.toLowerCase()) != -1);
  };

  // Go through all layers, assign needed properties,
  // and remove useless layers (no name or bad crs without children
  // or no intersection between map extent and layer extent)
  let getChildLayers = function(getCap, layer, proj) {

    // If the WMS layer has no name, it can't be displayed
    if (!layer['Name']) {
      layer['isInvalid'] = true;
      layer['Abstract'] = gettext('Invalid layer: missing name');
    }

    if (!layer['isInvalid']) {
      layer['wmsUrl'] = getCap['Service']['OnlineResource'];
      layer['wmsVersion'] = getCap['version'];
      layer['id'] = 'WMS||' + layer['wmsUrl'] + '||' + layer['Name'];
      layer['extent'] = getLayerExtentFromGetCap(layer, proj);

      // if the layer has no extent, it is set as invalid.
      // We don't have proj codes list for wms 1.1.1 so we assume the
      // layer can be displayed (wait for
      // https://github.com/openlayers/ol3/pull/2944)
      let projCode = proj.getCode();
      if (getCap['version'] == '1.3.0' && !canUseProj(layer, projCode)) {
        layer['useReprojection'] = true;

        if (!layer['extent']) {
          layer['isInvalid'] = true;
          layer['Abstract'] = gettext('Invalid layer outside the map');
        }
      }
    }

    // Go through the child to get valid layers
    if (layer.Layer) {

      for (let i = 0; i < layer.Layer.length; i++) {
        let l = getChildLayers(getCap, layer.Layer[i], proj);
        if (!l) {
          layer.Layer.splice(i, 1);
          i--;
        }
      }

      // No valid child
      if (layer.Layer.length == 0) {
        layer.Layer = undefined;
      }
    }

    if (layer['isInvalid'] && !layer.Layer) {
      return undefined;
    }

    return layer;
  };

  return {
    restrict: 'A',
    templateUrl: ngeoWmsGetCapTemplateUrl,
    scope: {
      'getCap': '=ngeoWmsGetCap',
      'map': '=ngeoWmsGetCapMap',
      'options': '=ngeoWmsGetCapOptions'
    },
    link: function(scope) {

      // List of layers available in the GetCapabilities.
      // The layerXXXX properties use layer objects from the parsing of
      // a  GetCapabilities file, not ol layer object.
      scope['layers'] = [];
      scope['options'] = scope['options'] || {};
      scope.$watch('getCap', function(val) {
        let err;
        try {
          val = new ol.format.WMSCapabilities().read(val);
        } catch (e) {
          err = e;
        }

        if (err || !val) {
          $window.console.error('WMS GetCap parsing failed: ', err || val);
          scope['userMsg'] = gettext('Parsing failed');
          return;
        }

        scope['limitations'] = '';
        scope['layers'] = [];
        scope['options'].layerSelected = null; // the layer selected on click
        scope['options'].layerHovered = null;

        if (val && val['Service'] && val['Capability']) {
          if (val['Service']['MaxWidth']) {
            scope['limitations'] = gettextCatalog.getString('Maximum WMS size allowed') +
                ' ' + val['Service']['MaxWidth'] +
                ' * ' + val['Service']['MaxHeight'];
          }

          if (val['Capability']['Layer']) {
            let root = getChildLayers(val, val['Capability']['Layer'],
                scope['map'].getView().getProjection());
            if (root) {
              scope['layers'] = root['Layer'] || [root];
            }
          }
        }
      });

      // Add the selected layer to the map
      scope['addLayerSelected'] = function() {
        let getCapLay = scope['options'].layerSelected;
        if (getCapLay && scope['options']['getOlLayerFromGetCapLayer']) {
          let msg = gettextCatalog.getString('WMS layer added succesfully');
          try {
            let olLayer = scope['options']['getOlLayerFromGetCapLayer'](getCapLay);
            if (olLayer) {
              scope['map'].addLayer(olLayer);
            }

          } catch (e) {
            $window.console.error('Add layer failed:' + e);
            msg = gettextCatalog.getString('WMS layer could not be added') + ' ' + e.message;
          }
          $window.alert(msg);
        }
      };

      // Get the abstract to display in the text area
      scope['getAbstract'] = function() {
        let l = scope['options'].layerSelected || scope['options'].layerHovered || {};
        return gettextCatalog.getString(l.Abstract) || '';
      };
    }
  };
};

exports.module = angular.module('ngeo.wmsGetCapDirective', [
  'gettext'
]);

exports.module.value('ngeoWmsGetCapTemplateUrl',
    /**
     * @param {angular.JQLite} element Element.
     * @param {angular.Attributes} attrs Attributes.
     * @return {boolean} Template URL.
     */
    function(element, attrs) {
      let templateUrl = attrs['ngeoWmsGetCapTemplateUrl'];
      return templateUrl !== undefined ? templateUrl :
          ngeo.baseModuleTemplateUrl + '/import/partials/wms-get-cap.html';
    });

/**
 * This directive displays the list of layers available in the
 * GetCapabilities object.
 */
exports.module.directive('ngeoWmsGetCap', exports);
