goog.require('ngeo.filereaderDirective');

describe('ngeo.filereaderDirective', function() {
  let element, rootScope;

  beforeEach(function() {
    element = angular.element(
      '<input type="file" ngeo-filereader="fileContent" />');

    module(function($provide) {
      let FileReader = function() {};
      FileReader.prototype.readAsText = function(file) {
        let progressEvent = {
          target: {
            result: '<kml></kml>'
          }
        };
        this.onload(progressEvent);
      };
      $provide.value('$window', {FileReader: FileReader});
    });

    inject(function($rootScope, $compile) {
      $compile(element)($rootScope);
      rootScope = $rootScope;
    });
  });

  it('sets the file content onto the scope', function() {
    let input = element[0];
    let customEvent = document.createEvent('CustomEvent');
    customEvent.initCustomEvent('change', true, true, {});
    input.dispatchEvent(customEvent);
    expect(rootScope.fileContent).toBe('<kml></kml>');
  });

});
