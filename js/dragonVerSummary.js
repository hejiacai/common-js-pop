/*!
 * jQuery JavaScript Library v1.8.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Tue Nov 13 2012 08:20:33 GMT-0500 (Eastern Standard Time)
 */
(function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.3",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Remove at next major release (1.9/2.0)
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = core_slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,
	outermostContext,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	Token = String,
	document = window.document,
	docElem = document.documentElement,
	dirruns = 0,
	done = 0,
	pop = [].pop,
	push = [].push,
	slice = [].slice,
	// Use a stripped-down indexOf if a native one is unavailable
	indexOf = [].indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value == null || value;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			// Retrieve with (key + " ") to avoid collision with native Object.prototype properties (see Issue #157)
			return (cache[ key + " " ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
		"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"POS": new RegExp( pos, "i" ),
		"CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var val,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( xml || assertAttributes ) {
		return elem.getAttribute( name );
	}
	val = elem.getAttributeNode( name );
	return val ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			val.specified ? val.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": assertUsableName && function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": assertUsableClassName && function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem, context ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.substr( result.length - check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				return function( elem ) {
					var node, diff,
						parent = elem.parentNode;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					if ( parent ) {
						diff = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								diff++;
								if ( elem === node ) {
									break;
								}
							}
						}
					}

					// Incorporate the offset (or cast to NaN), then check against cycle size
					diff -= last;
					return diff === first || ( diff % first === 0 && diff / first >= 0 );
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		// Positional types
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 0; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 1; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ expando ][ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			tokens.push( matched = new Token( match.shift() ) );
			soFar = soFar.slice( matched.length );

			// Cast descendant combinators to space
			matched.type = match[0].replace( rtrim, " " );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {

				tokens.push( matched = new Token( match.shift() ) );
				soFar = soFar.slice( matched.length );
				matched.type = type;
				matched.matches = match;
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && combinator.dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( checkNonElements || elem.nodeType === 1  ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( !xml ) {
				var cache,
					dirkey = dirruns + " " + doneName + " ",
					cachedkey = dirkey + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem, context, xml ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( matcher( elem, context, xml ) ) {
							return elem;
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && tokens.join("")
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Nested matchers should use non-integer dirruns
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = superMatcher.el;
			}

			// Add elements passing elementMatchers directly to results
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++superMatcher.el;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				for ( j = 0; (matcher = setMatchers[j]); j++ ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	superMatcher.el = 0;
	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ expando ][ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed, xml ) {
	var i, tokens, token, type, find,
		match = tokenize( selector ),
		j = match.length;

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !xml &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().length );
			}

			// Fetch a seed set for right-to-left matching
			for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( rbackslash, "" ),
						rsibling.test( tokens[0].type ) && context.parentNode || context,
						xml
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && tokens.join("");
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		xml,
		results,
		rsibling.test( selector )
	);
	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

			// qSa(:focus) reports false when true (Chrome 21), no need to also add to buggyMatches since matches checks buggyQSA
			// A support test would require too much code (would include document ready)
			rbuggyQSA = [ ":focus" ],

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [ ":active" ],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		// rbuggyQSA always contains :focus, so no need for a length check
		rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && !rbuggyQSA.test( selector ) ) {
				var groups, i,
					old = true,
					nid = expando,
					newContext = context,
					newSelector = context.nodeType === 9 && selector;

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					groups = tokenize( selector );

					if ( (old = context.getAttribute("id")) ) {
						nid = old.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}
					nid = "[id='" + nid + "'] ";

					i = groups.length;
					while ( i-- ) {
						groups[i] = nid + groups[i].join("");
					}
					newContext = rsibling.test( selector ) && context.parentNode || context;
					newSelector = groups.join(",");
				}

				if ( newSelector ) {
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							newSelector
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( "!=", pseudos );
				} catch ( e ) {}
			});

			// rbuggyMatches always contains :active and :focus, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && !rbuggyQSA.test( expr ) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( e ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== "undefined" ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	return {
		top: box.top  + scrollTop  - clientTop,
		left: box.left + scrollLeft - clientLeft
	};
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );








/*
*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*
*common.js
*
*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

/****公共js方法库****/
/****公共js方法库****/
$.ajaxSetup({ cache: false });

//获取最高的一个zindex，提供给dialog和control调用，
var zindex = 100;
var getZIndex = function() { return zindex++; };

String.prototype.toInt = function()
{
    return parseInt(this);
}
//字符串的长度，区分全角与半角
String.prototype.caseLength = function()
{
    var self = this;
    var len = self.length;
    var caseLen = 0;
    for (var i = 0; i < len; i++)
    {
        if ((self.charCodeAt(i) & 0xff00) != 0)
        {
            caseLen++;
        }
        caseLen++;
    }
    return caseLen;
}

// 截取字符串长度，一个全角字符算两个长度
String.prototype.caseSubStr = function(start, len)
{
    var self = this;
    var caseLen = 0;
    var l = 0;
    var tempLen = 0;
    var iStart = 0;
    var iLen = 0;
    for (var i = 0; i < self.length; i++)
    {
        tempLen = 0;
        if ((self.charCodeAt(i) & 0xff00) != 0)
        {
            caseLen++;
            tempLen++;
        }
        caseLen++;
        tempLen++;
        if (caseLen >= start)
        {
            if (iStart == null) iStart = i;
            l += tempLen;
            if (l >= len)
            {
                iLen = i - iStart + 1;
                break;
            }
        }
    }
    return this.substring(iStart, iLen);
}

//将字符串转换为float类型
String.prototype.toFloat = function()
{
    return parseFloat(this);
}

//将日期字符串转换为日期类型，格式： 2010-11-5 16:00:00 
String.prototype.toDate = function()
{
    var datePart = this.split(" ")[0];
    var temp = datePart.split("-");
    date = new Date(temp[0], temp[1] - 1, temp[2]);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

//去掉字符串的前后空格
// 2011-04-27 zhangyu update
// 将单个的replace方法拆分为 两次调用，可使每个正则表达式变得简单，因此更快
String.prototype.trim = function()
{
    return this.replace(/^\s+/, "").replace(/\s+$/, "");
}

// 应用于比较长的字符串清空空格

// 2011-04-27  zhangyu  add
String.prototype.longTrim = function()
{
    this.replace(/^\s+/, "");
    for (var i = this.length - 1; i >= 0; i--)
    {
        if (/\s/.test(this.charAt(i)))
        {
            this.substring(0, i + 1);
            break;
        }
    }
    return this;
}

// 字符串StringBuilder类
function StringBuilder()
{
    this._strings = new Array();
}
StringBuilder.prototype.Append = function(value)
{
    this._strings.push(value);
    return this;
}
StringBuilder.prototype.Clear = function()
{
    this._strings.length = 1;
}
StringBuilder.prototype.toString = function()
{
    return this._strings.join('');
}


// 通过自身的选中状态选中其它复选框
$.fn.checkBox = function(chk, table)
{
    var checked = this.attr('checked');
    var inputCheckBoxs = !table ? $('input:not(:disabled)[type=checkbox][name="' + chk + '"]') : $(table).find('input:not(:disabled)[type=checkbox][name="' + chk + '"]');
    inputCheckBoxs.attr("checked", checked);
    refreshChecked(inputCheckBoxs, checked);
}

//检查自身的选中状态是否正确
$.fn.refreshCheck = function(table)
{
    var c = this.data('checkBoxName');
    try
    {
        c.check();
    }
    catch (e)
    {
    }
    refreshChecked(!table ? $(this).closest('table').find(':checkbox') : $(table).find(':checkbox'), $(this).is(':checked'));
}

//给当前复先框绑定选中事件
$.fn.bindCheckBox = function(chk, containerName)
{
    // 2011-04-29  zhangyu
    // 替换为checkBox click绑定匿名函数
    var con = $(containerName);
    $(this).click(function()
    {
        var _self = $(this);
        var checked = _self.attr('checked');
        var inputCheckBoxs = !containerName ? $('input:not(:disabled)[type=checkbox][name="' + chk + '"]') : con.find('input:not(:disabled)[type=checkbox][name="' + chk + '"]');
        inputCheckBoxs.attr("checked", checked);
        var selStatus = _self.closest('.downState').find('.selectAllCon');
        if (selStatus.length > 0)
        {
            selStatus.hide();
        }
        refreshChecked(inputCheckBoxs, checked);
    });
    var c =
    {
        checkbox: this,
        selector: chk,
        check: function()
        {
            var _self = c;
            var checked = 0, unchecked = 0;
            var checkBoxs = !containerName ? $('input[type="checkbox"][name="' + _self.selector + '"]') : con.find('input[type="checkbox"][name="' + _self.selector + '"]');
            for (var i = checkBoxs.length - 1; i >= 0; i--)
            {
                var el = $(checkBoxs[i]);
                if (el.attr('checked'))
                {
                    checked++;
                } else if (el.attr('disabled') != true)
                {
                    unchecked++;
                }
            }
            var allCheck = checked > 0 && unchecked == 0;
            _self.checkbox.attr('checked', allCheck);
            singleRefreshChecked($(this));
        }
    };
    this.data('checkBoxName', c);
    (!containerName ? $('input[type="checkbox"][name="' + chk + '"]') : con.find('input[type="checkbox"][name="' + chk + '"]')).live('click', c.check);
}


//检查是否选定的指定的个数，min max 可以不指定
function checkSelected(name, containerName, min, max)
{
    var checked = 0;
    var inputs = containerName ? $(containerName).find('input[name=' + name + ']') : $('input[name=' + name + ']');
    for (var i = inputs.length - 1; i >= 0; i--)
    {
        if ($(inputs[i]).attr('checked'))
        {
            checked++;
        }
    }
    if (min && checked < min) return false;
    if (max && checked > max) return false;
    if (min != -1 && checked < 1) return false;
    return true;
}

//jquery 插件
//绑定的文本框只能输入数字；                $("#txtOnlyNumber").onlyInputNumber();
//绑定的文本框输入小写字母自动转为大写；    $("#txtWord").autoUpper();
//绑定的文本框只能输入只定字符串；          $("#keyword").keyFileter("0123456789abcdefghijklmnopqrstuvwxyz_");
//绑定的文本框只能输入实数；                $("#keyword").keyFilterFloat();
jQuery.fn.extend(
{
    onlyInputNumber: function()
    {
        if (event.keyCode == 13)
        {
            return;
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57))
        {
            return;
        }
        event.preventDefault();
    },
    autoUpper: function()
    {
        this.keyup(function(event)
        {
            var s = $(this);
            s.val(s.val().toUpperCase());
        });
    },
    keyFileter: function(key)
    {
        this.keypress(function(event)
        {
            if (event.keyCode == 13)
            {
                return;
            }
            for (i = 0; i < key.length; i++)
            {
                if (event.keyCode == key.charCodeAt(i))
                {
                    return;
                }
            }
            event.preventDefault();
        });
    },
    keyFilterFloat: function()
    {
        $(this).keypress(function(event)
        {
            var temp = $(this).val();
            if (event.keyCode == 13)
            {
                return;
            }
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode == 46 && temp.indexOf(".") == -1))
            {
                return;
            }
            event.preventDefault();
        });
    }
})

//根据 property (传入的属性，如“dateTime”)来获取要进行处理的日期字段
//再从data数据（json格式）中统计出今天、昨天、更早以前数据
//today由外部传入，根据传入的today值进行比较
//返回值 {today:[],yesterday:[],past:[]}
//调用方法：
//var obj = $.stage(json,'2010-10-5',"dateTime");
jQuery.extend({
    stage: function(data, today, property)
    {
        if (today.constructor == String)
        {
            today = today.toDate();
        }
        var yestoday = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), today.getDate());
        var yyestoday = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), today.getDate());
        yestoday.setDate(yestoday.getDate() - 1);
        yyestoday.setDate(yyestoday.getDate() - 2);
        var week = new Array("本周日", "本周一", "本周二", "本周三", "本周四", "本周五", "本周六");
        //firefox下面getYeard在大于2000时返回的是1900后面的差值，所以要加1900
        var tempDate = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), today.getDate());
        var tempDate2 = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), today.getDate());
        tempDate2.setDate(tempDate2.getDate() - 1);
        tempDate.setDate(tempDate.getDate() + 7 - tempDate2.getDay());
       
        //分组对象
        var dayArr = function(name, s, e)
        {
            var start = null;
            var end = null;
           
            if (e) end = new Date(e.getYear() < 1000 ? e.getYear() + 1900 : e.getYear(), e.getMonth(), e.getDate());
            
            if (s) start = new Date(s.getYear() < 1000 ? s.getYear() + 1900 : s.getYear(), s.getMonth(), s.getDate());
           
            this.name = name;
            this.data = new Array();
            this.process = function(d, date)
            {
                if (date == null && (start == null && end == null))
                {

                    this.data.push(d);
                    return true;
                }
                if ((start == null && end == null) || (date >= start && end == null) || (start == null && date <= end)
                    || (start != null && end != null && date >= start && date <= end))
                {
                    this.data.push(d);
                    return true;
                }
                return false;
            }
        }
        //分组对象的数组
        var arr = new Array();
        //之后
        {
            var d = new dayArr('之后', tempDate, null);
            arr.push(d);
        }
        //本周
        for (var i = 7; i > 0; i--)
        {
            tempDate.setDate(tempDate.getDate() - (i > 0 ? 1 : 0));
            var name = null;
            if (tempDate.getDay() == today.getDay())
            {
                name = '今天';
            } else if (tempDate.getDay() == yestoday.getDay())
            {
                name = '昨天';
            } else if (tempDate.getDay() == yyestoday.getDay())
            {
                name = '前天';
            } else
            {
                name = week[tempDate.getDay()];
            }
            var d = new dayArr(name, tempDate, tempDate);
            arr.push(d);
        }
        //上周
        {
            //tempDate.setDate(tempDate.getDate() - 7);
            var endDate = new Date(tempDate.getYear() < 1000 ? tempDate.getYear() + 1900 : tempDate.getYear(), tempDate.getMonth(), tempDate.getDate());

            endDate.setDate(tempDate.getDate() - 1);
            var name = '上周日';
            var d = new dayArr(name, endDate, endDate);
            arr.push(d);

            endDate.setDate(tempDate.getDate() - 7);
            name = '上周';
            d = new dayArr(name, endDate, tempDate);
            arr.push(d);
        }
        //本月
        {
            var monthStart = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), 1);
            var monthEnd = new Date(today.getYear() < 1000 ? today.getYear() + 1900 : today.getYear(), today.getMonth(), 1);
            monthEnd.setMonth(monthEnd.getMonth() + 1, 1);
            monthEnd.setDate(monthEnd.getDate() - 1);
            var d = new dayArr('本月', monthStart, monthEnd);
            arr.push(d);
        }
        //一个月前
        {
            var d = new dayArr('一个月前', null, tempDate);
            arr.push(d);
        }

        //其它
        var other = new dayArr('其它', null, null);
        arr.push(other);


        for (var i = 0; i < data.length; i++)
        {
            var value = eval("data[i]" + "." + property);
            var temp = value.toDate();
            var date = null;
            if (temp) date = new Date(temp.getYear() < 1000 ? temp.getYear() + 1900 : temp.getYear(), temp.getMonth(), temp.getDate());
            for (var j in arr)
            {
                if (arr[j].process(data[i], date)) break;
            }
        }
        var o = new Array();
        for (var i in arr)
        {
            if (arr[i].data.length > 0)
            {
                o.push({ name: arr[i].name, data: arr[i].data });
            }
        }
        return o;
    }
});

//链接输入正动补全功能
(function($)
{
    var protocols = ['http'];

    var createDiv = function(txt)
    {
        var val = txt.val();
        var div = $('<div style="position:absolute; cursor:pointer;border:#0000FF solid 1px;">');
        for (var i = 0; i < protocols.length; i++)
        {
            var opt = $('<div id="' + protocols[i] + '" style="height:25; text-align:left;padding:3px;">');
            opt.html(protocols[i] + '://' + val);
            if (i == 0)
            {
                opt.css('background-color', '#0099FF');
                //opt.attr('current', 'true');
            }
            opt.click(function()
            {
                var el = $(this);
                var text = el.html();
                var parent = el.parent();
                parent.data('txt').val(text);
                parent.hide();
            });
            div.append(opt);
        }
        div.data('txt', txt);
        div.moveNext = function()
        {
            var divs = this.find('div');
            var index = 0;
            for (var i = 0; i < divs.length; i++)
            {
                var el = $(divs[i]);
                if (el.attr('current') == 'true')
                {
                    index = i;
                }
                el.css('background-color', '#FFFFFF');
                el.attr('current', 'false');
            }
            index++;
            if (index > divs.length - 1) index = 0;
            $(divs[index]).css('background-color', '#0099FF')
            $(divs[index]).attr('current', 'true');
        };
        div.moveUp = function()
        {
            var divs = this.find('div');
            var index = 0;
            for (var i = 0; i < divs.length; i++)
            {
                var el = $(divs[i]);
                if (el.attr('current') == 'true')
                {
                    index = i;
                }
                el.css('background-color', '#FFFFFF')
                el.attr('current', 'false');
            }
            index--;
            if (index < 0) index = divs.length - 1;
            $(divs[index]).css('background-color', '#0099FF')
            $(divs[index]).attr('current', 'true');
        }

        div.update = function(text)
        {
            for (var i = 0; i < protocols.length; i++)
            {
                this.find('#' + protocols[i]).html(protocols[i] + '://' + text);
            }
            this.setSelect(0);
        };
        div.setValue = function()
        {
            var txt = this.data('txt');
            this.find('div').each(function()
            {
                var el = $(this);
                if (el.attr('current') == 'true')
                {
                    txt.val(el.html());
                }
            });
            this.hide();
        };
        div.showF = function()
        {
            if (this.is(':visible')) return;
            var txt = this.data('txt');
            var offset = txt.offset();
            var top = offset.top + txt.outerHeight();
            var left = offset.left;
            div.css({ left: left, top: top });
            this.setSelect(0);
            div.show();
        };
        div.setSelect = function(index)
        {
            var divs = this.find('div');
            for (var i = 0; i < divs.length; i++)
            {
                var el = $(divs[i]);
                if (i == index)
                {
                    el.css('background-color', '#0099FF')
                    el.attr('current', 'true');
                } else
                {
                    el.css('background-color', '#FFFFFF')
                    el.attr('current', 'false');
                }
            }
        }
        $('body').append(div);
        $('body').click(function()
        {
            div.hide();
        });
        div.hide();
        return div;
    }

    var checkProtocol = function(text)
    {
        var hasProtocol = false;
        for (var i = 0; i < protocols.length; i++)
        {
            var reg = new RegExp('^' + protocols[i] + '://.*', 'i');
            if (reg.test(text))
            {
                hasProtocol = true;
                break;
            }
        }
        return hasProtocol;
    }

    $.fn.urlInput = function()
    {
        this.data('oldVal', this.val());
        this.keyup(function()
        {
            var el = $(this);
            var val = el.val();
            var div = el.data('div');
            if (val == '' || checkProtocol(val))
            {
                try
                {
                    if (div) div.hide();
                } catch (e) { }
                return;
            }

            var e = $.event.fix(event);
            var oldVal = el.data('oldVal');

            if (!div)
            {

                div = createDiv(el);
                el.data('div', div);
            }
            div.showF();
            if (val != oldVal)
            {
                div.update(val);
                el.data('oldVal', val);
            }
            if (e.keyCode == 38)
            {
                div.moveUp();
            } else if (e.keyCode == 40)
            {
                div.moveNext();
            } else if (e.keyCode == 13)
            {
                div.setValue();
            }
        });
    }
})(jQuery);

//下拉列表展开事件
function toggleItemLi(obj) {
    if ($(obj).closest('span.verSelect').find('span.verSelectCon').is(":hidden")) {
        $('html').find('span.verSelect').removeClass('verSelectCu');
        $(obj).closest('span.verSelect').addClass('verSelectCu');
    }
    else {
        $(obj).closest('span.verSelect').removeClass('verSelectCu');
    }
}


//下拉列表选择项事件
function chooseItem(obj, isValidate,onchange) {
    $(obj).closest('ul').find('li').removeClass('cu');
    $(obj).addClass('cu');
    $(obj).closest('span.verSelect').find(':input').val($(obj).find('a').attr("thevalue"));
    $(obj).closest('span.verSelect').find('span.verSelectBg span.verSelectTxt').html($(obj).find('a').html());
    if (typeof onchange != 'undefined' && onchange instanceof Function) {
        onchange($(obj).closest('span.verSelect').find(':input').val(),obj);
    }
    if (isValidate) {
        $(obj).closest('form').validate().element($(obj).closest('span.verSelect').find(':input'));
    }
   
    $(obj).closest('span.verSelect').removeClass('verSelectCu');
}

