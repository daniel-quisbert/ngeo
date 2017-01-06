goog.provide('gmf.SyncLayertreeMap');

goog.require('gmf');
goog.require('gmf.WMSTime');
goog.require('ol.layer.Image');
goog.require('ol.layer.Tile');

/**
 * Service to create layer based on a ngeo.LayertreeController with a
 * GMFThemesGroup ou GMFThemesLeaf as node object.
 * This layer is also used to synchronise a state of ngeo.LayertreeController
 * and its corresponding layer in the map.
 *
 * @constructor
 * @param {angular.Scope} $rootScope Angular rootScope.
 * @param {ngeo.LayerHelper} ngeoLayerHelper Ngeo Layer Helper.
 * @param {gmf.Themes} gmfThemes The gmf Themes service.
 * @param {gmf.WMSTime} gmfWMSTime wms time service.
 * @ngInject
 * @ngdoc service
 * @ngname gmfSyncLayertreeMap
 */
gmf.SyncLayertreeMap = function($rootScope, ngeoLayerHelper, gmfThemes, gmfWMSTime) {

  /**
   * @type {ngeo.LayerHelper}
   * @private
   */
  this.layerHelper_ = ngeoLayerHelper;

  /**
   * @type {gmf.WMSTime}
   * @private
   */
  this.gmfWMSTime_ = gmfWMSTime;

  /**
   * @type {gmfThemes.GmfOgcServers}
   * @private
   */
  this.ogcServersObject_;

  gmfThemes.getOgcServersObject().then(function(ogcServersObject) {
    this.ogcServersObject_ = ogcServersObject;
  }.bind(this));

  $rootScope.$on('ngeo-layertree-state', function(map, treeCtrl, firstParent) {
    this.sync_(map, firstParent);
  }.bind(this));
};


/**
 * Create, insert (or update) and return a layer from the GmfGroup or the
 * GmfLayer of the given treeCtrl.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @param {ol.Map} map A map that contains the group to insert the not first
 *     level group layer.
 * @param {ol.layer.Group} dataLayerGroup the layer group to insert the first
 *     level group layer.
 * @param {number=} opt_position for first level Group, you can precise the
 *     position to add the group in the array of layers of the dataLayerGroup.
 * @return {ol.layer.Base|ol.layer.Group} a new layer.
 * @public
 */
gmf.SyncLayertreeMap.prototype.createLayer = function(treeCtrl, map,
    dataLayerGroup, opt_position) {
  /**
   * @type {ol.layer.Base|ol.layer.Group}
   */
  let layer = null;
  if (treeCtrl.node.children !== undefined && treeCtrl.node.mixed) {
    // Mixed groups
    layer = this.createGroup_(treeCtrl, map, dataLayerGroup, opt_position);
  } else if (treeCtrl.node.children === undefined && treeCtrl.parent.node.mixed) {
    // Layers in a mixed group
    layer = this.createLeafInAMixedGroup_(treeCtrl, map);
  } else if (treeCtrl.node.children === undefined) {
    // Layers in a non mixed group
    this.initGmfLayerInANotMixedGroup_(treeCtrl, map);
  } else if (treeCtrl.depth === 1 && !treeCtrl.node.mixed) {
    // First level group non mix
    layer = this.createGroup_(treeCtrl, map, dataLayerGroup, opt_position);
  }
  return layer;
};


/**
 * Synchronise the state of each layers corresponding to the given tree and
 * all its children.
 * @param {ol.Map} map A map that contains the layers.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @private
 */
gmf.SyncLayertreeMap.prototype.sync_ = function(map, treeCtrl) {
  treeCtrl.traverseDepthFirst(function(treeCtrl) {
    if (treeCtrl.layer && !treeCtrl.node.mixed) {
      this.updateLayerState_(treeCtrl.layer, treeCtrl);
    }
  }.bind(this));
};


/**
 * Set the active state of a layer based on its treeCtrl state.
 * @param {ol.layer.Tile|ol.layer.Image} layer A layer.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @private
 */
