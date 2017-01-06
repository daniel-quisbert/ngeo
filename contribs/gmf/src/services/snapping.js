goog.provide('gmf.Snapping');

goog.require('gmf');
goog.require('gmf.Themes');
goog.require('gmf.TreeManager');
goog.require('gmf.LayertreeController');
goog.require('ol.Collection');
goog.require('ol.format.WFS');
goog.require('ol.interaction.Snap');


/**
 * The snapping service of GMF. Responsible of collecting the treeCtrls that
 * support snapping and store them here. As soon as a treeCtrl state becomes
 * 'on', a WFS GetFeature request is issued to collect the features at the
 * map view location. A new request is sent every time the map is panned or
 * zoomed for each treeCtrl that are still 'on'.
 *
 * Features returned by these requests get bound to a `ol.interaction.Snap`,
 * which allows the snapping to occur on other places where vector
 * features are drawn or modified.
 *
 * @constructor
 * @param {angular.$http} $http Angular $http service.
 * @param {angular.$q} $q The Angular $q service.
 * @param {!angular.Scope} $rootScope Angular rootScope.
 * @param {angular.$timeout} $timeout Angular timeout service.
 * @param {gmf.Themes} gmfThemes The gmf Themes service.
 * @param {gmf.TreeManager} gmfTreeManager The gmf TreeManager service.
 * @ngInject
 * @ngdoc service
 * @ngname gmfSnapping
 */
gmf.Snapping = function($http, $q, $rootScope, $timeout, gmfThemes,
    gmfTreeManager) {

  // === Injected services ===

  /**
   * @type {angular.$http}
   * @private
   */
  this.http_ = $http;

  /**
   * @type {angular.$q}
   * @private
   */
  this.q_ = $q;

  /**
   * @type {!angular.Scope}
   * @private
   */
  this.rootScope_ = $rootScope;

  /**
   * @type {angular.$timeout}
   * @private
   */
  this.timeout_ = $timeout;

  /**
   * @type {gmf.Themes}
   * @private
   */
  this.gmfThemes_ = gmfThemes;

  /**
   * @type {gmf.TreeManager}
   * @private
   */
  this.gmfTreeManager_ = gmfTreeManager;


  // === Properties ===

  /**
   * A cache containing all available snappable items, in which the listening
   * of the state of the `treeCtrl` is registered and unregistered.
   * @type {gmf.Snapping.Cache}
   * @private
   */
  this.cache_ = {};

  /**
   * @type {!Array.<ol.EventsKey>}
   * @private
   */
  this.listenerKeys_ = [];

  /**
   * @type {?ol.Map}
   * @private
   */
  this.map_ = null;

  /**
   * Reference to the promise taking care of calling all GetFeature requests
   * of the currently active cache items after the map view changed. Used
   * to cancel if the map view changes often within a short period of time.
   * @type {?angular.$q.Promise}
   * @private
   */
  this.mapViewChangePromise_ = null;

  /**
   * A reference to the OGC servers loaded by the theme service.
   * @type {gmfThemes.GmfOgcServers}
   * @private
   */
  this.ogcServers_ = null;

};


/**
 * In order for a `ol.interaction.Snap` to work properly, it has to be added
 * to the map after any draw interactions or other kinds of interactions that
 * ineracts with features on the map.
 *
 * This method can be called to make sure the Snap interactions are on top.
 *
 * @export
 */
gmf.Snapping.prototype.ensureSnapInteractionsOnTop = function() {
  let map = this.map_;
  goog.asserts.assert(map);

  let item;
  for (let uid in this.cache_) {
    item = this.cache_[+uid];
    if (item.active) {
      goog.asserts.assert(item.interaction);
      map.removeInteraction(item.interaction);
      map.addInteraction(item.interaction);
    }
  }
};


/**
 * Bind the snapping service to a map
 * @param {?ol.Map} map Map
 * @export
 */
