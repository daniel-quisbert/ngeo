goog.provide('ngeo.interaction.ModifyRectangle');

goog.require('goog.asserts');
goog.require('ol');
goog.require('ol.Collection');
goog.require('ol.Feature');
goog.require('ol.MapBrowserPointerEvent');
goog.require('ol.events');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.interaction.Modify');
goog.require('ol.interaction.Pointer');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');


/**
 * @classdesc
 * Interaction for modifying feature geometries.
 *
 * @constructor
 * @struct
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.ModifyOptions} options Options.
 * @fires ngeo.interaction.ModifyCircleEvent
 * @export
 * @api
 */
ngeo.interaction.ModifyRectangle = function(options) {

  ol.interaction.Pointer.call(this, {
    handleDownEvent: this.handleDown_,
    handleMoveEvent: this.handleMove_,
    handleDragEvent: this.handleDrag_,
    handleUpEvent: this.handleUp_
  });

  /**
   * @type {boolean}
   * @private
   */
  this.modified_ = false;

  // Get the style for the box and the points
  let style = options.style ? options.style : ol.interaction.Modify.getDefaultStyleFunction();

  /**
   * @type {ol.layer.Vector}
   * @private
   */
  this.vectorPoints_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      wrapX: !!options.wrapX
    }),
    style: style,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  });

  /**
   * @type {ol.Collection.<ol.Feature>}
   * @private
   */
  this.features_ = options.features;

  /**
   * The feature currently modified.
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null;

  /**
   * @type {Object.<number, ngeo.interaction.ModifyRectangle.CacheItem>}
   * @private
   */
  this.cache_ = {};

  ol.events.listen(this.features_, ol.Collection.EventType.ADD,
      this.handleFeatureAdd_, this);
  ol.events.listen(this.features_, ol.Collection.EventType.REMOVE,
      this.handleFeatureRemove_, this);

  this.features_.forEach(this.addFeature_, this);

};
ol.inherits(ngeo.interaction.ModifyRectangle, ol.interaction.Pointer);


/**
 * @param {ol.Feature} feature Feature.
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.addFeature_ = function(feature) {
  let featureGeom = feature.getGeometry();
  if (featureGeom instanceof ol.geom.Polygon) {

    // If the feature's corners are already set, no need to set them again
    let uid = ol.getUid(feature);
    let item = this.cache_[uid];
    if (item) {
      return;
    }

    let pointSource = this.vectorPoints_.getSource();

    // from each corners, create a point feature and add it to the point layer.
    // each point is then associated with 2 siblings in order to update the
    // siblings geometry at the same time when a point gets dragged around.
    // mark each one as 'corner'
    let corners = featureGeom.getCoordinates()[0];
    while (corners.length > 4) {
      if (corners[0][0] < corners[1][0] && corners[0][1] <= corners[1][1]) {
        corners.pop();
      } else {
        corners.shift();
      }
    }
    let pointFeatures = [];
    let cornerPoint;
    let cornerFeature;
    corners.forEach(function(corner) {
      cornerPoint = new ol.geom.Point(corner);
      cornerFeature = new ol.Feature({
        'corner': true,
        'geometry': cornerPoint,
        'siblingX': null,
        'siblingY': null,
        'boxFeature': feature
      });

      pointFeatures.push(cornerFeature);
    }, this);
    item = /** @type {ngeo.interaction.ModifyRectangle.CacheItem} */ ({
      corners: pointFeatures
    });
    this.cache_[uid] = item;

    let previousFeature;
    let nextFeature;
    pointFeatures.forEach(function(cornerFeature, index) {
      previousFeature = pointFeatures[index - 1];
      if (!previousFeature) {
        previousFeature = pointFeatures[pointFeatures.length - 1];
      }

      nextFeature = pointFeatures[index + 1];
      if (!nextFeature) {
        nextFeature = pointFeatures[0];
      }

      if (index % 2 === 0) {
        cornerFeature.set('siblingX', nextFeature);
        cornerFeature.set('siblingY', previousFeature);
      } else {
        cornerFeature.set('siblingX', previousFeature);
        cornerFeature.set('siblingY', nextFeature);
      }

    }, this);
    pointSource.addFeatures(pointFeatures);
  }

};


/**
 * @param {ol.MapBrowserPointerEvent} evt Map browser event
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.willModifyFeatures_ = function(evt) {
  if (!this.modified_) {
    this.modified_ = true;
    this.dispatchEvent(new ol.interaction.Modify.Event(
        ol.interaction.Modify.EventType.MODIFYSTART, this.features_, evt));
  }
};


/**
 * @param {ol.Feature} feature Feature.
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.removeFeature_ = function(feature) {
  let uid = ol.getUid(feature);
  let item = this.cache_[uid];
  let corners = item.corners;
  for (let i = 0; i < corners.length; i++) {
    this.vectorPoints_.getSource().removeFeature(corners[i]);
  }
  this.feature_ = null;
  corners.length = 0;
  delete this.cache_[uid];
};


/**
 * @inheritDoc
 */
ngeo.interaction.ModifyRectangle.prototype.setMap = function(map) {
  this.vectorPoints_.setMap(map);
  this.vectorPoints_.setVisible(false);
  ol.interaction.Pointer.prototype.setMap.call(this, map);
};


/**
 * @param {ol.Collection.Event} evt Event.
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleFeatureAdd_ = function(evt) {
  let feature = evt.element;
  goog.asserts.assertInstanceof(feature, ol.Feature,
      'feature should be an ol.Feature');
  this.addFeature_(feature);
};


/**
 * @param {ol.Collection.Event} evt Event.
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleFeatureRemove_ = function(evt) {
  let feature = /** @type {ol.Feature} */ (evt.element);
  this.removeFeature_(feature);
};