gmf.SyncLayertreeMap.prototype.updateLayerState_ = function(layer, treeCtrl) {
  let active = treeCtrl.getState() === 'on';
  if (treeCtrl.node.type === 'WMTS') {
    layer.setVisible(active);
  } else if (!treeCtrl.node.mixed && treeCtrl.depth === 1) {
    // First level non mixed group
    goog.asserts.assertInstanceof(layer, ol.layer.Image);
    let names = [];
    treeCtrl.traverseDepthFirst(function(treeCtrl) {
      if (treeCtrl.node.children === undefined && treeCtrl.getState() === 'on') {
        names.push(treeCtrl.node.layers);
      }
    });
    if (names.length === 0) {
      layer.setVisible(false);
    }
    /** @type {ol.source.ImageWMS} */ (layer.getSource()).updateParams({
      'LAYERS': names.reverse().join(',')
    });
    if (names.length !== 0) {
      layer.setVisible(true);
    }
  } else {
    // WMS mixed layer
    goog.asserts.assertInstanceof(layer, ol.layer.Image);
    layer.setVisible(active);
  }
};


/**
 * Create insert and return a layer group (for not mixed case) or a wmsLayer (for
 * mixed case). Take care about the insertion order in the map in case of first
 * level group.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @param {ol.Map} map A map that contains the group to insert the not first
 *     level group layer.
 * @param {ol.layer.Group} dataLayerGroup the layer group to insert the first
 *     level group layer.
 * @param {number=} opt_position for first level Group, you can precise the
 *     position to add the group in the array of layers of the dataLayerGroup.
 * @return {ol.layer.Image|ol.layer.Group} a new layer.
 * @private
 */
gmf.SyncLayertreeMap.prototype.createGroup_ = function(treeCtrl, map,
    dataLayerGroup, opt_position) {
  let groupNode = /** @type {gmfThemes.GmfGroup} */ (treeCtrl.node);
  let layer = null;
  let isFirstLevelGroup = treeCtrl.parent.isRoot;

  if (isFirstLevelGroup) { // First level group
    layer = this.createLayerFromGroup_(treeCtrl, !!groupNode.mixed);
    // Insert the layer at the right place
    let position = opt_position | 0;
    dataLayerGroup.getLayers().insertAt(position, layer);

  } else { // Other Groups, create a group layer only in mixed groups
    let inAMixedGroup = !this.isOneParentNotMixed_(treeCtrl);
    if (inAMixedGroup) {
      layer = this.createLayerFromGroup_(treeCtrl, true);
      let layerGroup = /** @type {ol.layer.Group} */ (
              gmf.SyncLayertreeMap.getLayer(treeCtrl.parent));
      layerGroup.getLayers().insertAt(0, layer);
    }
  }
  return layer;
};


/**
 * Create, insert and return a layer group (for not mixed case) or a wmsLayer
 * for mixed case).
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @param {boolean} mixed True for a group layer, false for a WMS layer.
 * @return {ol.layer.Image|ol.layer.Group} a new layer.
 * @private
 */
gmf.SyncLayertreeMap.prototype.createLayerFromGroup_ = function(treeCtrl,
    mixed) {
  let layer;
  let groupNode = /** @type {gmfThemes.GmfGroup} */ (treeCtrl.node);
  if (mixed) { // Will be one ol.layer per each node.
    layer = this.layerHelper_.createBasicGroup();
  } else { // Will be one ol.layer for multiple WMS nodes.
    let timeParam = this.getTimeParam_(treeCtrl);
    let ogcServer = this.ogcServersObject_[groupNode.ogcServer || ''];
    goog.asserts.assert(ogcServer);
    goog.asserts.assert(ogcServer.url);
    goog.asserts.assert(ogcServer.type);
    layer = this.layerHelper_.createBasicWMSLayer(
        ogcServer.url, '', ogcServer.type, timeParam
    );
    treeCtrl.traverseDepthFirst(function(ctrl) {
      // Update layer information and tree state.
      this.updateLayerReferences_(ctrl.node, layer);
      if (ctrl.node.metadata.isChecked) {
        ctrl.setState('on', false);
        this.updateLayerState_(/** @type {ol.layer.Image} */ (layer), ctrl);
      }
    }.bind(this));
    layer.set('layerNodeName', groupNode.name); //Really useful ?
  }
  return layer;
};


