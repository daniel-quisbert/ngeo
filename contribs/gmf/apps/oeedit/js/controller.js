/**
 * Application entry point.
 *
 * This file defines the "app_oeedit" Closure namespace, which is be used as
 * the Closure entry point (see "closure_entry_point" in the "build.json"
 * file).
 *
 * This file includes `goog.require`'s for all the components/directives used
 * by the HTML page and the controller to provide the configuration.
 */
goog.provide('app.OEEditController');
goog.provide('app_oeedit');

goog.require('app');
goog.require('gmf.AbstractDesktopController');
/** @suppress {extraRequire} */
goog.require('ngeo.proj.EPSG2056');
/** @suppress {extraRequire} */
goog.require('ngeo.proj.EPSG21781');

/** @suppress {extraRequire} */
goog.require('gmf.objecteditingDirective');
goog.require('gmf.ObjectEditingManager');
goog.require('gmf.Themes');
goog.require('ngeo.ToolActivate');
goog.require('ngeo.ToolActivateMgr');
goog.require('ol.Collection');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');

/**
 * @param {angular.Scope} $scope Scope.
 * @param {angular.$injector} $injector Main injector.
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @constructor
 * @extends {gmf.AbstractDesktopController}
 * @ngInject
 * @export
 */
app.OEEditController = function($scope, $injector, $timeout) {

  /**
   * @type {boolean}
   * @export
   */
  this.oeEditActive = false;

  gmf.AbstractDesktopController.call(this, {
    srid: 21781,
    mapViewConfig: {
      center: [632464, 185457],
      zoom: 3,
      resolutions: [250, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05]
    }
  }, $scope, $injector);

  /**
   * The ngeo ToolActivate manager service.
   * @type {ngeo.ToolActivateMgr}
   */
  let ngeoToolActivateMgr = $injector.get('ngeoToolActivateMgr');

  ngeoToolActivateMgr.unregisterGroup('mapTools');

  let oeEditToolActivate = new ngeo.ToolActivate(this, 'oeEditActive');
  ngeoToolActivateMgr.registerTool('mapTools', oeEditToolActivate, true);

  let queryToolActivate = new ngeo.ToolActivate(this, 'queryActive');
  ngeoToolActivateMgr.registerTool('mapTools', queryToolActivate, false);

  // Set edit tool as default active one
  $timeout(function() {
    this.oeEditActive = true;
  }.bind(this));

  /**
   * @type {ol.source.Vector}
   * @private
   */
  this.vectorSource_ = new ol.source.Vector({
    wrapX: false
  });

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.vectorLayer_ = new ol.layer.Vector({
    source: this.vectorSource_
  });

  /**
   * @type {ol.Collection.<ol.Feature>}
   * @export
   */
  this.sketchFeatures = new ol.Collection();

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.sketchLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: this.sketchFeatures,
      wrapX: false
    })
  });

  /**
   * @type {gmf.Themes} gmfObjectEditingManager The gmf theme service
   */
  let gmfThemes = $injector.get('gmfThemes');

  gmfThemes.getThemesObject().then(function(themes) {
    if (themes) {
      // Add layer vector after
      this.map.addLayer(this.vectorLayer_);
      this.map.addLayer(this.sketchLayer_);
    }
  }.bind(this));

  /**
   * @type {gmf.ObjectEditingManager} gmfObjectEditingManager The gmf
   *     ObjectEditing manager service.
   */
  let gmfObjectEditingManager = $injector.get('gmfObjectEditingManager');

  /**
   * @type {?string}
   * @export
   */
  this.oeGeomType = gmfObjectEditingManager.getGeomType();

  /**
   * @type {?number}
   * @export
   */
  this.oeLayerNodeId = gmfObjectEditingManager.getLayerNodeId();

  /**
   * @type {?ol.Feature}
   * @export
   */
  this.oeFeature = null;

  gmfObjectEditingManager.getFeature().then(function(feature) {
    this.oeFeature = feature;
    if (feature) {
      this.vectorSource_.addFeature(feature);
    }
  }.bind(this));

  /**
   * @type {Array.<string>}
   * @export
   */
  this.searchCoordinatesProjections = ['EPSG:21781', 'EPSG:2056', 'EPSG:4326'];

  /**
   * @type {!Array.<number>}
   * @export
   */
  this.scaleSelectorValues = [250000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 250, 100, 50];

  /**
   * @type {Array.<string>}
   * @export
   */
  this.elevationLayers = ['aster', 'srtm'];

  /**
   * @type {string}
   * @export
   */
  this.selectedElevationLayer = this.elevationLayers[0];

  /**
   * @type {Object.<string, gmfx.ProfileLineConfiguration>}
   * @export
   */
  this.profileLinesconfiguration = {
    'aster': {color: '#0000A0'},
    'srtm': {color: '#00A000'}
  };

  /**
   * @type {Array.<gmfx.MousePositionProjection>}
   * @export
   */
  this.mousePositionProjections = [{
    code: 'EPSG:2056',
    label: 'CH1903+ / LV03',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: 'EPSG:21781',
    label: 'CH1903 / LV03',
    filter: 'ngeoNumberCoordinates::{x}, {y} m'
  }, {
    code: 'EPSG:4326',
    label: 'WGS84',
    filter: 'ngeoDMSCoordinates:2'
  }];

  // Allow angular-gettext-tools to collect the strings to translate
  /** @type {angularGettext.Catalog} */
  let gettextCatalog = $injector.get('gettextCatalog');
  gettextCatalog.getString('Add a theme');
  gettextCatalog.getString('Add a sub theme');
  gettextCatalog.getString('Add a layer');
};
ol.inherits(app.OEEditController, gmf.AbstractDesktopController);


app.module.controller('OEEditController', app.OEEditController);
