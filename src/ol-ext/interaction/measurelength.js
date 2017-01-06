goog.provide('ngeo.interaction.MeasureLength');

goog.require('ngeo.interaction.Measure');
goog.require('ol.geom.LineString');
goog.require('ol.interaction.Draw');


/**
 * @classdesc
 * Interaction dedicated to measure length.
 *
 * See our live example: [../examples/measure.html](../examples/measure.html)
 *
 * @constructor
 * @struct
 * @extends {ngeo.interaction.Measure}
 * @param {ngeox.unitPrefix} format The format function
 * @param {ngeox.interaction.MeasureOptions=} opt_options Options
 * @export
 */
ngeo.interaction.MeasureLength = function(format, opt_options) {

  let options = opt_options !== undefined ? opt_options : {};

  ngeo.interaction.Measure.call(this, options);


  /**
   * Message to show after the first point is clicked.
   * @type {Element}
   */
  this.continueMsg = options.continueMsg !== undefined ? options.continueMsg :
      goog.dom.createDom('SPAN', {},
          'Click to continue drawing the line.',
          goog.dom.createDom('BR'),
          'Double-click or click last point to finish.');

  /**
   * The format function
   * @type {ngeox.unitPrefix}
   */
  this.format = format;

};
ol.inherits(ngeo.interaction.MeasureLength, ngeo.interaction.Measure);


/**
 * @inheritDoc
 */
ngeo.interaction.MeasureLength.prototype.createDrawInteraction = function(style,
    source) {

  return new ol.interaction.Draw(
      /** @type {olx.interaction.DrawOptions} */ ({
        type: 'LineString',
        source: source,
        style: style
      }));

};


/**
 * @inheritDoc
 */
ngeo.interaction.MeasureLength.prototype.handleMeasure = function(callback) {
  let geom = /** @type {ol.geom.LineString} */
      (this.sketchFeature.getGeometry());
  let proj = this.getMap().getView().getProjection();
  let dec = this.decimals;
  let output = ngeo.interaction.Measure.getFormattedLength(geom, proj, dec, this.format);
  let coord = geom.getLastCoordinate();
  callback(output, coord);
};