/**
 * Create and insert a layer from a leaf in a mixed group.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @param {ol.Map} map A map that contains the group to insert the layer.
 * @return {ol.layer.Tile|ol.layer.Image} a new layer.
 * @private
 */
gmf.SyncLayertreeMap.prototype.createLeafInAMixedGroup_ = function(treeCtrl, map) {
  let gmfLayer = /** @type {gmfThemes.GmfLayer} */ (treeCtrl.node);
  let layer;
  // Make layer.
  if (gmfLayer.type === 'WMTS') {
    layer = this.createWMTSLayer_(/** @type gmfThemes.GmfLayerWMTS */ (gmfLayer));
  } else {
    let gmfLayerWMS = /** @type gmfThemes.GmfLayerWMS */ (gmfLayer);
    let timeParam = this.getTimeParam_(treeCtrl);
    let ogcServer = this.ogcServersObject_[/** @type string */ (gmfLayerWMS.ogcServer)];
    goog.asserts.assert(ogcServer);
    goog.asserts.assert(ogcServer.url);
    goog.asserts.assert(ogcServer.type);
    goog.asserts.assert(gmfLayerWMS.layers);
    layer = this.layerHelper_.createBasicWMSLayer(ogcServer.url,
            gmfLayerWMS.layers, ogcServer.type, timeParam);
  }
  // Update layer information and tree state.
  layer.set('layerNodeName', gmfLayer.name); // Really useful ?
  this.updateLayerReferences_(gmfLayer, layer);
  let checked = gmfLayer.metadata.isChecked === true;
  if (checked) {
    treeCtrl.setState('on', false);
  }
  layer.setVisible(checked);
  // Insert layer in the map.
  let layerGroup = /** @type {ol.layer.Group} */ (
    gmf.SyncLayertreeMap.getLayer(treeCtrl.parent));
  layerGroup.getLayers().insertAt(0, layer);
  return layer;
};


/**
 * Update a WMS layer with the given treeCtrl node information. Assumes that
 * the first parent with ogcServer information is linked to the layer to update
 * and that this treeCtrl node is a leafNode.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @param {ol.Map} map A map that contains the layer to update.
 * @private
 */
gmf.SyncLayertreeMap.prototype.initGmfLayerInANotMixedGroup_ = function(treeCtrl, map) {
  let leafNode = /** @type {gmfThemes.GmfLayer} */ (treeCtrl.node);
  let firstLevelGroup = this.getFirstLevelGroupCtrl_(treeCtrl);
  goog.asserts.assert(firstLevelGroup);
  let layer = /** @type {ol.layer.Image} */ (firstLevelGroup.layer);
  goog.asserts.assertInstanceof(layer, ol.layer.Image);
  // Update layer information and tree state.
  this.updateLayerReferences_(leafNode, layer);
  if (leafNode.metadata.isChecked) {
    treeCtrl.setState('on', false);
    this.updateLayerState_(layer, firstLevelGroup);
  } else {
    treeCtrl.parent.refreshState();
  }
};


/**
 * Create and return a Tile layer.
 * @param {gmfThemes.GmfLayerWMTS} gmfLayerWMTS A leaf node.
 * @return {ol.layer.Tile} a Tile WMTS layer. (Source and capabilities can come
 *     later).
 * @private
 */
