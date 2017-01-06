let urlElements = window.location.pathname.split('/');

let gmfUrlElements = urlElements.slice(0, urlElements.length - 3);
gmfUrlElements.push('src', 'directives', 'partials');

let ngeoUrlElements = urlElements.slice(0, urlElements.length - 5);
ngeoUrlElements.push('src', 'directives', 'partials');

let ngeoModuleUrlElements = urlElements.slice(0, urlElements.length - 5);
ngeoModuleUrlElements.push('src', 'modules');

/**
 * The default ngeo template base URL, used as-is by the template cache.
 * @type {string}
 */
ngeo.baseTemplateUrl = window.location.origin + ngeoUrlElements.join('/');

/**
 * The default ngeo template base URL, used as-is by the template cache.
 * @type {string}
 */
ngeo.baseModuleTemplateUrl = window.location.origin + ngeoModuleUrlElements.join('/');

/**
 * The default gmf template base URL, used as-is by the template cache.
 * @type {string}
 */
gmf.baseTemplateUrl = window.location.origin + gmfUrlElements.join('/');
