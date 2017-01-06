goog.require('gmf.Authentication');
goog.require('gmf.AuthenticationEventType');

describe('gmf.Authentication', function() {
  let gmfAuthentication;
  let authenticationBaseUrl;
  let isLoggedInUrl;
  let loginUrl;
  let logoutUrl;
  let $httpBackend;

  beforeEach(function() {
    inject(function($injector) {
      gmfAuthentication = $injector.get('gmfAuthentication');
      authenticationBaseUrl = $injector.get('authenticationBaseUrl');

      isLoggedInUrl = goog.uri.utils.appendPath(
          authenticationBaseUrl, gmf.AuthenticationRouteSuffix.IS_LOGGED_IN);
      loginUrl = goog.uri.utils.appendPath(
          authenticationBaseUrl, gmf.AuthenticationRouteSuffix.LOGIN);
      logoutUrl = goog.uri.utils.appendPath(
          authenticationBaseUrl, gmf.AuthenticationRouteSuffix.LOGOUT);

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', isLoggedInUrl).respond({});

      // need to flush after the initialization to process the request which
      // queries the initial logged-in status
      $httpBackend.flush();
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('emits READY after login status check', function() {
    let spy = jasmine.createSpy();
    let event;
    ol.events.listenOnce(
      gmfAuthentication, gmf.AuthenticationEventType.READY, function(evt) {
        event = evt;
        spy();
      });

    $httpBackend.when('GET', isLoggedInUrl).respond({});

    gmfAuthentication.load_();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    expect(event).toBeDefined();
    expect(event.type).toBe(gmf.AuthenticationEventType.READY);
    expect(event.user.username).toBe(null);
  });

  it('logins successful', function() {
    let spy = jasmine.createSpy();
    let event;
    ol.events.listenOnce(
      gmfAuthentication, gmf.AuthenticationEventType.LOGIN, function(evt) {
        event = evt;
        spy();
      });

    $httpBackend.when('POST', loginUrl).respond({'username': 'user'});

    gmfAuthentication.login('user', 'pwd');
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
    expect(event).toBeDefined();
    expect(event.type).toBe(gmf.AuthenticationEventType.LOGIN);
    expect(event.user.username).toBe('user');
  });

  it('trys to login with wrong credentials', function() {
    let spy = jasmine.createSpy();
    ol.events.listenOnce(
      gmfAuthentication, gmf.AuthenticationEventType.LOGIN, spy);

    $httpBackend.when('POST', loginUrl).respond({});

    gmfAuthentication.login('user', 'wrong-pwd');
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(0);
  });

  it('logs out', function() {
    let spy = jasmine.createSpy();
    ol.events.listenOnce(
      gmfAuthentication, gmf.AuthenticationEventType.LOGOUT, spy);

    $httpBackend.when('GET', logoutUrl).respond('true');

    gmfAuthentication.logout();
    $httpBackend.flush();

    expect(spy.calls.count()).toBe(1);
  });
});