gmf.SyncLayertreeMap.prototype.createWMTSLayer_ = function(gmfLayerWMTS) {
  let newLayer = new ol.layer.Tile();
  goog.asserts.assert(gmfLayerWMTS.url);
  goog.asserts.assert(gmfLayerWMTS.layer);
  this.layerHelper_.createWMTSLayerFromCapabilitites(gmfLayerWMTS.url,
        gmfLayerWMTS.layer, gmfLayerWMTS.dimensions).then(function(layer) {
          newLayer.setSource(layer.getSource());
          newLayer.set('capabilitiesStyles', layer.get('capabilitiesStyles'));
        });
  return newLayer;
};


/**
 * Update properties of a layer with the node of a given leafNode.
 * @param {gmfThemes.GmfLayer} leafNode a leaf node.
 * @param {ol.layer.Base} layer A layer.
 * @private
 */
gmf.SyncLayertreeMap.prototype.updateLayerReferences_ = function(leafNode,
    layer) {
  let id = leafNode.id;
  let querySourceIds = layer.get('querySourceIds') || [];
  querySourceIds.push(id);
  layer.set('querySourceIds', querySourceIds);

  if (leafNode.editable) {
    let editableIds = layer.get('editableIds') || [];
    editableIds.push(id);
    layer.set('editableIds', editableIds);
  }

  let disclaimer = leafNode.metadata.disclaimer;
  if (disclaimer) {
    let disclaimers = layer.get('disclaimers') || [];
    disclaimers.push(leafNode.metadata.disclaimer);
    layer.set('disclaimers', disclaimers);
  }
};


/**
 * Get the time parameter for a WMS Layer. If it's a group and it doesn't have
 * time, get the first time parameter available in any child.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @return {string|undefined} A wms time param.
 * @private
 */
gmf.SyncLayertreeMap.prototype.getTimeParam_ = function(treeCtrl) {
  let wmsTime;
  let timeParam;
  let node = treeCtrl.node;
  if (node.time) {
    wmsTime = node.time;
  } else if (node.children) {
    treeCtrl.traverseDepthFirst(function(treeCtrl) {
      if (treeCtrl.node.children === undefined && treeCtrl.node.time) {
        wmsTime = treeCtrl.node.time;
        return ngeo.LayertreeController.VisitorDecision.STOP;
      }
    });
  }
  if (wmsTime) {
    let timeValues = this.gmfWMSTime_.getOptions(wmsTime)['values'];
    timeParam = this.gmfWMSTime_.formatWMSTimeParam(wmsTime, {
      start: timeValues[0] || timeValues,
      end: timeValues[1]
    });
  }
  return timeParam;
};


/**
 * Return true if a parent tree is mixed, based on its node.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @return {boolean} True is any parent is mixed. False Otherwise.
 * @private
 */
gmf.SyncLayertreeMap.prototype.isOneParentNotMixed_ = function(treeCtrl) {
  let tree = treeCtrl.parent;
  let isOneParentNotMix = false;
  do {
    isOneParentNotMix = tree.node.mixed === false;
    tree = tree.parent;
  }
  while (tree.parent && !isOneParentNotMix);
  return isOneParentNotMix;
};


/**
 * Return the first parent, from the root parent, that is not mixed.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @return {ngeo.LayertreeController} The first not mixed parent.
 * @private
 */
gmf.SyncLayertreeMap.prototype.getFirstLevelGroupCtrl_ = function(
    treeCtrl) {
  let tree = treeCtrl;
  while (!tree.parent.isRoot) {
    tree = tree.parent;
  }
  return tree;
};


/**
 * Return the layer used by the given treeCtrl.
 * @param {ngeo.LayertreeController} treeCtrl ngeo layertree controller.
 * @return {ol.layer.Base} The layer.
 * @public
 */
gmf.SyncLayertreeMap.getLayer = function(treeCtrl) {
  let tree = treeCtrl;
  let layer = null;
  while (!tree.isRoot && layer === null) {
    if (tree.layer) {
      layer = tree.layer;
    }
    tree = tree.parent;
  }
  return layer;
};


gmf.module.service('gmfSyncLayertreeMap', gmf.SyncLayertreeMap);