gmf.Snapping.prototype.setMap = function(map) {

  let keys = this.listenerKeys_;

  if (this.map_) {
    this.treeCtrlsUnregister_();
    this.unregisterAllTreeCtrl_();
    keys.forEach(ol.events.unlistenByKey);
    keys.length = 0;
  }

  this.map_ = map;

  if (map) {
    this.treeCtrlsUnregister_ = this.rootScope_.$watchCollection(function() {
      if (this.gmfTreeManager_.rootCtrl) {
        return this.gmfTreeManager_.rootCtrl.children;
      }
    }.bind(this), function(value) {
      // Timeout required, because the collection event is fired before the
      // leaf nodes are created and they are the ones we're looking for here.
      this.timeout_(function() {
        if (value) {
          this.unregisterAllTreeCtrl_();
          this.gmfTreeManager_.rootCtrl.traverseDepthFirst(this.registerTreeCtrl_.bind(this));
        }
      }.bind(this), 0);
    }.bind(this));

    keys.push(
      ol.events.listen(
        this.gmfThemes_,
        gmf.ThemesEventType.CHANGE,
        this.handleThemesChange_,
        this
      )
    );

    let view = map.getView();
    keys.push(
      ol.events.listen(
        view,
        ol.Object.getChangeEventType(ol.View.Property.CENTER),
        this.handleMapViewChange_,
        this
      )
    );
    keys.push(
      ol.events.listen(
        view,
        ol.Object.getChangeEventType(ol.View.Property.RESOLUTION),
        this.handleMapViewChange_,
        this
      )
    );
  }
};


/**
 * Called when the themes change. Get the OGC servers, then listen to the
 * tree manager Layertree controllers array changes.
 * @private
 */
gmf.Snapping.prototype.handleThemesChange_ = function() {
  this.ogcServers_ = null;
  this.gmfThemes_.getOgcServersObject().then(function(ogcServers) {
    this.ogcServers_ = ogcServers;
  }.bind(this));
};


/**
 * Registers a newly added Layertree controller 'leaf'. If it's snappable,
 * create and add a cache item with every configuration required to do the
 * snapping. It becomes active when its state is set to 'on'.
 *
 * @param {ngeo.LayertreeController} treeCtrl Layertree controller to register
 * @private
 */
gmf.Snapping.prototype.registerTreeCtrl_ = function(treeCtrl) {

  // Skip any Layertree controller that has a node that is not a leaf
  let node = /** @type {gmfThemes.GmfGroup|gmfThemes.GmfLayer} */ (treeCtrl.node);
  if (node.children) {
    return;
  }

  // If treeCtrl is snappable and supports WFS, listen to its state change.
  // When it becomes visible, it's added to the list of snappable tree ctrls.
  let snappingConfig = gmf.LayertreeController.getSnappingConfig(treeCtrl);
  if (snappingConfig) {
    let wfsConfig = this.getWFSConfig_(treeCtrl);
    if (wfsConfig) {
      let uid = ol.getUid(treeCtrl);

      let stateWatcherUnregister = this.rootScope_.$watch(
        function() {
          return treeCtrl.getState();
        }.bind(this),
        this.handleTreeCtrlStateChange_.bind(this, treeCtrl)
      );

      // Todo: some of the properties here are hardcoded, but could come from
      //       the node metadata at some point.
      this.cache_[uid] = {
        active: false,
        featureNS: 'http://mapserver.gis.umn.edu/mapserver',
        featurePrefix: 'feature',
        features: new ol.Collection(),
        geometryName: 'the_geom',
        interaction: null,
        maxFeatures: 50,
        requestDeferred: null,
        snappingConfig: snappingConfig,
        treeCtrl: treeCtrl,
        wfsConfig: wfsConfig,
        stateWatcherUnregister: stateWatcherUnregister
      };

      // This extra call is to initialize the treeCtrl with its current state
      this.handleTreeCtrlStateChange_(treeCtrl, treeCtrl.getState());
    }
  }
};


/**
 * Unregisters all removed layertree controllers 'leaf'. Remove the according
 * cache item and deactivate it as well. Unregister events.
 *
 * @private
 */
gmf.Snapping.prototype.unregisterAllTreeCtrl_ = function() {
  for (let uid in this.cache_) {
    let item = this.cache_[+uid];
    if (item) {
      item.stateWatcherUnregister();
      this.deactivateItem_(item);
      delete this.cache_[+uid];
    }
  }
};


