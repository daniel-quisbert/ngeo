goog.provide('gmf.ObjectEditingQuery');

goog.require('gmf');
goog.require('gmf.Themes');
goog.require('ol.format.WMSGetFeatureInfo');
goog.require('ol.source.ImageWMS');


/**
 * A service that collects all queryable layer nodes from all themes, stores
 * them and use them to make WMS GetFeatureInfo queries. Queries can be made
 * regardless of the associated layer visibility. The layer nodes are also
 * loaded only once.
 *
 * @param {angular.$http} $http Angular $http service.
 * @param {angular.$q} $q Angular $q service.
 * @param {gmf.Themes} gmfThemes The gmf themes service.
 * @constructor
 * @struct
 * @ngInject
 */
gmf.ObjectEditingQuery = function($http, $q, gmfThemes) {

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
   * @type {gmf.Themes}
   * @private
   */
  this.gmfThemes_ = gmfThemes;

  /**
   * @type {?angular.$q.Deferred}
   * @private
   */
  this.getQueryableLayerNodesDefered_ = null;

};


/**
 * @return {angular.$q.Promise} Promise.
 * @export
 */
gmf.ObjectEditingQuery.prototype.getQueryableLayersInfo = function() {

  if (!this.getQueryableLayerNodesDefered_) {
    this.getQueryableLayerNodesDefered_ = this.q_.defer();
    this.gmfThemes_.getOgcServersObject().then(function(ogcServers) {
      this.gmfThemes_.getThemesObject().then(function(themes) {
        if (!themes) {
          return;
        }

        // Get all queryable nodes
        let allQueryableLayersInfo =
            gmf.ObjectEditingQuery.getQueryableLayersInfoFromThemes(
              themes,
              ogcServers
            );

        // Narrow down to only those that have the 'copyable' metadata set
        let queryableLayersInfo = [];
        for (let i = 0, ii = allQueryableLayersInfo.length; i < ii; i++) {
          if (allQueryableLayersInfo[i].layerNode.metadata.copyable) {
            queryableLayersInfo.push(allQueryableLayersInfo[i]);
          }
        }

        this.getQueryableLayerNodesDefered_.resolve(queryableLayersInfo);
      }.bind(this));
    }.bind(this));
  }

  return this.getQueryableLayerNodesDefered_.promise;

};


/**
 * From a list of theme nodes, collect all WMS layer nodes that are queryable.
 * A list of OGC servers is given in order to bind each queryable layer node
 * to its associated server and be able to build requests.
 *
 * @param {Array.<gmfThemes.GmfTheme>} themes List of theme nodes.
 * @param {gmfThemes.GmfOgcServers} ogcServers List of ogc servers
 * @return {Array.<gmf.ObjectEditingQuery.QueryableLayerInfo>} List of
 *     queryable layers information.
 * @export
 */
gmf.ObjectEditingQuery.getQueryableLayersInfoFromThemes = function(
  themes, ogcServers
) {
  let queryableLayersInfo = [];
  let theme;
  let group;
  let nodes;
  let node;

  for (let i = 0, ii = themes.length; i < ii; i++) {
    theme = /** @type {gmfThemes.GmfTheme} */ (themes[i]);
    for (let j = 0, jj = theme.children.length; j < jj; j++) {
      group = /** @type {gmfThemes.GmfGroup} */ (theme.children[j]);

      // Skip groups that don't have an ogcServer set
      if (!group.ogcServer) {
        continue;
      }

      nodes = [];
      gmf.Themes.getFlatNodes(group, nodes);

      for (let k = 0, kk = nodes.length; k < kk; k++) {
        node = /** @type {gmfThemes.GmfGroup|gmfThemes.GmfLayerWMS} */ (
          nodes[k]);

        // Skip groups within groups
        if (node.children && node.children.length) {
          continue;
        }

        if (node.childLayers &&
          node.childLayers[0] &&
          node.childLayers[0].queryable
        ) {
          queryableLayersInfo.push({
            layerNode: node,
            ogcServer: ogcServers[group.ogcServer]
          });
        }
      }
    }
  }

  return queryableLayersInfo;
};


/**
 * From a queryable layer (WMS layer node), use its associated OGC server
 * to issue a single WMS GetFeatureInfo request at a specific location on a
 * specific map to fetch a single feature. If no feature is found, a `null`
 * value is returned.
 *
 * @param {gmf.ObjectEditingQuery.QueryableLayerInfo} layerInfo Queryable layer
 *     information.
 * @param {ol.Coordinate} coordinate Coordinate.
 * @param {ol.Map} map Map.
 * @return {angular.$q.Promise} Promise.
 * @export
 */
gmf.ObjectEditingQuery.prototype.getFeatureInfo = function(
  layerInfo,
  coordinate,
  map
) {

  let view = map.getView();
  let projCode = view.getProjection().getCode();
  let resolution = /** @type {number} */(view.getResolution());
  let infoFormat = ngeo.QueryInfoFormatType.GML;
  let layerNode = layerInfo.layerNode;
  let layersParam = layerNode.layers.split(',');
  let ogcServer = layerInfo.ogcServer;

  let format = new ol.format.WMSGetFeatureInfo({
    layers: layersParam
  });

  let wmsSource = new ol.source.ImageWMS({
    url: ogcServer.url,
    params: {
      layers: layersParam
    }
  });

  let url = /** @type {string} */ (
    wmsSource.getGetFeatureInfoUrl(coordinate, resolution, projCode, {
      'INFO_FORMAT': infoFormat,
      'FEATURE_COUNT': 1,
      'QUERY_LAYERS': layersParam
    })
  );

  return this.http_.get(url).then(
    function(format, response) {
      let features = format.readFeatures(response.data);
      return (features && features[0]) ? features[0] : null;
    }.bind(this, format)
  );
};


gmf.module.service('gmfObjectEditingQuery', gmf.ObjectEditingQuery);


/**
 * @typedef {{
 *     ogcServers: (gmfThemes.GmfOgcServers),
 *     queryableLayerNodes: (Array.<gmfThemes.GmfLayerWMS>)
 * }}
 */
gmf.ObjectEditingQuery.GetQueryableLayerNodesResponse;


/**
 * @constructor
 * @struct
 * @export
 */
gmf.ObjectEditingQuery.QueryableLayerInfo = function() {};


/**
 * @type {gmfThemes.GmfOgcServer}
 * @export
 */
gmf.ObjectEditingQuery.QueryableLayerInfo.prototype.ogcServer;


/**
 * @type {gmfThemes.GmfLayerWMS}
 * @export
 */
gmf.ObjectEditingQuery.QueryableLayerInfo.prototype.layerNode;