//年月控件选择项事件
function __resetYearMonth(change, cqjobFormat, enableYearOnly, isValidate, obj) {
    var con = $(obj).closest('span._yearMonthContainer');
    var hid = con.find('input[type=hidden]');
    var sel = con.find('span.verSelect');
    $(obj).closest('ul').find('li').removeClass('cu');
    $(obj).addClass('cu');
    $(obj).closest('span.verSelect').find('span.verSelectBg span.verSelectTxt').html($(obj).find('a').html());
    $(obj).closest('span.verSelect').removeClass('verSelectCu');

    var year = $(sel[0]).find('span.verSelectCon').find('ul li.cu').find('a').attr('theValue');
    var month = $(sel[1]).find('span.verSelectCon').find('ul li.cu').find('a').attr('theValue');

    if (year && month) {
        if (cqjobFormat) {
            hid.val(year + '/' + month);
        } else {
            hid.val(year + '-' + month + '-1');
        }
    } else if (year && enableYearOnly) {
        if (cqjobFormat) {
            hid.val(year);
        } else {
            hid.val(year + '-1-1');
        }
    } else {
        hid.val('');
    }
    if (change) {
        try {
            eval(change + '("' + hid.val() + '")');
        } catch (e) { }
    }

    if (isValidate) {
        $(obj).closest('form').validate().element(hid);
    }
}

//检查个人用户是否登录，参数是登录成功后的回调函数
//如果没登录返回false并弹出登录界面
function checkPersonLogin(callback, onclose, hideTip)
{
	return true;
    var logined = true;
    $.ajax(
    {
        url: '/CommonHandles/PersonLoginCheck.ashx',
        dataType: 'json',
        async: false,
        success: function(json) { logined = json.isLogined; },
        error: function() { /*logined = false;*/ }
    });
    if (!logined && !($('#loginForm')[0]))
    {
        if (typeof onclose == 'boolean')
        {
            hideTip = onclose;
            onclose = null;
        }
        var url = '/DragonVerPersonAjaxLogin.aspx?success=' + (callback || '') + (hideTip ? '&hideTip=true' : '');
        $.showModal(url, { title: '个人登录', animate: false, onclose: onclose });
    }
    return logined;
}

//检查单位用户是否登录，参数是登录成功后的回调函数
//如果没登录返回false并弹出登录界面
function checkCompanyLogin(callback, onclose)
{
	return true;
    var logined = true;
    $.ajax(
    {
        url: '/CommonHandles/CompanyLoginCheck.ashx',
        dataType: 'json',
        async: false,
        success: function(json) { logined = json.isLogined; },
        error: function() { /*logined = false;*/ }
    });
    if (!logined && !($('#loginForm')[0]))
    {
        var url = '/DragonVerCompanyAjaxLogin.aspx?success=' + (callback || '');
        $.showModal(url, { title: '单位登录', onclose: onclose });
    }
    return logined;
}

$.fn.bgIframe = $.fn.bgiframe = function(s)
{
    //因发现ie7也出现这个问题，所以不管什么浏览器都加上
    //if ($.browser.msie && /6.0/.test(navigator.userAgent))
    try
    {
        s = $.extend({ top: 'auto', left: 'auto', width: 'auto', height: 'auto', opacity: true, src: 'javascript:void(0);'
        }, s || {});

        var prop = function(n)
        {
            return n && n.constructor == Number ? n + 'px' : n;
        };
        var width = this.outerWidth(true);
        var height = this.outerHeight(true);
        //var html = '<iframe class="bgiframe" frameborder="0"tabindex="-1"src="' + s.src + '"' + 'style="display:block;position:absolute;z-index:-1;' + (s.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '') + 'top:' + (s.top == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')' : prop(s.top)) + ';' + 'left:' + (s.left == 'auto' ? 'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')' : prop(s.left)) + ';' + 'width:' + (s.width == 'auto' ? 'expression(this.parentNode.offsetWidth+\'px\')' : prop(s.width)) + ';' + 'height:' + (s.height == 'auto' ? 'expression(this.parentNode.offsetHeight+\'px\')' : prop(s.height)) + ';' + '"/>';
        var html = this.find('.bgiframe');
        if (html.length > 0)
        {
            html.remove();
        }
        html = '<iframe class="bgiframe" frameborder="0" tabindex="-1"src="javascript:void(0)"' + 'style="display:block;position:absolute;z-index:-1;' + (s.opacity !== false ? 'filter:Alpha(Opacity=\'0\');' : '') + 'top:' + (s.top == 'auto' ? '0px' : prop(s.top)) + ';' + 'left:' + (s.left == 'auto' ? '0px' : prop(s.left)) + ';' + 'width:' + prop(width) + ';' + 'height:' + prop(height) + ';' + '"/>';
        this.prepend(html);
       
    } catch (e) { }
    return this;
};

//正则表达式集合
var Reg = {
    //验证数字
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
    //验证日期
    date: /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/,
    //验证url
    url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
    //验证Email
    email: /^[a-z0-9]([a-z0-9]*[-_.]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z0-9]+([\.][a-z0-9]{2,3})?$/i,
    //电话号码
    tel: /^.{0,30}\d{5}.{0,30}$/,
    //身份证
    idcard: /^\d{17}[\d|X|x]$/,
    //数字和字母
    numChar: /^[a-z0-9A-Z]*$/,
    //验证用户名
    username: /^[a-z0-9_]*$/
};

/*
计算文本长度
*/

(function($)
{
    var Listener = function(el, opt)
    {
        //默认值
        var _default = {
            max: 4000,
            objTotal: $(el).closest('div').next().find('.content'),
            objLeft: $(el).closest('div').next().find('.prompt'),
            duration: 200,
            objTotalStyle: 'green',
            flag: false
        };
        //初始化参数
        var options = $.extend({}, _default, opt);
        var start = function()
        {
            //统计函数
            var _length, _oldLen, _lastRn;
            _oldLen = _length = 0;
            this.time = setInterval(function()
            {
                _length = el.val().length;
                if (el == null || typeof el == "undefined")
                {
                    this.time = null;
                    return;
                }
                if (!options.flag)
                {
                    if (_length == _oldLen)     //防止计时器做无用的计算
                    {
                        return;
                    }
                }
                if (_length > options.max)
                {
                    //避免ie最后两个字符为"\r\n",导致崩溃
                    _lastRN = (el.val().substr(options.max - 1, 2) == "\r\n");
                    el.val(el.val().substr(0, (_lastRN ? options.max - 1 : options.max)));
                }
                _oldLen = _length = el.val().length;
                //显示已输入字符
                if (options.objTotal != null)
                {
                    options.objTotal.html(_length).addClass(options.objTotalStyle);
                };
                //显示剩余的输入字符
                if (options.objLeft != null)
                {
                    options.objLeft.html((options.max - _length) < 0 ? 0 : (options.max - _length)).addClass(options.objTotalStyle);
                }
            }, options.duration);
        };

        var stop = function()
        {
            this.time = null;
        };
        if (options.objLeft != null)
        {
            try
            {
                var defaultLength = options.max - $(el).val().length;
                options.objLeft.html(defaultLength).addClass(options.objTotalStyle);
            }
            catch (e) { }
        };
        el.bind('focus', start);
        el.bind('blur', stop);
    };

    $.fn.setListen = function(opt)
    {
        var l = new Listener(this, opt || {});
        this.data('listener', l);
    };
})(jQuery);

//给一组复选框或单选框设置和获取值的快捷方法
//设置时传入数组或以','分割的字符串，返回一个数组
$.fn.checkValues = function(vals)
{
    var valArr = null;
    if ($.isArray(vals))
    {
        valArr = new Array();
        for (var i in vals)
        {
            valArr.push(vals[i].toString());
        }
    } else if (typeof vals == 'string')
    {
        valArr = vals.split(',');
    } else if (typeof vals == 'number')
    {
        valArr = new Array();
        valArr.push(vals.toString());
    }

    if (valArr)
    {
        for (var i = 0; i < this.length; i++)
        {
            var el = $(this[i]);
            var isIn = $.inArray(el.val(), valArr) >= 0;
            el.attr('checked', isIn);
        }
    }
    var v = new Array();
    for (var i = 0; i < this.length; i++)
    {
        var el = $(this[i]);
        if (el.attr('checked')) v.push(el.val());
    }
    return v;
};


//给文本框加水印
$.fn.watermark = function(txt)
{
    var getVal = function(el)
    {
        if (el.length == 0) return '';
        if (el[0].type.toLowerCase() == 'a' || el[0].type.toLowerCase() == 'span')
        {
            return el.html();
        } else
        {
            return el.val();
        }
    };

    this.attr('watermark', txt);
    if (getVal(this) == '')
    {
        this.val(txt);
        //this.css({color:'#b1b1b1'});
        this.addClass('textGray');
    }
    this.focus(function()
    {
        var el = $(this);
        if (getVal(el) == el.attr('watermark'))
        {
            el.removeClass('textGray');
            //el.css({color:''})
            el.val('');
        }
    });
    this.blur(function()
    {
        refreshStatus();
    });
    var self = this;
    var refreshStatus = function()
    {
        var el = self; //$(this);
        var val = getVal(el);
        var watermark = el.attr('watermark');
        if (val == '' || val == watermark)
        {
            el.val(watermark);
            el.addClass('textGray');
        } else
        {
            el.removeClass('textGray');
        }
    }
    refreshStatus();
};

//用于在form提交前清空水印
$.fn.clearWatermark = function()
{
    var inputs = this.find(':input[watermark]');
    for (var i = inputs.length - 1; i >= 0; i--)
    {
        var el = $(inputs[i]);
        if (el.val() == el.attr('watermark'))
        {
            el.val('');
        }
    }
}

//绑定需要水印的文本框
$(document).ready(function(even) {
    $(':input[type=text][watermark]').each(function() { $(this).watermark($(this).attr('watermark')); });
    $(document).click(function(even) {
        if (!($(even.target).hasClass('verSelectBg') || $(even.target).hasClass('verSelectTxt') && $('html').find('span.verSelectCon:not(:hidden)').length > 0)) {
            $('html').find('span.verSelect').removeClass("verSelectCu");
        }
    });
});

//用于需要统一文本框加样式 add by jcl 12-11-29
$(document).ready(function(event) {
    inputHoverEvent();
    inputFocusEvent();
});

//文本框Hover事件
function inputHoverEvent() {
    //文本框,密码框
    var spanVerText = $('span.verText');
    spanVerText.find(':input[type=text][class:contains(inputText)],:input[type=password][class:contains(inputText)]').hover(function() {
        $(this).addClass('textHov');
    }, function() {
        $(this).removeClass('textHov');
    });
    //文本域
    var spanVerTextarea = $('span.verTextarea');
    spanVerTextarea.find(':input[type=textarea][class:contains(textarea)]').hover(function() {
        $(this).addClass('textHov');
    }, function() {
        $(this).removeClass('textHov');
    });
}
//文本框Focus事件
function inputFocusEvent() {
    //文本框,密码框
    var spanVerText = $('span.verText');
    spanVerText.find(':input[type=text][class:contains(inputText)],:input[type=password][class:contains(inputText)]').focus(function() {
        $(this).removeClass('textHov').addClass('textFocus');
    }).blur(function() {
        $(this).removeClass('textFocus');
    });
    var spanVerTextarea = $('span.verTextarea');
    spanVerTextarea.find(':input[type=textarea][class:contains(textarea)]').focus(function() {
        $(this).removeClass('textHov').addClass('textFocus');
    }).blur(function() {
        $(this).removeClass('textFocus');
    });
}

var _pager_loading = null;
//显示数据正在加载中的窗口
function loading()
{
    if (_pager_loading)
    {
        try
        {
            _pager_loading.close();
        } catch (e) { }
    }
    var html = '<div class="dataLoad"><b class="L"></b><b class="R"></b>' +
               '	<span class="dataLoadTxt">数据正在载入中,请稍候</span> </div>';

    var box = null;
    var left = 200;
    var top = 0;
    var menu = $('.nav');
    if (menu.count > 0)
    {
        var menuOffset = menu.offset();
        if ((menuOffset.top + menu.outerHeight()) > $(window).scrollTop())
        {
            top = menuOffset.top + menu.outerHeight() - $(window).scrollTop();
        } else
        {
            top = 0;
        }
    }
    //var content = $('.content');
    left = 205 - (1440 - $('body').width()) / 2;
    box = $.anchor(html, { position: 'anchorRight', left: left, top: top, showBackground: false, showBorder: false, icon: '' });
    _pager_loading = box;
}
//关闭数据正在加载中的窗口
function stopLoading()
{
    if (_pager_loading)
    {
        try
        {
            _pager_loading.close();
            _pager_loading = null;
        } catch (e) { }
    }
}

//滚动到数据列表的第一行
function scrollToFisrtRow()
{
    var wnd = $(window);
    var tableHeaderTop = 0;
    var table = $('.table');
    if (table.length == 1)
    {
        tableHeaderTop = table.offset().top;
        if (wnd.scrollTop() > tableHeaderTop)
        {
            wnd.scrollTop(tableHeaderTop);
        }
    }
}


function bindTrHover(over, out, tableName)
{
    var tab = tableName ? $(tableName) : $('.getlist');
    tab.find('tbody').find('tr:not(.thorough,.getlist_line)').unbind('mouseover').bind('mouseover', function() 
    {
        
        $(this).addClass('conhov');
        if ($.isFunction(over)) {
            over.apply(this);
        }
    });
    tab.find('tbody').find('tr:not(.thorough,.getlist_line)').unbind('mouseout').bind('mouseout', function()
    {
        $(this).removeClass('conhov');
        if ($.isFunction(out))
        {
            out.apply(this);
        }
    });
}
function unbindTrHover(tableName)
{
    var tab = tableName ? $(tableName) : $('.getlist');
    tab.find('tbody').find('tr:not(.thorough,.getlist_line)').unbind('mouseover');
    tab.find('tbody').find('tr:not(.thorough,.getlist_line)').unbind('mouseout');
}
//清除高亮显示，可以指定表格
function clearHighLight(table)
{
    if (typeof table == 'undefined')
    {
        table = $('div.table');
    } else if (typeof table == 'string')
    {
        table = $(table);
    }
    if (table.length > 0)
    {
        for (var i = table.length - 1; i >= 0; i--)
        {
            $(table[i]).find('li').removeClass('cuHigh');
        }
    }
}
//将指定id的行高亮显示
function highLight(ids, table)
{
    if (typeof ids == 'string')
    {
        if (ids == 'selected')
        {
            ids = new Array();
            $(':checkbox[checked]').each(function()
            {
                var chk = $(this);
                ids.push(chk.closest('tr').attr('id'));
            });
        } else
        {
            ids = ids.split(',');
        }
    }
    if (typeof table == 'undefined')
    {
        table = $('div.table');
    } else if (typeof table == 'string')
    {
        table = $(table);
    }
    for (var i in ids)
    {
        try
        {
            if (ids[i]) table.find('#' + ids[i]).addClass('cuHigh');
        } catch (e) { }
    }
}

function singleRefreshChecked(checkbox)
{
    var el = checkbox;
    var tr = el.closest('li');
//    var next = tr.next('.details');
    if (el.attr('checked'))
    {
        // if (!tr.hasClass('concu')) 
        tr.addClass('cu');
        //if (next.hasClass('details'))
//        next.addClass('concu');
        // tr.css('background',"red");
    } else
    {
        tr.removeClass('cu');
        //if (next.hasClass('details'))
//        next.removeClass('concu');
        //tr.css('background',"white");
    }
}


//刷新选中的行的选中状态，以更新背景颜色
function refreshChecked(checkBoxs, isChecked)
{

    var checks = checkBoxs;
    if (isChecked)
    {
        for (var j = checks.length - 1; j >= 0; j--)
        {
            var el = $(checkBoxs[j]);
            var tr = el.closest('li');

            tr.addClass('cu');

        }
    }
    else
    {
        for (var j = checks.length - 1; j >= 0; j--)
        {
            var el = $(checkBoxs[j]);
            var tr = el.closest('li');
            tr.removeClass('cu');

        }
    }
}