/**
 * Get the configuration required to do WFS requests (for snapping purpose)
 * from a Layertree controller that has a leaf node.
 *
 * The following requirements must be met in order for a treeCtrl to be
 * considered supporting WFS:
 *
 * 1) ogcServers objects are loaded
 * 2) its node `type` property is equal to `WMS`
 * 3) in its node `childLayers` property, the `queryable` property is set
 *    to `true`
 * 4) if its node `mixed` property is:
 *   a) true: then the node must have an `ogcServer` property set
 *   b) false: then the first parent node must have an `ogcServer` property set
 * 5) the ogcServer defined in 3) has the `wfsSupport` property set to `true`.
 *
 * @param {ngeo.LayertreeController} treeCtrl The layer tree controller
 * @return {?gmf.Snapping.WFSConfig} The configuration object.
 * @private
 */
gmf.Snapping.prototype.getWFSConfig_ = function(treeCtrl) {

  // (1)
  if (this.ogcServers_ === null) {
    return null;
  }

  let gmfLayer = /** @type {gmfThemes.GmfLayer} */ (treeCtrl.node);

  // (2)
  if (gmfLayer.type !== gmf.Themes.NodeType.WMS) {
    return null;
  }

  let gmfLayerWMS = /** @type {gmfThemes.GmfLayerWMS} */ (gmfLayer);

  // (3)
  let featureTypes = [];
  for (let i = 0, ii = gmfLayerWMS.childLayers.length; i < ii; i++) {
    if (gmfLayerWMS.childLayers[i].queryable) {
      featureTypes.push(gmfLayerWMS.childLayers[i].name);
    }
  }
  if (!featureTypes.length) {
    return null;
  }

  // (4)
  let ogcServerName;
  let gmfGroup = /** @type {gmfThemes.GmfGroup} */ (treeCtrl.parent.node);
  if (gmfGroup.mixed) {
    ogcServerName = gmfLayerWMS.ogcServer;
  } else {
    let firstTreeCtrl = ngeo.LayertreeController.getFirstParentTree(treeCtrl);
    let firstNode = /** @type {gmfThemes.GmfGroup} */ (firstTreeCtrl.node);
    ogcServerName = firstNode.ogcServer;
  }
  if (!ogcServerName) {
    return null;
  }

  // (5)
  let ogcServer = this.ogcServers_[ogcServerName];
  if (!ogcServer.wfsSupport) {
    return null;
  }

  // At this point, every requirements have been met.
  // Create and return the configuration.
  let urlWfs = ogcServer.urlWfs;
  goog.asserts.assert(urlWfs, 'urlWfs should be defined.');

  return {
    featureTypes: featureTypes.join(','),
    url: urlWfs
  };
};


/**
 * @param {ngeo.LayertreeController} treeCtrl The layer tree controller
 * @param {?string} newVal New state value
 * @private
 */
gmf.Snapping.prototype.handleTreeCtrlStateChange_ = function(treeCtrl, newVal) {

  let uid = ol.getUid(treeCtrl);
  let item = this.cache_[uid];

  // Note: a snappable treeCtrl can only be a leaf, therefore the only possible
  //       states are: 'on' and 'off'.
  if (newVal === 'on') {
    this.activateItem_(item);
  } else {
    this.deactivateItem_(item);
  }
};


/**
 * Activate a cache item by adding a Snap interaction to the map and launch
 * the initial request to get the features.
 *
 * @param {gmf.Snapping.CacheItem} item Cache item.
 * @private
 */
gmf.Snapping.prototype.activateItem_ = function(item) {

  // No need to do anything if item is already active
  if (item.active) {
    return;
  }

  let map = this.map_;
  goog.asserts.assert(map);

  let interaction = new ol.interaction.Snap({
    edge: item.snappingConfig.edge,
    features: item.features,
    pixelTolerance: item.snappingConfig.tolerance,
    vertex: item.snappingConfig.vertex
  });

  map.addInteraction(interaction);

  item.interaction = interaction;
  item.active = true;

  // Init features
  this.loadItemFeatures_(item);
};


/**
 * Deactivate a cache item by removing the snap interaction and clearing any
 * existing features.
 *
 * @param {gmf.Snapping.CacheItem} item Cache item.
 * @private
 */
