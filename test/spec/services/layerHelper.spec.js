/* global wmtsCapabilities */
goog.require('ngeo.LayerHelper');
goog.require('ngeo.test.data.wmtsCapabilities');

describe('ngeo.LayerHelper', function() {
  let ngeoLayerHelper;
  let layer;
  let wmtsSrc = 'http://fake/wmts/capabilities.xml';
  let wmtsName = 'layer-7328';
  let $httpBackend;

  beforeEach(function() {
    inject(function($injector) {
      ngeoLayerHelper = $injector.get('ngeoLayerHelper');
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', wmtsSrc).respond(wmtsCapabilities);
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Create a basic WMS layer', function() {
    layer = ngeoLayerHelper.createBasicWMSLayer('', '');
    expect(layer.constructor).toBe(ol.layer.Image);
    expect(layer.getSource().constructor).toBe(ol.source.ImageWMS);
  });

  it('Create a WMTS layer from capabilitites', function() {
    $httpBackend.expectGET(wmtsSrc);
    let spy = jasmine.createSpy();
    let promise = ngeoLayerHelper.createWMTSLayerFromCapabilitites(wmtsSrc,
            wmtsName);
    promise.then(spy);
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    layer = spy.calls.mostRecent().args[0];
    expect(layer.getSource().getLayer()).toBe(wmtsName);
  });

  it('Create a layergroup with layers', function() {
    layer = ngeoLayerHelper.createBasicWMSLayer('', '');
    let collection = new ol.Collection();
    collection.push(layer);
    let group = ngeoLayerHelper.createBasicGroup(collection);
    expect(group.getLayersArray().length).toBe(1);
  });

  it('Get an array of layer from a group', function() {
    layer = ngeoLayerHelper.createBasicWMSLayer('', '');
    let collection = new ol.Collection();
    collection.push(layer);
    let group = new ol.layer.Group();
    group.setLayers(collection);
    expect(ngeoLayerHelper.getFlatLayers(group).length).toBe(1);
  });

  it('Get WMS legend url', function() {
    let url = 'http://test';
    let layerName = 'wmsLayer';
    let scale = 0;
    let wmsLegendURL = ngeoLayerHelper.getWMSLegendURL(url, layerName, scale);
    let expectedResult = url + '?FORMAT=image%2Fpng&TRANSPARENT=true&SERVICE=' +
      'WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=' + layerName +
      '&SCALE=' + scale;
    expect(expectedResult).toBe(wmsLegendURL);
  });

  it('Get WMS legend icon url', function() {
    let url = 'http://test';
    let layerName = 'wmsLayer';
    let legendRule = 'legendRule';
    let wmsLegendURL = ngeoLayerHelper.getWMSLegendURL(url, layerName, undefined,
        legendRule);
    let expectedResult = url + '?FORMAT=image%2Fpng&TRANSPARENT=true&SERVICE=' +
      'WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=' + layerName +
      '&RULE=' + legendRule;
    expect(expectedResult).toBe(wmsLegendURL);
  });

  it('Get WMTS legend url', function() {
    $httpBackend.expectGET(wmtsSrc);
    let spy = jasmine.createSpy();
    let promise = ngeoLayerHelper.createWMTSLayerFromCapabilitites(wmtsSrc,
            wmtsName);
    promise.then(spy);
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    layer = spy.calls.mostRecent().args[0];
    let capabilitiesStyles = [{legendURL: [{href: 'http://legendURL'}]}];
    layer.set('capabilitiesStyles', capabilitiesStyles);
    let legend = ngeoLayerHelper.getWMTSLegendURL(layer);
    expect(legend).toBe('http://legendURL');
  });
});