/**
 * Show/hide the points when hovering the polygon
 * @param {ol.MapBrowserEvent} evt Event.
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleMove_ = function(evt) {
  let hit = evt.map.hasFeatureAtPixel(evt.pixel);

  if (this.vectorPoints_.getVisible() != hit) {
    this.vectorPoints_.changed();
  }
  this.vectorPoints_.setVisible(hit);
};


/**
 * @param {ol.MapBrowserPointerEvent} evt Event.
 * @return {boolean} Start drag sequence?
 * @this {ngeo.interaction.ModifyRectangle}
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleDown_ = function(evt) {
  let map = evt.map;

  let feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      }, undefined);

  if (feature && feature.getGeometry() instanceof ol.geom.Point &&
      feature.get('siblingX') && feature.get('siblingY')) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;

    this.vectorPoints_.setVisible(true);

    return true;
  }

  return false;
};


/**
 * @param {ol.MapBrowserPointerEvent} evt Event.
 * @this {ngeo.interaction.ModifyRectangle}
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleDrag_ = function(evt) {
  this.willModifyFeatures_(evt);
  let feature = this.feature_;

  let geometry = /** @type {ol.geom.SimpleGeometry} */
      (feature.getGeometry());

  if (geometry instanceof ol.geom.Point) {
    this.vectorPoints_.setVisible(true);

    geometry.setCoordinates(evt.coordinate);

    // Get all four corners' coordinates

    // 1 - The pixel of the handle we dragged
    let destinationPixel = evt.pixel;

    // 2 - One of our siblings
    let siblingX = feature.get('siblingX');
    goog.asserts.assertInstanceof(siblingX, ol.Feature);
    let siblingXPoint = siblingX.getGeometry();
    goog.asserts.assertInstanceof(siblingXPoint, ol.geom.Point);
    let siblingXCoordinate = siblingXPoint.getCoordinates();
    let siblingXPixel = this.getMap().getPixelFromCoordinate(siblingXCoordinate);

    // 3 - The second sibling
    let siblingY = feature.get('siblingY');
    goog.asserts.assertInstanceof(siblingY, ol.Feature);
    let siblingYPoint = siblingY.getGeometry();
    goog.asserts.assertInstanceof(siblingYPoint, ol.geom.Point);
    let siblingYCoordinate = siblingYPoint.getCoordinates();
    let siblingYPixel = this.getMap().getPixelFromCoordinate(siblingYCoordinate);

    // 4 - The point opposite of the handle we dragged
    let opposite = siblingY.get('siblingY');
    goog.asserts.assertInstanceof(opposite, ol.Feature);
    if (ol.getUid(feature) == ol.getUid(opposite)) {
      opposite = siblingY.get('siblingX');
    }

    goog.asserts.assertInstanceof(opposite, ol.Feature);
    let oppositePoint = opposite.getGeometry();
    goog.asserts.assertInstanceof(oppositePoint, ol.geom.Point);
    let origin = oppositePoint.getCoordinates();
    let originPixel = this.getMap().getPixelFromCoordinate(origin);

    // Calculate new positions of siblings
    let b2Pixel = this.calculateNewPixel_(originPixel, destinationPixel, siblingXPixel);
    let b2Coordinate = this.getMap().getCoordinateFromPixel(b2Pixel);
    siblingXPoint.setCoordinates(b2Coordinate);

    let c2Pixel = this.calculateNewPixel_(originPixel, destinationPixel, siblingYPixel);
    let c2Coordinate = this.getMap().getCoordinateFromPixel(c2Pixel);

    siblingYPoint.setCoordinates(c2Coordinate);


    // Resize the box
    let boxFeature = feature.get('boxFeature');
    let geom = boxFeature.getGeometry();
    goog.asserts.assertInstanceof(geom, ol.geom.Polygon);
    geom.setCoordinates([[evt.coordinate, b2Coordinate, origin, c2Coordinate, evt.coordinate]]);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
  }
};


/**
 * Calculate the new position of a point as projected on a vector from origin to
 * destination.
 * @param {ol.Pixel} origin Pixel of origin (opposite of the drag handle)
 * @param {ol.Pixel} destination Pixel of destination (the handle we dragged)
 * @param {ol.Pixel} point The point to transform.
 * @return {ol.Pixel} The new pixel of the point
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.calculateNewPixel_ = function(
  origin, destination, point) {

  let aVector = [destination[0] - origin[0], destination[1] - origin[1]];
  let bVector = [
    point[0] - origin[0],
    point[1] - origin[1]
  ];

  let abScalarProduct = aVector[0] * bVector[0] + aVector[1] * bVector[1];
  let bDivisor = Math.pow(bVector[0], 2) + Math.pow(bVector[1], 2);

  let b2Vector = [
    (bVector[0] * abScalarProduct) / bDivisor,
    (bVector[1] * abScalarProduct) / bDivisor
  ];

  return [b2Vector[0] + origin[0], b2Vector[1] + origin[1]];
};


/**
 * @param {ol.MapBrowserPointerEvent} evt Event.
 * @return {boolean} Stop drag sequence?
 * @this {ngeo.interaction.ModifyRectangle}
 * @private
 */
ngeo.interaction.ModifyRectangle.prototype.handleUp_ = function(evt) {
  if (this.modified_) {
    this.dispatchEvent(new ol.interaction.Modify.Event(
        ol.interaction.Modify.EventType.MODIFYEND, this.features_, evt));
    this.modified_ = false;
  }
  return false;
};


/**
 * @typedef {{
 *     corners: Array.<ol.Feature>
 * }}
 */
ngeo.interaction.ModifyRectangle.CacheItem;
