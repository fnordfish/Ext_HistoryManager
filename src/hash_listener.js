
/*!
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

provides: [Ext.ux.HashListener]

...
*/
Ext.ns('Ext.ux');

Ext.ux.HashListener = (function ()
{
	var HashListener_options = {
		blank_page : 'blank.html',
		iframe_body_id: null,
		start : false
	};
	
	var HashListener = Ext.extend(Ext.util.Observable, {

		options : {},

		iframe : null,
		currentHash : '',
		firstLoad : true,
		handle : false,

		useIframe : (Ext.isIE && (typeof(document.documentMode)=='undefined' || document.documentMode < 8)),

		ignoreLocationChange : false,


		constructor: function (options)
		{
			Ext.apply(this.options, options, HashListener_options);
			Ext.ux.HashListener.superclass.constructor.call(this, options);

			if (!this.options.iframe_body_id)
			{
				this.options.iframe_body_id = 'state' + (new Date()).getTime();
			}

			// shortcut avoiding "this"-bindings
			var $this = this;

			// Disable Opera's fast back/forward navigation mode
			if (Ext.isOpera && window.history.navigationMode)
			{
				window.history.navigationMode = 'compatible';
			}

			// IE8 in IE7 mode defines window.onhashchange, but never fires it...
			if (('onhashchange' in window) && (typeof(document.documentMode) == 'undefined' || document.documentMode > 7))
			{
				// The HTML5 way of handling DHTML history...
				Ext.EventManager.on(window, 'hashchange', function ()
				{
					var hash = $this.getHash();
					if (hash == $this.currentHash)
					{
						return;
					}
					$this.fireEvent('hashChanged', hash);
				});
			}

			Ext.EventManager.on(window, 'unload', function ()
			{
				$this.firstLoad = null;
			});

			if (this.options.start)
			{
				this.start();
			}
		},

		initializeHistoryIframe : function ()
		{
			var hash = this.getHash();
			var doc;
			this.iframe = Ext.DomHelper.append(Ext.getBody(), {
				'tag': 'iframe',
				'src': this.options.blank_page,
				'scrolling': '0',
				'frameborder': '0',
				'width': '0',
				'height': '0',
				'styles': {
					'position': 'absolute',
					'top': 0,
					'left': 0,
					'border': '0px none',
					'width': '0px',
					'height': '0px',
					'visibility': 'hidden',
					'display': 'none'
				}
			});
			this.setIframeHash(hash);
			return;
		},

		checkHash : function ()
		{
			var hash = this.getHash();
			var ie_state;
			var doc;

			if (this.ignoreLocationChange)
			{
				this.ignoreLocationChange = false;
				return;
			}

			if (this.useIframe)
			{
				doc = (this.iframe.contentDocument) ? this.iframe.contentDocumnet  : this.iframe.contentWindow.document;

				if (doc.body.id != this.options.iframe_body_id)
				{
					ie_state = '';
					// reset
					this.iframe.src = this.options.blank_page;
					this.setIframeHash('');
				}
				else
				{
					ie_state = doc.body.innerHTML;
				}

				if (ie_state != hash)
				{
					this.setHash(ie_state);
					hash = ie_state;
				}
			}

			if (this.currentLocation == hash)
			{
				return;
			}

			this.currentLocation = hash;

			this.fireEvent('hashChanged', hash);
		},

		setHash : function (newHash)
		{
			window.location.hash = this.currentLocation = newHash;

			if (('onhashchange' in window) && (typeof(document.documentMode) == 'undefined' || document.documentMode > 7))
			{
				return;
			}

			this.fireEvent('hashChanged', newHash);
		},

		getHash : function ()
		{
			var m;
			if (Ext.isGecko)
			{
				m = /#(.*)$/.exec(window.location.href);
				return m && m[1] ? m[1] : '';
			}
			else if (Ext.isWebKit)
			{
				return decodeURI(window.location.hash.substr(1));
			}
			else
			{
				return window.location.hash.substr(1);
			}
		},

		setIframeHash: function (newHash)
		{
			var doc = (this.iframe.contentDocument) ? this.iframe.contentDocumnet : this.iframe.contentWindow.document;
			doc.open();
			doc.write('<html><body id="' + this.options.iframe_body_id + '">' + newHash + '</body></html>');
			doc.close();
			return;
		},

		updateHash : function (newHash)
		{
			if (Ext.get(newHash))
			{
				throw (
					"Exception: History locations can not have the same value as _any_ IDs that might be in the document," +
					" due to a bug in IE; please ask the developer to choose a history location that does not match any HTML" +
					" IDs in this document. The following ID is already taken and cannot be a location: `" +
					newHash + "`");
			}

			this.ignoreLocationChange = true;

			if (this.useIframe)
			{
				this.setIframeHash(newHash);
			}
			else
			{
				this.setHash(newHash);
			}
		},

		start : function()
		{
			// we need to wait until now for injecting the IE-Hack to make early IE6 happy, which dont like elements (iframe) to be inserted while not ready parsing the DOM
			if (this.useIframe && !(('onhashchange' in window) && (typeof(document.documentMode) == 'undefined' || document.documentMode > 7)))
			{
				this.initializeHistoryIframe();
			} 
			
			this.handle = setInterval(this.checkHash.createDelegate(this), 100);
			this.fireEvent.defer(110, this, ['started']);
		},

		stop : function()
		{
			clearInterval(this.handle);
		}

	});
	
	return HashListener;
})();
