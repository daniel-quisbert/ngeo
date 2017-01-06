goog.provide('ngeo.interaction.MeasureArea');

goog.require('ngeo.interaction.Measure');
goog.require('ol.geom.Polygon');
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
ngeo.interaction.MeasureArea = function(format, opt_options) {

  let options = opt_options !== undefined ? opt_options : {};

  ngeo.interaction.Measure.call(this, options);


  /**
   * Message to show after the first point is clicked.
   * @type {Element}
   */
  this.continueMsg = options.continueMsg !== undefined ? options.continueMsg :
      goog.dom.createDom('SPAN', {},
          'Click to continue drawing the polygon.',
          goog.dom.createDom('BR'),
          'Double-click or click starting point to finish.');

  /**
   * The format function
   * @type {ngeox.unitPrefix}
   */
  this.format = format;

};
ol.inherits(ngeo.interaction.MeasureArea, ngeo.interaction.Measure);


/**
 * @inheritDoc
 */
ngeo.interaction.MeasureArea.prototype.createDrawInteraction = function(style,
    source) {

  return new ol.interaction.Draw(
      /** @type {olx.interaction.DrawOptions} */ ({
        type: 'Polygon',
        source: source,
        style: style
      }));

};


/**
 * @inheritDoc
 */
ngeo.interaction.MeasureArea.prototype.handleMeasure = function(callback) {
  let geom = /** @type {ol.geom.Polygon} */
      (this.sketchFeature.getGeometry());
  let proj = this.getMap().getView().getProjection();
  let dec = this.decimals;
  let output = ngeo.interaction.Measure.getFormattedArea(geom, proj, dec, this.format);
  let verticesCount = geom.getCoordinates()[0].length;
  let coord = null;
  if (verticesCount > 2) {
    coord = geom.getInteriorPoint().getCoordinates();
  }
  callback(output, coord);
};
