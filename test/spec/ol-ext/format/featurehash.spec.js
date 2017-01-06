goog.require('ol.Feature');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPoint');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.LineString');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');
goog.require('ol.style.Text');
goog.require('ngeo.format.FeatureHash');


describe('ngeo.format.FeatureHash', function() {

  let fhFormat;

  beforeEach(function() {
    fhFormat = new ngeo.format.FeatureHash();
  });

  describe('decoding', function() {

    describe('point decoding', function() {

      it('correctly decodes a point', function() {
        let point = fhFormat.readGeometry('p(__)');
        expect(point instanceof ol.geom.Point).toBeTruthy();
        let coordinate = point.getCoordinates();
        expect(coordinate).toEqual([1, 1]);
      });

    });

    describe('multi point decoding', function() {

      it('correctly decodes a multi point', function() {
        let multiPoint = fhFormat.readGeometry('P(..__)');
        expect(multiPoint instanceof ol.geom.MultiPoint).toBeTruthy();
        let coordinates = multiPoint.getCoordinates();
        expect(coordinates.length).toBe(2);
        expect(coordinates[0]).toEqual([0, 0]);
        expect(coordinates[1]).toEqual([1, 1]);
      });

    });

    describe('line decoding', function() {

      it('correctly decodes a line', function() {
        let lineString = fhFormat.readGeometry('l(..__)');
        expect(lineString instanceof ol.geom.LineString).toBeTruthy();
        let coordinates = lineString.getCoordinates();
        expect(coordinates.length).toBe(2);
        expect(coordinates[0]).toEqual([0, 0]);
        expect(coordinates[1]).toEqual([1, 1]);
      });

    });

    describe('multi line decoding', function() {

      it('correctly decodes a multi line', function() {
        let multiLineString = fhFormat.readGeometry('L(..__\'--__)');
        expect(multiLineString instanceof ol.geom.MultiLineString).toBeTruthy();
        let coordinates = multiLineString.getCoordinates();
        expect(coordinates.length).toBe(2);
        expect(coordinates[0][0]).toEqual([0, 0]);
        expect(coordinates[0][1]).toEqual([1, 1]);
        expect(coordinates[1][0]).toEqual([0, 0]);
        expect(coordinates[1][1]).toEqual([1, 1]);
      });

    });

    describe('polygon decoding', function() {

      it('correctly decodes a polygon', function() {
        let polygon = fhFormat.readGeometry('a(..DD.K\'!F_..!-.)');
        expect(polygon instanceof ol.geom.Polygon).toBeTruthy();
        let linearRingCount = polygon.getLinearRingCount();
        expect(linearRingCount).toBe(2);
        let ring;
        ring = polygon.getLinearRing(0);
        expect(ring.getCoordinates()).toEqual(
            [[0, 0], [4, 4], [4, -4], [0, 0]]);
        ring = polygon.getLinearRing(1);
        expect(ring.getCoordinates()).toEqual(
            [[2, 1], [3, 1], [3, -1], [2, -1], [2, 1]]);
      });

    });

    describe('multi polygon decoding', function() {

      it('correctly decodes a multi polygon', function() {
        let multiPolygon = fhFormat.readGeometry(
            'A(..DD.K\'!F_..!-.)(!_!!.D)');
        expect(multiPolygon instanceof ol.geom.MultiPolygon).toBeTruthy();
        let polygons = multiPolygon.getPolygons();
        expect(polygons.length).toBe(2);
        let polygon, linearRingCount, ring;
        polygon = polygons[0];
        linearRingCount = polygon.getLinearRingCount();
        expect(linearRingCount).toBe(2);
        ring = polygon.getLinearRing(0);
        expect(ring.getCoordinates()).toEqual(
            [[0, 0], [4, 4], [4, -4], [0, 0]]);
        ring = polygon.getLinearRing(1);
        expect(ring.getCoordinates()).toEqual(
            [[2, 1], [3, 1], [3, -1], [2, -1], [2, 1]]);
        polygon = polygons[1];
        linearRingCount = polygon.getLinearRingCount();
        expect(linearRingCount).toBe(1);
        ring = polygon.getLinearRing(0);
        expect(ring.getCoordinates()).toEqual(
            [[0, 0], [-2, -2], [-2, 2], [0, 0]]);
      });

    });

    describe('feature decoding', function() {

      it('correctly decodes a feature', function() {
        let feature = fhFormat.readFeature(
            'p(__~foo*foo\'bar*bar~fillColor*%23ff0101\'' +
            'strokeColor*%2301ff01\'strokeWidth*3\'' +
            'fontSize*12px\'fontColor*%230101ff)');
        expect(feature instanceof ol.Feature).toBeTruthy();
        let geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Point).toBeTruthy();
        let coordinate = geometry.getCoordinates();
        expect(coordinate).toEqual([1, 1]);
        expect(feature.get('foo')).toBe('foo');
        expect(feature.get('bar')).toBe('bar');
        let style = feature.getStyle();
        expect(style instanceof ol.style.Style).toBeTruthy();
        let fillStyle = style.getFill();
        expect(fillStyle instanceof ol.style.Fill).toBeTruthy();
        let fillColor = fillStyle.getColor();
        expect(fillColor).toBe('#ff0101');
        let strokeStyle = style.getStroke();
        expect(strokeStyle instanceof ol.style.Stroke).toBeTruthy();
        let strokeColor = strokeStyle.getColor();
        expect(strokeColor).toBe('#01ff01');
        let imageStyle = style.getImage();
        expect(imageStyle).toBe(null);
        let textStyle = style.getText();
        expect(textStyle instanceof ol.style.Text);
        let font = textStyle.getFont();
        expect(font).toBe('12px sans-serif');
        let textFillStyle = textStyle.getFill();
        expect(textFillStyle instanceof ol.style.Fill);
        let textFillColor = textFillStyle.getColor();
        expect(textFillColor).toBe('#0101ff');
      });

    });

    describe('feature decoding with pointRadius', function() {
      it('correctly decodes a feature with pointRadius', function() {
        let feature = fhFormat.readFeature(
            'p(__~foo*foo\'bar*bar~fillColor*%23ff0101\'' +
            'strokeColor*%2301ff01\'strokeWidth*3\'' +
            'pointRadius*4)');
        expect(feature instanceof ol.Feature).toBeTruthy();
        let geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Point).toBeTruthy();
        let coordinate = geometry.getCoordinates();
        expect(coordinate).toEqual([1, 1]);
        expect(feature.get('foo')).toBe('foo');
        expect(feature.get('bar')).toBe('bar');
        let style = feature.getStyle();
        expect(style instanceof ol.style.Style).toBeTruthy();
        let fillStyle = style.getFill();
        expect(fillStyle).toBe(null);
        let strokeStyle = style.getStroke();
        expect(strokeStyle).toBe(null);
        let imageStyle = style.getImage();
        expect(imageStyle instanceof ol.style.Image).toBeTruthy();
        let radius = imageStyle.getRadius();
        expect(radius).toBe(4);
        fillStyle = imageStyle.getFill();
        expect(fillStyle instanceof ol.style.Fill).toBeTruthy();
        let fillColor = fillStyle.getColor();
        expect(fillColor).toBe('#ff0101');
        strokeStyle = imageStyle.getStroke();
        expect(strokeStyle instanceof ol.style.Stroke).toBeTruthy();
        let strokeColor = strokeStyle.getColor();
        expect(strokeColor).toBe('#01ff01');
        let strokeWidth = strokeStyle.getWidth();
        expect(strokeWidth).toBe(3);
      });
    });

    describe('feature decoding with style, witout attributes', function() {
      it('correctly decodes a feature with style, witout attributes', function() {
        let feature = fhFormat.readFeature(
            'p(__~~fillColor*%23ff0101\'' +
            'strokeColor*%2301ff01\'strokeWidth*3\'' +
            'pointRadius*4)');
        expect(feature instanceof ol.Feature).toBeTruthy();
        let geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Point).toBeTruthy();
        let coordinate = geometry.getCoordinates();
        expect(coordinate).toEqual([1, 1]);
        let style = feature.getStyle();
        expect(style instanceof ol.style.Style).toBeTruthy();
        let fillStyle = style.getFill();
        expect(fillStyle).toBe(null);
        let strokeStyle = style.getStroke();
        expect(strokeStyle).toBe(null);
        let imageStyle = style.getImage();
        expect(imageStyle instanceof ol.style.Image).toBeTruthy();
        let radius = imageStyle.getRadius();
        expect(radius).toBe(4);
        fillStyle = imageStyle.getFill();
        expect(fillStyle instanceof ol.style.Fill).toBeTruthy();
        let fillColor = fillStyle.getColor();
        expect(fillColor).toBe('#ff0101');
        strokeStyle = imageStyle.getStroke();
        expect(strokeStyle instanceof ol.style.Stroke).toBeTruthy();
        let strokeColor = strokeStyle.getColor();
        expect(strokeColor).toBe('#01ff01');
        let strokeWidth = strokeStyle.getWidth();
        expect(strokeWidth).toBe(3);
      });
    });

    describe('feature decoding with attributes, witout style', function() {
      it('correctly decodes a feature with attributes, witout style', function() {
        let feature = fhFormat.readFeature('p(__~foo*foo\'bar*bar~)');
        expect(feature instanceof ol.Feature).toBeTruthy();
        let geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Point).toBeTruthy();
        let coordinate = geometry.getCoordinates();
        expect(coordinate).toEqual([1, 1]);
        expect(feature.get('foo')).toBe('foo');
        expect(feature.get('bar')).toBe('bar');
      });
    });

    describe('features decoding', function() {

      it('correctly decodes features', function() {
        let features = fhFormat.readFeatures('Fp(__)l(..__)');
        expect(features.length).toBe(2);
        let feature, geometry, coordinates;
        feature = features[0];
        expect(feature instanceof ol.Feature).toBeTruthy();
        geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Point).toBeTruthy();
        coordinates = geometry.getCoordinates();
        expect(coordinates).toEqual([1, 1]);
        feature = features[1];
        expect(feature instanceof ol.Feature).toBeTruthy();
        geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.LineString).toBeTruthy();
        coordinates = geometry.getCoordinates();
        expect(coordinates.length).toBe(2);
        expect(coordinates[0]).toEqual([0, 0]);
        expect(coordinates[1]).toEqual([1, 1]);
      });

    });

  });

  describe('encoding', function() {

    describe('point encoding', function() {

      it('correctly encodes a point', function() {
        let point = new ol.geom.Point([1, 1]);
        let result = fhFormat.writeGeometry(point);
        expect(result).toBe('p(__)');
      });

    });

    describe('multi point encoding', function() {

      it('correctly encodes a multi point', function() {
        let multiPoint = new ol.geom.MultiPoint([[0, 0], [1, 1]]);
        let result = fhFormat.writeGeometry(multiPoint);
        expect(result).toBe('P(..__)');
      });

    });

    describe('line string encoding', function() {

      it('correctly encodes a line', function() {
        let lineString = new ol.geom.LineString([[0, 0], [1, 1]]);
        let result = fhFormat.writeGeometry(lineString);
        expect(result).toBe('l(..__)');
      });

    });

    describe('multi line string encoding', function() {

      it('correctly encodes a multi line', function() {
        let multiLineString = new ol.geom.MultiLineString([
            [[0, 0], [1, 1]], [[0, 0], [1, 1]]
        ]);
        let result = fhFormat.writeGeometry(multiLineString);
        expect(result).toBe('L(..__\'--__)');
      });

    });

    describe('polygon encoding', function() {

      it('correctly encodes a polygon', function() {
        let polygon = new ol.geom.Polygon([
            [[0, 0], [4, 4], [4, -4], [0, 0]],
            [[2, 1], [3, 1], [3, -1], [2, -1], [2, 1]]
        ]);
        let result = fhFormat.writeGeometry(polygon);
        expect(result).toBe('a(..DD.K\'!F_..!-.)');
      });

    });

    describe('multi polygon encoding', function() {

      it('correctly encodes a multi polygon', function() {
        let multiPolygon = new ol.geom.MultiPolygon([
          [[[0, 0], [4, 4], [4, -4], [0, 0]],
          [[2, 1], [3, 1], [3, -1], [2, -1], [2, 1]]],
          [[[0, 0], [-2, -2], [-2, 2], [0, 0]]]
        ]);
        let result = fhFormat.writeGeometry(multiPolygon);
        expect(result).toBe('A(..DD.K\'!F_..!-.)(!_!!.D)');
      });

    });

    describe('point feature encoding', function() {

      it('correctly encodes a point feature', function() {
        let point = new ol.geom.Point([1, 1]);
        let feature = new ol.Feature({
          geometry: point,
          foo: 'foo',
          bar: 'bar'
        });
        feature.setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            radius: 3,
            fill: new ol.style.Fill({
              color: [255, 1, 1, 1]
            }),
            stroke: new ol.style.Stroke({
              color: [1, 255, 1, 1],
              width: 2
            })
          })
        }));
        let result = fhFormat.writeFeature(feature);
        expect(result).toBe('p(__~foo*foo\'bar*bar~' +
            'pointRadius*3\'fillColor*%23ff0101\'' +
            'strokeColor*%2301ff01\'strokeWidth*2)');
      });

    });

    describe('line string feature encoding', function() {

      it('correctly encodes a line string feature', function() {
        let lineString = new ol.geom.LineString([[0, 0], [1, 1]]);
        let feature = new ol.Feature({
          geometry: lineString,
          foo: 'foo',
          bar: 'bar'
        });
        feature.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 2,
            color: [255, 1, 1, 1]
          })
        }));
        let result = fhFormat.writeFeature(feature);
        expect(result).toBe('l(..__~foo*foo\'bar*bar~' +
            'strokeColor*%23ff0101\'strokeWidth*2)');
      });

    });

    describe('polygon feature encoding', function() {

      it('correctly encodes a polygon feature', function() {
        let polygon = new ol.geom.Polygon([
            [[0, 0], [4, 4], [4, -4], [0, 0]],
            [[2, 1], [3, 1], [3, -1], [2, -1], [2, 1]]
        ]);
        let feature = new ol.Feature({
          geometry: polygon,
          foo: 'foo',
          bar: 'bar'
        });
        feature.setStyle(new ol.style.Style({
          fill: new ol.style.Fill({
            color: [255, 1, 1, 1]
          }),
          stroke: new ol.style.Stroke({
            color: [1, 255, 1, 1],
            width: 2
          }),
          text: new ol.style.Text({
            label: 'foo', // not encoded
            font: 'bold 12px Verdana',
            fill: new ol.style.Fill({
              color: [1, 255, 1, 1]
            })
          })
        }));
        let result = fhFormat.writeFeature(feature);
        expect(result).toBe('a(..DD.K\'!F_..!-.~foo*foo\'bar*bar~' +
            'fillColor*%23ff0101\'strokeColor*%2301ff01\'strokeWidth*2\'' +
            'fontSize*12px\'fontColor*%2301ff01)');
      });

    });

    describe('features encoding', function() {

      it('correctly encodes features', function() {
        let point = new ol.geom.Point([1, 1]);
        let pointFeature = new ol.Feature({
          geometry: point,
          foo: 'foo',
          bar: 'bar'
        });
        let lineString = new ol.geom.LineString([[0, 0], [1, 1]]);
        let lineStringFeature = new ol.Feature({
          geometry: lineString,
          foo: 'foo',
          bar: 'bar'
        });
        let features = [pointFeature, lineStringFeature];
        let result = fhFormat.writeFeatures(features);
        expect(result).toBe('Fp(__~foo*foo\'bar*bar)l(..__~foo*foo\'bar*bar)');
      });
    });

    describe('OpenLayers.Format.URLCompressed compatibility', function() {

      //
      // OpenLayers.Format.URLCompressed encodes the polygon
      //
      // [538820, 153580], [538720, 151980], [540400, 151300],
      // [541040, 151920], [541080, 153060], [540340, 154120],
      // [538820, 153580]
      //
      // to
      //
      // a(huv9Fhmrx_gy-z801u1-z9I1hHh4H1Uh9RgfJhqP)
      //

      beforeEach(function() {
        fhFormat = new ngeo.format.FeatureHash({accuracy: 0.1});
      });

      it('encodes as expected', function() {
        let polygon = new ol.geom.Polygon([[
            [538820, 153580], [538720, 151980], [540400, 151300],
            [541040, 151920], [541080, 153060], [540340, 154120],
            [538820, 153580]]]);
        let polygonFeature = new ol.Feature({
          geometry: polygon
        });
        let features = [polygonFeature];
        let result = fhFormat.writeFeatures(features);
        expect(result).toBe('Fa(huv9Fhmrx_gy-z801u1-z9I1hHh4H1Uh9RgfJhqP)');
      });

      it('decodes as expected', function() {
        let features = fhFormat.readFeatures(
            'Fa(huv9Fhmrx_gy-z801u1-z9I1hHh4H1Uh9RgfJhqP)');
        expect(features.length).toBe(1);
        let feature, geometry, coordinates;
        feature = features[0];
        expect(feature instanceof ol.Feature).toBeTruthy();
        geometry = feature.getGeometry();
        expect(geometry instanceof ol.geom.Polygon).toBeTruthy();
        coordinates = geometry.getCoordinates();
        expect(coordinates.length).toBe(1);
        coordinates = coordinates[0];
        expect(coordinates[0]).toEqual([538820, 153580]);
        expect(coordinates[1]).toEqual([538720, 151980]);
        expect(coordinates[2]).toEqual([540400, 151300]);
        expect(coordinates[3]).toEqual([541040, 151920]);
        expect(coordinates[4]).toEqual([541080, 153060]);
        expect(coordinates[5]).toEqual([540340, 154120]);
        expect(coordinates[6]).toEqual([538820, 153580]);
      });
    });

    describe('With a user-provided feature properties function', function() {
      it('encodes feature properties as expected', function() {
        fhFormat = new ngeo.format.FeatureHash({
          properties: function(feature) {
            return {foobar: feature.get('foo') + feature.get('bar')};
          }
        });
        let feature = new ol.Feature(new ol.geom.Point([1, 1]));
        feature.set('foo', 'foo');
        feature.set('bar', 'bar');
        let result = fhFormat.writeFeature(feature);
        expect(result).toBe('p(__~foobar*foobar)');
      });
    });

  });
});
