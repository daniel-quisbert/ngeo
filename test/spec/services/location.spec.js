goog.require('ngeo.Location');

describe('ngeo.Location', function() {
  let win;
  let ngeoLocation;

  beforeEach(function() {
    win = {
      'location': 'http://domain.com/some/path?some=param',
      'history': {'replaceState': function() {}}
    };
    spyOn(win.history, 'replaceState');
    module(function($provide) {
      $provide.value('$window', win);
    });
    inject(function($injector) {
      ngeoLocation = $injector.get('ngeoLocation');
    });
  });

  describe('#getUriString', function() {
    it('returns the URI', function() {
      let uri = ngeoLocation.getUriString();
      expect(uri).toBe('http://domain.com/some/path?some=param');
    });
    it('returns the URI with additional params', function() {
      let uri = ngeoLocation.getUriString({'another': 'param'});
      expect(uri).toBe('http://domain.com/some/path?some=param&another=param');
    });
  });

  describe('#hasParam', function() {
    it('returns true if the param exists', function() {
      let value = ngeoLocation.hasParam('some');
      expect(value).toBe(true);
      value = ngeoLocation.hasParam('missing');
      expect(value).toBe(false);
    });
  });

  describe('#getParam', function() {
    it('returns the param value', function() {
      let value = ngeoLocation.getParam('some');
      expect(value).toBe('param');
    });
  });

  describe('#getParamAsInt', function() {
    it('returns the param value as integer', function() {
      ngeoLocation.updateParams({'key2': '2'});
      let value = ngeoLocation.getParamAsInt('key2');
      expect(value).toBe(2);
    });

    it('returns undefined if no integer', function() {
      let value = ngeoLocation.getParamAsInt('key1');
      expect(value).toBe(undefined);
    });

    it('returns undefined if no integer', function() {
      let value = ngeoLocation.getParamAsInt('wrong-key');
      expect(value).toBe(undefined);
    });
  });

  describe('#getParamKeys', function() {
    it('returns the param keys', function() {
      let keys = ngeoLocation.getParamKeys();
      expect(keys).toEqual(['some']);
    });
  });

  describe('#updateParams', function() {
    it('updates an existing param key', function() {
      ngeoLocation.updateParams({'key1': 'new value'});
      let value = ngeoLocation.getParam('key1');
      expect(value).toBe('new value');
    });

    it('adds a new param key', function() {
      ngeoLocation.updateParams({'key3': 'value3'});
      let value = ngeoLocation.getParam('key3');
      expect(value).toBe('value3');
    });
  });

  describe('#deleteParam', function() {
    it('delete the params', function() {
      ngeoLocation.deleteParam('some');
      let uri = ngeoLocation.getUriString();
      expect(uri).toBe('http://domain.com/some/path');
    });
  });

  describe('#refresh', function() {
    it('calls history.replaceState with expected args', function() {
      ngeoLocation.refresh();
      expect(win.history.replaceState).toHaveBeenCalledWith(
        null, '', 'http://domain.com/some/path?some=param');
    });
  });

  describe('fragment parameters', function() {
    beforeEach(function() {
      // change url to 'http://domain.com/some/path?some=param#key1=value1&key2=2'
      ngeoLocation.uri_.setFragment('key1=value1&key2=2');
    });

    describe('#hasFragmentParam', function() {
      it('returns true if the param exists', function() {
        let value = ngeoLocation.hasFragmentParam('key1');
        expect(value).toBe(true);
        value = ngeoLocation.hasFragmentParam('missing');
        expect(value).toBe(false);
      });
    });

    describe('#getFragmentParam', function() {
      it('returns the param value', function() {
        let value = ngeoLocation.getFragmentParam('key1');
        expect(value).toBe('value1');
      });

      it('returns undefined for missing keys', function() {
        let value = ngeoLocation.getFragmentParam('no-existing-key');
        expect(value).toBe(undefined);
      });
    });

    describe('#getFragmentParamAsInt', function() {
      it('returns the param value as integer', function() {
        let value = ngeoLocation.getFragmentParamAsInt('key2');
        expect(value).toBe(2);
      });

      it('returns undefined if no integer', function() {
        let value = ngeoLocation.getFragmentParamAsInt('key1');
        expect(value).toBe(undefined);
      });

      it('returns undefined if no integer', function() {
        let value = ngeoLocation.getFragmentParamAsInt('wrong-key');
        expect(value).toBe(undefined);
      });
    });

    describe('#getFragmentParamKeys', function() {
      it('returns the param keys', function() {
        let keys = ngeoLocation.getFragmentParamKeys();
        expect(keys).toEqual(['key1', 'key2']);
      });
    });

    describe('#getFragmentParamKeysWithPrefix', function() {
      it('returns the param keys', function() {
        let keys = ngeoLocation.getFragmentParamKeysWithPrefix('key');
        expect(keys).toEqual(['key1', 'key2']);
      });
    });

    describe('#updateFragmentParams', function() {
      it('updates an existing param key', function() {
        ngeoLocation.updateFragmentParams({'key1': 'new value'});
        let value = ngeoLocation.getFragmentParam('key1');
        expect(value).toBe('new value');
      });

      it('updates an existing param key with special chars', function() {
        ngeoLocation.updateFragmentParams({'key1': '6+,7a+'});
        let value = ngeoLocation.getFragmentParam('key1');
        expect(value).toBe('6+,7a+');
      });

      it('adds a new param key', function() {
        ngeoLocation.updateFragmentParams({'key3': 'value3'});
        let value = ngeoLocation.getFragmentParam('key3');
        expect(value).toBe('value3');
      });
    });

    describe('#deleteFragmentParam', function() {
      it('delete the params', function() {
        ngeoLocation.deleteFragmentParam('key1');
        let value = ngeoLocation.getFragmentParam('key1');
        expect(value).toBe(undefined);
      });
    });
  });
});
