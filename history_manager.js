/*
 * http://www.timdown.co.uk/jshashtable/
 * 
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Hashtable=(function(){var s="function";var u=(typeof Array.prototype.splice==s)?function(a,b){a.splice(b,1)}:function(b,c){var d,a,e;if(c===b.length-1){b.length=c}else{d=b.slice(c+1);b.length=c;for(a=0,e=d.length;a<e;++a){b[c+a]=d[a]}}};function H(a){var c;if(typeof a=="string"){return a}else{if(typeof a.hashCode==s){c=a.hashCode();return(typeof c=="string")?c:H(c)}else{if(typeof a.toString==s){return a.toString()}else{try{return String(a)}catch(b){return Object.prototype.toString.call(a)}}}}}function B(b,a){return b.equals(a)}function D(b,a){return(typeof a.equals==s)?a.equals(b):(b===a)}function F(a){return function(b){if(b===null){throw new Error("null is not a valid "+a)}else{if(typeof b=="undefined"){throw new Error(a+" must not be undefined")}}}}var r=F("key"),w=F("value");function E(a,c,b,d){this[0]=a;this.entries=[];this.addEntry(c,b);if(d!==null){this.getEqualityFunction=function(){return d}}}var A=0,y=1,C=2;function t(a){return function(d){var e=this.entries.length,b,c=this.getEqualityFunction(d);while(e--){b=this.entries[e];if(c(d,b[0])){switch(a){case A:return true;case y:return b;case C:return[e,b[1]]}}}return false}}function x(a){return function(c){var b=c.length;for(var d=0,e=this.entries.length;d<e;++d){c[b+d]=this.entries[d][a]}}}E.prototype={getEqualityFunction:function(a){return(typeof a.equals==s)?B:D},getEntryForKey:t(y),getEntryAndIndexForKey:t(C),removeEntryForKey:function(a){var b=this.getEntryAndIndexForKey(a);if(b){u(this.entries,b[0]);return b[1]}return null},addEntry:function(b,a){this.entries[this.entries.length]=[b,a]},keys:x(0),values:x(1),getEntries:function(c){var a=c.length;for(var b=0,d=this.entries.length;b<d;++b){c[a+b]=this.entries[b].slice(0)}},containsKey:t(A),containsValue:function(a){var b=this.entries.length;while(b--){if(a===this.entries[b][1]){return true}}return false}};function v(c,b){var d=c.length,a;while(d--){a=c[d];if(b===a[0]){return d}}return null}function z(c,b){var a=c[b];return(a&&(a instanceof E))?a:null}function G(e,g){var b=this;var c=[];var d={};var a=(typeof e==s)?e:H;var f=(typeof g==s)?g:null;this.put=function(o,n){r(o);w(n);var l=a(o),j,i,m=null;j=z(d,l);if(j){i=j.getEntryForKey(o);if(i){m=i[1];i[1]=n}else{j.addEntry(o,n)}}else{j=new E(l,o,n,f);c[c.length]=j;d[l]=j}return m};this.get=function(i){r(i);var m=a(i);var l=z(d,m);if(l){var j=l.getEntryForKey(i);if(j){return j[1]}}return null};this.containsKey=function(i){r(i);var j=a(i);var l=z(d,j);return l?l.containsKey(i):false};this.containsValue=function(i){w(i);var j=c.length;while(j--){if(c[j].containsValue(i)){return true}}return false};this.clear=function(){c.length=0;d={}};this.isEmpty=function(){return !c.length};var h=function(i){return function(){var j=[],l=c.length;while(l--){c[l][i](j)}return j}};this.keys=h("keys");this.values=h("values");this.entries=h("getEntries");this.remove=function(n){r(n);var m=a(n),l,i=null;var j=z(d,m);if(j){i=j.removeEntryForKey(n);if(i!==null){if(!j.entries.length){l=v(c,m);u(c,l);delete d[m]}}}return i};this.size=function(){var i=0,j=c.length;while(j--){i+=c[j].entries.length}return i};this.each=function(l){var j=b.entries(),i=j.length,m;while(i--){m=j[i];l(m[0],m[1])}};this.putAll=function(o,j){var l=o.entries();var I,q,i,n,m=l.length;var p=(typeof j==s);while(m--){I=l[m];q=I[0];i=I[1];if(p&&(n=b.get(q))){i=j(q,n,i)}b.put(q,i)}};this.clone=function(){var i=new G(e,g);i.putAll(b);return i}}return G})();
/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state
This is a port form the mootools' version of HashListener to work with native Ext-JS

license: MIT-style

authors:
- Robert Schulze
- Arieh Glazer
- Dave De Vos
- Digitarald

requires:
- ext-core 3.1.0

provides: [Ext.HashListener]

...
*/
Ext.HashListener=Ext.extend(Ext.util.Observable,{options:{blank_page:"blank.html",start:false},iframe:null,currentHash:"",firstLoad:true,handle:false,useIframe:(Ext.isIE&&(typeof(document.documentMode)=="undefined"||document.documentMode<8)),ignoreLocationChange:false,constructor:function(a){Ext.HashListener.superclass.constructor.call(this,a);var b=this;if(Ext.isOpera&&window.history.navigationMode){window.history.navigationMode="compatible"}if(("onhashchange" in window)&&(typeof(document.documentMode)=="undefined"||document.documentMode>7)){Ext.EventManager.on(window,"hashchange",function(){var c=b.getHash();if(c==b.currentHash){return}b.fireEvent("hashChanged",c)})}else{if(this.useIframe){this.initializeHistoryIframe()}}Ext.EventManager.on(window,"unload",function(){b.firstLoad=null});if(this.options.start){this.start()}},initializeHistoryIframe:function(){var b=this.getHash();var a;this.iframe=Ext.DomHelper(document.body,{tag:"iframe",src:this.options.blank_page,styles:{position:"absolute",top:0,left:0,width:"1px",height:"1px",visibility:"hidden"}});a=(this.iframe.contentDocument)?this.iframe.contentDocument:this.iframe.contentWindow.document;a.open();a.write('<html><body id="state">'+b+"</body></html>");a.close();return},checkHash:function(){var c=this.getHash();var a;var b;if(this.ignoreLocationChange){this.ignoreLocationChange=false;return}if(this.useIframe){b=(this.iframe.contentDocument)?this.iframe.contentDocumnet:this.iframe.contentWindow.document;a=b.body.innerHTML;if(a!=c){this.setHash(a);c=a}}if(this.currentLocation==c){return}this.currentLocation=c;this.fireEvent("hashChanged",c)},setHash:function(a){window.location.hash=this.currentLocation=a;if(("onhashchange" in window)&&(typeof(document.documentMode)=="undefined"||document.documentMode>7)){return}this.fireEvent("hashChanged",a)},getHash:function(){var a;if(Ext.isGecko){a=/#(.*)$/.exec(window.location.href);return a&&a[1]?a[1]:""}else{if(Ext.isWebKit){return decodeURI(window.location.hash.substr(1))}else{return window.location.hash.substr(1)}}},setIframeHash:function(a){var b=(this.iframe.contentDocument)?this.iframe.contentDocumnet:this.iframe.contentWindow.document;b.open();b.write('<html><body id="state">'+a+"</body></html>");b.close()},updateHash:function(a){if(Ext.get(a)){throw ("Exception: History locations can not have the same value as _any_ IDs that might be in the document, due to a bug in IE; please ask the developer to choose a history location that does not match any HTML IDs in this document. The following ID is already taken and cannot be a location: `"+a+"`")}this.ignoreLocationChange=true;if(this.useIframe){this.setIframeHash(a)}else{this.setHash(a)}},start:function(){this.handle=setInterval(this.checkHash.createDelegate(this),100);this.fireEvent.defer(110,this,["started"])},stop:function(){clearInterval(this.handle)}});
/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state
This is a port form the mootools' version of HistoryManager to work with native Ext-JS

license: MIT-style

authors:
- Robert Schulze
- Arieh Glazer

requires:
- Ext.HashListener
- Hashtable (http://www.timdown.co.uk/jshashtable)

provides: [Ext.HistoryManager]

...
*/
Ext.HistoryManager=Ext.extend(Ext.HashListener,{options:{delimiter:"",serializeHash:null,deserializeHash:null},state:new Hashtable(),stateCache:new Hashtable(),constructor:function(a){Ext.HistoryManager.superclass.constructor.call(this,a);Ext.apply(this.options,a);if(null!==this.options.deserializeHash&&null!==this.options.serializeHash){this.serializeHash=this.options.serializeHash;this.deserializeHash=this.options.deserializeHash}this.addListener("hashChanged",this.updateState,this)},serializeHash:function(a){var b={};a.each(function(c,d){b[c]=d});return Ext.urlEncode(b)},deserializeHash:function(b){var a=new Hashtable();var c=Ext.urlDecode(b);for(k in c){if(c.hasOwnProperty(k)){a.put(k,c[k])}}return a},updateState:function(b){var a=this;if(this.options.delimiter){b=b.substr(b.indexOf(this.options.delimiter)+this.options.delimiter.length)}b=this.deserializeHash(b);this.state.each(function(d,e){var f,h,c,g;if(false===b.containsKey(d)){f=a.state.get(d);a.fireEvent(d+"-removed",f);a.state.remove(d);a.stateCache.remove(d);b.remove(d);return}g=b.get(d);c=typeof g;h=(c=="string"||c=="number"||c=="boolean")?g:Ext.encode(g);if(h!=a.stateCache.get(d)){f=b.get(d);a.state.put(d,f);a.stateCache.put(d,h);a.fireEvent(d+"-updated",f);a.fireEvent(d+"-changed",f)}b.remove(d)});b.each(function(c,d){a.state.put(c,d);v_type=typeof d;comperable=(v_type=="string"||v_type=="number"||v_type=="boolean")?d:Ext.encode(d);a.stateCache.put(c,comperable);a.fireEvent(c+"-added",d);a.fireEvent(c+"-changed",d)})},set:function(a,b){var c=this.state.clone();c.put(a,b);this.updateHash(this.options.delimiter+this.serializeHash(c));return this},hasKey:function(a){return this.state.containsKey(a)},remove:function(a){var b=this.state.clone();b.remove(a);this.updateHash(this.options.delimiter+this.serializeHash(b));return this}});