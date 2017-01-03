goog.module('ngeo.wmsGetCapItemDirective');
goog.module.declareLegacyNamespace();


/**
 * @constructor
 * @param {angular.Scope} $scope .
 * @ngInject
 */
exports.Controller = function($scope) {
  /**
   * @type {ngeox.ImportWmsGetCapItemOptions}
   */
  var options = $scope['options'];

  // Add preview layer
  $scope['addPreviewLayer'] = function(evt, getCapLayer) {
    evt.stopPropagation();
    options.layerHovered = getCapLayer;
    if (getCapLayer['isInvalid']) {
      return;
    }
    options.addPreviewLayer($scope['map'], getCapLayer);
  };

  // Remove preview layer
  $scope['removePreviewLayer'] = function(evt) {
    evt.stopPropagation();
    options.layerHovered = null;
    options.removePreviewLayer($scope['map']);
  };

  // Select the layer clicked
  $scope['toggleLayerSelected'] = function(evt, getCapLayer) {
    evt.stopPropagation();

    options.layerSelected = (options.layerSelected &&
        options.layerSelected.Name == getCapLayer['Name']) ?
        null : getCapLayer;
  };
};

/**
 * @param {angular.$compile} $compile .
 * @param {string|function(!angular.JQLite=, !angular.Attributes=)}
 *     ngeoWmsGetCapItemTemplateUrl The template url.
 * @ngInject
 * @return {angular.Directive} .
 */
exports.directive = function($compile, ngeoWmsGetCapItemTemplateUrl) {

  /**** UTILS functions ****/
  // from OL2
  //TO FIX: utils function to get scale from an extent, should be
  //elsewhere?
  var getScaleFromExtent = function(view, extent, mapSize) {
    // Constants get from OpenLayers 2, see:
    // https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Util.js
    //
    // 39.37 INCHES_PER_UNIT
    // 72 DOTS_PER_INCH
    return view.getResolutionForExtent(extent, mapSize) *
        39.37 * 72;
  };

  // Zoom to layer extent
  var zoomToLayerExtent = function(scope, layer, map) {
    var extent = layer.extent;
    if (scope['options'].transformExtent) {
      extent = scope['options'].transformExtent(layer.extent);
    }
    var view = map.getView();
    var mapSize = map.getSize();

    // Test this with this wms:
    // http://wms.vd.ch/public/services/VD_WMS/Mapserver/Wmsserver
    // If a minScale is defined
    if (layer.MaxScaleDenominator && extent) {

      // We test if the layer extent specified in the
      // getCapabilities fit the minScale value.
      var layerExtentScale = getScaleFromExtent(view, extent, mapSize);

      if (layerExtentScale > layer.MaxScaleDenominator) {
        var layerExtentCenter = ol.extent.getCenter(extent);
        var factor = layerExtentScale / layer.MaxScaleDenominator;
        var width = ol.extent.getWidth(extent) / factor;
        var height = ol.extent.getHeight(extent) / factor;
        extent = [
          layerExtentCenter[0] - width / 2,
          layerExtentCenter[1] - height / 2,
          layerExtentCenter[0] + width / 2,
          layerExtentCenter[1] + height / 2
        ];
        extent = scope['options'].transformExtent(extent);

        if (extent) {
          var res = view.constrainResolution(
              view.getResolutionForExtent(extent, mapSize), 0, -1);
          view.setCenter(layerExtentCenter);
          view.setResolution(res);
        }
        return;
      }
    }

    if (extent) {
      view.fit(extent, mapSize);
    }
  };

  return {
    restrict: 'A',
    templateUrl: ngeoWmsGetCapItemTemplateUrl,
    controller: 'NgeoWmsGetCapItemDirectiveController',
    compile: function(elt) {
      var contents = elt.contents().remove();
      var compiledContent;
      return function(scope, elt) {
        if (!compiledContent) {
          compiledContent = $compile(contents);
        }
        compiledContent(scope, function(clone, scope) {
          elt.append(clone);
        });

        var headerGroup = elt.find('> .ngeo-header-group');
        var toggleBt = headerGroup.find('.fa-plus');
        var childGroup;

        headerGroup.find('.fa-zoom-in').on('click', function(evt) {
          evt.stopPropagation();
          zoomToLayerExtent(scope, scope.layer, scope['map']);
        });

        toggleBt.on('click', function(evt) {
          evt.stopPropagation();
          toggleBt.toggleClass('fa-minus');
          if (!childGroup) {
            childGroup = elt.find('> .ngeo-child-group');
          }
          childGroup.slideToggle();
        });
      };
    }
  };
};

exports.module = angular.module('ngeo.wmsGetCapItemDirective', []);

exports.module.value('ngeoWmsGetCapItemTemplateUrl',
    /**
     * @param {angular.JQLite} element Element.
     * @param {angular.Attributes} attrs Attributes.
     * @return {boolean} Template URL.
     */
    function(element, attrs) {
      var templateUrl = attrs['ngeoWmsGetCapItemTemplateUrl'];
      return templateUrl !== undefined ? templateUrl :
          ngeo.baseModuleTemplateUrl + '/import/partials/wms-get-cap-item.html';
    });

exports.module.controller('NgeoWmsGetCapItemDirectiveController', exports.Controller);
exports.module.directive('ngeoWmsGetCapItem', exports.directive);
