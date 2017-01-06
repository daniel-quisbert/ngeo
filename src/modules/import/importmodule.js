goog.module('ngeo.import.importModule');
goog.module.declareLegacyNamespace();

let fileService = goog.require('ngeo.fileService');
let dnd = goog.require('ngeo.importDndDirective');
let local = goog.require('ngeo.importLocalDirective');
let online = goog.require('ngeo.importOnlineDirective');
let wmsGetCap = goog.require('ngeo.wmsGetCapDirective');
let wmsGetCapItem = goog.require('ngeo.wmsGetCapItemDirective');


exports.module = angular.module('ngeo.import', [
  fileService.module.name,
  dnd.module.name,
  local.module.name,
  online.module.name,
  wmsGetCap.module.name,
  wmsGetCapItem.module.name
]);
