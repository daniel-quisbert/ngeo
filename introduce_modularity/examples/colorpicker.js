(function(){'use strict';var aa=this;function l(a,b){a=a.split(".");var c=aa;a[0]in c||!c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c[d]?c=c[d]:c=c[d]={}:c[d]=b};function m(a,b){a.prototype=Object.create(b.prototype);a.prototype.constructor=a}function p(){}var ba=0;function r(a){this.message="Assertion failed. See /doc/errors/#"+a+" for details.";this.code=a;this.name="AssertionError"}m(r,Error);var t="function"===typeof Object.assign?Object.assign:function(a,b){if(!a||!a)throw new TypeError("Cannot convert undefined or null to object");for(var c=Object(a),d=1,e=arguments.length;d<e;++d){var f=arguments[d];if(void 0!==f&&null!==f)for(var g in f)f.hasOwnProperty(g)&&(c[g]=f[g])}return c};function ca(a){for(var b in a)delete a[b]};function da(a){function b(b){var d=a.listener,e=a.H||a.target;a.J&&u(a);return d.call(e,b)}return a.I=b}function ea(a,b,c,d){for(var e,f=0,g=a.length;f<g;++f)if(e=a[f],e.listener===b&&e.H===c)return d&&(e.deleteIndex=f),e}function fa(a,b){return(a=a.A)?a[b]:void 0}function v(a,b,c,d){var e,f=a.A;f||(f=a.A={});e=f;(f=e[b])||(f=e[b]=[]);(e=ea(f,c,d,!1))?e.J=!1:(e={H:d,J:!1,listener:c,target:a,type:b},a.addEventListener(b,da(e)),f.push(e));return e}
function ga(a,b,c,d){(a=fa(a,b))&&(c=ea(a,c,d,!0))&&u(c)}function u(a){if(a&&a.target){a.target.removeEventListener(a.type,a.I);var b=fa(a.target,a.type);if(b){var c="deleteIndex"in a?a.deleteIndex:b.indexOf(a);-1!==c&&b.splice(c,1);if(0===b.length){var b=a.target,c=a.type,d=fa(b,c);if(d){for(var e=0,f=d.length;e<f;++e)b.removeEventListener(c,d[e].I),ca(d[e]);d.length=0;if(d=b.A)delete d[c],0===Object.keys(d).length&&delete b.A}}}ca(a)}};function ha(){};function w(a){this.type=a;this.target=null}w.prototype.preventDefault=w.prototype.stopPropagation=function(){this.M=!0};function x(){this.v={};this.h={};this.u={}}m(x,ha);x.prototype.addEventListener=function(a,b){var c=this.u[a];c||(c=this.u[a]=[]);-1===c.indexOf(b)&&c.push(b)};function ia(a,b){var c="string"===typeof b?new w(b):b;b=c.type;c.target=a;var d=a.u[b];if(d){b in a.h||(a.h[b]=0,a.v[b]=0);++a.h[b];for(var e=0,f=d.length;e<f&&!1!==d[e].call(a,c)&&!c.M;++e);--a.h[b];if(0===a.h[b]){c=a.v[b];for(delete a.v[b];c--;)a.removeEventListener(b,p);delete a.h[b]}}}
x.prototype.removeEventListener=function(a,b){var c=this.u[a];c&&(b=c.indexOf(b),a in this.v?(c[b]=p,++this.v[a]):(c.splice(b,1),0===c.length&&delete this.u[a]))};function y(){x.call(this);this.B=0}m(y,x);y.prototype.b=function(){++this.B;ia(this,"change")};y.prototype.on=function(a,b,c){if(Array.isArray(a)){for(var d=a.length,e=Array(d),f=0;f<d;++f)e[f]=v(this,a[f],b,c);return e}return v(this,a,b,c)};function ja(a,b,c){w.call(this,a);this.key=b;this.oldValue=c}m(ja,w);function z(a){y.call(this);this.L||(this.L=++ba);this.j={};void 0!==a&&ka(this,a)}m(z,y);var la={};function A(a){return la.hasOwnProperty(a)?la[a]:la[a]="change:"+a}z.prototype.get=function(a){var b;this.j.hasOwnProperty(a)&&(b=this.j[a]);return b};z.prototype.set=function(a,b,c){c?this.j[a]=b:(c=this.j[a],this.j[a]=b,c!==b&&(b=A(a),ia(this,new ja(b,a,c)),ia(this,new ja("propertychange",a,c))))};
function ka(a,b){for(var c in b)a.set(c,b[c],void 0)};function B(a,b,c,d,e){return e?(e[0]=a,e[1]=b,e[2]=c,e[3]=d,e):[a,b,c,d]}function ma(a){return[(a[0]+a[2])/2,(a[1]+a[3])/2]};var na=function(){var a;"cosh"in Math?a=Math.cosh:a=function(a){a=Math.exp(a);return(a+1/a)/2};return a}();/*

 Latitude/longitude spherical geodesy formulae taken from
 http://www.movable-type.co.uk/scripts/latlong.html
 Licensed under CC-BY-3.0.
*/
function oa(a){this.radius=a}function pa(a,b){var c=a[1]*Math.PI/180,d=b[1]*Math.PI/180,e=(d-c)/2;a=(b[0]-a[0])*Math.PI/180/2;c=Math.sin(e)*Math.sin(e)+Math.sin(a)*Math.sin(a)*Math.cos(c)*Math.cos(d);return 2*qa.radius*Math.atan2(Math.sqrt(c),Math.sqrt(1-c))}
oa.prototype.offset=function(a,b,c){var d=a[1]*Math.PI/180;b/=this.radius;var e=Math.asin(Math.sin(d)*Math.cos(b)+Math.cos(d)*Math.sin(b)*Math.cos(c));return[180*(a[0]*Math.PI/180+Math.atan2(Math.sin(c)*Math.sin(b)*Math.cos(d),Math.cos(b)-Math.sin(d)*Math.sin(e)))/Math.PI,180*e/Math.PI]};var qa=new oa(6370997);var D={};D.degrees=2*Math.PI*qa.radius/360;D.ft=.3048;D.m=1;D["us-ft"]=1200/3937;
function E(a){this.a=a.code;this.b=a.units;this.c=void 0!==a.extent?a.extent:null;this.g=void 0!==a.w?a.w:this.h;this.f=a.K;var b=ra,c=a.code,d=sa||window.proj4;if("function"==typeof d&&void 0===b[c]){var e=d.defs(c);if(void 0!==e){void 0===a.K&&(this.f=e.to_meter);void 0===a.units&&(this.b=e.units);var f,g;for(f in b)if(a=d.defs(f),void 0!==a)if(b=F(f),a===e)ta([b,this]);else{g=d(f,c);a=g.forward;g=g.inverse;var b=F(b),h=F(this);G(b,h,ua(a));G(h,b,ua(g))}}}}E.prototype.l=function(){return this.c};
E.prototype.h=function(a,b){if("degrees"==this.b)return a;var c=va(this,F("EPSG:4326"));a=[b[0]-a/2,b[1],b[0]+a/2,b[1],b[0],b[1]-a/2,b[0],b[1]+a/2];a=c(a,a,2);c=(pa(a.slice(0,2),a.slice(2,4))+pa(a.slice(4,6),a.slice(6,8)))/2;a=this.f||D[this.b];void 0!==a&&(c/=a);return c};E.prototype.w=function(a,b){return this.g(a,b)};var ra={},H={},sa=null;function ta(a){wa(a);a.forEach(function(b){a.forEach(function(a){b!==a&&G(b,a,xa)})})}function ya(a){ra[a.a]=a;G(a,a,xa)}
function wa(a){var b=[];a.forEach(function(a){b.push(ya(a))})}function G(a,b,c){a=a.a;b=b.a;a in H||(H[a]={});H[a][b]=c}function ua(a){return function(b,c,d){var e=b.length;d=void 0!==d?d:2;c=void 0!==c?c:Array(e);var f,g;for(g=0;g<e;g+=d)for(f=a([b[g],b[g+1]]),c[g]=f[0],c[g+1]=f[1],f=d-1;2<=f;--f)c[g+f]=b[g+f];return c}}
function F(a){var b;if(a instanceof E)b=a;else if("string"===typeof a){b=ra[a];var c=sa||window.proj4;void 0===b&&"function"==typeof c&&void 0!==c.defs(a)&&(b=new E({code:a}),ya(b))}return b||null}function za(a,b){a=F(a);b=F(b);return va(a,b)}function va(a,b){a=a.a;b=b.a;var c;a in H&&b in H[a]&&(c=H[a][b]);void 0===c&&(c=Aa);return c}function Aa(a,b){if(void 0!==b&&a!==b){for(var c=0,d=a.length;c<d;++c)b[c]=a[c];a=b}return a}
function xa(a,b){if(void 0!==b){for(var c=0,d=a.length;c<d;++c)b[c]=a[c];a=b}else a=a.slice();return a};function I(){z.call(this);this.F=[Infinity,Infinity,-Infinity,-Infinity];this.G=-1}m(I,z);I.prototype.l=function(a){this.G!=this.B&&(this.F=this.D(this.F),this.G=this.B);var b=this.F;a?(a[0]=b[0],a[1]=b[1],a[2]=b[2],a[3]=b[3]):a=b;return a};I.prototype.transform=function(a,b){this.C(za(a,b));return this};(function(){if(!("HTMLCanvasElement"in window))return!1;try{return document.createElement("CANVAS").getContext("2d")?!0:!1}catch(a){return!1}})();function J(a){z.call(this);this.a="geometry";this.f=this.c=null;v(this,A(this.a),this.g,this);void 0!==a&&(a instanceof I||!a?this.set(this.a,a):ka(this,a))}m(J,z);J.prototype.clone=function(){var a=new J(t({},this.j));Ba(a,this.a);var b=this.get(this.a);b&&(b=b.clone(),a.set(a.a,b));(b=this.c)&&a.setStyle(b);return a};J.prototype.l=function(){this.b()};J.prototype.g=function(){this.f&&(u(this.f),this.f=null);var a=this.get(this.a);a&&(this.f=v(a,"change",this.l,this));this.b()};
J.prototype.setStyle=function(a){if((this.c=a)&&"function"!==typeof a&&!Array.isArray(a))throw new r(41);this.b()};function Ba(a,b){ga(a,A(a.a),a.g,a);a.a=b;v(a,A(a.a),a.g,a);a.g()};function Ca(){this.a=this.s=null};function K(){I.call(this);this.layout="XY";this.f=2;this.a=null}m(K,I);function Da(a){var b;"XY"==a?b=2:"XYZ"==a||"XYM"==a?b=3:"XYZM"==a&&(b=4);return b}K.prototype.D=function(a){var b=this.a,c=this.a.length,d=this.f;a=B(Infinity,Infinity,-Infinity,-Infinity,a);for(var e=0;e<c;e+=d){var f=a,g=b[e],h=b[e+1];f[0]=Math.min(f[0],g);f[1]=Math.min(f[1],h);f[2]=Math.max(f[2],g);f[3]=Math.max(f[3],h)}return a};function L(a,b,c){a.f=Da(b);a.layout=b;a.a=c}
function M(a,b,c,d){if(b)c=Da(b);else{for(b=0;b<d;++b){if(0===c.length){a.layout="XY";a.f=2;return}c=c[0]}c=c.length;var e;2==c?e="XY":3==c?e="XYZ":4==c&&(e="XYZM");b=e}a.layout=b;a.f=c}K.prototype.C=function(a){this.a&&(a(this.a,this.a,this.f),this.b())};
K.prototype.rotate=function(a,b){var c=this.a;if(c){var d=c.length,e=this.f,f=c?c:[],g=Math.cos(a);a=Math.sin(a);var h=b[0];b=b[1];for(var n=0,q=0;q<d;q+=e){var k=c[q]-h,C=c[q+1]-b;f[n++]=h+k*g-C*a;f[n++]=b+k*a+C*g;for(k=q+2;k<q+e;++k)f[n++]=c[k]}c&&f.length!=n&&(f.length=n);this.b()}};
K.prototype.scale=function(a,b,c){var d=b;void 0===d&&(d=a);var e=c;e||(e=ma(this.l()));if(c=this.a){b=c.length;for(var f=this.f,g=c?c:[],h=e[0],e=e[1],n=0,q=0;q<b;q+=f){var k=c[q]-h,C=c[q+1]-e;g[n++]=h+a*k;g[n++]=e+d*C;for(k=q+2;k<q+f;++k)g[n++]=c[k]}c&&g.length!=n&&(g.length=n);this.b()}};K.prototype.translate=function(a,b){var c=this.a;if(c){var d=c.length,e=this.f,f=c?c:[],g=0,h,n;for(h=0;h<d;h+=e)for(f[g++]=c[h]+a,f[g++]=c[h+1]+b,n=h+2;n<h+e;++n)f[g++]=c[n];c&&f.length!=g&&(f.length=g);this.b()}};function Ea(a,b,c,d){var e,f;e=0;for(f=c.length;e<f;++e){var g=c[e],h;for(h=0;h<d;++h)a[b++]=g[h]}return b}function Fa(a,b,c,d,e){e=e?e:[];var f=0,g,h;g=0;for(h=c.length;g<h;++g)b=Ea(a,b,c[g],d),e[f++]=b;e.length=f;return e};function N(a,b){K.call(this);this.g(a,b)}m(N,K);N.prototype.clone=function(){var a=new N(null);L(a,this.layout,this.a.slice());a.b();return a};N.prototype.g=function(a,b){a?(M(this,b,a,1),this.a||(this.a=[]),this.a.length=Ea(this.a,0,a,this.f)):L(this,"XY",null);this.b()};navigator.userAgent.match("CriOS");try{new MouseEvent("click",{buttons:1})}catch(a){};function O(a,b){K.call(this);this.g(a,b)}m(O,K);O.prototype.clone=function(){var a=new O(null);L(a,this.layout,this.a.slice());a.b();return a};O.prototype.D=function(a){var b=this.a,c=b[0],b=b[1];return B(c,b,c,b,a)};O.prototype.g=function(a,b){if(a){M(this,b,a,0);this.a||(this.a=[]);var c=b=this.a,d=0,e,f;e=0;for(f=a.length;e<f;++e)c[d++]=a[e];b.length=d}else L(this,"XY",null);this.b()};function P(a,b){K.call(this);this.c=[];this.g(a,b)}m(P,K);P.prototype.clone=function(){var a=new P(null),b=this.c.slice();L(a,this.layout,this.a.slice());a.c=b;a.b();return a};P.prototype.g=function(a,b){a?(M(this,b,a,2),this.a||(this.a=[]),a=Fa(this.a,0,a,this.f,this.c),this.a.length=0===a.length?0:a[a.length-1]):(a=this.c,L(this,"XY",null),this.c=a);this.b()};function Ga(a){E.call(this,{code:a,units:"m",extent:Ha,global:!0,O:Ia})}m(Ga,E);Ga.prototype.w=function(a,b){return a/na(b[1]/6378137)};var Q=6378137*Math.PI,Ha=[-Q,-Q,Q,Q],Ia=[-180,-85,180,85],Ja="EPSG:3857 EPSG:102100 EPSG:102113 EPSG:900913 urn:ogc:def:crs:EPSG:6.18:3:3857 urn:ogc:def:crs:EPSG::3857 http://www.opengis.net/gml/srs/epsg.xml#3857".split(" ").map(function(a){return new Ga(a)});
function Ka(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c){b[e]=Q*a[e]/180;var f=6378137*Math.log(Math.tan(Math.PI*(a[e+1]+90)/360));f>Q?f=Q:f<-Q&&(f=-Q);b[e+1]=f}return b}function La(a,b,c){var d=a.length;c=1<c?c:2;void 0===b&&(2<c?b=a.slice():b=Array(d));for(var e=0;e<d;e+=c)b[e]=180*a[e]/Q,b[e+1]=360*Math.atan(Math.exp(a[e+1]/6378137))/Math.PI-90;return b};var Ma=new oa(6378137);function R(a,b){E.call(this,{code:a,units:"degrees",extent:Na,P:b,global:!0,K:Oa,O:Na})}m(R,E);R.prototype.w=function(a){return a};var Na=[-180,-90,180,90],Oa=Math.PI*Ma.radius/180,Pa=[new R("CRS:84"),new R("EPSG:4326","neu"),new R("urn:ogc:def:crs:EPSG::4326","neu"),new R("urn:ogc:def:crs:EPSG:6.6:4326","neu"),new R("urn:ogc:def:crs:OGC:1.3:CRS84"),new R("urn:ogc:def:crs:OGC:2:84"),new R("http://www.opengis.net/gml/srs/epsg.xml#4326","neu"),new R("urn:x-ogc:def:crs:EPSG:4326","neu")];ta(Ja);ta(Pa);Pa.forEach(function(a){Ja.forEach(function(b){G(a,b,Ka);G(b,a,La)})});function S(){return{restrict:"A",link:function(a,b,c){var d=a.$eval(c.ngeoSearch),e=a.$eval(c.ngeoSearchDatasets).slice();e.unshift(d);b.typeahead.apply(b,e);c=a.$eval(c.ngeoSearchListeners);var f=S.a(c);b.on("typeahead:open",function(){a.$apply(function(){f.open()})});b.on("typeahead:close",function(){a.$apply(function(){f.close()})});b.on("typeahead:cursorchange",function(b,c,d){a.$apply(function(){f.cursorchange(b,c,d)})});b.on("typeahead:select",function(b,c,d){a.$apply(function(){f.select(b,
c,d)})});b.on("typeahead:autocomplete",function(b,c,d){a.$apply(function(){f.autocomplete(b,c,d)})})}}}S.a=function(a){var b;a?b={open:void 0!==a.open?a.open:p,close:void 0!==a.close?a.close:p,cursorchange:void 0!==a.cursorchange?a.cursorchange:p,select:void 0!==a.select?a.select:p,autocomplete:void 0!==a.autocomplete?a.autocomplete:p}:b={open:p,close:p,cursorchange:p,select:p,autocomplete:p};return b};S.module=angular.module("ngeoSearchDirective",[]);S.module.directive("ngeoSearch",S);function Qa(){Ca.call(this)}m(Qa,Ca);function Ra(a){return"string"===typeof a?(a=JSON.parse(a))?a:null:null!==a?a:null};function T(a){I.call(this);this.a=a?a:null;Sa(this)}m(T,I);function Sa(a){var b,c;if(a.a)for(b=0,c=a.a.length;b<c;++b)v(a.a[b],"change",a.b,a)}T.prototype.clone=function(){var a=new T(null),b=this.a,c=[],d,e;d=0;for(e=b.length;d<e;++d)c.push(b[d].clone());if(a.a)for(b=0,d=a.a.length;b<d;++b)ga(a.a[b],"change",a.b,a);a.a=c;Sa(a);a.b();return a};
T.prototype.D=function(a){B(Infinity,Infinity,-Infinity,-Infinity,a);for(var b=this.a,c=0,d=b.length;c<d;++c){var e=a,f=b[c].l();f[0]<e[0]&&(e[0]=f[0]);f[2]>e[2]&&(e[2]=f[2]);f[1]<e[1]&&(e[1]=f[1]);f[3]>e[3]&&(e[3]=f[3])}return a};T.prototype.rotate=function(a,b){for(var c=this.a,d=0,e=c.length;d<e;++d)c[d].rotate(a,b);this.b()};T.prototype.scale=function(a,b,c){c||(c=ma(this.l()));for(var d=this.a,e=0,f=d.length;e<f;++e)d[e].scale(a,b,c);this.b()};
T.prototype.C=function(a){var b=this.a,c,d;c=0;for(d=b.length;c<d;++c)b[c].C(a);this.b()};T.prototype.translate=function(a,b){var c=this.a,d,e;d=0;for(e=c.length;d<e;++d)c[d].translate(a,b);this.b()};function U(a,b){K.call(this);this.c=[];this.g(a,b)}m(U,K);U.prototype.clone=function(){var a=new U(null),b=this.c.slice();L(a,this.layout,this.a.slice());a.c=b;a.b();return a};U.prototype.g=function(a,b){a?(M(this,b,a,2),this.a||(this.a=[]),a=Fa(this.a,0,a,this.f,this.c),this.a.length=0===a.length?0:a[a.length-1]):(a=this.c,L(this,"XY",null),this.c=a);this.b()};function V(a,b){K.call(this);this.g(a,b)}m(V,K);V.prototype.clone=function(){var a=new V(null);L(a,this.layout,this.a.slice());a.b();return a};V.prototype.g=function(a,b){a?(M(this,b,a,1),this.a||(this.a=[]),this.a.length=Ea(this.a,0,a,this.f)):L(this,"XY",null);this.b()};function W(a,b){K.call(this);this.c=[];this.g(a,b)}m(W,K);W.prototype.clone=function(){for(var a=new W(null),b=this.c.length,c=Array(b),d=0;d<b;++d)c[d]=this.c[d].slice();L(a,this.layout,this.a.slice());a.c=c;a.b();return a};
W.prototype.g=function(a,b){if(a){M(this,b,a,3);this.a||(this.a=[]);b=this.a;var c=this.f,d=this.c,e=0,d=d?d:[],f=0,g,h;g=0;for(h=a.length;g<h;++g)e=Fa(b,e,a[g],c,d[f]),d[f++]=e,e=e[e.length-1];d.length=f;0===d.length?this.a.length=0:(a=d[d.length-1],this.a.length=0===a.length?0:a[a.length-1])}else a=this.c,L(this,"XY",null),this.c=a;this.b()};function Ta(a){a=a?a:{};Ca.call(this);this.s=F(a.s?a.s:"EPSG:4326");a.i&&(this.a=F(a.i));this.b=a.geometryName}m(Ta,Qa);
function Ua(a,b){if(a){a=(0,Va[a.type])(a);var c=b?F(b.i):null;b=b?F(b.o):null;var d;if(d=c&&b)c===b?d=!0:(d=c.b===b.b,d=c.a===b.a?d:va(c,b)===xa&&d),d=!d;d&&(a instanceof I?a=a.transform(b,c):(c=za(b,c),a=[a[0],a[1],a[0],a[3],a[2],a[1],a[2],a[3]],c(a,a,2),b=[a[0],a[2],a[4],a[6]],d=[a[1],a[3],a[5],a[7]],a=Math.min.apply(null,b),c=Math.min.apply(null,d),b=Math.max.apply(null,b),d=Math.max.apply(null,d),a=B(a,c,b,d,void 0)))}else a=null;return a}
var Va={Point:function(a){return new O(a.coordinates)},LineString:function(a){return new N(a.coordinates)},Polygon:function(a){return new P(a.coordinates)},MultiPoint:function(a){return new V(a.coordinates)},MultiLineString:function(a){return new U(a.coordinates)},MultiPolygon:function(a){return new W(a.coordinates)},GeometryCollection:function(a,b){a=a.geometries.map(function(a){return Ua(a,b)});return new T(a)}};
function Wa(a,b,c){b="Feature"===b.type?b:{type:"Feature",geometry:b};c=Ua(b.geometry,c);var d=new J;a.b&&Ba(d,a.b);d.set(d.a,c);void 0!==b.id&&d.b();b.properties&&ka(d,b.properties);return d};function X(a,b,c,d,e,f){var g=new Ta;a={remote:{url:a,prepare:function(a,b){b.url=b.url.replace("%QUERY",a);return b},transform:function(a){void 0!==b&&(a={type:"FeatureCollection",features:a.features.filter(b)});var e=a,f={i:c,o:d};a=Ra(e);var k;if(f){if(f.o)k=f.o;else if(k=Ra(e).crs)if("name"==k.type)k=F(k.properties.name);else if("EPSG"==k.type)k=F("EPSG:"+k.properties.code);else throw new r(36);else k=g.s;k={o:k,i:f.i}}f=t({o:g.s,i:g.a},k);if("FeatureCollection"===a.type){k=[];a=a.features;var C,
e=0;for(C=a.length;e<C;++e)k.push(Wa(g,a[e],f))}else k=[Wa(g,a,f)];return k}},datumTokenizer:p,queryTokenizer:Bloodhound.tokenizers.whitespace};e=t({},e||{});f=t({},f||{});e.remote&&(t(f,e.remote),delete e.remote);t(a,e);t(a.remote,f);return new Bloodhound(a)}X.module=angular.module("ngeoSearchCreategeojsonbloodhound",[]);X.module.value("ngeoSearchCreateGeoJSONBloodhound",X);var Xa=angular.module("ngeoSearchModule",[S.module.name,X.module.name]);var Y=angular.module("ngeo",[Xa.name,"gettext","ui.date","floatThead"]);l("ngeo.FeatureProperties",{ANGLE:"a",COLOR:"c",IS_CIRCLE:"l",IS_RECTANGLE:"r",IS_TEXT:"t",NAME:"n",OPACITY:"o",AZIMUT:"z",SHOW_MEASURE:"m",SIZE:"s",STROKE:"k"});l("ngeo.GeometryType",{CIRCLE:"Circle",LINE_STRING:"LineString",MULTI_LINE_STRING:"MultiLineString",MULTI_POINT:"MultiPoint",MULTI_POLYGON:"MultiPolygon",POINT:"Point",POLYGON:"Polygon",RECTANGLE:"Rectangle",TEXT:"Text"});Y.directive("ngeoMap",function(){return{restrict:"A",link:function(a,b,c){a.$eval(c.ngeoMap).a(b[0])}}});Y.value("ngeoColorpickerTemplateUrl",function(a,b){a=b.ngeoColorpickerTemplateurl;return void 0!==a?a:"ngeo/colorpicker.html"});function Ya(a){return{restrict:"A",scope:{colors:"<?ngeoColorpicker",color:"=?ngeoColorpickerColor"},controller:"NgeoColorpickerController",controllerAs:"ctrl",bindToController:!0,templateUrl:a}}Ya.$inject=["ngeoColorpickerTemplateUrl"];Y.directive("ngeoColorpicker",Ya);
var Za=["#F4EB37 #CDDC39 #62AF44 #009D57 #0BA9CC #4186F0 #3F5BA9 #7C3592 #A61B4A #DB4436 #F8971B #F4B400 #795046".split(" "),"#F9F7A6 #E6EEA3 #B7DBAB #7CCFA9 #93D7E8 #9FC3FF #A7B5D7 #C6A4CF #D698AD #EE9C96 #FAD199 #FFDD5E #B29189".split(" "),["#ffffff","#CCCCCC","#777","#000000"]];function Z(){this.colors=Za}l("ngeo.ColorpickerController",Z);Z.$inject=["$scope","$element","$attrs"];Z.prototype.N=function(a){this.color=a};Z.prototype.setColor=Z.prototype.N;
Y.controller("NgeoColorpickerController",Z);var $a=angular.module("app",["ngeo"]);$a.directive("appColorpicker",function(){return{restrict:"E",scope:!0,template:'<div ngeo-colorpicker="ctrl.colors" ngeo-colorpicker-color="mainCtrl.color"></div>',controllerAs:"ctrl",bindToController:!0,controller:"AppColorpickerController"}});$a.controller("AppColorpickerController",function(){this.colors=["red yellow green lightgreen lightblue orange purple".split(" "),["#ffffff","#f7f7f7","#c3c3c3","#000000"]]});function ab(){this.color="red"}ab.$inject=["$scope"];
$a.controller("MainController",ab);(function(){function a(a){a.put("ngeo/attributes.html",'<fieldset ng-disabled=attrCtrl.disabled> <div class=form-group ng-repeat="attribute in ::attrCtrl.attributes"> <div ng-if="attribute.type !== \'geometry\'"> <label class=control-label>{{ ::attribute.name | translate }} <span class=text-muted>{{::attribute.required ? "*" : ""}}</span></label> <div ng-switch=attribute.type> <select name={{::attribute.name}} ng-required=attribute.required ng-switch-when=select ng-model=attrCtrl.properties[attribute.name] ng-change=attrCtrl.handleInputChange(attribute.name); class=form-control type=text> <option ng-repeat="attribute in ::attribute.choices" value="{{ ::attribute }}"> {{ ::attribute }} </option> </select> <input name={{::attribute.name}} ng-required=attribute.required ng-switch-when=date ui-date=attrCtrl.dateOptions ng-model=attrCtrl.properties[attribute.name] ng-change=attrCtrl.handleInputChange(attribute.name); class=form-control type=text> <input name={{::attribute.name}} ng-required=attribute.required ng-switch-when=datetime ui-date=attrCtrl.dateOptions ng-model=attrCtrl.properties[attribute.name] ng-change=attrCtrl.handleInputChange(attribute.name); class=form-control type=text> <input name={{::attribute.name}} ng-required=attribute.required ng-switch-default ng-model=attrCtrl.properties[attribute.name] ng-change=attrCtrl.handleInputChange(attribute.name); class=form-control type=text> <div ng-show="form.$submitted || form[attribute.name].$touched"> <p class=text-danger ng-show=form[attribute.name].$error.required> {{\'This field is required\' | translate}} </p> </div> </div> </div> </div> </fieldset> ');
a.put("ngeo/popup.html",'<h4 class="popover-title ngeo-popup-title"> <span ng-bind-html=title></span> <button type=button class=close ng-click="open = false"> &times;</button> </h4> <div class=popover-content ng-bind-html=content></div> ');a.put("ngeo/grid.html",'<div class=ngeo-grid-table-container> <table float-thead=ctrl.floatTheadConfig ng-model=ctrl.configuration.data class="table table-bordered table-striped table-hover"> <thead class=table-header> <tr> <th ng-repeat="columnDefs in ctrl.configuration.columnDefs" ng-click=ctrl.sort(columnDefs.name)>{{columnDefs.name | translate}} <i ng-show="ctrl.sortedBy !== columnDefs.name" class="fa fa-fw"></i> <i ng-show="ctrl.sortedBy === columnDefs.name && ctrl.sortAscending === true" class="fa fa-caret-up"></i> <i ng-show="ctrl.sortedBy === columnDefs.name && ctrl.sortAscending === false" class="fa fa-caret-down"></i> </th> </tr> </thead> <tbody> <tr ng-repeat="attributes in ctrl.configuration.data" ng-class="[\'row-\' + ctrl.configuration.getRowUid(attributes), ctrl.configuration.isRowSelected(attributes) ? \'ngeo-grid-active\': \'\']" ng-click="ctrl.clickRow(attributes, $event)" ng-mousedown=ctrl.preventTextSelection($event)> <td ng-repeat="columnDefs in ctrl.configuration.columnDefs" ng-bind-html="attributes[columnDefs.name] | ngeoTrustHtml"></td> </tr> </tbody> </table> </div> ');
a.put("ngeo/scaleselector.html",'<div class="btn-group btn-block" ng-class="::{\'dropup\': scaleselectorCtrl.options.dropup}"> <button type=button class="btn btn-default dropdown-toggle" data-toggle=dropdown aria-expanded=false> <span ng-bind-html=scaleselectorCtrl.currentScale|ngeoScalify></span>&nbsp;<i class=caret></i> </button> <ul class="dropdown-menu btn-block" role=menu> <li ng-repeat="zoomLevel in ::scaleselectorCtrl.zoomLevels"> <a href ng-click=scaleselectorCtrl.changeZoom(zoomLevel) ng-bind-html=::scaleselectorCtrl.getScale(zoomLevel)|ngeoScalify> </a> </li> </ul> </div> ');
a.put("ngeo/datepicker.html","<div class=ngeo-datepicker> <form name=dateForm class=ngeo-datepicker-form novalidate> <div ng-if=\"::datepickerCtrl.time.widget === 'datepicker'\"> <div class=ngeo-datepicker-start-date> <span ng-if=\"::datepickerCtrl.time.mode === 'range'\" translate>From:</span> <span ng-if=\"::datepickerCtrl.time.mode !== 'range'\" translate>Date:</span> <input name=sdate ui-date=datepickerCtrl.sdateOptions ng-model=datepickerCtrl.sdate required> </div> <div class=ngeo-datepicker-end-date ng-if=\"::datepickerCtrl.time.mode === 'range'\"> <span translate>To:</span> <input name=edate ui-date=datepickerCtrl.edateOptions ng-model=datepickerCtrl.edate required> </div> </div> </form> </div> ");
a.put("ngeo/layertree.html",'<span ng-if=::!layertreeCtrl.isRoot>{{::layertreeCtrl.node.name}}</span> <input type=checkbox ng-if="::layertreeCtrl.node && !layertreeCtrl.node.children" ng-model=layertreeCtrl.getSetActive ng-model-options="{getterSetter: true}"> <ul ng-if=::layertreeCtrl.node.children> <li ng-repeat="node in ::layertreeCtrl.node.children" ngeo-layertree=::node ngeo-layertree-notroot ngeo-layertree-map=layertreeCtrl.map ngeo-layertree-nodelayerexpr=layertreeCtrl.nodelayerExpr ngeo-layertree-listenersexpr=layertreeCtrl.listenersExpr> </li> </ul> ');
a.put("ngeo/colorpicker.html",'<table class=ngeo-colorpicker-palette> <tr ng-repeat="colors in ::ctrl.colors"> <td ng-repeat="color in ::colors" ng-click=ctrl.setColor(color) ng-class="{\'ngeo-colorpicker-selected\': color == ctrl.color}"> <div ng-style="::{\'background-color\': color}"></div> </td> </tr> </table> ')}a.$inject=["$templateCache"];Y.run(a)})();}).call(window);
//# sourceMappingURL=colorpicker.js.map
