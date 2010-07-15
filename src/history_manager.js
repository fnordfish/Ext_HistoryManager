
/*!
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state
This is a port form the mootools' version of HistoryManager to work with native Ext-JS

license: MIT-style

authors:
- Robert Schulze
- Arieh Glazer

requires:
- Ext.ux.HashListener

provides: [Ext.ux.HistoryManager, Ext.ux.HistoryManager.SimpleMap]

...
*/
Ext.ns('Ext.ux');

Ext.ux.HistoryManager = (function () {
	
	/*
	 * A simple Object-Map, which does not soffer from reserved key-names
	 */
	var SimpleMap = Ext.extend(Object, (function (){

		var values = {};
		var length = 0;

		// we need to prefix each value, we want to store, to avoid collitions with prototypal values ob `Object` 
		var prefix = '$___';
		var prefixLength = prefix.length;

		function prefixKey(key)
		{
			return prefix + key;
		}

		function unPrefixKey(key)
		{
			if (0 === key.indexOf(prefix))
			{
				return key.substr(prefixLength);
			}
			return false;
		}

		return {

			constructor: function (obj)
			{
				if (obj && 'object' == typeof obj)
				{
					for (k in obj) if (obj.hasOwnProperty(k))
					{
						this.put(k, obj[k])
					}
				}
			},

			put: function (key, value)
			{
				var oldValue = this.get(key);
				values[ prefixKey(key) ] = value;
				++length;
				return oldValue;
			},

			get: function (key)
			{
				return values[ prefixKey(key) ];
			},

			remove: function (key)
			{
				var k = prefixKey(key);
				var v;

				if (values.hasOwnProperty(k))
				{
					v = values[k];
					delete values[k];
					--length;
				}

				return v;
			},
			
			clear: function ()
			{
				values = {};
				length = 0;
			},

			containsKey: function (key)
			{
				return values.hasOwnProperty(prefixKey(key));
			},

			isEmpty: function ()
			{
				return (length === 0);
			},

			each: function (callback)
			{
				for (k in values) if (values.hasOwnProperty(k))
				{
					callback(unPrefixKey(k), values[k]);
				}
				return this;
			},
			
			clone: function ()
			{
				var newMap = new SimpleMap();
				this.each(newMap.put);
				return newMap;
			}
		};

	})());
	Ext.apply(SimpleMap, new Object());
	
	
	var HistoryManager = Ext.extend(Ext.ux.HashListener, {

		options : {
			delimiter : '',
			serializeHash: null,
			deserializeHash: null
		}, 
	
		state : new SimpleMap(),
		stateCache : new SimpleMap(),
	
	
		constructor: function (options)
		{
			Ext.ux.HistoryManager.superclass.constructor.call(this, options);
			Ext.apply(this.options, options);
			if (null !== this.options.deserializeHash && null !== this.options.serializeHash)
			{
				this.serializeHash = this.options.serializeHash;
				this.deserializeHash = this.options.deserializeHash;
			}
		
			this.addListener('hashChanged', this.updateState, this);
		},
	

		serializeHash : function (h)
		{
			// make a plain object
			var o = {};
			h.each(function (key, val)
			{
				o[key] = val;
			});
			return Ext.urlEncode(o);
		},
	

		deserializeHash : function (s)
		{
			var h = new SimpleMap();
			var o = Ext.urlDecode(s);
			for (k in o) if (o.hasOwnProperty(k))
			{
				h.put(k, o[k]);
			}
			return h; 
		},
	
	
		updateState : function (hash)
		{
			var $this = this;
		
			if (this.options.delimiter)
			{
				hash = hash.substr(hash.indexOf(this.options.delimiter) + this.options.delimiter.length);
			}
		
			hash = this.deserializeHash(hash);

			this.state.each(function (key, value)
			{
				var nvalue, comperable, h_type, h_value;
			
				if (false === hash.containsKey(key))
				{
					nvalue = $this.state.get(key);
					$this.fireEvent(key+'-removed', nvalue);
					$this.state.remove(key);
					$this.stateCache.remove(key);
					hash.remove(key);
					return;
				}
			
				h_value = hash.get(key);
				h_type = typeof h_value;
			
				comperable = (h_type=='string' || h_type=='number' || h_type =='boolean') ? h_value : Ext.encode(h_value);
			
				if (comperable != $this.stateCache.get(key))
				{
					nvalue = hash.get(key);
					$this.state.put(key, nvalue);
					$this.stateCache.put(key, comperable);
					$this.fireEvent(key+'-updated', nvalue);
					$this.fireEvent(key+'-changed', nvalue);
				}
			
				hash.remove(key);
			});
		
			hash.each(function (key, value)
			{
				$this.state.put(key,value);
				v_type = typeof value;
				comperable = (v_type == 'string' || v_type == 'number' || v_type == 'boolean') ? value : Ext.encode(value);
				$this.stateCache.put(key, comperable);
				$this.fireEvent(key+'-added', value);
				$this.fireEvent(key+'-changed', value);
			});
		
		},
	
		set : function (key, value)
		{
			var newState = this.state.clone();
		
			newState.put(key, value);
		
			this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
			return this;
		},
	
		hasKey : function (key)
		{
			return this.state.containsKey(key);
		},
	
		remove : function (key)
		{
			var newState = this.state.clone();
		
			newState.remove(key);
		
			this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
			return this;
		}
	});
	
	HistoryManager.SimpleMap = SimpleMap;
	
	return HistoryManager;
})();
