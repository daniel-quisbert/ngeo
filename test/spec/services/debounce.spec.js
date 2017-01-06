goog.require('ngeo.Debounce');

describe('ngeo.Debounce', function() {
  let ngeoDebounce;
  let $timeout;

  beforeEach(function() {
    inject(function($injector) {
      ngeoDebounce = $injector.get('ngeoDebounce');
      $timeout = $injector.get('$timeout');
    });
  });

  it('debounces the function', function() {
    let spy = jasmine.createSpy('debounced');
    let func = ngeoDebounce(spy, 200, false);
    let args = [1, 'foo'];
    func.apply(null, args);
    expect(spy).not.toHaveBeenCalled();
    func.apply(null, args);
    expect(spy).not.toHaveBeenCalled();
    func.apply(null, args);
    expect(spy).not.toHaveBeenCalled();
    $timeout.flush(200);
    expect(spy).toHaveBeenCalledWith(1, 'foo');
    expect(spy.calls.count()).toEqual(1);
  });
});
