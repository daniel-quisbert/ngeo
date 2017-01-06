goog.require('ngeo.CsvDownload');

describe('ngeo.csvdownload', function() {

  let ngeoCsvDownload;

  beforeEach(inject(function(_ngeoCsvDownload_) {
    ngeoCsvDownload = _ngeoCsvDownload_;
  }));

  describe('#generateCsv', function() {
    it('deals with no data', function() {
      expect(ngeoCsvDownload.generateCsv([], [])).toBe('');
    });

    it('generates a CSV', function() {
      const columnDefs = [{name: 'col 1'}, {name: 'col 2'}, {name: 'col 3'}];
      const data = [{
        'col 1': 'some text',
        'col 2': 123,
        'col 3': true,
        'column that should be ignored': 'some text'
      }, {
        'col 1': 'some "more" text',
        'col 2': null,
        'col 3': undefined
      }];
      const csv = ngeoCsvDownload.generateCsv(data, columnDefs);

      const expectedCsv =
          '"col 1","col 2","col 3"\n' +
          '"some text","123","true"\n' +
          '"some ""more"" text",,\n';

      expect(csv).toBe(expectedCsv);
    });
  });
});