//摘要显示列表
function tableList(parms, buildListFunc) {
    var cloneWorkExp = $('<div class="thorougt_exp" id="divWorkExperience"><label id="lblWorkYear"></label><label id="lblStation" class="strong"></label>&nbsp;<label id="lblWorkInCompany"></label><label id="lblSalaryMonth"></label><br /><label id="lblDesc"></label></div>');
    var cloneSummary = $('<div class="thorougt_con"><dl><dt id="dtSchool"></dt><dd><label id="lblSchool"></label><label id="lblProfessional"></label><label id="lblDegree"></label></dd></dl><div class="clear"></div><dl><dt id="dtDesc"></dt><dd id="feature"></dd></dl><div class="clear"></div><dl><dt id="dtSalaryExp"></dt><dd id="ddSalaryExp"></dd></dl><div class="clear"></div><dl><dt id="dtWorkExp"></dt><dd id="work"></dd></dl><div class="clear"></div></div>');
    var cloneApplyReply = $('<div class="tableSubCon noOpen"><div class="tit">求职信详情：</div><div class="con"></div><div class="clear"></div></div><div class="tableSubCon noOpen"><div class="tit">企业回复：</div><div class="con"></div><div class="clear"></div></div>');
    var cloneInviteReply = $('<div class="tableSubCon noOpen"><div class="tit">邀请内容：</div><div class="con"></div><div class="clear"></div></div><div class="tableSubCon noOpen"><div class="tit">回复内容：</div><div class="con"></div><div class="clear"></div></div>');
    var cloneFairInviteReply = $('<div class="tableSubCon noOpen"><p id="subject"></p></div><div class="tableSubCon noOpen" id="swithContent"><div class="tit">邀请内容：</div><div class="con" id="fairInviteContent"></div><div class="clear"></div></div>');
    
    //默认值
    //listButton 列表显示按钮，summaryButton 摘要显示按钮，summarySelector 摘要选择器
    //tbody 显示列表的容器，cloneSummary 摘要DOM对象，data 显示的数据，isGroup 是否需要分组显示    
    var _defaultValue = { tableID: 'searchList', isListMode: true, listButton: '#btnList', summaryButton: '#btnAbstract', summarySelector: '.thorough', tbody: '#content', summaryBody: '.thorough', data: 'undefined', arrSort: [], isGroup: false, isSummary: true, isApplyReply: false, isInviteReply: false, isBatchInviteReply: false };
    var content = $.extend(_defaultValue, parms);
    var isListMode = content.isListMode;
    var tbody = $(content.tbody);
    var summaryBody = content.summaryBody;
    var colspan = $(summaryBody).find('td').attr('colspan');
    var _self = this; // Zy
    var currentSortPro = undefined; // 指定当前的排序属性
    var isSummary = content.isSummary; // 是否需要展示摘要信息
    var isApplyReply = content.isApplyReply;  //是否是个人求职申请列表页面
    var isInviteReply = content.isInviteReply;  //是否是企业邀请个人列表页面
    var isBatchInviteReply = content.isBatchInviteReply; //是否是企业招聘会邀请个人列表页面
    
    //摘要与列表切换显示
    var switchShowSummaryAndList = function()
    {
        /*
        if ($.browser.opera)
        {
        $(content.listButton).removeAttr('click');
        }
        var onclick = $(content.listButton).attr('click');
        if (typeof onclick != 'function')
        {
        }
        */
        $(content.listButton).click(function()
        {

            $(this).addClass('list_cu');
            $(content.summaryButton).removeClass('abstract_cu');
            $(content.summarySelector).hide();
            isListMode = true;
        });

        $(content.summaryButton).click(function()
        {
            $(this).addClass('abstract_cu');
            $(content.listButton).removeClass('list_cu');
            $(content.summarySelector).show();
            isListMode = false;
        });
    }


    // 2011-06-28 ZhangYu add  sortTable method


    //  转换函数
    var convert = function(sValue, sType)
    {
        switch (sType)
        {
            case "int":
                return parseInt(sValue);
            case "date":
                return new Date(Date.parse(sValue));
            default:
                return sValue.toString();
        }
    }

    // 比较函数
    var generateCompareTRs = function(property, type, arrSort, filter)
    {

        return function(x, y)
        {
            var xValue;
            var yValue;
            if (filter && typeof filter != 'undefined')
            {
                // 过滤数据
                xValue = convert(filter.exec(eval('x.' + property)), type);
                yValue = convert(filter.exec(eval('y.' + property)), type);
            }
            else
            {
                xValue = convert(eval('x.' + property), type);
                yValue = convert(eval('y.' + property), type);
            }
            if (arrSort && typeof arrSort != "undefined" && arrSort.length > 0)
            {
                // 按指定的数据排序进行排序
                var sortString = arrSort.toString();
                var xIndex = sortString.indexOf(xValue);
                var yIndex = sortString.indexOf(yValue);
                if (xIndex < yIndex)
                {
                    return -1;
                } else if (xIndex > yIndex)
                {
                    return 1;
                } else
                {
                    return 0;
                }
            }
            else
            {
                if (xValue < yValue)
                {
                    return -1;
                } else if (xValue > yValue)
                {
                    return 1;
                } else
                {
                    return 0;
                }
            }
        }
    }

    //  排序
    var sortTable = function(property, type, arrSort, filter)
    {
        var data = Array.apply(this, content.data);
        if (currentSortPro && currentSortPro == property)
        {
            data.reverse();
        }
        else
        {
            data.sort(generateCompareTRs(property, type, arrSort, filter));
        }
        currentSortPro = property;
        content.data = data;
    }


    // 提示排序操作

    var promptSort = function(params)
    {
        $('#divPromptSort').remove();
        var p = $('#' + content.tableID).position();
        var left = p.left + 5;
        var top = p.top - 50;
        //设置层的位置
        $('<div class="firsttips" id="divPromptSort"><div class="firsttips_c"><div class="firsttips_close"><a href="javascript:void(0)" id="btnHidePromptSort" title="我知道了"></a></div><div class="firsttips_arrow_bottom"></div><div class="firsttips_con">点击部分有箭头标识的类目对搜索出的简历进行排序，找到合适的人才将变得更加容易喔！</div></div></div>').appendTo('body');
        $('#divPromptSort').css('left', left).css('top', top).show().bgIframe();
        //设置隐藏层的事件
        $('#btnHidePromptSort').click(function()
        {
            $('#divPromptSort').hide();
        });
    }

    //添加数据到数据区
    var append = function(row, name)
    {
        if (typeof buildListFunc != 'function')
        {
            return;
        }
        if (isSummary == true)
        {
            var summary = summaryBody.clone();
            summary.find('td').append(cloneSummary.clone());
            var id = row.UID; //在后台生成一个统一的ID号调用方式为 row.UID
            var summaryData = eval('(' + row.summary + ')');
            summary.attr('id', 'summary' + id);
            if (typeof summaryData.school != "undefined" && summaryData.school != '')
            {
                $('#dtSchool', summary).html('毕业院校：');
                $('#lblSchool', summary).html(summaryData.school);
                $('#lblProfessional', summary).html(summaryData.professional);
                $('#lblDegree', summary).html(summaryData.degreeName);
            }
            else
            {
                $('#dtSchool', summary).parent('dl').remove();
            }
            if (summaryData.feature != undefined && summaryData.feature != '')
            {
                $('#dtDesc', summary).html('特点概述：');
                $('#feature', summary).html(summaryData.feature);
            }
            else
            {
                $('#dtDesc', summary).parent('dl').remove();
            }

            $('#dtSalaryExp', summary).html("期望月薪：");
            var temp = '<label>' + summaryData.summary_salary_exp + '</label>';
            if (summaryData.salary_year != undefined && summaryData.salary_year != '')
            {
                temp = temp + '<label>目前年薪：' + summaryData.salary_year + '</label>';
            }
            $('#ddSalaryExp', summary).html(temp);

            $('#dtWorkExp', summary).html('工作经验：');
            //处理工作经验
            var workExp;
            var work = eval(summaryData.work);
            if (work != undefined && work != null && work != '')
            {
                for (var j = 0; j < work.length; j++)
                {
                    workExp = cloneWorkExp.clone();
                    if (work[j].workCompany.caseLength() > 40)
                    {
                        work[j].workCompany = work[j].workCompany.caseSubStr(0, 40) + '...';
                    }
                    if (work[j].station.caseLength() > 30)
                    {
                        work[j].station = work[j].station.caseSubStr(0, 30) + '...';
                    }
                    if (work[j].desc.caseLength() > 300)
                    {
                        work[j].desc = work[j].desc.caseSubStr(0, 300) + '...';
                    }
                    var salaryMonth = '';
                    if (work[j].salary_month != undefined && work[j].salary_month != null)
                    {
                        salaryMonth = work[j].salary_month;
                    }
                    $('#lblWorkYear', workExp).html(work[j].time);
                    $('#lblWorkInCompany', workExp).html(work[j].workCompany);
                    $('#lblStation', workExp).html(work[j].station);
                    $('#lblSalaryMonth', workExp).html(work[j].salary_month);
                    $('#lblDesc', workExp).html(work[j].desc);
                    if (work.length - 1 == j)
                    {
                        workExp.css('border', '0');
                    }
                    $('#work', summary).append(workExp);
                }

                if (work.length == 0)
                {
                    $('#dtWorkExp', summary).parent('dl').remove();
                }
            }
            else
            {
                $('#dtWorkExp', summary).parent('dl').remove();
            }
        }

        var hasReply = true;
        if (isApplyReply == true)
        {
            var replyBody = summaryBody.clone();
            replyBody.append(cloneApplyReply.clone());
            if (row.letter == '' && row.reContent == '')
            {
                hasReply = false;
            }
            else
            {
                if (row.letter == '')
                {
                    replyBody.find('div.con:even').html('无求职信内容');
                }
                else
                {
                    replyBody.find('div.con:even').html(row.letter);
                }
                if (row.reContent == '')
                {
                    replyBody.find('div.con:odd').html('暂无回复内容');
                }
                else
                {
                    replyBody.find('div.con:odd').html(row.reContent);
                }
            }
        }
        if (isInviteReply == true)
        {
            var replyBody = summaryBody.clone();
            replyBody.append(cloneInviteReply.clone());
            if (row.content == '' && row.reContent == '')
            {
                hasReply = false;
            }
            else
            {
                if (row.content == '')
                {
                    replyBody.find('div.con:even').html('无邀请内容');
                }
                else
                {
                    replyBody.find('div.con:even').html(row.content);
                }
                if (row.reContent == '')
                {
                    replyBody.find('div.con:odd').html('您尚未进行回复');
                }
                else
                {
                    replyBody.find('div.con:odd').html(row.reContent);
                }
            }
            if (replyBody.find('div.con:even').find('dl').length < 1)
            {
                replyBody.find('div.con:even').append('<dl><dd class="link"><a href="javascript:void(0);" onclick="singleAccept(this);" class="btn3"><b class="L"></b><b class="R"></b>接受邀请</a><a href="javascript:void(0);" onclick="singleConsider(this);" class="btn3"><b class="L"></b><b class="R"></b>需要再考虑</a><a href="javascript:void(0);" onclick="singleRefuse(this);" class="btn3"><b class="L"></b><b class="R"></b>婉言谢绝</a></dd></dl>');
            }
            else
            {
                replyBody.find('div.con:even').find('dl').append('<dd class="link"><a href="javascript:void(0);" onclick="singleAccept(this);" class="btn3"><b class="L"></b><b class="R"></b>接受邀请</a><a href="javascript:void(0);" onclick="singleConsider(this);" class="btn3"><b class="L"></b><b class="R"></b>需要再考虑</a><a href="javascript:void(0);" onclick="singleRefuse(this);" class="btn3"><b class="L"></b><b class="R"></b>婉言谢绝</a></dd>');
            }
        }
        if (isBatchInviteReply == true)
        {
            var replyBody = summaryBody.clone();
            replyBody.append(cloneFairInviteReply.clone());
            if (row.content == '' && row.reContent == '')
            {
                hasReply = false;
            }
            else
            {

                replyBody.find('#subject').html(row.subject);

                if (row.reContent == '')
                {
                    replyBody.find('#fairInviteContent').html('您尚未进行回复');
                }
                else
                {
                    replyBody.find('#fairInviteContent').html(row.Content);
                }
            }
        }
        var tr;
        if (content.isGroup == true && name != undefined && name != null && name != '')
        {
            tr = $(buildListFunc(row, name)).attr('group', name);
            tbody.find('#' + name).append(tr);
        }
        else
        {
            tbody.append(buildListFunc(row));
        }
        if (isSummary == true)
        {
            tbody.append(summary);
            tbody.append('<tr id="trLine' + id + '" class="getlist_line"><td colspan="' + colspan + '"></td></tr>');
        }
        if (isApplyReply == true)
        {
            if (hasReply == true)
            {
                tbody.find('#div' + row.applyID).append(replyBody);
            }
            else
            {
                tbody.find('#div' + row.applyID).find('.switch').remove();
            }
        }
        if (isInviteReply == true)
        {
            if (hasReply == true)
            {
                tbody.find('#div' + row.id).append(replyBody);
            }
            else
            {
                tbody.find('#div' + row.id).find('.switch').remove();
            }
        }
        if (isBatchInviteReply == true)
        {
            if (hasReply == true)
            {
                tbody.find('#row' + row.id).append(replyBody);
            }
            else
            {
                tbody.find('#row' + row.id).find('.switch').remove();
            }
        }
    }

    //生成列表的方法
    this.build = function()
    {
        switchShowSummaryAndList();
        var rows = content.data;
        for (var i = 0, count = rows.length; i < count; i++)
        {
            if (content.isGroup == true)
            {
                var header = $('<div class="tableGroup" groupName=' + rows[i].name + '>' + rows[i].name + '<em>(' + rows[i].data.length + ')</em></div>');
                header = $('<div class="tableGroup" onclick="pitchOnGroup(this)" groupName=' + rows[i].name + '>' + rows[i].name + '<em>(' + rows[i].data.length + ')</em></div>');
                tbody.append(header);
                var ul = '<ul id=' + rows[i].name + '></ul>';
                tbody.append(ul);
                for (var j = 0, k = rows[i].data.length; j < k; j++)
                {
                    append(rows[i].data[j], rows[i].name);
                }
            }
            else
            {
                append(rows[i]);
            }
        }
        if (isListMode)
        {
            $(content.summarySelector).css('display', 'none');
            $(content.listButton).addClass('list_cu');
            $(content.summaryButton).removeClass('abstract_cu');
        }
        else
        {
            $(content.summarySelector).css('display', '');
            $(content.summaryButton).addClass('abstract_cu');
            $(content.listButton).removeClass('list_cu');
        };
        var trs = tbody.find('tr.rowcontent').has(':checkbox');
        for (i = 0, j = trs.length; i < j; i++)
        {
            var item = $(trs[i]);
            item.find(':checkbox').click(function()
            {
                if ($(this).attr('checked'))
                {
                    var left = 0;
                    if (isIE)
                    {
                        left = $(this).offset().left + 17;
                    }
                    else
                    {
                        left = $(this).offset().left + 15;
                    }

                    var top = $(this).offset().top + 2;
                    $(this).parent().find('a').css({ 'display': 'inline', 'position': 'absolute', 'left': left, 'top': top });
                }
                else
                {
                    $(this).parent().find('a').css({ 'display': 'none' });
                }
            }).parent().find('a').attr('title', '查看所选');
        }
    }
    
    //提供一个删除后的刷新方法  刷新分组的记录数，如果删除了分组中的所有数据，那么删除分组头部
    this.refreshList = function()
    {
        var trGroups = tbody.find('div[groupName]');
        for (var i = 0, j = trGroups.length; i < j; i++)
        {
            var item = $(trGroups[i]);
            var groupName = item.attr('groupName');
            var count = tbody.find('li[group=' + groupName + ']').length;
            if (count > 0)
            {
                item.html(groupName + '<em>(' + count + ')</em>');
            }
            else
            {
                item.remove();
                tbody.find('#' + groupName).remove();
            }
        }
    }


    // 表头排序事件初始化
    this.init = function(arrSort)
    {
        if (!arrSort || typeof arrSort == "undefined" || arrSort.length <= 0) return;
        //promptSort();
        $('#' + content.tableID).find('th').find('b').removeClass('uplst downlst').removeAttr('clickNum').unbind();
        $.each(arrSort, function(i, item)
        {
            /*
            $('#searchList').find("#"+item.name).bind('click',function()
            {
            tbody.empty();
            sortTable(item.property,item.type,item.sort,item.filter);
            _self.build();
            $.listToggleSelected({tbody:tbody});
            })
            */
            /*
            $('#'+content.tableID).find("#"+item.name).find('b').toggle(function(){
            $('#'+content.tableID).find('thead b').removeClass('uplst downlst');
            $(this).removeClass('uplst').addClass('downlst');
            tbody.empty();
            sortTable(item.property,item.type,item.sort,item.filter);
            _self.build();
            $.listToggleSelected({tbody:tbody});
                      
            },function(){
            $('#'+content.tableID).find('thead b').removeClass('uplst downlst');
            $(this).removeClass('downlst').addClass('uplst');
            tbody.empty();
            sortTable(item.property,item.type,item.sort,item.filter);
            _self.build();
            $.listToggleSelected({tbody:tbody});   
            });
            */

            $('#' + content.tableID).find("#" + item.name).find('b').click(function()
            {
                $(this).closest('th').siblings().find('b').removeClass('uplst downlst').removeAttr('clickNum');
                if (typeof $(this).attr('clickNum') == "undefined" || $(this).attr('clickNum') == '0')
                {
                    $(this).removeClass('uplst').addClass('downlst');
                    $(this).attr('clickNum', '1')
                }
                else
                {
                    $(this).removeClass('downlst').addClass('uplst');
                    $(this).attr('clickNum', '0')
                }
                var height = $(window).scrollTop();
                tbody.empty();
                sortTable(item.property, item.type, item.sort, item.filter);
                _self.build();
                $(window).scrollTop(height);
                $.listToggleSelected({ tbody: tbody });
                return false;
            });

        })
    }
    _self.init(content.arrSort);
}

//选中当前分组中所有复选框
function pitchOnGroup(obj) {
    var _self = $(obj);
    var checked;
    var isChecked = true;
    var checkedCount = 0, uncheckedCount = 0;
    var checkBoxs = _self.next().find('input:not(:disabled)[type=checkbox]');
    var checkBoxsAll = _self.parent().find('input:not(:disabled)[type=checkbox]');
    for (var i = 0; i < checkBoxs.length; i = i + 1) {
        if (!($(checkBoxs[i]).parents('li').hasClass('cu'))) {
            isChecked = false;
        }
    }
    if (checkBoxs.parents('li').hasClass('cu') && isChecked) {
        checkBoxs.attr('checked', false);
        checked = false;
    } else {
        checkBoxs.attr('checked', true);
        checked = true;
    }
    refreshChecked(checkBoxs, checked);
    for (var j = 0; j < checkBoxsAll.length; j = j + 1) {
        if (!($(checkBoxsAll[j]).parents('li').hasClass('cu'))) {
            uncheckedCount++;
        } else {
            checkedCount++;
        }
    }
    var allCheck = checkedCount > 0 && uncheckedCount == 0;
    _self.parent().siblings('div').find(":input[type=checkbox]").attr('checked', allCheck);
}

//过滤字符串中的html文本
$.extend(
{
    filterHTML: function(str)
    {
        if (str == 'undefined' || str == null || str == '' || str.constructor != String)
        {
            return '';
        }
        return str.replace(/<.*?>/g, function(match) { return match.replace('<', '').replace('>', ''); });
    }
});


//设置按钮状态为正在运行状态
$.fn.running = function(msg, opt)
{
    this.enable(false);
    if ($.isPlainObject(msg))
    {
        opt = msg;
        msg = null;
    }
    msg = msg || '正在处理，请稍候';
    opt = $.extend({}, opt);
    opt.type = 'running';
    opt.position = 'auto';
    opt.dependElement = this;
    opt.contentType = 'html';
    opt.content = '<div class="clickLoading"><b class="L"></b><b class="R"></b><div class="clickLoadingTxt">' + msg + '</div></div>';
    //opt.animate = 'fade';
    opt.showHeader = false;
    opt.showBorder = false;
    opt.showBackground = false;
    opt.draggable = false;
    opt.showButton = false;
    opt.id = new Date().getTime();
    var box = $.dialog(opt);
    box.show();
    this.data('running', box);
    return box;
}

//恢复正在运行状态的按钮为正常状态
$.fn.stopRunning = function()
{
    var running = this.data('running');
    try
    {
        running.close();
    } catch (e)
    { }
    finally
    {
        this.enable(true);
    }
}
// 是否是ie浏览器

var isIE = $.browser.msie;

$.extend(
{
    listToggleSelected: function(parms)
    {
        var _default = { tbody: '#content', esys: '.esys' }
        var names = $.extend(_default, parms);
        var esysLeft = isIE ? 17 : 15;
        var tbody = $(names.tbody);
        var rows = tbody.find('li');
        
        for (var i = rows.length - 1; i >= 0; i--)
        {
            var item = $(rows[i]);
            var trDetail = item.next('tr');
            var func = (function(item, trDetail)
            {
                return function()
                {
                    item.addClass('hov');
                    //                    //item.addClass('conhov');
                    //                    //trDetail.addClass('conhov');
                    //                    item.css('backgroundColor', '#ffffe1');
                    //                    trDetail.css('backgroundColor', '#ffffe1');
                    //                    var selected = item.find('input[type=checkbox]:checked');
                    //                    if (selected.length > 0)
                    //                    {
                    //                        var point = selected.offset();
                    //                        var left = point.left + esysLeft;
                    //                        var top = point.top + 2;
                    //                        item.find(names.esys).css({ 'display': 'inline', 'position': 'absolute', 'left': left, 'top': top });
                    //                    }
                    //                    // event.stopPropagation();                    
                }
            })(item, trDetail);

            var funcleave = (function(item, trDetail)
            {
                return function()
                {
                    item.removeClass('hov');
                    //                    $(item).css('backgroundColor', '').find(names.esys).css('display', 'none');
                    //                    $(trDetail).css('backgroundColor', '');
                    //                    // event.stopPropagation();
                }
            })(item, trDetail);
            item.mouseover(
            func
            /*function(event)
            {
            
            $(this).addClass('conhov');//conhov
            
            var detail=$(this).next('tr');
            
            detail.addClass('conhov');
            var selected = $(this).find('input[type=checkbox]:checked');
            if (selected.length > 0)
            {
            var left = 0;
            var point=selected.offset();
            left = point.left + esysLeft;
            var top = point.top + 2;
            $(this).find(names.esys).css({ 'display': 'inline', 'position': 'absolute', 'left': left, 'top': top });           

            } 
            }*/).mouseout(
            funcleave
            /*
            function(event)
            {
            $(this).removeClass('conhov').find(names.esys).css('display', 'none');
            $(this).next('tr').removeClass('conhov');
            }*/);


            if (trDetail.length > 0)
            {
                trDetail.mouseenter(
                func
                /*function()
                {
                $(this).addClass('conhov');
                var content=$(this).prev('tr').addClass('conhov');
                var selected = content.find('input:checked');
                if (selected.length > 0)
                {
                var left = 0;
                var point=selected.offset();
                left = point.left+esysLeft;
                var top = point.top + 2;
                content.find(names.esys).css({ 'display': 'inline', 'position': 'absolute', 'left': left, 'top': top });
                }
                }*/).mouseleave(
                funcleave
                /*function(event)
                {
                $(this).removeClass('conhov');
                var content=$(this).prev().removeClass('conhov').find(names.esys).css('display', 'none');
                }*/);

            }

        }
    }
});

//查看简历
//self 是当前事件触发的对象，operate 是显示简历的类型，比如查看邀请的简历为 invite
function showSelectedResume(self, parms)
{
    var _default = { tbody: '#content', operate: 'invite' };
    var show = $.extend(_default, parms);
    $(self).attr('href', 'javascript:void(0)').removeAttr('target');
    var selected = $(show.tbody).find('input:checked');
    if (selected.length > 0)
    {
        var IDs = '';
        if (show.operate == 'recycle')
        {
            var checkedRec = $('#tdyContent').find('input:checked');
            $.each(checkedRec, function(i, n)
            {
                if (i == checkedRec.length - 1)
                {
                    IDs += 'recID=' + $(n).val().split('|')[0];
                }
                else
                {
                    IDs += 'recID=' + $(n).val().split('|')[0] + '&';
                }
            });
        }
        else
        {
            IDs = selected.fieldSerialize();
        }
        $(self).attr('href', '/Company/Resuming/ResumeBatchShow.aspx?operate=' + show.operate + '&' + IDs).attr('target', '_blank');
    }
    else
    {
        $.anchorMsg('请选择需要查看的简历', { icon: 'warning' }); return;
    }
}

//照片显示插件
function showPhoto(node, photo, hdPhoto)
{
    var el = $(node);

    var doc = $(document);
    var wnd = $(window);
    var offset = el.offset();
    var top = 0;
    var left = 0;
    var fix = 2;
    var isHd = false;
    var toTop = function(el, con)
    {
        top = offset.top - con.height() - fix - 3;
        left = offset.left + el.width() + fix;
        if (left + con.outerWidth() > wnd.scrollLeft() + wnd.width())
        {
            left -= left + con.outerWidth() - wnd.scrollLeft() - wnd.width();
        }
        return top >= wnd.scrollTop();
    }

    var toBottom = function(el, con)
    {
        top = offset.top + el.height() + fix;
        left = offset.left - con.outerWidth() - fix;
        if (left < wnd.scrollLeft())
        {
            left += wnd.scrollLeft() - left;
        }
        return top + con.outerHeight() <= wnd.scrollTop() + wnd.height();
    }
    //定位
    var pos = function(el, con)
    {
        //如果是高清照直接定位在左边
        if (isHd)
        {
            top = offset.top;
            left = offset.left - con.outerWidth();
        } else
        {
            if (!toTop(el, con)) toBottom(el, con);
        }
        con.css({ top: top, left: left, 'z-index': getZIndex() });
        con.show();
    }

    if (hdPhoto)
    {
        var hdImg = $('img[src="' + hdPhoto + '"]');
        if (hdImg.length > 0)
        {
            isHd = true;
            pos(el, hdImg.closest('div'));
            return;
        }
    } else
    {
        var norImg = $('img[src="' + photo + '"]');
        if (norImg.length > 0)
        {
            pos(el, norImg.closest('div'));
            return;
        }
    }
    var src = null;
    var width = 0;
    var height = 0;
    if (hdPhoto)
    {
        isHd = true;
        src = hdPhoto;
        width = 240;
        height = 300;
    } else if (photo)
    {
        src = photo;
        width = 120;
        height = 150;
    }
    var img = $('<div class="" style="position:absolute;top:-1000px;left:-1000px;"><img src="' + src + '"/></div>');
    var div = $('<div style="position:absolute;overflow:hidden;" class="floatlayer_pic"></div>');
    div.append(img);
    div.css({ width: width + 4, height: height + 4 });
    div.appendTo('body');
    var failNotify = setTimeout(function()
    {
        div.addClass(isHd ? 'floatlayer_error2' : 'floatlayer_error').html('照片加载失败');
    }, 10000);
    img.find('img').load(function()
    {
        clearTimeout(failNotify);
        $(this).closest('div').css({ left: 0, top: 0 });
        $(this).closest('div').parent().bgIframe();
    });
    pos(el, div);
    el.mouseout(function()
    {
        div.hide();
    });
}

