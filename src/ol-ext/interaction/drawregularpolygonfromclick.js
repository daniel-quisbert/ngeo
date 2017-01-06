goog.provide('ngeo.interaction.DrawRegularPolygonFromClick');

goog.require('ol.Feature');
goog.require('ol.functions');
goog.require('ol.geom.Circle');
goog.require('ol.interaction.Draw');
goog.require('ol.interaction.Interaction');


/**
 * @classdesc
 * This interactions allows drawing regular polygons of a pre-determined number
 * of sides and size a a clicked location on the map.
 *
 * @constructor
 * @struct
 * @fires ol.interaction.Draw.Event
 * @extends {ol.interaction.Interaction}
 * @param {ngeox.interaction.DrawRegularPolygonFromClickOptions} options Options
 * @export
 */
ngeo.interaction.DrawRegularPolygonFromClick = function(options) {

  /**
   * @type {number}
   * @private
   */
  this.angle_ = options.angle !== undefined ? options.angle : 0;

  /**
   * @type {number}
   * @private
   */
  this.radius_ = options.radius;

  /**
   * @type {number}
   * @private
   */
  this.sides_ = options.sides !== undefined ? options.sides : 3;

  /**
   * @type {!Array.<ol.EventsKey>}
   * @private
   */
  this.listenerKeys_ = [];

  ol.interaction.Interaction.call(this, {
    handleEvent: ol.functions.TRUE
  });

};
ol.inherits(
  ngeo.interaction.DrawRegularPolygonFromClick, ol.interaction.Interaction);


/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @export
 */
ngeo.interaction.DrawRegularPolygonFromClick.prototype.setActive = function(
  active
) {

  ol.interaction.Interaction.prototype.setActive.call(this, active);

  if (this.getMap()) {
    if (active) {
      this.enable_();
    } else {
      this.disable_();
    }
  }
};


/**
 * @inheritDoc
 */
ngeo.interaction.DrawRegularPolygonFromClick.prototype.setMap = function(map) {

  let active = this.getActive();

  let currentMap = this.getMap();
  if (currentMap && active) {
    this.disable_();
  }

  ol.interaction.Interaction.prototype.setMap.call(this, map);

  if (map && active) {
    this.enable_();
  }

};


/**
 * Enable the interaction. Called when added to a map AND active.
 * @private
 */
ngeo.interaction.DrawRegularPolygonFromClick.prototype.enable_ = function() {
  let map = this.getMap();
  goog.asserts.assert(map, 'Map should be set.');
  this.listenerKeys_.push(
    ol.events.listen(
      map,
      ol.MapBrowserEvent.EventType.CLICK,
      this.handleMapClick_,
      this
    )
  );
};


/**
 * Disable the interaction. Called when removed from a map or deactivated.
 * @private
 */
ngeo.interaction.DrawRegularPolygonFromClick.prototype.disable_ = function() {
  let map = this.getMap();
  goog.asserts.assert(map, 'Map should be set.');
  this.listenerKeys_.forEach(ol.events.unlistenByKey, this);
  this.listenerKeys_.length = 0;
};


/**
 * Called the the map is clicked. Create a regular polygon at the clicked
 * location using the configuration
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @private
 */
ngeo.interaction.DrawRegularPolygonFromClick.prototype.handleMapClick_ = function(
  evt
) {

  let center = evt.coordinate;
  let geometry = ol.geom.Polygon.fromCircle(
    new ol.geom.Circle(center), this.sides_
  );

  ol.geom.Polygon.makeRegular(geometry, center, this.radius_, this.angle_);

  this.dispatchEvent(
    new ol.interaction.Draw.Event(
      ol.interaction.Draw.EventType.DRAWEND,
      new ol.Feature(geometry)
    )
  );
};
