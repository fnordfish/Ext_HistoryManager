HistoryManager
================
This library consists of 3 Classes:

  * Ext.ux.HashListener : Supplies a very simple interface to mimic a cross-browser back/farward buttons functionality through the browser hash. It uses only 1 method to do this - updateHash, and only 1 Event - 'hash-changed'.
  * Ext.ux.HistoryManager : This class is built on-top of the HashListener to supplly an Observer interface to the HashListener.
  * Ext.ux.HistoryManager.SimpleMap : Provides a simple Object-Map avoiding the trouble of reserved key names

In general, this is a Ext JS 3.1.0 rip-off of the [MooTools' HashListener done by Arieh Glazer](http://github.com/arieh/HistoryManager).
I've added some useful stuff, which will be available in my [MooTools' HistoryManager fork](http://github.com/fnordfish/HistoryManager) and switched the default hash serialization to use url query syntax.

In conclusion, this code was only able by some others fine work:

  * Dave De Vos supplied me with a very good Moo implemenetation that he worked out from several other sources (such as YUI and LittleHistoryManager)
  * Digitarald's HistoryManager, which was originaly made for Moo 1.1. His IE method is by now the best I've seen used and is the one used for this class.

This port is not yet widely tested, nor is the documentation very complete (even though I've used most of the docs done by Arieh). Feel free to fork and help me with that ;)

How To Use
-------------
For both classes, you must supply a blank.html (comes with the package), and point the classes to it (for IE<8 support). by default the classes assume it's location at the root dir.

### Hash Listener

This class supplies a very simple interface for modifying the browser hash in a way that supports a back/farward behavior to all browsers (theoretically).
How To Use:

	#JS
	var hl = new Ext.ux.HashListener();
	
	//add an event listener to the manager
	hl.addListener('hashChanged', function(new_hash) {
		console.log(new_hash);
	});
	
	hl.start(); //Will start listening to hash changes
	
	hl.updateHash('a string'); //will log 'a string'
	hl.updateHash('another string'); //will log 'another string'
	
note that updateHash changes the hash completely.

### History Manager

This class extends the HashListener to supply a richer interface that allows multiple states to be kept together.
It supplies a Domain Observer. This means that you can register your classes through it, and let it transact data between different classes and layers of the site. 
It's usage can be a bit confusing but it actually tries to use JavaScript's event driven syntax:
	
	#JS
	var hm = new Ext.ux.HistoryManager({delimiter: '!'});
	
	/*
	 * Adding event listeners to the observer. 
	 * Should be done before observer is started, so that they will 
	 * also be used when site is opened from history/bookmark.
	 */
	hm.addListener('page-changed', function (val)
	{
		console.log('page was changed: ' + new_value);
	});
	hm.addListener('page-added', function (val)
	{
		console.log('page was added: ' + new_value);
	});
	hm.addListener('page-removed', function (old_value)
	{
		console.log('page was removed: ' + old_value);
	});
	
	hm.start();
	
	hm.set('page', 1); //will log 'page was added: 1' and 'page was changed: 1'
	hm.set('page', 'aaa'); //will log 'page was changed: aaa'
	hm.remove('page'); //will log 'page was removed: aaa'
	hm.set('page', 'bbb'); //will log 'page was added: bbb' and 'page was changed: bbb'
	

Note that this can be done with multiple value names, and can use any JSON-encodable data format as values (such as strings, arrays and objects).

Another note - because of the way the hash is analyzed, changing the order of the inner members of a value will cuase a state-change event. This is because i'm convering the objects to JSON instead of parsing them to save speed.
If you do not controll the order of the values in your objects, make sure you check this manuly.
An Example for this:
	
	#JS
	hm.set('someValue', {a:'a',b:'b'});
	hm.set('someValue', {b:'b',a:'a'}); //will fire someValue-changed although values aren't actualy modified. 

Options
---------
Both classes use the same options:

  * blank_page : an alternative source for an iframe file. *note that the file must be valid for IE<8 support*
  * start : whether to start service on creation (default:false). this is not recomended, since you want the events to be registered before starting the class up.
  * delimiter - (`string`: defaults no '') a beginning delimiter to add to the hash, to support the new Google AJAX syntax (#!)
  * serializeHash - `String function (aHash)` (_Optional_, use with `deserializeHash`) A callback function which serializes a SimpleMap instance
  * deserializeHash - `Hashtable function (aString)` (_Optional_, use with `serializeHash`) A callback function which deserializes a String to a SimpleMap instance

#### Delimiter Usage:
	var hm = new Ext.ux.HistoryManager({delimiter:'!'}); //will add support for the google syntax
	
#### Custom (de)serializer Usage:

	// *TBD*


Events
-------
### Hash Listener

  * `hashChanged` : will fire whenever the hash was changed (whether by the back-button or the class's methods). will send the new hash as a paramater to the function
  * `started` : will be fired after {Ext.ux.HashListener:start()} was called. This is useful when you want to observe values right after the initial page load.

### History Manager
Along side the `hashChanged` event, the class supports 3 dynamic Events, which point to the 3 states a value might hold ('*' notes the value's name):

*NOTE: this is a change that is incompatibale with previous versions*

  * ` * -added` : will be fired when an unset key is given a value. will pass the new value as parameter.
  * ` * -updated` : will be fired when a current key's value was changed. will pass the new value as parameter.
  * ` * -removed` : will be fired when a key has been removed from the state. will pas the key's last value as parameter.
  * ` * -changed` : will fire when any a key is added/updated. will pass the new value as parameter. *NOTE: this will fire alongside the add/updated events*
 