//新版照片显示插件
function showDragonVerPhoto(node, photo, hdPhoto) {
    var el = $(node);

    var doc = $(document);
    var wnd = $(window);
    var offset = el.offset();
    var top = 0;
    var left = 0;
    var fix = 2;
    var isHd = false;
    var toTop = function(el, con) {
        top = offset.top - con.height() - fix - 3;
        left = offset.left + el.width() + fix;
        if (left + con.outerWidth() > wnd.scrollLeft() + wnd.width()) {
            left -= left + con.outerWidth() - wnd.scrollLeft() - wnd.width();
        }
        return top >= wnd.scrollTop();
    }

    var toBottom = function(el, con) {
        top = offset.top + el.height() + fix;
        left = offset.left - con.outerWidth() - fix;
        if (left < wnd.scrollLeft()) {
            left += wnd.scrollLeft() - left;
        }
        return top + con.outerHeight() <= wnd.scrollTop() + wnd.height();
    }
    //定位
    var pos = function(el, con) {
        //如果是高清照直接定位在左边
        if (isHd) {
            top = offset.top;
            left = offset.left - con.outerWidth();
        } else {
            if (!toTop(el, con)) toBottom(el, con);
        }
        con.css({ top: top, left: left, 'z-index': getZIndex() });
        con.show();
        el.mouseout(function() {
            con.hide();
        });
    }

    if (hdPhoto) {
        var hdImg = $('img[src="' + hdPhoto + '"]');
        if (hdImg.length > 0) {
            isHd = true;
            pos(el, hdImg.closest('div.floatlayer_pic'));            
            return;
        }
    } else {
        var norImg = $('img[src="' + photo + '"]');
        if (norImg.length > 0) {
            pos(el, norImg.closest('div.floatlayer_pic'));
            return;
        }
    }
    var src = null;
    var width = 0;
    var height = 0;
    if (hdPhoto) {
        isHd = true;
        src = hdPhoto;
        width = 240;
        height = 300;
    } else if (photo) {
        src = photo;
        width = 120;
        height = 150;
    }
    var img = $('<div class="" style="position:absolute;top:-1000px;left:-1000px;"><img src="' + src + '"/></div>');
    var div = $('<div style="position:absolute;overflow:hidden;" class="floatlayer_pic"></div>');
    div.append(img);
    div.css({ width: width + 4, height: height + 4 });
    div.appendTo('body');
    var failNotify = setTimeout(function() {
        div.addClass(isHd ? 'floatlayer_error2' : 'floatlayer_error').html('照片加载失败');
    }, 10000);
    img.find('img').load(function() {
        clearTimeout(failNotify);
        $(this).closest('div').css({ left: 0, top: 0 });
        $(this).closest('div').parent().bgIframe();
    });
    pos(el, div);
    el.mouseout(function() {
        div.hide();
    });
}

//检查浏览器是否支持fixed样式
$.support.fixed = !document.all || document.all && document.compatMode == "CSS1Compat" && window.XMLHttpRequest;

//重写window.close函数以便火狐也能关闭
var _windowClose = window.close;
window.close = function()
{
    window.opener = null;
    window.open("", '_self', "");
    _windowClose();
    try
    {
        $.anchorMsg('如果窗口没有关闭，请手动关闭窗口', { icon: 'warning' });
    } catch (e) { }
}

// 写Cookie
function writeCookie(name, value)
{
    var expire = new Date();
    expire.setFullYear(expire.getFullYear() + 20);
    expire = '; expires=' + expire.toGMTString();
    document.cookie = name + '=' + escape(value) + expire;
}

// 读取Cookie
function readCookie(name)
{
    var cookieValue = '';
    var search = name + '=';
    if (document.cookie.length > 0)
    {
        var offset = document.cookie.indexOf(search)
        if (offset != -1)
        {
            offset += search.length;
            var end = document.cookie.indexOf(';', offset);
            if (end == -1) end = document.cookie.length;
            cookieValue = unescape(document.cookie.substring(offset, end));
        }
    }
    return cookieValue;
}

//定位强调摘要显示
function stressAbstract(parms)
{
    $('#divStressAbstract').remove();
    var defaultParms = { name: 'btnAbstract' };
    var btn = $.extend(defaultParms, parms);
    var display = readCookie("displayStressAbstract");
    if (display == 'false')
    {
        return;
    }
    var p = $('#' + btn.name).position();
    var left = p.left + 5;
    var top = p.top - 50;
    //设置层的位置
    $('<div class="firsttips" id="divStressAbstract"><div class="firsttips_c"><div class="firsttips_close"><a href="javascript:void(0)" id="btnHideStressAbstract"></a></div><div class="firsttips_arrow_bottom"></div><div class="firsttips_con">摘要模式更好用哦，试试看？</div></div></div>').appendTo('body');
    $('#divStressAbstract').css('left', left).css('top', top).show().bgIframe();
    //设置隐藏层的事件
    $('#btnHideStressAbstract').click(function()
    {
        writeCookie('displayStressAbstract', 'false');
        $('#divStressAbstract').hide();
    });
}

//强调菜单位置
function stressMenu()
{
    $('#divStressMenu').remove();
    var display = readCookie("displayStressMenu");
    if (display == 'false')
    {
        return;
    }
    var p = $('.nav_three').find('span').position();
    var left = 605; //p.left;
    var top = p.top - 37;
    //设置层的位置
    $('<div class="firsttips" id="divStressMenu"><div class="firsttips_c"><div class="firsttips_close"><a href="javascript:void(0)" id="btnHideStressMenu"></a></div><div class="firsttips_arrow_top"></div><div class="firsttips_con"><div class="firsttips_txt">操作菜单跑到这里来了，试试看</div></div></div></div>').appendTo('.content');
    $('#divStressMenu').css('left', left).css('top', top).show();
    //设置隐藏层的事件
    $('#btnHideStressMenu').click(function()
    {
        writeCookie('displayStressMenu', 'false');
        $('#divStressMenu').hide();
    });
}

//职位福利
var __otherReward = [{ "id": "01", "name": "养老保险" }, { "id": "02", "name": "医疗保险" }, { "id": "03", "name": "失业保险" }, { "id": "04", "name": "工伤保险" }, { "id": "05", "name": "生育保险" }, { "id": "06", "name": "住房公积金" }, { "id": "07", "name": "双休" }, { "id": "08", "name": "节日礼金" }, { "id": "09", "name": "生日礼金" }, { "id": "10", "name": "婚丧礼金" }, { "id": "11", "name": "培训机会" }, { "id": "12", "name": "带薪年假" }, { "id": "13", "name": "年终奖金" }, { "id": "14", "name": "全勤奖" }, { "id": "15", "name": "团队娱乐活动" }, { "id": "16", "name": "通信费" }, { "id": "17", "name": "交通费" }, { "id": "18", "name": "防暑降温费" }, { "id": "19", "name": "包吃住" }, { "id": "20", "name": "工作餐" }, { "id": "21", "name": "健康体检" }, { "id": "22", "name": "年底双薪" }, { "id": "23", "name": "班车接送" }, { "id": "24", "name": "住房补贴" }, { "id": "25", "name": "公费旅游"}];

//获取职位福利
function getOtherReward(id)
{
    for (var i in __otherReward)
    {
        var p = __otherReward[i];
        if (p.id == id) return p;
    }
    return null;
}

function getOtherRewardName(id)
{
    var reward = getOtherReward(id);
    if (reward)
    {
        return reward.name;
    } else
    {
        return '';
    }
}

//职位福利选择框
(function OtherRewardSelect($)
{
    var id = 0;
    var getTempID = function()
    {
        id++;
        return '_otherRewardTemp' + id;
    }
    var _default = {
        multi: true, //多选模式
        selectTo: null,
        onChanged: null, //当选中的内容有变化时发生，返回区域编号的列表
        getValues: null, //获取值的回调
        max: null, //最大选中个数
        inputName: 'otherReward', //单选或复选表单的name属性
        values: null
    };

    var containerHtml = '<div class="windowpop choice choice_jobs">' +
                       '<div class="choice_tit"><h3>职位福利选择</h3><div class="choice_close"><a href="javascript:void(0)" id="_btnClose"></a></div></div>' +
	                   ' <div class="choice_txt">' +
	                   '    <h4 id="_limit"></h4>' +
                       '     <div class="choice_btn">' +
                       '         <a href="javascript:void(0)" class="btn1" id="_btnOtherRewardOk"><span>确定</span></a>' +
        	           '         <a href="javascript:void(0)" id="_btnOtherRewardClear"><span>清空</span></a>' +
                       '     </div>' +
                       '     <div class="clear"></div>' +
                       ' </div>' +
	                   ' <div class="choice_lst">' +
    	               '     <ul id="_list">' +
                       '     </ul>' +
                       '     <div class="clear"></div>' +
                       ' </div>' +
    	               '     <h4 class="tit">您选择的职位福利是：</h4>' +
                       '     <div class="choice_selected">' +
                       '         <ul id="_selected">' +
                       '         </ul>' +
                       '         <div class="clear"></div>' +
                       '     </div>' +
                       '<div id="_tempHidden" style="display:none;"></div>' +
                       '</div>';
    var subListHtml = '<div class="choiceLstLower" style="display:none;">' +
        	        '    <ul id="_sublist">' +
                    '    </ul>' +
                    '    <div class="clear"></div>' +
                    '</div>';
    var OtherRewardClass = function(opt, el)
    {
        this.options = $.extend({}, _default, opt);
        this.container = null;
        this.selected = null;
        this.mask = null; //遮罩层
        this.selectTo = this.options.selectTo;
        this.hidden = $('<em>');
        this.tempHidden = null;
        el.after(this.hidden);
        this.list = null;
        this.topJob = null;
        var self = this;
        this.createWindow = function(properties)
        {
            this.container = $(containerHtml);
            if (typeof this.selectTo == 'string')
            {
                this.selectTo = $(this.selectTo);
            }
            //取消自动添加到选中功能
            this.selectTo = null;

            this.tempHidden = this.container.find('#_tempHidden');
            this.selected = this.container.find('#_selected')
            this.list = this.container.find('#_list');

            if (this.options.max > 0 && this.options.multi)
            {
                this.container.find('#_limit').html('您最多可以选择' + self.options.max + '项');
            }
            //关闭
            this.container.find('#_btnClose').click(function()
            {
                self.hide();
                return false;
            });
            //确定
            this.container.find('#_btnOtherRewardOk').click(function()
            {
                self.hidden.html(self.tempHidden.html());
                self.onChanged();
                self.hide();
                return false;
            });
            this.container.find('#_btnOtherRewardClear').click(function()
            {
                if (self.selectTo) self.selectTo.empty();
                self.tempHidden.empty();
                self.syncToList();
                self.onChanged();
                return false;
            });

            for (var i in properties)
            {
                var id = getTempID();
                var a = properties[i];
                var v = createListItem(a);
                this.list.append(v);
            }
            this.syncToList();
        };
        this.bodyKeydown = function(event)
        {
            var e = $.event.fix(event);
            if (e.keyCode == 27)
            {
                self.close();
            } else if (e.keyCode == 13)
            {
                self.container.find('#_btnOtherRewardOk').click();
            }
        }
        var createListItem = function(a)
        {
            var id = getTempID();
            var v = $('<li><label for="_otherReward' + id + '"><input type="' + getInpuType() + '" id="_otherReward' + id + '" name="_list' + self.options.inputName + '" value="' + a.id + '" />' + a.name + '</label></li>');
            v.find(':input').click(function()
            {
                var values = new Array();
                self.tempHidden.find(':input[name=' + self.options.inputName + ']').each(function()
                {
                    values.push($(this).val());
                });
                if (self.options.multi && $(this).attr('checked') && values && self.options.max && self.options.max > 0 && values.length >= self.options.max)
                {
                    $.anchor('您最多只能选择' + self.options.max + '项。', { icon: 'warning', timeout: 1 });
                    return false;
                }
                self.syncToSelected();
            });
            return v;
        }
        var createSelectItem = function(a)
        {
            var id = getTempID();
            var v = $('<li><label for="__otherRewardS' + id + '"><input type="' + getInpuType() + '" id="__otherRewardS' + id + '" value="' + a.id + '" checked="checked" />' + a.name + '</label></li>');
            v.click(function()
            {
                self.removeFromSelected($(this).find(':input').val());
                self.syncToList();
                self.onChanged();
                self.container.find('#_btnOtherRewardOk').focus();
            });
            return v;
        }

        var getInpuType = function()
        {
            return self.options.multi ? 'checkbox' : 'radio';
        }

        //将选中的职位福利内容同步到列表中
        this.syncToList = function()
        {
            self.list.find(':input[type=' + getInpuType() + ']').removeAttr('checked');
            self.selected.empty();
            self.tempHidden.find(':input[name=' + self.options.inputName + ']').each(function()
            {
                var el = $(this);
                var val = el.val();
                var a = getOtherReward(val);
                if (a)
                {
                    var v = createSelectItem(a);
                    self.selected.append(v);
                }
                self.list.find(':input[value=' + val + ']').attr('checked', 'checked');
            });
            self.refreshCheckedStyle();
        }
        //装饰列表中的内容同步到选中职位福利
        this.syncToSelected = function()
        {
            if (!self.options.multi)
            {
                self.tempHidden.empty();
                if (self.selectTo) self.selectTo.empty();
                self.selected.empty();
            }
            var arr = this.list.find(':input[name=_list' + self.options.inputName + ']');
            arr.each(function()
            {
                var el = $(this);
                var val = el.val();
                var checked = el.attr('checked');
                var selHid = self.tempHidden.find(':input[value=' + val + ']');
                if (checked && selHid.length == 0)
                {
                    var a = getOtherReward(val);
                    if (a)
                    {
                        self.addToSelected(a);
                    }
                } else if (!checked && selHid.length > 0)
                {
                    self.removeFromSelected(val);
                }
            });
            self.refreshCheckedStyle();
        };

        this.addToSelected = function(a)
        {
            var v = createSelectItem(a);
            self.selected.append(v);
            if (self.selectTo)
            {
                var v = createSelectItem(a);
                self.selectTo.append(v.find('label'));
            }
            self.tempHidden.append($('<input type="hidden" name="' + self.options.inputName + '" value="' + a.id + '">'));
        }

        this.removeFromSelected = function(id)
        {
            self.tempHidden.find(':input[value=' + id + ']').remove();
            var chk = self.selected.find(':input[value=' + id + ']');
            if (chk.length > 0) chk.closest('li').remove();
            if (self.selectTo)
            {
                chk = self.selectTo.find(':input[value=' + id + ']');
                if (chk.length > 0) chk.closest('label').remove();
            }
        }

        this.onChanged = function()
        {
            if (typeof this.options.onChanged == 'function')
            {
                try
                {
                    this.options.onChanged(this.values());
                } catch (e)
                {
                    alert(e.message);
                }
            }
        }
        //检查选中的项，给它加上样式
        this.refreshCheckedStyle = function()
        {
            self.list.find(':checkbox').each(function()
            {

                var el = $(this);
                if (el.attr('checked') && !el.attr('disabled'))
                {
                    el.closest('li').addClass('cu');
                } else
                {
                    el.closest('li').removeClass('cu');
                }
            });
        }

        //返回职位福利编号的数组
        this.values = function(vals)
        {
            if (typeof vals == 'undefined')
            {
                var vals = new Array();
                this.hidden.find(':input[name=' + this.options.inputName + ']').each(function()
                {
                    vals.push($(this).val());
                });
                return vals;
            } else
            {
                if (typeof vals == 'string')
                {
                    var v = vals;
                    vals = new Array();
                    vals.push(v);
                }
                this.hidden.empty();
                if (this.selectTo) this.selectTo.empty();
                for (var i in vals)
                {
                    var a = getOtherReward(vals[i]);
                    if (a)
                    {
                        self.hidden.append($('<input type="hidden" name="' + self.options.inputName + '" value="' + a.id + '">'));
                    }
                }
                if (self.container.is(':visible')) self.syncToList();
                this.onChanged();
                return this.values();
            }
        }
        //添加选中的值
        this.addValue = function(val)
        {
            var values = this.values();
            var exists = false;
            for (var i in values)
            {
                if (val == values[i])
                {
                    exists = true;
                    break;
                }
            }
            if (!exists)
            {
                values.push(val);
                this.values(values);
            }
            return this.values();
        }
        //移除已选中的值
        this.removeValue = function(val)
        {
            var values = this.values();
            var newValues = new Array();

            for (var i in values)
            {
                var v = values[i];
                if (v != val)
                {
                    newValues.push(v);
                }
            }
            this.values(newValues);
            return this.values();
        }
        this.show = function()
        {
            this.mask.css({ 'z-index': getZIndex() });
            this.container.css({ 'z-index': getZIndex() });
            self.anchoToCenter();
            this.mask.animate({ opacity: 0.5 }, 500).show();
            this.container.show();
            self.container.find('#_btnOtherRewardOk').focus();
            self.tempHidden.html(self.hidden.html());
            self.syncToList();
            self.refreshCheckedStyle();
            $('body').keydown(self.bodyKeydown);
        };

        this.close = this.hide = function()
        {
            var self = this.mask;
            this.mask.animate({ opacity: 0 }, { complete: function() { self.hide(); } });
            this.container.hide();
            $('body').unbind('keydown', self.bodyKeydown);
        };

        this.toggle = function()
        {
            if (this.container.is(':visible'))
            {
                self.hide();
            } else
            {
                self.show();
            }
        };

        this.anchoToCenter = function()
        {
            var doc = $(document);
            var wnd = $(window);
            var left = (wnd.width() - self.container.width()) / 2 + wnd.scrollLeft();
            var top = (wnd.height() - self.container.height()) / 2 + wnd.scrollTop();
            self.container.css({ left: left, top: top });
        };

        this.createWindow(__otherReward);
        var isIE6 = $.browser.msie && ($.browser.version == "6.0");
        if (isIE6)
        {
            this.mask = $('<div class="resumemask"></div>')
				.appendTo('body').hide().css(
				{
				    width: $(document).width(),
				    height: $(document).height(),
				    position: 'absolute'
				}).bgiframe();
            $(window).resize(function()
            {
                var docHeight = $(document).height() - 4;
                var docWidth = $(document).width() - 4;
                self.mask.css('height', docHeight);
                self.mask.css('width', docWidth);
            });
        }
        else
        {
            this.mask = $('<div class="resumemask"></div>')
				.appendTo('body').hide().bgiframe();
        }
        this.container.css({ position: 'absolute', left: -1000, top: -1000 }).appendTo('body').hide();
        el.click(function()
        {
            self.toggle();
        });
    }

    $.fn.bindOtherReward = function(opt)
    {
        var otherReward = new OtherRewardClass(opt, this);
        this.data('otherReward', otherReward);
        return this;
    };

    $.fn.otherRewardValues = function(val)
    {
        var otherReward = this.data('otherReward');
        return otherReward.values(val);
    }
    $.fn.addOtherRewardValue = function(val)
    {
        var otherReward = this.data('otherReward');
        return otherReward.addValue(val);
    }
    $.fn.removeOtherRewardValue = function(val)
    {
        var otherReward = this.data('otherReward');
        return otherReward.removeValue(val);
    }
})(jQuery);






/**
* dialog.js
* @category   javascript
* @package    jquery
* @author     dongzh
* @version    
*/