gmf.Snapping.prototype.deactivateItem_ = function(item) {

  // No need to do anything if item is already inactive
  if (!item.active) {
    return;
  }

  let map = this.map_;
  goog.asserts.assert(map);

  let interaction = item.interaction;
  map.removeInteraction(interaction);

  item.interaction = null;
  item.features.clear();

  // If a previous request is still running, cancel it.
  if (item.requestDeferred) {
    item.requestDeferred.resolve();
    item.requestDeferred = null;
  }

  item.active = false;
};


/**
 * @private
 */
gmf.Snapping.prototype.loadAllItems_ = function() {
  this.mapViewChangePromise_ = null;
  let item;
  for (let uid in this.cache_) {
    item = this.cache_[+uid];
    if (item.active) {
      this.loadItemFeatures_(item);
    }
  }
};


/**
 * For a specific cache item, issue a new WFS GetFeatures request. The returned
 * features set in the item collection of features (they replace any existing
 * ones first).
 *
 * @param {gmf.Snapping.CacheItem} item Cache item.
 * @private
 */
gmf.Snapping.prototype.loadItemFeatures_ = function(item) {

  // If a previous request is still running, cancel it.
  if (item.requestDeferred) {
    item.requestDeferred.resolve();
  }

  let map = this.map_;
  goog.asserts.assert(map);

  let view = map.getView();
  let size = map.getSize();
  goog.asserts.assert(size);

  let extent = view.calculateExtent(size);
  let projCode = view.getProjection().getCode();
  let featureTypes = item.wfsConfig.featureTypes.split(',');

  let getFeatureOptions = {
    srsName: projCode,
    featureNS: item.featureNS,
    featurePrefix: item.featurePrefix,
    featureTypes: featureTypes,
    outputFormat: 'GML3',
    bbox: extent,
    geometryName: item.geometryName,
    maxFeatures: item.maxFeatures
  };

  let wfsFormat = new ol.format.WFS();
  let xmlSerializer = new XMLSerializer();
  let featureRequestXml = wfsFormat.writeGetFeature(getFeatureOptions);
  let featureRequest = xmlSerializer.serializeToString(featureRequestXml);
  let url = item.wfsConfig.url;

  item.requestDeferred = this.q_.defer();

  this.http_.post(url, featureRequest, {timeout: item.requestDeferred.promise})
    .then(function(response) {
      // (1) Unset requestDeferred
      item.requestDeferred = null;

      // (2) Clear any previous features in the item
      item.features.clear();

      // (3) Read features from request response and add them to the item
      let readFeatures = new ol.format.WFS().readFeatures(response.data);
      if (readFeatures) {
        item.features.extend(readFeatures);
      }
    }.bind(this));

};


/**
 * Called when the map view changes. Load all active cache items after a small
 * delay. Cancel any currenly delayed call, if required.
 * @private
 */
gmf.Snapping.prototype.handleMapViewChange_ = function() {
  if (this.mapViewChangePromise_) {
    this.timeout_.cancel(this.mapViewChangePromise_);
  }
  this.mapViewChangePromise_ = this.timeout_(
    this.loadAllItems_.bind(this),
    400
  );
};


/**
 * @typedef {Object<number, gmf.Snapping.CacheItem>}
 */
gmf.Snapping.Cache;


/**
 * @typedef {{
 *     active: (boolean),
 *     featureNS: (string),
 *     featurePrefix: (string),
 *     features: (ol.Collection.<ol.Feature>),
 *     geometryName: (string),
 *     interaction: (?ol.interaction.Snap),
 *     maxFeatures: (number),
 *     requestDeferred: (?angular.$q.Deferred),
 *     snappingConfig: (gmfThemes.GmfSnappingConfig),
 *     stateWatcherUnregister: (Function),
 *     treeCtrl: (ngeo.LayertreeController),
 *     wfsConfig: (gmf.Snapping.WFSConfig)
 * }}
 */
gmf.Snapping.CacheItem;


/**
 * @typedef {{
 *     featureTypes: (string),
 *     url: (string)
 * }}
 */
gmf.Snapping.WFSConfig;


gmf.module.service('gmfSnapping', gmf.Snapping);
