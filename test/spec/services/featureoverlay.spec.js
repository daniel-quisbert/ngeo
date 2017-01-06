goog.require('ngeo.FeatureOverlayMgr');

describe('ngeo.FeatureOverlayMgr', function() {
  let ngeoFeatureOverlayMgr;
  let map;
  let layer;

  beforeEach(function() {
    map = new ol.Map({});

    inject(function($injector) {
      ngeoFeatureOverlayMgr = $injector.get('ngeoFeatureOverlayMgr');
      ngeoFeatureOverlayMgr.init(map);
      layer = ngeoFeatureOverlayMgr.getLayer();
    });
  });

  it('creates an unmanaged layer', function() {
    expect(map.getLayers().getLength()).toBe(0);
    expect(layer).toBeDefined();
  });

  it('adds and removes features', function() {
    let overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let feature = new ol.Feature();
    overlay.addFeature(feature);
    expect(layer.getSource().getFeatures().length).toBe(1);

    overlay.removeFeature(feature);
    expect(layer.getSource().getFeatures().length).toBe(0);
  });

  it('removes all the features', function() {
    let overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let feature = new ol.Feature();
    overlay.addFeature(feature);
    overlay.clear();
    expect(layer.getSource().getFeatures().length).toBe(0);
  });

  it('doesn\'t remove features from other overlays', function() {
    let overlay1 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let feature1 = new ol.Feature();
    overlay1.addFeature(feature1);

    let overlay2 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let feature2 = new ol.Feature();
    overlay2.addFeature(feature2);

    expect(layer.getSource().getFeatures().length).toBe(2);

    overlay2.clear();

    expect(layer.getSource().getFeatures().length).toBe(1);
  });

  it('correctly sets styles', function() {
    let overlay1 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let style1 = new ol.style.Style();
    overlay1.setStyle(style1);

    let overlay2 = ngeoFeatureOverlayMgr.getFeatureOverlay();
    let style2 = new ol.style.Style();
    overlay2.setStyle(style2);

    let feature1 = new ol.Feature();
    overlay1.addFeature(feature1);

    let feature2 = new ol.Feature();
    overlay2.addFeature(feature2);

    let styleFunction = ngeoFeatureOverlayMgr.getLayer().getStyleFunction();

    let resolution = 1;
    let styles;

    styles = styleFunction(feature1, resolution);
    expect(styles.length).toEqual(1);
    expect(styles[0]).toBe(style1);

    styles = styleFunction(feature2, resolution);
    expect(styles.length).toEqual(1);
    expect(styles[0]).toBe(style2);
  });

  describe('feature overlay configured with a feature collection', function() {
    let overlay, features;

    beforeEach(function() {
      overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
      let feature1 = new ol.Feature();
      let feature2 = new ol.Feature();
      features = new ol.Collection([feature1, feature2]);
      overlay.setFeatures(features);
    });

    it('adds features to the overlay', function() {
      expect(layer.getSource().getFeatures().length).toBe(2);
    });

    describe('add features to the collection', function() {
      it('adds features to the overlay', function() {
        features.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(3);
      });
    });

    describe('remove features from the collection', function() {
      it('removes features from the overlay', function() {
        features.clear();
        expect(layer.getSource().getFeatures().length).toBe(0);
      });
    });

    describe('remove the collection', function() {
      it('removes the features from the collection', function() {
        overlay.setFeatures(null);
        expect(layer.getSource().getFeatures().length).toBe(0);
      });
    });

    describe('replace the collection by another one', function() {
      it('uses the new collection and ignores the old one', function() {
        let newFeatures = new ol.Collection();
        overlay.setFeatures(newFeatures);
        expect(layer.getSource().getFeatures().length).toBe(0);
        newFeatures.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(1);
        features.push(new ol.Feature());
        expect(layer.getSource().getFeatures().length).toBe(1);
      });
    });

  });

});