/**
* dialog.js
* @category   javascript
* @package    jquery
* @author     dongzh
* @version    
*/
(function($)
{
    var contextData = '_dialog';
    var cachedata = {};
    var arrweebox = new Array();
    var dialogID = 0;
    var getID = function() { return dialogID++; }
    var getElement = function(obj)
    {
        if ($.isPlainObject(obj)) return obj;
        if (typeof (obj) == 'string') return $(obj);
        return obj;
    }
    var errorHtml =
    '            	<div class="dialogError">' +
    '            		非常抱歉，数据加载失败' +
    '                </div>' +
    '               <div class="dialogPopBtn"><a class="btn2" onclick="$(this).closeDialog();" href="javascript:void(0)"><b class="L"></b><b class="R"></b>关&nbsp;闭</a></div>';

    var tooltipError = '<div class="dialogError">非常抱歉，数据加载失败</div>';

    var weebox = function(opt)
    {
        //var self = this;
        this.id = '';
        this.dh = null;
        this.mh = null;
        this.dc = null;
        this.dt = null;
        this.header = null; //窗口头部，包括关闭按钮
        this.dw = null; //窗口内部装内容的部分，设置宽度时就设置这个
        this.db = null;
        this._dragging = false;
        this.cachedContent = null;
        this.options = null;
        this.contentInited = false;
        this._defaults = {
            src: null, //当弹出confirm对话框时引用的原Jquery对象，在事件函数的时候会以参数传回去
            cache: false,
            type: 'dialog', //类型 message confirm dialog model hover anchor menu等
            title: '',
            width: 0,
            height: 0,
            maskClass: 'dialogMask', //遮罩层的class名称
            timeout: 0,
            draggable: true,
            modal: true,    //是否模态
            focus: null,
            blur: null,
            left: 0,
            top: 0,
            position: 'center',
            anchorPosition: true, //是否始终定位在某一位置，只在某些状态下有效
            dependElement: null,
            keepHover: null, //要保持浮动窗口的节点，当点击在这些节点内时不会关闭浮动窗口
            overlay: 30,
            icon: '',
            showBackground: true,
            showBorder: true,
            showHeader: true,
            showButton: true,
            showCancel: true,
            showClose: true,
            showOk: true,
            showMask: true, //是否显示遮罩
            okBtnName: '确定',
            cancelBtnName: '取消',
            content: '',
            contentType: 'text',
            contentChange: false,
            clickClose: false,
            animate: '',
            showAnimate: '',
            hideAnimate: '',
            onclose: null, //事件
            onopen: null,
            oncancel: null,
            onok: null,
            
            select: { url: '', type: 'radio', tele: '', vele: '', width: 120, search: false, fn: null }
        };

        var self = this;

        //初始化选项
        this.initOptions = function()
        {
            var tempOpt = opt || {};
            tempOpt.animate = tempOpt.animate || '';
            tempOpt.showAnimate = tempOpt.showAnimate || tempOpt.animate;
            tempOpt.hideAnimate = tempOpt.hideAnimate || tempOpt.animate;
            self.options = $.extend({}, this._defaults, tempOpt);
        };

        //初始化弹窗Box
        this.initBox = function()
        {
            if (self.options.id)
            {
                self.id = self.options.id;
            } else
            {
                self.id = getID();
            }
            var html = '';
            switch (self.options.type)
            {
                case 'anchor': //定位于屏幕某一位置的窗口
                    var iconClass = '';
                    switch (self.options.icon)
                    {
                        case 'success':
                            iconClass = 'success';
                            break;
                        case 'fail':
                            iconClass = 'fail';
                            break;
                        case 'warning':
                            iconClass = 'warning';
                            break;
                        case 'question':
                            iconClass = 'question';
                            break;
                        case 'info':
                            iconClass = 'info';
                            break;
                    }
                    if (self.options.position == 'anchorRight')
                    {
                        html = '<div class="_dialog dialog" id="_dialog' + self.id + '" style="padding:0;">' +
						'	<table border="0" cellspacing="0" cellpadding="0">' +
						'		<tr>' +
						'			<td class="dialog-cl"></td>' +
						'			<td>' +
						'				<div class="_container _dialogContent dialogContent" style="padding:0;overflow:inherit"></div>' +
						'			</td>' +
						'			<td class="dialog-cr"></td>' +
						'		</tr>' +
						'	</table>' +
						'</div>';
                    } else
                    {
                        html = '<div class="_dialog" id="_dialog' + self.id + '">' +
							   '	<div class="prompt"><b class="L"></b><b class="R"></b>' +
                               '    	<div class="promptTxt ' + (!(self.options.icon == 'warning' || self.options.icon == 'fail') ? 'promptS' : 'promptF') + '">' +
                               '    		<div class="_dialogContent"></div>' +
                               '    	</div>' +
							   '    </div>'
        					   '</div>';
                    }
                    break;
                case 'message': //提示窗口
                case 'confirm': //确认窗口
                    var iconClass = '';
                    switch (self.options.icon)
                    {
                        case 'success':
                            iconClass = 'popS';
                            break;
                        case 'fail':
                            iconClass = 'popF';
                            break;
                        case 'warning':
                            iconClass = 'popW';
                            break;
                        case 'question':
                            iconClass = 'popQ';
                            break;
                        case 'info':
                            iconClass = 'popI';
                            break;
                    }
                    html = '<div class="_dialog dialog" id="_dialog' + self.id + '">' +
					'	<div class="dialogCon">' +
                    '    <div class="dialogHead _dialogHeader"><span class="_title">系统消息</span><a href="javascript:void(0)" class="dialogClose _dialogClose" title="关闭"></a></div> ' +
						'	<table border="0" cellspacing="0" cellpadding="0">' +
						'		<tr>' +
						'			<td class="dialog-cl"></td>' +
						'			<td>' +
						'				<div class="_container dialogContent ' + iconClass + '"><div class="_dialogContent popTxt"></div>' +
						'				<div class="_dialog-button dialogPopBtn">' +
						'					<a href="javascript:void(0)" class="btn2 dialog-ok _dialogOk"><b class="L"></b><b class="R"></b>确&nbsp;定</a>' +
						'					<a href="javascript:void(0)" class="btn1 dialog-cancel _dialogCancel"><b class="L"></b><b class="R"></b>取&nbsp;消</a>' +
						'				</div>' +
						'</div>' +
						'			</td>' +
						'			<td class="dialog-cr"></td>' +
						'		</tr>' +
						'	</table>' +
						'	</div>' +
						'</div>';
                    break;
                case 'modal': //模式窗口
                    //self.options.maskClass='resumemask';
                case 'dialog': //非模式窗口
                    html = '<div class="_dialog dialog" id="_dialog' + self.id + '">' +
						'<div class="dialogCon">' +
                        '	<div class="dialogHead _dialogHeader"><span class="_title">系统消息</span><a href="javascript:void(0)" class="dialogClose _dialogClose" title="关闭"></a></div> ' +
						'	<table border="0" cellspacing="0" cellpadding="0">' +
						'		<tr>' +
						'			<td class="dialog-cl"></td>' +
						'			<td>' +
						'				<div class="_container _dialogContent dialogContent"></div>' +
						'			</td>' +
						'			<td class="dialog-cr"></td>' +
						'		</tr>' +
						'	</table>' +
						'</div>' +
						'</div>';
                    break;
					
				case 'running':
                    html = '<div class="_dialog dialog" id="_dialog' + self.id + '" style="padding:0;">' +
						'<div class="dialogCon"  style="background:none;_overflow:hidden;border:0;">' +
                        '	<div class="dialogHead _dialogHeader"><span class="_title">系统消息</span><a href="javascript:void(0)" class="dialogClose _dialogClose" title="关闭"></a></div> ' +
						'	<table border="0" cellspacing="0" cellpadding="0">' +
						'		<tr>' +
						'			<td class="dialog-cl"></td>' +
						'			<td>' +
						'				<div class="_container _dialogContent dialogContent" style="padding:0;overflow:inherit"></div>' +
						'			</td>' +
						'			<td class="dialog-cr"></td>' +
						'		</tr>' +
						'	</table>' +
						'</div>' +
						'</div>';
			         break;
                case 'menu': //菜单
                    html = '<div class="_dialog dialog dialogosilde" id="_dialog' + self.id + '">' +
						'				<div class="_container _dialogContent dialogContent"></div>' +
						'</div>';
                    break;
                case 'hover': //浮动窗口
                    html = '<div class="_dialog dialog" id="_dialog' + self.id + '">' +
						'				<div class="_container _dialogContent dialogContent"></div>' +
						'</div>';
                    break;
                case 'tooltip': //气泡
                    html = '<div class="_dialog floatlayer_con _tooltip" style="" id="_dialog' + self.id + '">' +
                           '    <div id="_arrow" class="floatlayer_arrow_left"></div>' +
                           '    <table cellpadding="0" cellspacing="0" >' +
        	               '         <tbody>' +
            	           '             <tr class="floatlayer_con_top">' +
                           '                 <td class="floatlayer_con_top_l" width="5">&nbsp;</td>' +
                           '                 <td class="floatlayer_con_top_c">&nbsp;</td>' +
                           '                 <td class="floatlayer_con_top_r" width="5">&nbsp;</td>' +
                           '             </tr>' +
                           '             <tr class="floatlayer_con_con">' +
                	       '                 <td class="floatlayer_con_con_l">&nbsp;</td>' +
                           '                 <td class="floatlayer_con_con_c _container _dialogContent">' +
                           '                 </td>' +
                           '                 <td class="floatlayer_con_con_r">&nbsp;</td>' +
                           '             </tr>' +
                           '             <tr class="floatlayer_con_bot">' +
                	       '                 <td class="floatlayer_con_bot_l">&nbsp;</td>' +
                           '                 <td class="floatlayer_con_bot_c">&nbsp;</td>' +
                           '                 <td class="floatlayer_con_bot_r">&nbsp;</td>' +
                           '             </tr>' +
                           '         </tbody>' +
                           '    </table>' +
                           '</div>';
                    html = '<div class="_dialog _tooltip floatlayer" id="_dialog' + self.id + '">' +
                            '        <div id="_arrow" class="floatlayer_arrow_left"></div>' +
                            '    <div class=" _container _dialogContent floatlayer_con">' +
                    //'        <div class=" test" style="_white-space:nowrap;"></div>' +
                            '    </div>' +
                            '</div>';
                    break;
                case 'img': //图片
                    html = '<div class="_dialog" id="_dialog' + self.id + '"></div>';
                    break;
            }
            //如果是菜单，加到指定的位置里
            if (self.options.type == 'menu')
            {
                self.dh = $(html).appendTo(self.options.container || 'body').css({
                    position: 'absolute',
                    //    overflow: 'hidden',
                    zIndex: getZIndex(),
                    left: -1000,
                    top: -1000
                });
            } else
            {
                self.dh = $(html).appendTo('body').css({
                    position: 'absolute',
                    //    overflow: 'hidden',
                    zIndex: getZIndex(),
                    left: -1000,
                    top: -1000
                });
            }
            if (self.options.type == 'message' || self.options.type == 'confirm')
            {
                self.dh.addClass('confirmWidth');
            }
            self.dc = self.find('._dialogContent');
            self.dt = self.find('._title');
            self.dw = self.find('._container');
            self.header = self.find('._dialogHeader');
            self.db = self.find('._dialogButton');

            if (self.options.boxclass)
            {
                self.dh.addClass(self.options.boxclass);
            }
            if (self.options.height > 0)
            {
                self.dc.css('height', self.options.height);
            }
            if (self.options.width > 0)
            {
                self.dw.css('width', self.options.width);
            }
            if (self.options.position == 'anchorRight')
            {
                self.dh.addClass('anchorRight');
            }

            self.setTitle(self.options.title);
           if(self.options.showMask) self.dh.bgiframe();
            self.dh.data(contextData, self);
        }

        //初始化遮照
        this.initMask = function()
        {
            if (self.options.showMask && (self.options.type == 'modal' || self.options.type == 'message' || self.options.type == 'confirm'))
            {
                /*if ($.browser.msie) 
                {
                h = document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
                w = document.compatMode == "CSS1Compat" ? document.documentElement.clientWidth : document.body.clientWidth;
                } else */
                var h, w;
                var wnd = $(window);
                var doc = $(document);
                if (doc.height() > wnd.height())
                {
                    h = doc.height() - 5; //self.bheight();
                    w = doc.width() - 21;
                } else
                {
                    h = doc.height() - 5; //self.bheight();
                    w = doc.width() - 5;
                }
                //临时用于type=modeal的遮罩层样式
                if(self.options.type == 'modal')self.options.maskClass='dialogMask';

			    var isIE6=$.browser.msie&&($.browser.version=="6.0");
			    if(isIE6)
			    {
                    self.mh = $('<div id="_mask' + self.id + '" class="' + self.options.maskClass + '"></div>')
				    .appendTo('body').hide().css(
				    {
				        width: w,
				        height: h,
				        position:'absolute',
				        zIndex: getZIndex()
				    }).animate({opacity: 0.3},200).bgiframe();
			        $(window).resize(function()
                    {
                        var h, w;
                        var wnd = $(window);
                        var doc = $(document);
                        if (doc.height() > wnd.height())
                        {
                            h = doc.height() - 5; //self.bheight();
                            w = doc.width() - 21;
                        } else
                        {
                            h = doc.height() - 5; //self.bheight();
                            w = doc.width() - 5;
                        }
                        self.mh.css({ height: h, width: w });
                    });
			    }
			    else
			    {
                    self.mh = $('<div id="_mask' + self.id + '" class="' + self.options.maskClass + '"></div>')
				    .appendTo('body').hide().css(
				    {
				        //width: w,
				        //height: h,
				        zIndex: getZIndex()
				    }).animate({opacity: 0.3},200).bgiframe();			    
			    }
			    
            }
        }

        this.setTitle = function(title)
        {
            if (title == '')
            {
                self.dt.html('&nbsp;');
            } else
            {
                self.dt.html(title);
            }
        }

        //初始化弹窗内容
        this.initContent = function(content)
        {
            self.dh.find("._dialogOk").val(self.options.okBtnName);
            self.dh.find("._dialogCancel").val(self.options.cancelBtnName);
            if (self.options.title == '')
            {
                self.dt.html('&nbsp;');
            } else
            {
                self.dt.html(self.options.title);
            }
            if (!self.options.showHeader)
            {
                self.header.hide();
            }
            if (!self.options.showBorder)
            {
                self.dh.css({ border: 'none' });
                self.dc.css({ border: 'none' });
            }
            if (!self.options.showBackground)
            {
                self.dh.css({ background: 'none' });
                self.dc.css({ background: 'none' });
            }
            if (!self.options.showButton)
            {
                self.dh.find('._dialogButton').hide();
            }
            if (!self.options.showCancel)
            {
                self.dh.find('._dialogCancel').hide();
            }
            if (!self.options.showClose)
            {
                self.dh.find('._dialogClose').hide();
            }
            if (!self.options.showOk)
            {
                self.dh.find("._dialogOk").hide();
            }

            //如果没有图标内容不偏移
            if (!self.options.icon)
            {
                //self.dc.css({padding:0});
            }

            if (self.options.contentType == "selector")
            {
                var content = getElement(self.options.content).clone(true);
                content.show();
                content.css('display', 'block');
                self.setContent(content);
                self.contentInited = true;
                //if have checkbox do
                //选中里面的多选框，暂时没得用
                /*
                var cs = $(self.selector).find(':checkbox');
                self.dc.find(':checkbox').each(function(i) 
                {
                self.checked = cs[i].checked;
                });*/
                //$(self.selector).empty(); //清空原来的div
                //self.show();
                //self.focus();
                self.onopen();
            } else if (self.options.contentType == "ajax")
            {
                self.setLoading();
                var stop = self.stopLoading;
                setTimeout(stop, 8000);
                //this.show();
                //this.dh.find(".dialog-button").hide();
                var url = self.options.content;
                if (self.options.type == 'tooltip')
                {
                    if (url.indexOf('?') == -1)
                    {
                        url += "?_tooltip=true";
                    } else
                    {
                        url += "&_tooltip=true";
                    }
                }
                $.ajax(
                {
                    url: url,
                    dataType: 'html',
                    success: function(data)
                    {

						try {
							var json_need = $.parseJSON(data);
							if (json_need && json_need['isNeedLogin']){
								data = "<div style='padding: 40px;text-align: center;color: #999;'>登录已超时，请重新登录后再操作! </div>";
								setTimeout(function () {
									window.open('/');
								},800);
								// self.close();
							}
						}catch (e){

						}

                        self.stopLoading();
                        if (self.options.type == 'tooltip')
                        {
                            if (data == 'needPersonLogin')
                            {
                                try
                                {
                                    self.hide();
                                } catch (e) { }
                                checkPersonLogin();
                                return;
                            } else if (data == 'needCompanyLogin')
                            {
                                try
                                {
                                    self.hide();
                                } catch (e) { }
                                checkCompanyLogin();
                                return;
                            }
                        }
                        self.setContent(data);
                        self.innerShow(true);
                        if (self.options.cache)
                        {
                            self.cachedContent = data;
                        }
                        self.contentInited = true;
                        //self.show();
                        //self.focus();
                        self.onopen();
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown)
                    {
                        self.stopLoading();
                        if (self.options.type == 'tooltip')
                        {
                            self.setContent(tooltipError);
                        } else
                        {
                            self.setContent(errorHtml);
                        }
                        self.innerShow(true);
                        if (self.options.cache)
                        {
                            self.cachedContent = data;
                        }
                        self.contentInited = true;
                        //self.show();
                        //self.focus();
                        self.onopen();
                    }
                });
            } else if (self.options.contentType == "iframe")
            { /*加入iframe使程序可以直接引用其它页面 by ePim*/
                var html = '<style type="text/css">';
                html += ('\n.dialog-box .dialogContent{padding:0px;}');
                html += ('\n</style>');
                html += ('<iframe class="dialogIframe" src="' + self.options.content + '" width="100%" height="100%" frameborder="0"></iframe>');
                self.setContent(html);
                self.contentInited = true;
                self.onopen();
                //self.show();
            } else if (self.options.contentType == 'img')
            {
                var html = '<div class="floatlayer_pic"><img src="' + self.options.content + '" /></div>';
                self.setContent(html);
                self.contentInited = true;
                self.onopen();
            } else
            {
                self.setContent(self.options.content);
                self.contentInited = true;
                //self.show();
                //self.focus();
                self.onopen();
            }
        }

        //初始化弹窗事件
        this.initEvent = function()
        {
            self.dh.find("._dialogClose, ._dialogCancel, ._dialogOk").unbind('click').click(function() { $(this).closeDialog(); return false; });
            //当用户按下键盘按钮时触取消按钮
            self.dh.keydown(function(event)
            {
                var e = $.event.fix(event);
                //esc键， 等效于退出按钮
                if (e.keyCode == 27)
                {
                    var cancell = self.dh.find('._dialogCancel');
                    if (cancell.is(':visible'))
                    {
                        cancell.click();
                    } else if (self.dh.find('._dialogClose').is(':visible'))
                    {
                        self.dh.find('._dialogClose').click();
                    }
                }
            });
            self.dh.mousedown(function() { self.dh.css('z-index', getZIndex()) });
            if (self.options.onok)
            {
                self.setOnok(self.options.onok);
            }

            if (self.options.oncancel)
            {
                self.setOncancel(self.options.oncancel);
            }

            if (self.options.timeout > 0)
            {
                window.setTimeout(self.close, (self.options.timeout * 1000));
            }
            if (self.options.type == 'hover' || self.options.type == 'menu')
            {
                $('body').mousedown(function(event)
                {
                    var e = $.event.fix(event);
                    var src = e.target;
                    var keep = false;
                    if (self.dh[0] == src || $.contains(self.dh[0], src))
                    {
                        keep = true;
                    }
                    //如果是在模式窗口内也不关闭
                    $('._dialog').each(function()
                    {
                        if ($.contains(this, src)) keep = true;
                    });
                    if (!keep && self.options.keepHover)
                    {
                        if ($.isArray(self.options.keepHover))
                        {
                            try
                            {
                                for (var i in self.options.keepHover)
                                {
                                    if (typeof self.options.keepHover[i] == 'string')
                                    {
                                        $(self.options.keepHover[i]).each(function()
                                        {
                                            if (this == src || $.contains(this, src))
                                            {
                                                keep = true;
                                            }
                                        });
                                    } else
                                    {
                                        var el = self.options.keepHover[i][0];
                                        if (el == src || $.contains(el, src))
                                        {
                                            keep = true;
                                        }
                                    }

                                }
                            } catch (e) { }
                        } else
                        {
                            try
                            {
                                if (typeof self.options.keepHover == 'string')
                                {
                                    $(self.options.keepHover).each(function()
                                    {
                                        if (this == src || $.contains(this, src))
                                        {
                                            keep = true;
                                        }
                                    });
                                } else
                                {
                                    var el = self.options.keepHover[0];
                                    if (el == src || $.contains(el, src))
                                    {
                                        keep = true;
                                    }
                                }
                            } catch (e) { }
                        }
                    }
                    if (!keep) self.close();
                });

                self.dh.find('tr').each(function()
                {
                    $(this).mouseover(function() { $(this).addClass('cu'); }).mouseout(function() { $(this).removeClass('cu'); });
                });
            }
            self.drag();
        }

        //设置onok事件
        this.setOnok = function(fn)
        {
            //self.dh.find(".dialog-ok").unbind('click');
            if (typeof (fn) == "function")
            {
                var src = self.options.src;
                self.dh.find("._dialogOk").click(function() { fn(src); });
            } else if (typeof fn == 'number')
            {
                self.dh.find("._dialogOk").click(function()
                {
                    window.history.go(fn);
                });
            } else if (typeof fn == 'string')
            {
                self.dh.find("._dialogOk").click(function()
                {
                    window.location = fn;
                });
            }
        }
        //设置onOncancel事件
        this.setOncancel = function(fn)
        {
            //self.dh.find(".dialog-cancel").unbind('click');
            if (typeof (fn) == "function")
            {
                var src = self.options.src;
                self.dh.find("._dialogClose,._dialogCancel").click(function() { fn(src) });
            } else if (typeof (fn) == "number")
            {
                self.dh.find("._dialogClose,._dialogCancel").click(function() { window.history.go(fn); });
            } else if (typeof (fn) == "function")
            {
                self.dh.find("._dialogClose,._dialogCancel").click(function() { window.location = fn; });
            }
        }

        //打开前的回弹函数
        this.onopen = function()
        {
            if (typeof (self.options.onopen) == "function")
            {
                self.options.onopen(self);
            }
        }

        //关闭事件
        this.onclose = function()
        {
            //如果是加载的页面，清空高亮显示的行
            if (self.options.contentType == 'ajax' && (self.options.type == 'modal' || self.options.type == 'dialog'))
            {
                clearHighLight();
            }
            if (typeof self.options.onclose == 'number')
            {
                window.history.go(self.options.onclose);
            } else if (typeof self.options.onclose == 'string')
            {
                setTimeout('window.location = "' + self.options.onclose + '";', 100);

            } else if (typeof (self.options.onclose) == "function")
            {
                var src = self.options.src;
                self.options.onclose(src);
            }
        }

        //弹窗拖拽
        this.drag = function()
        {
            //取消拖动效果，因为加上了iframe后拖动不了
            return;
            if (self.options.draggable && self.options.showHeader)
            {
                var header = self.dh.find('._dialogHeader');
                header.css('cursor', 'move');
                var mouseMove = function(event)
                {
                    var h = self;
                    //var o = document;
                    var width = h.dh.width();
                    var height = h.dh.height();
                    if (window.getSelection)
                    {
                        window.getSelection().removeAllRanges();
                    } else
                    {
                        document.selection.empty();
                    }

                    var left = event.clientX - h.mx; // Math.max(event.clientX - h.mx, 0);
                    var top = event.clientY - h.my; //Math.max(event.clientY - h.my, 0);
                    h.dh.css({ left: left, top: top });
                };
                var mouseUp = function()
                {
                    var h = self;
                    if (h.releaseCapture)
                    {
                        h.releaseCapture();
                    }
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                };
                var mouseDown = function(event)
                {
                    var dhleft = parseInt(self.dh.css('left').replace('px'));
                    var dhtop = parseInt(self.dh.css('top').replace('px'));
                    self.mx = event.clientX - dhleft; // event.clientX;
                    self.my = event.clientY - dhtop; //event.clientY;
                    if (self.setCapture)
                    {
                        self.setCapture();
                    }

                    $(document).mousemove(mouseMove).mouseup(mouseUp);
                };

                header.mousedown(mouseDown);
            }
        }

        //增加一个按钮
        this.addButton = function(opt)
        {
            opt = opt || {};
            opt.title = opt.title || 'OK';
            opt.bclass = opt.bclass || 'dialog-btn1';
            opt.fn = opt.fn || null;
            opt.index = opt.index || 0;
            var btn = $('<input type="button" class="' + opt.bclass + '" value="' + opt.title + '">').click(function()
            {
                if (typeof opt.fn == "function") opt.fn(self);
            });
            if (opt.index < self.db.find('input').length)
            {
                self.db.find('input:eq(' + opt.index + ')').before(btn);
            } else
            {
                self.db.append(opt);
            }
        }
        this.hide = function(fn)
        {
            if (typeof self.options.hideAnimate == "string")
            {
                self.dh.hide(self.options.animate, fn);
            } else
            {
                self.dh.animate(self.options.hideAnimate.animate, self.options.hideAnimate.speed, "", fn);
            }
        }
        //设置弹窗焦点
        this.focus = function()
        {/*
            if (self.options.focus)
            {
                self.dh.find(self.options.focus).focus(); //TODO IE中要两次
                self.dh.find(self.options.focus).focus();
            } else
            {
                self.dh.find('._dialogCancel').focus();
            }*/
        }
        //在弹窗内查找元素
        this.find = function(selector)
        {
            return self.dh.find(selector);
        }
        //设置加载加状态
        this.setLoading = function()
        {
            //var loading = $('<div >正在加载中</div>');
            //$('body').append(loading);
            //loading.css({ 'z-index': self.dh.css('z-index') + 1 });
            //var width = Math.max(self.dh.outerWidth(), 40);
            //var height = Math.max(self.dh.outerHeight(), 70);
            //loading.css({ width: width, height: height });
            //self.initPosition(loading);
            //self.loading = loading;
            self.setContent('<div class="dialogLoading">加载中，请稍后</div>');
        }
        //停止加载状态
        this.stopLoading = function()
        {
            try
            {
                if(self.loading&&typeof self.loading != "undefined")
                {
                  self.loading.remove();
                }
            } catch (e) { } finally
            {
                self.loading = null;
                return;
            }
        }

        this.setWidth = function(width)
        {
            self.dw.width(width);
        }
        //取得标题
        this.getTitle = function()
        {
            return self.dt.html();
        }

        //设置内容
        this.setContent = function(content)
        {
            if (typeof content == 'string')
            {
                self.dc.html(content);
            } else
            {
                self.dc.append(content);
            }
            if (self.options.height > 0)
            {
                self.dc.css('height', self.options.height);
            } else
            {
                self.dc.css('height', '');
            }
            if (self.options.width > 0)
            {
                //self.dh.css('width', self.options.width);
            } else
            {
                self.dh.css('width', '');
            }
            if (self.options.showButton)
            {
                self.dh.find("._dialog-button").show();
            }
        }

        //取得内容
        this.getContent = function()
        {
            return self.dc.html();
        }

        //使能按钮
        this.disabledButton = function(btname, state)
        {
            self.dh.find('._dialog' + btname).attr("disabled", state);
        }
        //隐藏按钮
        this.hideButton = function(btname)
        {
            self.dh.find('._dialog' + btname).hide();
        }
        //显示按钮
        this.showButton = function(btname)
        {
            self.dh.find('._dialog' + btname).show();
        }
        //设置按钮标题
        this.setButtonTitle = function(btname, title)
        {
            self.dh.find('._dialog' + btname).val(title);
        }
        //操作完成
        this.next = function(opt)
        {
            opt = opt || {};
            opt.title = opt.title || self.getTitle();
            opt.content = opt.content || "";
            opt.okname = opt.okname || "确定";
            opt.width = opt.width || 260;
            opt.onok = opt.onok || self.close;
            opt.onclose = opt.onclose || null;
            opt.oncancel = opt.oncancel || null;
            opt.hideCancel = opt.hideCancel || true;
            self.setTitle(opt.title);
            self.setButtonTitle("ok", okname);
            self.setWidth(width);
            self.setOnok(opt.onok);
            if (opt.content != "") self.setContent(opt.content);
            if (opt.hideCancel) self.hideButton("cancel");
            if (typeof (opt.onclose) == "function") self.setOnclose(opt.onclose);
            if (typeof (opt.oncancel) == "function") self.setOncancel(opt.oncancel);
            self.show();
        }

        this.toggle = function()
        {
            if (self.options.id && self.dh && self.dh.length > 0)
            {
                try
                {
                    var d = self; //$('#_dialog' + self.options.id).data(contextData);
                    if (d.dh.is(':visible'))
                    {
                        d.close();
                    } else
                    {
                        d.show();
                    }
                } catch (e) { alert('toggle:' + e.message); }
            } else
            {
                if (self.dh && self.dh.length && self.dh.is(':visible'))
                {
                    self.close();
                } else
                {
                    self.show();
                }
            }
        }

        //显示弹窗
        this.show = function()
        {
            //关闭现有的层
            if (self.options.id)
            {
                try
                {
                    //有错
                    var d = $('#_dialog' + self.options.id); //.data(contextData);
                    //d.close();
                    if (d.size() > 0) return;
                } catch (e) { }
            }

            var dialog = self.options.id ? self : $.extend({}, self);
            dialog.initMask();
            dialog.initBox();
            dialog.initContent();
            // if (dialog.options.contentType != 'ajax')
            {
                dialog.innerShow();
            }

            return false;
        }

        this.innerShow = function(isComplete)
        {

            var dialog = self;
            dialog.initEvent();
            dialog.initPosition();
            if (dialog.mh)
            {
                dialog.mh.show();
            }

            if (dialog.options.type == 'menu')//菜单采用滑出的动画效果
            {
                //var height = dialog.dh.height();
                //dialog.dh.height(0);
                dialog.dh.show();
                if (dialog.options.position == 'under')
                {
                    //dialog.dh.animate({ height: height }, 200);
                } else if (dialog.options.position == 'top')
                {
                    var top = dialog.dh.offset().top;
                    //dialog.dh.css({ top: top + height });
                    //dialog.dh.animate({ height: height, top: top }, 200);
                }

            } else if (dialog.options.showAnimate == "toggle" || dialog.options.showAnimate == "slide" || dialog.options.showAnimate == "fade")
            {
                switch (dialog.options.animate)
                {
                    case 'toggle':
                        dialog.dh.hide().show(400);
                        break;
                    case 'slide':
                        dialog.dh.hide().slideDown(400);
                        break;
                    case 'fade':
                        dialog.dh.hide().fadeIn(400, function()
                        {
                            //聚集到确定或关闭按钮
                            var ok = self.dh.find('._dialogOk');
                            if (ok.is(':visible'))
                            {
                                ok.focus();
                            } else
                            {
                                self.dh.find('._dialogClose').focus();
                            }
                        });
                        break;
                }
            } else if (dialog.options.showAnimate)
            {
                dialog.dh.animate(dialog.options.showAnimate.animate, dialog.options.showAnimate.speed, function()
                {
                    //聚集到确定或关闭按钮
                    var ok = self.dh.find('._dialogOk');
                    if (ok.is(':visible'))
                    {
                        ok.focus();
                    } else
                    {
                        self.dh.find('._dialogClose').focus();
                    }
                });
            } else
            {
                dialog.dh.show();
                //聚集到确定或关闭按钮
                var ok = self.dh.find('._dialogOk');
                if (ok.is(':visible'))
                {
                    ok.focus();
                } else
                {
                    self.dh.find('._dialogClose').focus();
                }
            }

            if (self.options.type == 'tooltip' && self.options.keepHover && isComplete)
            {
                var depend = getElement(self.options.dependElement);
                var left = Math.min(depend.offset().left, self.dh.offset().left);
                var right = Math.max(depend.offset().left + depend.width(), self.dh.offset().left + self.dh.width());
                var top = Math.min(depend.offset().top, self.dh.offset().top);
                var bottom = Math.max(depend.offset().top + depend.height(), self.dh.offset().top + self.dh.height());
                var closeFn = self.close;
                // alert(left + ':' + right + '   :   ' + top + ':' + bottom);
                var move = function(event)
                {
                    var wnd = $(window);
                    var e = $.event.fix(event);
                    var x = e.clientX + wnd.scrollLeft();
                    var y = e.clientY + wnd.scrollTop();

                    if (x >= left && x <= right && y <= bottom && y >= top) return;
                    closeFn();
                    $('body').unbind('mousemove', move);
                };
                $('body').mousemove(move);
            }
            if(self.options.showMask)self.dh.bgiframe();
        }

        //关闭弹窗
        this.close = function(n)
        {
            self.onclose();
            //查看自动完成的提示窗口将其关闭,Email提示层
//            try
//            {
//                $('.em_divtip').remove();
//            } catch (e) { }

            //设置关闭后的焦点
            if (self.options.blur)
            {
                $(self.options.blur).focus();
            }
            //从数组中删除
            for (i = 0; i < arrweebox.length; i++)
            {
                if (arrweebox[i].dh.get(0) == self.dh.get(0))
                {
                    arrweebox.splice(i, 1);
                    break;
                }
            }
            //关闭回调，用于移除对象
            var closeCallback = function()
            {
                self.dh.remove();
                if (self.mh)
                {
                    self.mh.animate({opacity:0},{complete:function()
																   {
																   self.mh.remove();
																  }});
                }
            };
            if (self.options.type == 'menu')//菜单采用滑出的动画效果
            {
                var height = self.dh.height();
                if (self.options.position == 'under')
                {
                    //self.dh.animate({ height: 0 }, 200, closeCallback);
                } else if (self.options.position == 'top')
                {
                    var top = self.dh.offset().top + height;
                    //self.dh.css({top:top-height});
                    //self.dh.animate({ height: 0, top: top }, 200, closeCallback);
                }
                self.dh.hide();
                closeCallback();
            } else if (self.options.showAnimate == "toggle" || self.options.showAnimate == "slide" || self.options.showAnimate == "fade")
            {
                switch (self.options.animate)
                {
                    case 'toggle':
                        self.dh.hide(400, closeCallback);
                        break;
                    case 'slide':
                        self.dh.slideUp(400, closeCallback);
                        break;
                    case 'fade':
                        self.dh.fadeOut(400, closeCallback);
                        break;
                }
            } else if (self.options.showAnimate)
            {
                self.dh.animate(self.options.showAnimate.animate, self.options.showAnimate.speed, closeCallback);
            } else
            {
                self.dh.hide();
                closeCallback();
            }
            // self.hide();
        }
        //取得遮照高度
        this.bheight = function()
        {
            if ($.browser.msie && $.browser.version < 7)
            {
                var scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                var offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);

                if (scrollHeight < offsetHeight)
                {
                    return $(window).height();
                } else
                {
                    return scrollHeight;
                }
            } else
            {
                return $(document).height();
            }
        }
        //取得遮照宽度
        this.bwidth = function()
        {
            if ($.browser.msie && $.browser.version < 7)
            {
                var scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
                var offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

                if (scrollWidth < offsetWidth)
                {
                    return $(window).width();
                } else
                {
                    return scrollWidth;
                }
            } else
            {
                return $(document).width();
            }
        }
        //初始化窗口位置
        this.initPosition = function(obj)
        {
            var src = obj || self.dh;
            var left = 0, top = 0;
            if (self.options.type == 'tooltip')
            {
                var arrowSize = 7;
                var arrowClass = 'floatlayer_arrow_left';
                var depend = getElement(self.options.dependElement);
                var offset = depend.offset();
                left = offset.left;
                top = offset.top + depend.outerHeight();
                var arrowLeft = 0;
                var arrowTop = 0;
                var doc = $(document);
                var wnd = $(window);
                var toTop = function()
                {
                    top = offset.top - src.outerHeight() - arrowSize;
                    left = offset.left - ((src.outerWidth() - depend.outerWidth()) / 2);
                    var of = 0;
                    if (left < 0)
                    {
                        of = left * -1;
                    } else if (left + src.outerWidth() > wnd.scrollLeft() + wnd.width())
                    {
                        // of = doc.width() - (left + src.outerWidth());
                        of = left + src.outerWidth() - wnd.scrollLeft() - wnd.width();
                    }
                    left += of;
                    arrowTop = src.innerHeight() - 1;
                    arrowLeft = src.outerWidth() / 2 + of - arrowSize / 2;
                    arrowClass = 'floatlayer_arrow_bottom';
                    return top >= 0;
                };
                var toBottom = function()
                {
                    top = offset.top + depend.outerHeight() + arrowSize;
                    left = offset.left - ((src.outerWidth() - depend.outerWidth()) / 2);
                    var of = 0;
                    if (left < 0)
                    {
                        of = left * -1;
                    } else if (left + src.outerWidth() > wnd.scrollLeft() + wnd.width())
                    {
                        //of = doc.width() - (left + src.outerWidth());
                        of = left + src.outerWidth() - wnd.scrollLeft() - wnd.width();
                    }
                    left += of;
                    arrowTop = -1 * arrowSize;
                    arrowLeft = src.outerWidth() / 2 + of - arrowSize / 2;
                    arrowClass = 'floatlayer_arrow_top';
                    return top + src.outerHeight() < doc.height();
                };
                var toLeft = function()
                {
                    top = offset.top - (src.outerHeight() - depend.outerHeight()) / 2;
                    left = offset.left - src.outerWidth() - arrowSize;
                    var of = 0;
                    if (top + src.outerHeight() > wnd.scrollTop() + wnd.height())
                    {
                        //of = (top + src.outerHeight()) - doc.height();
                        of = top + src.outerHeight() - wnd.scrollTop() - wnd.height();
                    } else if (top < 0)
                    {
                        of = top * -1;
                    }
                    top -= of;
                    arrowTop = src.outerHeight() / 2 + of - arrowSize / 2;
                    arrowLeft = src.width() - 1;
                    arrowClass = 'floatlayer_arrow_right';
                    return left >= 0;
                };
                var toRight = function()
                {
                    top = offset.top - (src.outerHeight() - depend.outerHeight()) / 2;
                    left = offset.left + depend.outerWidth() + arrowSize;
                    var of = 0;
                    if (top + src.outerHeight() > wnd.scrollTop() + wnd.height())
                    {
                        //of = (top + src.outerHeight()) - doc.height();
                        of = top + src.outerHeight() - wnd.scrollTop() - wnd.height();
                    } else if (top < 0)
                    {
                        of = top * -1;
                    }
                    top -= of;
                    arrowTop = src.outerHeight() / 2 + of - arrowSize / 2;
                    arrowLeft = -1 * arrowSize;
                    arrowClass = 'floatlayer_arrow_left';

                    return left + src.outerWidth() <= doc.width();
                };

                if (self.options.position == 'top')
                {
                    if (!toTop()) toBottom();
                } else if (self.options.position == 'bottom')
                {
                    if (!toBottom()) toTop();
                } else if (self.options.position == 'left')
                {
                    if (!toLeft()) toRight();
                } else
                {
                    if (!toRight()) toLeft();
                }
                src.css({ left: left, top: top });
                //self.dw.width(src.width() - 10);
                //self.dw.height(src.height() - 20);
                src.find('#_arrow').addClass(arrowClass);
                src.find('#_arrow').css({ left: arrowLeft, top: arrowTop });
                return;
            } else if (self.options.position == 'center' || self.options.type == 'modal' || self.options.position == 'anchor' || self.options.position == 'anchorRight')//绝对定位于某个位置
            {
                self.anchorToPos(src);
                if (self.options.anchorPosition)
                {
                    var anchor = function(s)
                    {
                        return function() { self.anchorToPos(s); };
                    } (src);

                    anchor = $.proxy(anchor, self);

                    //  2011-05-20 zhangyu  update
                    //  取消弹出窗口根据浏览的改变和重新设置位置事件
                    //  只有当不支持fixed属性的时候才需要不断修正位置
                    
                    /*
                    if ($.support.fixed)
                    {
                        $(window).resize(anchor);
                        $(document).resize(anchor);
                    } else
                    {
                        //$(window).scroll(anchor).resize(anchor);
                        $(document).resize(anchor);
                    }
                    */
                }
                return;
            } else
            {
                var depend = getElement(self.options.dependElement);
                var offset = depend.offset();
                var wnd = $(window);
                var doc = $(document);

                var toDepend = function()
                {
                    left = depend.offset().left;
                    if (offset.left + self.dh.outerWidth() > doc.width())
                    {
                        left = doc.width() - src.outerWidth() - 10;
                    }
                    top = offset.top - src.outerHeight();
                    if (offset.top + self.dh.outerHeight() > doc.height())
                    {
                        top = doc.height() - src.outerHeight() - 10;
                    }
                }

                var toTop = function()
                {
                    var dependTop = 0;
                    if (self.options.type == 'menu' && self.options.container)
                    {
                        offset = depend.position();
                        dependTop = depend.offset().top;
                    }

                    left = offset.left;
                    top = offset.top - src.outerHeight();
                    if (left + self.dh.outerWidth() > wnd.scrollLeft() + wnd.width()) left -= left + self.dh.outerWidth() - wnd.scrollLeft() - wnd.width()
                    //不能超过屏幕边框
                    //if (left + self.dh.outerWidth() > wnd.scrollLeft() + wnd.width()) left -= left + src.outerWidth() - wnd.scrollLeft() - wnd.width();
                    //if (top + src.outerHeight() > wnd.height() + wnd.scrollTop()) top -= top + src.outerHeight() - wnd.height() - wnd.scrollTop();
                    if (self.options.type == 'menu') top++;
                    return top + dependTop >= wnd.scrollTop();
                }

                var toUnder = function()
                {
                    var dependTop = 0;
                    if (self.options.type == 'menu' && self.options.container)
                    {
                        offset = depend.position();
                        //下面的修正是针对简历助手进行的调整，只有简历助手才需要相对于父容器进行定位，其它的是相对于document
                        offset.top += 3;
                        offset.left += 10;
                        dependTop = depend.offset().top;
                    }
                    left = offset.left;
                    top = offset.top + depend.outerHeight();
                    //不能超过屏幕边框
                    //if (left + self.dh.outerWidth() > wnd.scrollLeft() + wnd.width()) left -= left + src.outerWidth() - wnd.scrollLeft() - wnd.width();
                    //if (top + src.outerHeight() > wnd.height() + wnd.scrollTop()) top -= top + src.outerHeight() - wnd.height() - wnd.scrollTop();
                    if (self.options.type == 'menu') top--;
                    return top + dependTop + self.dh.outerHeight() <= wnd.scrollTop() + wnd.height();
                }
                var toAuto = function()
                {
                    try
                    {
                        var offset = depend.offset();
                        left = offset.left + depend.outerWidth();
                        top = offset.top - src.outerHeight();
                    } catch (e) { }
                }

                if (self.options.position == 'depend')
                {
                    toDepend();
                } else if (self.options.position == 'top')//定位于某元素上面
                {
                    if (!toTop()) toUnder();
                }
                else if (self.options.position == 'under')//定位于某元素下面
                {
                    if (!toUnder()) toTop();
                } else if (self.options.position == 'auto')
                {
                    toAuto();
                }
            }
            src.css({ left: Math.max(left, 0), top: Math.max(top, 0) });
        }

        // toUpdate 2011-05-07 zhangyu
        // 移除窗口在浏览器中随浏览器滚动条 滚动而滚动
        self.anchorToPos = function(obj)
        {
            var src = obj || self.dh;
            var wnd = $(window);
            var doc = $(document);
            var top = 0;
            var left = 0;
            /*
            if (!$.support.fixed)
            {
                top = doc.scrollTop();
                left = doc.scrollLeft();
            }
            */
             top = doc.scrollTop();
             left = doc.scrollLeft();
            //2011-1-11 原来anchorRight只用于分页果的提示，后来要求将位置定位到中间
            if (self.options.position == 'center' || self.options.type == 'modal')
            {
                if ($.support.fixed && self.options.anchorPosition)
                {
                    top += (wnd.height() - src.outerHeight()) / 2;
                    left += (wnd.width() - src.outerWidth()) / 2;
                    src.css({left: left, top: top });
                   // src.css({ position: 'fixed', left: left, top: top });
                } else
                {
                    top += (wnd.height() - src.outerHeight()) / 2;
                    left += (wnd.width() - src.outerWidth()) / 2;
                    src.css({ left: left, top: top });
                }
            } else if (self.options.position == 'anchorRight')
            {
                //分页的提示放到页面中间
                
                if ($.support.fixed)
                {
                    top += (wnd.height() - src.outerHeight()) / 2;
                    left += (wnd.width() - src.outerWidth()) / 2;
                    src.css({left: left, top: top })
                    //src.css({ position: 'fixed', left: left, top: top });
                } else
                {
                    top += (wnd.height() - src.outerHeight()) / 2;
                    left += (wnd.width() - src.outerWidth()) / 2;
                    src.css({ left: left, top: top });
                }
                /*
                if (self.options.top == 'center')
                {
                top += (wnd.height() - src.outerHeight()) / 2;
                } else
                {
                top += self.options.top;
                }
                src.css('left', '');
                if ($.support.fixed)
                {
                left = self.options.left - doc.scrollLeft();
                src.css({ position: 'fixed', right: left, top: top });
                } else
                {
                left = self.options.left - doc.scrollLeft();
                src.css({ right: left, top: top });
                }*/
            } else
            {
                if (self.options.top == 'center')
                {
                    top += (wnd.height() - src.outerHeight()) / 2;
                } else
                {
                    top += self.options.top;
                }
                if (self.options.left == 'center')
                {
                    left += (wnd.width() - src.outerWidth()) / 2;
                } else
                {
                    left += self.options.left;
                }
                
                src.css({ left: left, top: top });
                /*
                if ($.support.fixed)
                {
                    src.css({ position: 'fixed', left: left, top: top });
                } else
                {
                    src.css({ left: left, top: top });
                }
                */
            }
        }

        self.initOptions();
    }

    this.singleID = '';
    this._onbox = false;
    this._opening = false;
    this.zIndex = 999;
    var length = function()
    {
        return arrweebox.length;
    }

    //关闭唯一对话框
    $.fn.closeSingleDialog = function()
    {
        try
        {
            var container = $('#_dialog' + this.singleID);
            var context = container.data(contextData);
            context.close();
        } catch (e) { }
    }

    //关闭当前对话框
    $.fn.closeDialog = function()
    {
        try
        {
            var container = this.getDialog();

            var context = container.data(contextData);
            context.close();
        } catch (e) { alert(e.message); }
    }

    //获取当前对话框
    $.fn.getDialog = function()
    {
        return this.closest('._dialog');
    }

    //获取当前对话框的实例对象
    $.fn.getDialogItem = function()
    {
        var container = this.getDialog();
        return container.data(contextData);
    }

    //获取内容属性以构造dialog对象
    var getContentOption = function(content)
    {
        var contentType = 'html';
        if (/^#/.test(content))
        {
            contentType = 'selector';
        } else if (/\.(png|aspx|ashx|html|htm|asp)/i.test(content))
        {
            contentType = 'ajax';
        } else if (/\.(jpg|png|gif)$/i.test(content))
        {
            contentType = 'img';
        }
        else// if(/^(http:)|(https:)/.test(href))
        {
            contentType = 'html';
        }
        return { content: content, contentType: contentType };
    }

    //手动绑定
    $.fn.bindWindow = function(options)
    {
        var opt = options || {};
        var box = new weebox(opt);
        this.unbind('click').click($.proxy(box.show, box));
        return box;
    }

    //模式窗口
    $.fn.bindModal = function(options)
    {
        var opt = options || {};
        var content = getContentOption(opt.content || this.attr('href'));
        opt.title = opt.title || this.attr('title');
        opt.content = opt.content || content.content;
        //opt.animate = 'fade';
        opt.contentType = content.contentType;
        opt.type = opt.type || 'modal';
        opt.position = 'center';
        opt.showButton = opt.showButton || false;
        opt.draggable = false;
        opt.id = '_hover' + getID();
        this.singleID = opt.id;

        var options = options || {};
        if (options.boxid)
        {
            for (var i = 0; i < arrweebox.length; i++)
            {
                if (arrweebox[i].dh.attr('id') == options.boxid)
                {
                    arrweebox[i].close();
                    break;
                }
            }
        }
        var box = new weebox(opt);
        this.unbind('click').click(box.show);
        return box;
    }

    //非模式窗口
    $.fn.bindDialog = function(options)
    {
        var opt = options || {};
        var content = getContentOption(opt.content || this.attr('href'));
        opt.title = opt.title || this.attr('title');
        opt.content = opt.content || content.content;
        //opt.animate = 'fade';
        opt.contentType = content.contentType;
        opt.type = opt.type || 'dialog';
        opt.position = opt.depend || 'depend';
        opt.dependElement = this;
        opt.showButton = opt.showButton || false;
        opt.draggable = true;

        var box = new weebox(opt);
        this.unbind('click').click(box.show);
        return box;
    }

    //浮动窗口
    $.fn.bindHover = function(options)
    {
        var opt = options || {};
        var content = getContentOption(opt.content || this.attr('href'));
        opt.title = opt.title || this.attr('title');
        opt.content = opt.content || content.content;
        opt.animate = 'fade';
        opt.contentType = content.contentType;
        opt.type = opt.type || 'hover';
        opt.position = opt.depend || 'left';
        opt.dependElement = this;
        opt.draggable = true;
        opt.id = '_hover' + getID();
        this.singleID = opt.id;

        var box = new weebox(opt);
        this.unbind('click').click(box.show, box);
        return box;
    }

    //提示框
    $.fn.bindTooltip = function(opt)
    {
        opt = opt || {};
        if (opt.contentType)
        {
            opt.content = this.attr('title');
        } else
        {
            opt = $.extend(opt, getContentOption(this.attr('title')));
        }
        this.removeAttr('title');
        opt.dependElement = this;
        /*
        var tagname=this[0].tagName;
        var wrap=this;
        if(tagname=='INPUT' || tagname=='IMG')
        {
        this.wrap('<span style="border:red solid 0px;"></span>');
        wrap=this.closest('span');
        opt.dependElement=wrap;
        }else
        {
        opt.dependElement=this;
        }*/
        opt.type = 'tooltip';
        //opt.animate = 'fade';
        opt.position = opt.position || 'left';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        this.singleID = opt.id;

        var box = new weebox(opt);
        var close = this.closeSingleDialog;
        //this.hover(box.show, self.closeSingleDialog);
        if (opt.keepHover)
        {
            this.hover(function()
            {
                //关闭所有其它已经显示的气泡
                $('._tooltip').each(function()
                {
                    var c = $(this).data(contextData);
                    if (c.options.id == box.options.id) return;
                    try
                    {
                        $(this).closeDialog();
                    } catch (e) { }
                });
                box.show();
            }, null);
        } else
        {
            this.hover(function()
            {
                //关闭所有其它已经显示的气泡
                $('._tooltip').each(function()
                {
                    var c = $(this).data(contextData);
                    if (c.options.id == box.options.id) return;
                    try
                    {
                        $(this).closeDialog();
                    } catch (e) { }
                });
                box.show();
            }, box.close);
        }
        return box;
    }

     // ZhangYu 20110-90-9
    //获取焦点事件的 提示框
    $.fn.bindfocusTooltip = function(opt)
    {
        opt = opt || {};
        if (opt.contentType)
        {
            opt.content = this.attr('title');
        } else
        {
            opt = $.extend(opt, getContentOption(this.attr('title')));
        }
        this.removeAttr('title');
        opt.dependElement = this;
        /*
        var tagname=this[0].tagName;
        var wrap=this;
        if(tagname=='INPUT' || tagname=='IMG')
        {
        this.wrap('<span style="border:red solid 0px;"></span>');
        wrap=this.closest('span');
        opt.dependElement=wrap;
        }else
        {
        opt.dependElement=this;
        }*/
        opt.type = 'tooltip';
        //opt.animate = 'fade';
        opt.position = opt.position || 'left';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        this.singleID = opt.id;

        var box = new weebox(opt);
        var close = this.closeSingleDialog;
        //this.hover(box.show, self.closeSingleDialog);
        this.focus(function()
        {
            //关闭所有其它已经显示的气泡
            $('._tooltip').each(function()
            {
                var c = $(this).data(contextData);
                if (c.options.id == box.options.id) return;
                try
                {
                    $(this).closeDialog();
                } catch (e) { }
            });
            box.show();
        }).blur(function()
        {
             box.close();
        });
        return box;
    }

    //下拉菜单      2010-10-14  by dongzh
    $.fn.bindMenu = function(menu, options)
    {
        var opt = options || {};
        //opt.container = opt.container || 'body';
        opt.content = menu;
        opt.contentType = 'selector';
        opt.type = 'menu';
        opt.position = opt.position || 'under';
        opt.dependElement = this;
        opt.draggable = false;
        opt.id = '_menu' + getID();
        //opt.width = this.outerWidth();
        this.singleID = opt.id;

        //2011-1-5 取消了点击指定区域不关闭菜单的功能
        opt.keepHover = this;
        /*
        if (opt.keepHover)
        {
        if ($.isArray(opt.keepHover))
        {
        opt.keepHover.push(this);
        } else
        {
        opt.keepHover = [opt.keepHover, this];
        }
        } else
        {
        opt.keepHover = this;
        }*/

        var box = new weebox(opt);
        this.unbind('click').click(box.toggle);
        return box;
    };

    //消息框
    $.message = function(msg, options)
    {
        var opt = {};
        if (typeof options == 'function' || typeof options == 'string' || typeof options == 'number')
        {
            opt.onclose = options;
        } else
        {
            opt = $.extend(opt, options);
        }
        opt.type = 'message';
        opt.position = 'center';
        opt.contentType = 'html';
        opt.icon = opt.icon || 'success';
        opt.content = msg;
        //opt.animate = 'fade';
        opt.title = opt.title || '系统提示';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        opt.showCancel = false;
        //opt.animate='slow';
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //消息框
    $.fn.message = function(msg, options)
    {
        var opt = {};
        if (typeof options == 'function' || typeof options == 'string' || typeof options == 'number')
        {
            opt.onclose = options;
        } else
        {
            opt = $.extend(opt, options);
        }
        opt.type = 'message';
        opt.position = 'center';
        opt.contentType = 'html';
        opt.icon = opt.icon || 'success';
        opt.content = msg;
        //opt.animate = 'fade';
        opt.title = opt.title || '系统提示';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        opt.showCancel = false;
        //opt.animate='slow';
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //确认框
    $.confirm = function(msg, title, ok, cancell)
    {
        var opt = {};
        opt.src = this;
        opt.type = 'confirm';
        opt.position = 'center';
        opt.contentType = 'html';
        opt.icon = 'question';
        opt.content = msg;
        //opt.animate = 'fade';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        //opt.okBtnName='是';
        //opt.cancelBtnName='否';
        if (typeof title == 'function')
        {
            opt.onok = title;
            opt.oncancell = ok;
        } else
        {
            opt.title = title;
            opt.onok = ok;
            opt.oncancel = cancell;
        }
        opt.title = opt.title || '系统提示';
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //确认框
    $.fn.confirm = function(msg, title, ok, cancell)
    {
        var opt = {};
        opt.src = this;
        opt.type = 'confirm';
        opt.position = 'center';
        opt.contentType = 'html';
        opt.icon = 'question';
        opt.content = msg;
        //opt.animate = 'fade';
        opt.draggable = false;
        opt.id = '_tooltip' + getID();
        //opt.okBtnName='是';
        //opt.cancelBtnName='否';
        if (typeof title == 'function')
        {
            opt.onok = title;
            opt.oncancell = ok;
        } else
        {
            opt.title = title;
            opt.onok = ok;
            opt.oncancel = cancell;
        }
        opt.title = opt.title || '系统提示';
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //创建一个对话框不自动显示
    $.dialog = function(options)
    {
        var box = new weebox(options);
        return box;
    }

    //打开指定的url并显示对话框
    $.showDialog = function(url, options)
    {
        var opt = options || {};
        opt.content = url;
        opt.contentType = opt.contentType || 'ajax';
        //if (typeof opt.animate == 'undefined') opt.animate = 'fade';
        opt.type = opt.type || 'dialog';
        opt.position = opt.depend || 'depend';
        opt.dependElement = $($.event.fix(event).target);
        opt.showButton = opt.showButton || false;
        opt.draggable = true;
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //打开指定的url并以模式窗口显示对话框draggable
    $.showModal = function(url, options)
    {
		debugger;
        var opt = options || {};
        opt.content = url;
        opt.contentType = opt.contentType || 'ajax';
        //if (typeof opt.animate == 'undefined') opt.animate = 'fade';
        opt.type = 'modal';
        opt.showButton = opt.showButton || false;
        //opt.draggable = opt.draggable || false;
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //提供定位于屏幕的某个位置的窗口显示
    $.anchor = function(msg, options)
    {
        var opt = options || {};
        opt.type = 'anchor';
        opt.position = opt.position || 'center';
        opt.content = msg;
        //opt.animate = 'fade';
        opt.contentType = 'html';
        opt.timeout = opt.timeout || 0;
        if (opt.icon == 'undefined') opt.icon = 'success';
        opt.draggable = false;
        opt.id = '_anchor' + getID();
        opt.showButton = false;
        var box = new weebox(opt);
        box.show();
        return box;
    }

    //显示一个消息提示，2秒钟消失
    $.anchorMsg = function(msg, opt)
    {
        opt = opt || {};
        if (typeof opt.timeout == 'undefined') opt.timeout = 2;
        //opt.timeout = 0;
        $.anchor(msg, opt);
    }

    $.showError = function(msg)
    {
        msg = msg || '非常抱歉，数据加载失败';
        var errorHtml =
    '            	<div class="dialogError">' +
    '            		' + msg +
    '                </div>' +
    '               <div class="dialogPopBtn"></div>';
      
	   $.showModal(errorHtml, { conentType: 'html'});
    }

    
    
 $().ready(function()
    {		

		var dialogs=$(".dialog"),dialogLefts=$(".dialogLeft"),dialogRights=$('.dialogRight'),dialogTops=$('.dialogTop'),
		dialogUnders=$('.dialogUnder'),modals=$('.modal');
		for(var i=0;i<dialogs.length;i++){ 
		    $(dialogs[i]).bindDialog();
		}
		for(var i=0;i<dialogLefts.length;i++){
			$(dialogLefts[i]).bindDialog({ depend: 'left' });
		}
		for(var i=0;i<dialogRights.length;i++){
			$(dialogRights[i]).bindDialog({ depend: 'right' });
		}
		for(var i=0;i<dialogTops.length;i++){
			$(dialogTops[i]).bindDialog({ depend: 'top' });
		}
		for(var i=0;i<dialogUnders.length;i++){
			$(dialogUnders[i]).bindDialog({ depend: 'under' });
		}
		for(var i=0;i<modals.length;i++){
			$(modals[i]).bindModal();
		}		
		var menus=$(".menu");
		for(var i=0;i<menus.length;i++){
			$(menus[i]).bindMenu();
		}
    });

})(jQuery);


/*
*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*
*jquery.form.js
*
*--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
*/

    /*!
    * jQuery Form Plugin
    * version: 2.47 (04-SEP-2010)
    * @requires jQuery v1.3.2 or later
    *
    * Examples and documentation at: http://malsup.com/jquery/form/
    * Dual licensed under the MIT and GPL licenses:
    *   http://www.opensource.org/licenses/mit-license.php
    *   http://www.gnu.org/licenses/gpl.html
    */
    ; (function($) {

        /*
        Usage Note:
        -----------
        Do not use both ajaxSubmit and ajaxForm on the same form.  These
        functions are intended to be exclusive.  Use ajaxSubmit if you want
        to bind your own submit handler to the form.  For example,

	$(document).ready(function() {
        $('#myForm').bind('submit', function() {
        $(this).ajaxSubmit({
        target: '#output'
        });
        return false; // <-- important!
        });
        });

	Use ajaxForm when you want the plugin to manage all the event binding
        for you.  For example,

	$(document).ready(function() {
        $('#myForm').ajaxForm({
        target: '#output'
        });
        });

	When using ajaxForm, the ajaxSubmit function will be invoked for you
        at the appropriate time.
        */

        /**
        * ajaxSubmit() provides a mechanism for immediately submitting
        * an HTML form using AJAX.
        */
        $.fn.ajaxSubmit = function(options) {
            // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
            if (!this.length) {
                log('ajaxSubmit: skipping submit process - no element selected');
                return this;
            }

            if (typeof options == 'function') {
                options = { success: options };
            }

            var url = $.trim(this.attr('action'));
            if (url) {
                // clean url (don't include hash vaue)
                url = (url.match(/^([^#]+)/) || [])[1];
            }
            url = url || window.location.href || '';

            options = $.extend(true, {
                url: url,
                type: this.attr('method') || 'GET',
                iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
            }, options);

            // hook for manipulating the form data before it is extracted;
            // convenient for use with rich editors like tinyMCE or FCKEditor
            var veto = {};
            this.trigger('form-pre-serialize', [this, options, veto]);
            if (veto.veto) {
                log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
                return this;
            }

            // provide opportunity to alter form data before it is serialized
            if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
                log('ajaxSubmit: submit aborted via beforeSerialize callback');
                return this;
            }

            var n, v, a = this.formToArray(options.semantic);
            if (options.data) {
                options.extraData = options.data;
                for (n in options.data) {
                    if (options.data[n] instanceof Array) {
                        for (var k in options.data[n]) {
                            a.push({ name: n, value: options.data[n][k] });
                        }
                    }
                    else {
                        v = options.data[n];
                        v = $.isFunction(v) ? v() : v; // if value is fn, invoke it
                        a.push({ name: n, value: v });
                    }
                }
            }

            // give pre-submit callback an opportunity to abort the submit
            if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
                log('ajaxSubmit: submit aborted via beforeSubmit callback');
                return this;
            }

            // fire vetoable 'validate' event
            this.trigger('form-submit-validate', [a, this, options, veto]);
            if (veto.veto) {
                log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
                return this;
            }

            var q = $.param(a);

            if (options.type.toUpperCase() == 'GET') {
                options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
                options.data = null;  // data is null for 'get'
            }
            else {
                options.data = q; // data is the query string for 'post'
            }

            var $form = this, callbacks = [];
            if (options.resetForm) {
                callbacks.push(function() { $form.resetForm(); });
            }
            if (options.clearForm) {
                callbacks.push(function() { $form.clearForm(); });
            }

            // perform a load on the target only if dataType is not provided
            if (!options.dataType && options.target) {
                var oldSuccess = options.success || function() { };
                callbacks.push(function(data) {
                    var fn = options.replaceTarget ? 'replaceWith' : 'html';
                    $(options.target)[fn](data).each(oldSuccess, arguments);
                });
            }
            else if (options.success) {
                callbacks.push(options.success);
            }

            options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
                var context = options.context || options;   // jQuery 1.4+ supports scope context 
                for (var i = 0, max = callbacks.length; i < max; i++) {
                    callbacks[i].apply(context, [data, status, xhr || $form, $form]);
                }
            };

            // are there files to upload?
            var fileInputs = $('input:file', this).length > 0;
            var mp = 'multipart/form-data';
            var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

            // options.iframe allows user to force iframe mode
            // 06-NOV-09: now defaulting to iframe mode if file input is detected
            if (options.iframe !== false && (fileInputs || options.iframe || multipart)) {
                // hack to fix Safari hang (thanks to Tim Molendijk for this)
                // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
                if (options.closeKeepAlive) {
                    $.get(options.closeKeepAlive, fileUpload);
                }
                else {
                    fileUpload();
                }
            }
            else {
                $.ajax(options);
            }

            // fire 'notify' event
            this.trigger('form-submit-notify', [this, options]);
            return this;


            // private function for handling file uploads (hat tip to YAHOO!)
            function fileUpload() {
                var form = $form[0];

                if ($(':input[name=submit],:input[id=submit]', form).length) {
                    // if there is an input with a name or id of 'submit' then we won't be
                    // able to invoke the submit fn on the form (at least not x-browser)
                    //alert('Error: Form elements must not have name or id of "submit".');
                    return;
                }

                var s = $.extend(true, {}, $.ajaxSettings, options);
                s.context = s.context || s;
                var id = 'jqFormIO' + (new Date().getTime()), fn = '_' + id;
                window[fn] = function() {
                    var f = $io.data('form-plugin-onload');
                    if (f) {
                        f();
                        window[fn] = undefined;
                        try { delete window[fn]; } catch (e) { }
                    }
                }
                var $io = $('<iframe id="' + id + '" name="' + id + '" src="' + s.iframeSrc + '" onload="window[\'_\'+this.id]()" />');
                var io = $io[0];

                $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

                var xhr = { // mock object
                    aborted: 0,
                    responseText: null,
                    responseXML: null,
                    status: 0,
                    statusText: 'n/a',
                    getAllResponseHeaders: function() { },
                    getResponseHeader: function() { },
                    setRequestHeader: function() { },
                    abort: function() {
                        this.aborted = 1;
                        $io.attr('src', s.iframeSrc); // abort op in progress
                    }
                };

                var g = s.global;
                // trigger ajax global events so that activity/block indicators work like normal
                if (g && !$.active++) {
                    $.event.trigger("ajaxStart");
                }
                if (g) {
                    $.event.trigger("ajaxSend", [xhr, s]);
                }

                if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
                    if (s.global) {
                        $.active--;
                    }
                    return;
                }
                if (xhr.aborted) {
                    return;
                }

                var cbInvoked = false;
                var timedOut = 0;

                // add submitting element to data if we know it
                var sub = form.clk;
                if (sub) {
                    var n = sub.name;
                    if (n && !sub.disabled) {
                        s.extraData = s.extraData || {};
                        s.extraData[n] = sub.value;
                        if (sub.type == "image") {
                            s.extraData[n + '.x'] = form.clk_x;
                            s.extraData[n + '.y'] = form.clk_y;
                        }
                    }
                }

                // take a breath so that pending repaints get some cpu time before the upload starts
                function doSubmit() {
                    // make sure form attrs are set
                    var t = $form.attr('target'), a = $form.attr('action');

                    // update form attrs in IE friendly way
                    form.setAttribute('target', id);
                    if (form.getAttribute('method') != 'POST') {
                        form.setAttribute('method', 'POST');
                    }
                    if (form.getAttribute('action') != s.url) {
                        form.setAttribute('action', s.url);
                    }

                    // ie borks in some cases when setting encoding
                    if (!s.skipEncodingOverride) {
                        $form.attr({
                            encoding: 'multipart/form-data',
                            enctype: 'multipart/form-data'
                        });
                    }

                    // support timout
                    if (s.timeout) {
                        setTimeout(function() { timedOut = true; cb(); }, s.timeout);
                    }

                    // add "extra" data to form if provided in options
                    var extraInputs = [];
                    try {
                        if (s.extraData) {
                            for (var n in s.extraData) {
                                extraInputs.push(
							$('<input type="hidden" name="' + n + '" value="' + s.extraData[n] + '" />')
								.appendTo(form)[0]);
                            }
                        }

                        // add iframe to doc and submit the form
                        $io.appendTo('body');
                        $io.data('form-plugin-onload', cb);
                        form.submit();
                    }
                    finally {
                        // reset attrs and remove "extra" input elements
                        form.setAttribute('action', a);
                        if (t) {
                            form.setAttribute('target', t);
                        } else {
                            $form.removeAttr('target');
                        }
                        $(extraInputs).remove();
                    }
                }

                if (s.forceSync) {
                    doSubmit();
                }
                else {
                    setTimeout(doSubmit, 10); // this lets dom updates render
                }

                var data, doc, domCheckCount = 50;

                function cb() {
                    if (cbInvoked) {
                        return;
                    }

                    $io.removeData('form-plugin-onload');

                    var ok = true;
                    try {
                        if (timedOut) {
                            throw 'timeout';
                        }
                        // extract the server response from the iframe
                        doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;

                        var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
                        log('isXml=' + isXml);
                        if (!isXml && window.opera && (doc.body == null || doc.body.innerHTML == '')) {
                            if (--domCheckCount) {
                                // in some browsers (Opera) the iframe DOM is not always traversable when
                                // the onload callback fires, so we loop a bit to accommodate
                                log('requeing onLoad callback, DOM not available');
                                setTimeout(cb, 250);
                                return;
                            }
                            // let this fall through because server response could be an empty document
                            //log('Could not access iframe DOM after mutiple tries.');
                            //throw 'DOMException: not available';
                        }

                        //log('response detected');
                        cbInvoked = true;
                        xhr.responseText = doc.documentElement ? doc.documentElement.innerHTML : null;
                        xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                        xhr.getResponseHeader = function(header) {
                            var headers = { 'content-type': s.dataType };
                            return headers[header];
                        };

                        var scr = /(json|script)/.test(s.dataType);
                        if (scr || s.textarea) {
                            // see if user embedded response in textarea
                            var ta = doc.getElementsByTagName('textarea')[0];
                            if (ta) {
                                xhr.responseText = ta.value;
                            }
                            else if (scr) {
                                // account for browsers injecting pre around json response
                                var pre = doc.getElementsByTagName('pre')[0];
                                if (pre) {
                                    xhr.responseText = pre.innerHTML;
                                }
                            }
                        }
                        else if (s.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
                            xhr.responseXML = toXml(xhr.responseText);
                        }
                        data = $.httpData(xhr, s.dataType);
                    }
                    catch (e) {
                        log('error caught:', e);
                        ok = false;
                        xhr.error = e;
                        $.handleError(s, xhr, 'error', e);
                    }

                    // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
                    if (ok) {
                        s.success.call(s.context, data, 'success', xhr);
                        if (g) {
                            $.event.trigger("ajaxSuccess", [xhr, s]);
                        }
                    }
                    if (g) {
                        $.event.trigger("ajaxComplete", [xhr, s]);
                    }
                    if (g && ! --$.active) {
                        $.event.trigger("ajaxStop");
                    }
                    if (s.complete) {
                        s.complete.call(s.context, xhr, ok ? 'success' : 'error');
                    }

                    // clean up
                    setTimeout(function() {
                        $io.removeData('form-plugin-onload');
                        $io.remove();
                        xhr.responseXML = null;
                    }, 100);
                }

                function toXml(s, doc) {
                    if (window.ActiveXObject) {
                        doc = new ActiveXObject('Microsoft.XMLDOM');
                        doc.async = 'false';
                        doc.loadXML(s);
                    }
                    else {
                        doc = (new DOMParser()).parseFromString(s, 'text/xml');
                    }
                    return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
                }
            }
        };

        /**
        * ajaxForm() provides a mechanism for fully automating form submission.
        *
        * The advantages of using this method instead of ajaxSubmit() are:
        *
        * 1: This method will include coordinates for <input type="image" /> elements (if the element
        *	is used to submit the form).
        * 2. This method will include the submit element's name/value data (for the element that was
        *	used to submit the form).
        * 3. This method binds the submit() method to the form for you.
        *
        * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
        * passes the options argument along after properly binding events for submit elements and
        * the form itself.
        */
        $.fn.ajaxForm = function(options) {
            // in jQuery 1.3+ we can fix mistakes with the ready state
            if (this.length === 0) {
                var o = { s: this.selector, c: this.context };
                if (!$.isReady && o.s) {
                    log('DOM not ready, queuing ajaxForm');
                    $(function() {
                        $(o.s, o.c).ajaxForm(options);
                    });
                    return this;
                }
                // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
                log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
                return this;
            }

            return this.ajaxFormUnbind().bind('submit.form-plugin', function(e) {
                if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
                    e.preventDefault();
                    $(this).ajaxSubmit(options);
                }
            }).bind('click.form-plugin', function(e) {
                var target = e.target;
                var $el = $(target);
                if (!($el.is(":submit,input:image"))) {
                    // is this a child element of the submit el?  (ex: a span within a button)
                    var t = $el.closest(':submit');
                    if (t.length == 0) {
                        return;
                    }
                    target = t[0];
                }
                var form = this;
                form.clk = target;
                if (target.type == 'image') {
                    if (e.offsetX != undefined) {
                        form.clk_x = e.offsetX;
                        form.clk_y = e.offsetY;
                    } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
                        var offset = $el.offset();
                        form.clk_x = e.pageX - offset.left;
                        form.clk_y = e.pageY - offset.top;
                    } else {
                        form.clk_x = e.pageX - target.offsetLeft;
                        form.clk_y = e.pageY - target.offsetTop;
                    }
                }
                // clear form vars
                setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
            });
        };

        // ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
        $.fn.ajaxFormUnbind = function() {
            return this.unbind('submit.form-plugin click.form-plugin');
        };

        /**
        * formToArray() gathers form element data into an array of objects that can
        * be passed to any of the following ajax functions: $.get, $.post, or load.
        * Each object in the array has both a 'name' and 'value' property.  An example of
        * an array for a simple login form might be:
        *
        * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
        *
        * It is this array that is passed to pre-submit callback functions provided to the
        * ajaxSubmit() and ajaxForm() methods.
        */
        $.fn.formToArray = function(semantic) {
            var a = [];
            if (this.length === 0) {
                return a;
            }

            var form = this[0];
            var els = semantic ? form.getElementsByTagName('*') : form.elements;
            if (!els) {
                return a;
            }

            var i, j, n, v, el;
            for (i = 0, max = els.length; i < max; i++) {
                el = els[i];
                n = el.name;
                if (!n) {
                    continue;
                }

                if (semantic && form.clk && el.type == "image") {
                    // handle image inputs on the fly when semantic == true
                    if (!el.disabled && form.clk == el) {
                        a.push({ name: n, value: $(el).val() });
                        a.push({ name: n + '.x', value: form.clk_x }, { name: n + '.y', value: form.clk_y });
                    }
                    continue;
                }

                v = $.fieldValue(el, true);
                if (v && v.constructor == Array) {
                    for (j = 0, jmax = v.length; j < jmax; j++) {
                        a.push({ name: n, value: v[j] });
                    }
                }
                else if (v !== null && typeof v != 'undefined') {
                    a.push({ name: n, value: v });
                }
            }

            if (!semantic && form.clk) {
                // input type=='image' are not found in elements array! handle it here
                var $input = $(form.clk), input = $input[0];
                n = input.name;
                if (n && !input.disabled && input.type == 'image') {
                    a.push({ name: n, value: $input.val() });
                    a.push({ name: n + '.x', value: form.clk_x }, { name: n + '.y', value: form.clk_y });
                }
            }
            return a;
        };

        /**
        * Serializes form data into a 'submittable' string. This method will return a string
        * in the format: name1=value1&amp;name2=value2
        */
        $.fn.formSerialize = function(semantic) {
            //hand off to jQuery.param for proper encoding
            return $.param(this.formToArray(semantic));
        };

        /**
        * Serializes all field elements in the jQuery object into a query string.
        * This method will return a string in the format: name1=value1&amp;name2=value2
        */
        $.fn.fieldSerialize = function(successful) {
            var a = [];
            this.each(function() {
                var n = this.name;
                if (!n) {
                    return;
                }
                var v = $.fieldValue(this, successful);
                if (v && v.constructor == Array) {
                    for (var i = 0, max = v.length; i < max; i++) {
                        a.push({ name: n, value: v[i] });
                    }
                }
                else if (v !== null && typeof v != 'undefined') {
                    a.push({ name: this.name, value: v });
                }
            });
            //hand off to jQuery.param for proper encoding
            return $.param(a);
        };

        /**
        * Returns the value(s) of the element in the matched set.  For example, consider the following form:
        *
        *  <form><fieldset>
        *	  <input name="A" type="text" />
        *	  <input name="A" type="text" />
        *	  <input name="B" type="checkbox" value="B1" />
        *	  <input name="B" type="checkbox" value="B2"/>
        *	  <input name="C" type="radio" value="C1" />
        *	  <input name="C" type="radio" value="C2" />
        *  </fieldset></form>
        *
        *  var v = $(':text').fieldValue();
        *  // if no values are entered into the text inputs
        *  v == ['','']
        *  // if values entered into the text inputs are 'foo' and 'bar'
        *  v == ['foo','bar']
        *
        *  var v = $(':checkbox').fieldValue();
        *  // if neither checkbox is checked
        *  v === undefined
        *  // if both checkboxes are checked
        *  v == ['B1', 'B2']
        *
        *  var v = $(':radio').fieldValue();
        *  // if neither radio is checked
        *  v === undefined
        *  // if first radio is checked
        *  v == ['C1']
        *
        * The successful argument controls whether or not the field element must be 'successful'
        * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
        * The default value of the successful argument is true.  If this value is false the value(s)
        * for each element is returned.
        *
        * Note: This method *always* returns an array.  If no valid value can be determined the
        *	   array will be empty, otherwise it will contain one or more values.
        */
        $.fn.fieldValue = function(successful) {
            for (var val = [], i = 0, max = this.length; i < max; i++) {
                var el = this[i];
                var v = $.fieldValue(el, successful);
                if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
                    continue;
                }
                v.constructor == Array ? $.merge(val, v) : val.push(v);
            }
            return val;
        };

        /**
        * Returns the value of the field element.
        */
        $.fieldValue = function(el, successful) {
            var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
            if (successful === undefined) {
                successful = true;
            }

            if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
		(t == 'checkbox' || t == 'radio') && !el.checked ||
		(t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
		tag == 'select' && el.selectedIndex == -1)) {
                return null;
            }

            if (tag == 'select') {
                var index = el.selectedIndex;
                if (index < 0) {
                    return null;
                }
                var a = [], ops = el.options;
                var one = (t == 'select-one');
                var max = (one ? index + 1 : ops.length);
                for (var i = (one ? index : 0); i < max; i++) {
                    var op = ops[i];
                    if (op.selected) {
                        var v = op.value;
                        if (!v) { // extra pain for IE...
                            v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
                        }
                        if (one) {
                            return v;
                        }
                        a.push(v);
                    }
                }
                return a;
            }
            if ($(el).attr('watermark')) {
                if ($(el).attr('watermark') == $(el).val()) return '';
            }
            return $(el).val();
        };

        /**
        * Clears the form data.  Takes the following actions on the form's input fields:
        *  - input text fields will have their 'value' property set to the empty string
        *  - select elements will have their 'selectedIndex' property set to -1
        *  - checkbox and radio inputs will have their 'checked' property set to false
        *  - inputs of type submit, button, reset, and hidden will *not* be effected
        *  - button elements will *not* be effected
        */
        $.fn.clearForm = function() {
            return this.each(function() {
                $('input,select,textarea', this).clearFields();
            });
        };

        /**
        * Clears the selected form elements.
        */
        $.fn.clearFields = $.fn.clearInputs = function() {
            return this.each(function() {
                var t = this.type, tag = this.tagName.toLowerCase();
                if (t == 'text' || t == 'password' || tag == 'textarea') {
                    this.value = '';
                }
                else if (t == 'checkbox' || t == 'radio') {
                    this.checked = false;
                }
                else if (tag == 'select') {
                    this.selectedIndex = -1;
                }
            });
        };

        /**
        * Resets the form data.  Causes all form elements to be reset to their original value.
        */
        $.fn.resetForm = function() {
            return this.each(function() {
                // guard against an input with the name of 'reset'
                // note that IE reports the reset function as an 'object'
                if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
                    this.reset();
                }
            });
        };

        /**
        * Enables or disables any matching elements.
        */
        $.fn.enable = function(b) {
            if (b === undefined) {
                b = true;
            }
            return this.each(function() {
                this.disabled = !b;
            });
        };

        /**
        * Checks/unchecks any matching checkboxes or radio buttons and
        * selects/deselects and matching option elements.
        */
        $.fn.selected = function(select) {
            if (select === undefined) {
                select = true;
            }
            return this.each(function() {
                var t = this.type;
                if (t == 'checkbox' || t == 'radio') {
                    this.checked = select;
                }
                else if (this.tagName.toLowerCase() == 'option') {
                    var $sel = $(this).parent('select');
                    if (select && $sel[0] && $sel[0].type == 'select-one') {
                        // deselect all other options
                        $sel.find('option').selected(false);
                    }
                    this.selected = select;
                }
            });
        };

        //将按钮绑定为ajax提交
        $.fn.bindAjax = function(options) {

        }

        // helper fn for console logging
        // set $.fn.ajaxSubmit.debug to true to enable debug logging
        function log() {
            if ($.fn.ajaxSubmit.debug) {
                var msg = '[jquery.form] ' + Array.prototype.join.call(arguments, '');
                if (window.console && window.console.log) {
                    window.console.log(msg);
                }
                else if (window.opera && window.opera.postError) {
                    window.opera.postError(msg);
                }
            }
        };

    })(jQuery);

    //从按钮ajax提交按钮所在的表单
    $.fn.submitForm = function(options) {
        var opt = options || {};
        opt.dataType = opt.dataType || 'json';
        //
        if (typeof opt.showRunning == 'undefined') opt.showRunning = true;
        opt.success = function(fn, btn) {
            return function(data, frm) {
                if (opt.showRunning) btn.stopRunning();
                try {
                    if (fn) {
                        return fn(data, frm);
                    }
                } catch (e) { }
            };
        } (opt.success, this);

        var btn = this;
        opt.complete = function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus != 'success') {
                //alert('Request status:' + XMLHttpRequest.status + '\n' + 'Text status:' + textStatus + '\nerrorThrown:' + errorThrown);
                $.showError();
            }
            if (opt.showRunning) btn.stopRunning();
        }

        opt.beforeSubmit = function(fn, btn) {
            return function(data, frm) {
                var willSubmit = false;
                try {
                    if (fn) {
                        willSubmit = fn(data, frm);
                    } else {
                        willSubmit = true;
                    }
                } catch (e) { }
                if (willSubmit && opt.showRunning) {
                
                     btn.running();
                }     
                return willSubmit;
            };
        } (opt.beforeSubmit, this);
        var form =opt.formID?$("#"+opt.formID):this.closest('form'); //var form = this.closest('form');
        form.ajaxSubmit(opt);
        return this;
    }

    //给表单中可能出现的文本框绑定回车事件，当回车时执行某个方法，并返回false以阻止提交表单
    $.fn.liveEnter = function(fn) {
        this.live(':text').keydown(function(event) {
            var e = $.event.fix(event);
            if (e.keyCode == 13) {
                if ($.isFunction(fn)) {
                    try {
                        fn();
                    } catch (e) { }
                }
                return false;
            }
            return true;
        });
    }

    //给表单中的文本框绑定回车事件，当回车时执行某个方法，并返回false以阻止提交表单
    $.fn.bindEnter = function(fn) {
        this.find(':text').keydown(function(event) {

            var e = $.event.fix(event);
            if (e.keyCode == 13) {
                try {
                    if ($.isFunction(fn)) {
                        fn();
                    }
                } catch (e) { }
                return false;
            }
            return true;
        });
    };

    $.fn.proxyClick = function(btn) {
        try {
            if (typeof btn == 'string') {
                btn = $(btn);
            }
            btn.click();
        } catch (e) { }
        return false;
    };

    $.fn.selectedText = function() {
        return this.find('option[value=' + this.val() + ']').text();
    }

    //调用 $.getJSON方法去获取数据
    //url--请求的地址
    //data--要传递的参数
    //callback成功的回调
    //error--失败的回调
    $.fn.getJSON = function(url, data, callback, error, async) {
        var success = callback;
        var errorFn = null;
        var complete = null;
        var d = data;
        if (typeof data == 'function') {
            success = data;
            error = callback;
            async = error;
            d = {};
        }
        if (typeof error == 'boolean') {
            async = error;
        }
        if (async == 'undefined') {
            async = true;
        }
        success = function(fn, btn) {
            return function(json) {
                btn.stopRunning();
                try {
                    if (fn) {
                        return fn(json);
                    }
                } catch (e) {
                    //alert(e.message); 
                }
            };
        } (success, this);
        complete = function(btn) {
            return function(XMLHttpRequest, textStatus) {
                btn.stopRunning();
            };
        } (this);
        errorFn = function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == 'error') {
                //alert(XMLHttpRequest.status);
            }
            if (error) {
                error(XMLHttpRequest, textStatus, errorThrown);
            } else {
                $.showError();
            }
        };
        this.running();
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            data: d,
            async: async,
            success: success,
            error: errorFn,
            complete: complete
        });
    }

    //调用 $.get方法去获取数据
    //url--请求的地址
    //data--要传递的参数
    //callback成功的回调
    //error--失败的回调
    $.fn.getHTML = function(url, data, callback, error) {
        var success = callback;
        var errorFn = null;
        var complete = null;
        var d = data;
        if (typeof data == 'function') {
            success = data;
            error = callback;
            d = {};
        }
        success = function(fn, btn) {
            return function(json) {
                btn.stopRunning();
                try {
                    if (fn) {
                        return fn(json);
                    }
                } catch (e) { alert(e.message); }
            };
        } (success, this);
        complete = function(btn) {
            return function(XMLHttpRequest, textStatus) {
                btn.stopRunning();
            };
        } (this);
        errorFn = function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == 'error') {
                alert(XMLHttpRequest.status);
            }
            if (error) {
                error(XMLHttpRequest, textStatus, errorThrown);
            }
        };
        this.running();
        $.ajax({
            type: "GET",
            url: url,
            dataType: "html",
            data: d,
            success: success,
            error: errorFn,
            complete: complete
        });
    }

 