goog.require('gmf.ShareService');

describe('gmf.ShareService', function() {
  let gmfShareService;
  let $httpBackend;
  let shortenerUrl;
  let successResponse = {
    short_url: 'http://fake/gmf'
  };

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Should get a short version of the permalink', function() {
    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('POST', shortenerUrl).respond(successResponse);
      gmfShareService = $injector.get('gmfShareService');
      shortenerUrl = $injector.get('gmfShortenerCreateUrl');
    });

    let permalink = 'htpp://fake/c2c/permalink';
    let params = /** @type {gmfx.ShortenerAPIRequestParams} */ ({
      url: permalink
    });

    $httpBackend.expectPOST(shortenerUrl, $.param(params));
    gmfShareService.getShortUrl(permalink);
    $httpBackend.flush();

    params.email = 'fake@c2c.com';
    $httpBackend.expectPOST(shortenerUrl, $.param(params));
    gmfShareService.sendShortUrl(permalink, params.email);
    $httpBackend.flush();

  });

  it('Should return the permalink if no URL for the shorten service has been provided', function() {
    module(function($provide) {
      $provide.value('gmfShortenerCreateUrl', '');
    });

    inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('POST', shortenerUrl).respond(successResponse);
      gmfShareService = $injector.get('gmfShareService');
      shortenerUrl = $injector.get('gmfShortenerCreateUrl');
    });

    gmfShareService.getShortUrl(shortenerUrl);
    $httpBackend.verifyNoOutstandingExpectation();

  });
});
