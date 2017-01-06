//
// A PhantomJS script used to check that the hosted examples load
// without errors. This script is executed by the Makefile's
// check-examples target.


let args = require('system').args;
if (args.length != 2) {
  phantom.exit(1);
}
let examplePath = args[1];
let page = require('webpage').create();
let exitCode = 0;
page.onError = function(msg, trace) {
  let msgStack = ['JavaScript ERROR: ' + msg];
  if (trace) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  exitCode = 2;
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('console: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
  exitCode = 2;
};
page.onAlert = function(msg) {
  console.log('alert: ' + msg);
  exitCode = 2;
};
page.onResourceError = function(resourceError) {
  console.log('Resource error: ' + resourceError.errorCode + ', ' + resourceError.url);
  exitCode = 2;
};
page.onUrlChanged = function(url) {
  console.log('URL changed: ' + url);
};
page.open(examplePath, function(s) {
  if (s != 'success') {
    console.error('PAGE LOAD ERROR');
    phantom.exit(2);
  }

  setTimeout(function() {
//    page.render(examplePath + '.png')
    let consoleControl = require('console-control-strings');

    let color = exitCode == 0 ? 'green' : 'red';
    console.log(
      consoleControl.color([color, "bold"]) +
      "EXIT with " + exitCode +
      consoleControl.color('reset')
    );
    phantom.exit(exitCode);
  }, 3000)
});
