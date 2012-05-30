/*! HTML5 Shiv vpre3.6 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
;(function(window, document) {

    /** Preset options */
    var options = window.html5 || {};

    /** Used to skip problem elements */
    var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

    /** Not all elements can be cloned in IE (this list can be shortend) **/
    var saveClones = /^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i;

    /** Detect whether the browser supports default html5 styles */
    var supportsHtml5Styles;

    /** Name of the expando, to work with multiple documents or to re-shiv one document */
    var expando = '_html5shiv';

    /** The id for the the documents expando */
    var expanID = 0;

    /** Cached data for each document */
    var expandoData = {};

    /** Detect whether the browser supports unknown elements */
    var supportsUnknownElements;

    (function() {
        var a = document.createElement('a');

        a.innerHTML = '<xyz></xyz>';

        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
        supportsHtml5Styles = ('hidden' in a);

        supportsUnknownElements = a.childNodes.length == 1 || (function() {
            // assign a false positive if unable to shiv
            try {
                (document.createElement)('a');
            } catch(e) {
                return true;
            }
            var frag = document.createDocumentFragment();
            return (
                typeof frag.cloneNode == 'undefined' ||
                    typeof frag.createDocumentFragment == 'undefined' ||
                    typeof frag.createElement == 'undefined'
                );
        }());

    }());

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a style sheet with the given CSS text and adds it to the document.
     * @private
     * @param {Document} ownerDocument The document.
     * @param {String} cssText The CSS text.
     * @returns {StyleSheet} The style element.
     */
    function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
    }

    /**
     * Returns the value of `html5.elements` as an array.
     * @private
     * @returns {Array} An array of shived element node names.
     */
    function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
    }

    /**
     * Returns the data associated to the given document
     * @private
     * @param {Document} ownerDocument The document.
     * @returns {Object} An object of data.
     */
    function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
    }

    /**
     * returns a shived element for the given nodeName and document
     * @memberOf html5
     * @param {String} nodeName name of the element
     * @param {Document} ownerDocument The context document.
     * @returns {Object} The shived element.
     */
    function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        data = data || getExpandoData(ownerDocument);
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

        // Avoid adding some elements to fragments in IE < 9 because
        // * Attributes like `name` or `type` cannot be set/changed once an element
        //   is inserted into a document/fragment
        // * Link elements with `src` attributes that are inaccessible, as with
        //   a 403 response, will cause the tab/window to crash
        // * Script elements appended to fragments will execute when their `src`
        //   or `text` property is set
        return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
    }

    /**
     * returns a shived DocumentFragment for the given document
     * @memberOf html5
     * @param {Document} ownerDocument The context document.
     * @returns {Object} The shived DocumentFragment.
     */
    function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
    }

    /**
     * Shivs the `createElement` and `createDocumentFragment` methods of the document.
     * @private
     * @param {Document|DocumentFragment} ownerDocument The document.
     * @param {Object} data of the document.
     */
    function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
                return data.createElem(nodeName);
            }
            return createElement(nodeName);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
            'var n=f.cloneNode(),c=n.createElement;' +
            'h.shivMethods&&(' +
            // unroll the `createElement` calls
            getElements().join().replace(/\w+/g, function(nodeName) {
                data.createElem(nodeName);
                data.frag.createElement(nodeName);
                return 'c("' + nodeName + '")';
            }) +
            ');return n}'
        )(html5, data.frag);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Shivs the given document.
     * @memberOf html5
     * @param {Document} ownerDocument The document to shiv.
     * @returns {Document} The shived document.
     */
    function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                // corrects block display not defined in IE6/7/8/9
                'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
                    // adds styling not present in IE6/7/8/9
                    'mark{background:#FF0;color:#000}'
            );
        }
        if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
        }
        return ownerDocument;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * The `html5` object is exposed so that more elements can be shived and
     * existing shiving can be detected on iframes.
     * @type Object
     * @example
     *
     * // options can be changed before the script is included
     * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
     */
    var html5 = {

        /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

        /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
        'shivCSS': !(options.shivCSS === false),

        /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
        'shivMethods': !(options.shivMethods === false),

        /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
        'type': 'default',

        // shivs the document according to the specified `html5` object options
        'shivDocument': shivDocument,

        //creates a shived element
        createElement: createElement,

        //creates a shived documentFragment
        createDocumentFragment: createDocumentFragment
    };

    /*--------------------------------------------------------------------------*/

    // expose html5
    window.html5 = html5;

    // shiv the document
    shivDocument(document);

}(this, document));

/*
 selectivizr v1.0.3b - (c) Keith Clark, freely distributable under the terms
 of the MIT license.

 selectivizr.com
 */
/*

 Notes about this source
 -----------------------

 * The #DEBUG_START and #DEBUG_END comments are used to mark blocks of code
 that will be removed prior to building a final release version (using a
 pre-compression script)


 References:
 -----------

 * CSS Syntax          : http://www.w3.org/TR/2003/WD-css3-syntax-20030813/#style
 * Selectors           : http://www.w3.org/TR/css3-selectors/#selectors
 * IE Compatability    : http://msdn.microsoft.com/en-us/library/cc351024(VS.85).aspx
 * W3C Selector Tests  : http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/

 */

(function(win) {

    // If browser isn't IE, then stop execution! This handles the script
    // being loaded by non IE browsers because the developer didn't use
    // conditional comments.
    if (/*@cc_on!@*/true) return;

    // =========================== Init Objects ============================

    var doc = document;
    var root = doc.documentElement;
    var xhr = getXHRObject();
    var ieVersion = /MSIE (\d+)/.exec(navigator.userAgent)[1];

    // If were not in standards mode, IE is too old / new or we can't create
    // an XMLHttpRequest object then we should get out now.
    if (doc.compatMode != 'CSS1Compat' || ieVersion<6 || ieVersion>8 || !xhr) {
        return;
    }


    // ========================= Common Objects ============================

    // Compatiable selector engines in order of CSS3 support. Note: '*' is
    // a placholder for the object key name. (basically, crude compression)
    var selectorEngines = {
        "NW"								: "*.Dom.select",
        "MooTools"							: "$$",
        "DOMAssistant"						: "*.$",
        "Prototype"							: "$$",
        "YAHOO"								: "*.util.Selector.query",
        "Sizzle"							: "*",
        "jQuery"							: "*",
        "dojo"								: "*.query"
    };

    var selectorMethod;
    var enabledWatchers 					= [];     // array of :enabled/:disabled elements to poll
    var domPatches							= [];
    var ie6PatchID 							= 0;      // used to solve ie6's multiple class bug
    var patchIE6MultipleClasses				= true;   // if true adds class bloat to ie6
    var namespace 							= "slvzr";

    // Stylesheet parsing regexp's
    var RE_COMMENT							= /(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*?/g;
    var RE_IMPORT							= /@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))\s*([^;]*);/g;
    var RE_ASSET_URL 						= /\burl\(\s*(["']?)(?!data:)([^"')]+)\1\s*\)/g;
    var RE_PSEUDO_STRUCTURAL				= /^:(empty|(first|last|only|nth(-last)?)-(child|of-type))$/;
    var RE_PSEUDO_ELEMENTS					= /:(:first-(?:line|letter))/g;
    var RE_SELECTOR_GROUP					= /((?:^|(?:\s*})+)(?:\s*@media[^{]+{)?)\s*([^\{]*?[\[:][^{]+)/g;
    var RE_SELECTOR_PARSE					= /([ +~>])|(:[a-z-]+(?:\(.*?\)+)?)|(\[.*?\])/g;
    var RE_LIBRARY_INCOMPATIBLE_PSEUDOS		= /(:not\()?:(hover|enabled|disabled|focus|checked|target|active|visited|first-line|first-letter)\)?/g;
    var RE_PATCH_CLASS_NAME_REPLACE			= /[^\w-]/g;

    // HTML UI element regexp's
    var RE_INPUT_ELEMENTS					= /^(INPUT|SELECT|TEXTAREA|BUTTON)$/;
    var RE_INPUT_CHECKABLE_TYPES			= /^(checkbox|radio)$/;

    // Broken attribute selector implementations (IE7/8 native [^=""], [$=""] and [*=""])
    var BROKEN_ATTR_IMPLEMENTATIONS			= ieVersion>6 ? /[\$\^*]=(['"])\1/ : null;

    // Whitespace normalization regexp's
    var RE_TIDY_TRAILING_WHITESPACE			= /([(\[+~])\s+/g;
    var RE_TIDY_LEADING_WHITESPACE			= /\s+([)\]+~])/g;
    var RE_TIDY_CONSECUTIVE_WHITESPACE		= /\s+/g;
    var RE_TIDY_TRIM_WHITESPACE				= /^\s*((?:[\S\s]*\S)?)\s*$/;

    // String constants
    var EMPTY_STRING						= "";
    var SPACE_STRING						= " ";
    var PLACEHOLDER_STRING					= "$1";

    // =========================== Patching ================================

    // --[ patchStyleSheet() ]----------------------------------------------
    // Scans the passed cssText for selectors that require emulation and
    // creates one or more patches for each matched selector.
    function patchStyleSheet( cssText ) {
        return cssText.replace(RE_PSEUDO_ELEMENTS, PLACEHOLDER_STRING).
            replace(RE_SELECTOR_GROUP, function(m, prefix, selectorText) {
                var selectorGroups = selectorText.split(",");
                for (var c = 0, cs = selectorGroups.length; c < cs; c++) {
                    var selector = normalizeSelectorWhitespace(selectorGroups[c]) + SPACE_STRING;
                    var patches = [];
                    selectorGroups[c] = selector.replace(RE_SELECTOR_PARSE,
                        function(match, combinator, pseudo, attribute, index) {
                            if (combinator) {
                                if (patches.length>0) {
                                    domPatches.push( { selector: selector.substring(0, index), patches: patches } )
                                    patches = [];
                                }
                                return combinator;
                            }
                            else {
                                var patch = (pseudo) ? patchPseudoClass( pseudo ) : patchAttribute( attribute );
                                if (patch) {
                                    patches.push(patch);
                                    return "." + patch.className;
                                }
                                return match;
                            }
                        }
                    );
                }
                return prefix + selectorGroups.join(",");
            });
    };

    // --[ patchAttribute() ]-----------------------------------------------
    // returns a patch for an attribute selector.
    function patchAttribute( attr ) {
        return (!BROKEN_ATTR_IMPLEMENTATIONS || BROKEN_ATTR_IMPLEMENTATIONS.test(attr)) ?
        { className: createClassName(attr), applyClass: true } : null;
    };

    // --[ patchPseudoClass() ]---------------------------------------------
    // returns a patch for a pseudo-class
    function patchPseudoClass( pseudo ) {

        var applyClass = true;
        var className = createClassName(pseudo.slice(1));
        var isNegated = pseudo.substring(0, 5) == ":not(";
        var activateEventName;
        var deactivateEventName;

        // if negated, remove :not()
        if (isNegated) {
            pseudo = pseudo.slice(5, -1);
        }

        // bracket contents are irrelevant - remove them
        var bracketIndex = pseudo.indexOf("(")
        if (bracketIndex > -1) {
            pseudo = pseudo.substring(0, bracketIndex);
        }

        // check we're still dealing with a pseudo-class
        if (pseudo.charAt(0) == ":") {
            switch (pseudo.slice(1)) {

                case "root":
                    applyClass = function(e) {
                        return isNegated ? e != root : e == root;
                    }
                    break;

                case "target":
                    // :target is only supported in IE8
                    if (ieVersion == 8) {
                        applyClass = function(e) {
                            var handler = function() {
                                var hash = location.hash;
                                var hashID = hash.slice(1);
                                return isNegated ? (hash == EMPTY_STRING || e.id != hashID) : (hash != EMPTY_STRING && e.id == hashID);
                            };
                            addEvent( win, "hashchange", function() {
                                toggleElementClass(e, className, handler());
                            })
                            return handler();
                        }
                        break;
                    }
                    return false;

                case "checked":
                    applyClass = function(e) {
                        if (RE_INPUT_CHECKABLE_TYPES.test(e.type)) {
                            addEvent( e, "propertychange", function() {
                                if (event.propertyName == "checked") {
                                    toggleElementClass( e, className, e.checked !== isNegated );
                                }
                            })
                        }
                        return e.checked !== isNegated;
                    }
                    break;

                case "disabled":
                    isNegated = !isNegated;

                case "enabled":
                    applyClass = function(e) {
                        if (RE_INPUT_ELEMENTS.test(e.tagName)) {
                            addEvent( e, "propertychange", function() {
                                if (event.propertyName == "$disabled") {
                                    toggleElementClass( e, className, e.$disabled === isNegated );
                                }
                            });
                            enabledWatchers.push(e);
                            e.$disabled = e.disabled;
                            return e.disabled === isNegated;
                        }
                        return pseudo == ":enabled" ? isNegated : !isNegated;
                    }
                    break;

                case "focus":
                    activateEventName = "focus";
                    deactivateEventName = "blur";

                case "hover":
                    if (!activateEventName) {
                        activateEventName = "mouseenter";
                        deactivateEventName = "mouseleave";
                    }
                    applyClass = function(e) {
                        addEvent( e, isNegated ? deactivateEventName : activateEventName, function() {
                            toggleElementClass( e, className, true );
                        })
                        addEvent( e, isNegated ? activateEventName : deactivateEventName, function() {
                            toggleElementClass( e, className, false );
                        })
                        return isNegated;
                    }
                    break;

                // everything else
                default:
                    // If we don't support this pseudo-class don't create
                    // a patch for it
                    if (!RE_PSEUDO_STRUCTURAL.test(pseudo)) {
                        return false;
                    }
                    break;
            }
        }
        return { className: className, applyClass: applyClass };
    };

    // --[ applyPatches() ]-------------------------------------------------
    function applyPatches() {
        var elms, selectorText, patches, domSelectorText;

        for (var c=0; c<domPatches.length; c++) {
            selectorText = domPatches[c].selector;
            patches = domPatches[c].patches;

            // Although some selector libraries can find :checked :enabled etc.
            // we need to find all elements that could have that state because
            // it can be changed by the user.
            domSelectorText = selectorText.replace(RE_LIBRARY_INCOMPATIBLE_PSEUDOS, EMPTY_STRING);

            // If the dom selector equates to an empty string or ends with
            // whitespace then we need to append a universal selector (*) to it.
            if (domSelectorText == EMPTY_STRING || domSelectorText.charAt(domSelectorText.length - 1) == SPACE_STRING) {
                domSelectorText += "*";
            }

            // Ensure we catch errors from the selector library
            try {
                elms = selectorMethod( domSelectorText );
            } catch (ex) {
                // #DEBUG_START
                log( "Selector '" + selectorText + "' threw exception '" + ex + "'" );
                // #DEBUG_END
            }


            if (elms) {
                for (var d = 0, dl = elms.length; d < dl; d++) {
                    var elm = elms[d];
                    var cssClasses = elm.className;
                    for (var f = 0, fl = patches.length; f < fl; f++) {
                        var patch = patches[f];
                        if (!hasPatch(elm, patch)) {
                            if (patch.applyClass && (patch.applyClass === true || patch.applyClass(elm) === true)) {
                                cssClasses = toggleClass(cssClasses, patch.className, true );
                            }
                        }
                    }
                    elm.className = cssClasses;
                }
            }
        }
    };

    // --[ hasPatch() ]-----------------------------------------------------
    // checks for the exsistence of a patch on an element
    function hasPatch( elm, patch ) {
        return new RegExp("(^|\\s)" + patch.className + "(\\s|$)").test(elm.className);
    };


    // =========================== Utility =================================

    function createClassName( className ) {
        return namespace + "-" + ((ieVersion == 6 && patchIE6MultipleClasses) ?
            ie6PatchID++
            :
            className.replace(RE_PATCH_CLASS_NAME_REPLACE, function(a) { return a.charCodeAt(0) }));
    };

    // --[ log() ]----------------------------------------------------------
    // #DEBUG_START
    function log( message ) {
        if (win.console) {
            win.console.log(message);
        }
    };
    // #DEBUG_END

    // --[ trim() ]---------------------------------------------------------
    // removes leading, trailing whitespace from a string
    function trim( text ) {
        return text.replace(RE_TIDY_TRIM_WHITESPACE, PLACEHOLDER_STRING);
    };

    // --[ normalizeWhitespace() ]------------------------------------------
    // removes leading, trailing and consecutive whitespace from a string
    function normalizeWhitespace( text ) {
        return trim(text).replace(RE_TIDY_CONSECUTIVE_WHITESPACE, SPACE_STRING);
    };

    // --[ normalizeSelectorWhitespace() ]----------------------------------
    // tidies whitespace around selector brackets and combinators
    function normalizeSelectorWhitespace( selectorText ) {
        return normalizeWhitespace(selectorText.
            replace(RE_TIDY_TRAILING_WHITESPACE, PLACEHOLDER_STRING).
            replace(RE_TIDY_LEADING_WHITESPACE, PLACEHOLDER_STRING)
        );
    };

    // --[ toggleElementClass() ]-------------------------------------------
    // toggles a single className on an element
    function toggleElementClass( elm, className, on ) {
        var oldClassName = elm.className;
        var newClassName = toggleClass(oldClassName, className, on);
        if (newClassName != oldClassName) {
            elm.className = newClassName;
            elm.parentNode.className += EMPTY_STRING;
        }
    };

    // --[ toggleClass() ]--------------------------------------------------
    // adds / removes a className from a string of classNames. Used to
    // manage multiple class changes without forcing a DOM redraw
    function toggleClass( classList, className, on ) {
        var re = RegExp("(^|\\s)" + className + "(\\s|$)");
        var classExists = re.test(classList);
        if (on) {
            return classExists ? classList : classList + SPACE_STRING + className;
        } else {
            return classExists ? trim(classList.replace(re, PLACEHOLDER_STRING)) : classList;
        }
    };

    // --[ addEvent() ]-----------------------------------------------------
    function addEvent(elm, eventName, eventHandler) {
        elm.attachEvent("on" + eventName, eventHandler);
    };

    // --[ getXHRObject() ]-------------------------------------------------
    function getXHRObject() {
        if (win.XMLHttpRequest) {
            return new XMLHttpRequest;
        }
        try	{
            return new ActiveXObject('Microsoft.XMLHTTP');
        } catch(e) {
            return null;
        }
    };

    // --[ loadStyleSheet() ]-----------------------------------------------
    function loadStyleSheet( url ) {
        xhr.open("GET", url, false);
        xhr.send();
        return (xhr.status==200) ? xhr.responseText : EMPTY_STRING;
    };

    // --[ resolveUrl() ]---------------------------------------------------
    // Converts a URL fragment to a fully qualified URL using the specified
    // context URL. Returns null if same-origin policy is broken
    function resolveUrl( url, contextUrl, ignoreSameOriginPolicy ) {

        function getProtocolAndHost( url ) {
            return url.substring(0, url.indexOf("/", 8));
        };

        if (!contextUrl) {
            contextUrl = baseUrl;
        }

        // absolute path
        if (/^https?:\/\//i.test(url)) {
            return !ignoreSameOriginPolicy || getProtocolAndHost(contextUrl) == getProtocolAndHost(url) ? url : null;
        }

        // root-relative path
        if (url.charAt(0)=="/")	{
            return getProtocolAndHost(contextUrl) + url;
        }

        // relative path
        var contextUrlPath = contextUrl.split(/[?#]/)[0]; // ignore query string in the contextUrl
        if (url.charAt(0) != "?" && contextUrlPath.charAt(contextUrlPath.length - 1) != "/") {
            contextUrlPath = contextUrlPath.substring(0, contextUrlPath.lastIndexOf("/") + 1);
        }

        return contextUrlPath + url;
    };

    // --[ parseStyleSheet() ]----------------------------------------------
    // Downloads the stylesheet specified by the URL, removes it's comments
    // and recursivly replaces @import rules with their contents, ultimately
    // returning the full cssText.
    function parseStyleSheet( url ) {
        if (url) {
            return loadStyleSheet(url).replace(RE_COMMENT, EMPTY_STRING).
                replace(RE_IMPORT, function( match, quoteChar, importUrl, quoteChar2, importUrl2, media ) {
                    var cssText = parseStyleSheet(resolveUrl(importUrl || importUrl2, url, true));
                    return (media) ? "@media " + media + " {" + cssText + "}" : cssText;
                }).
                replace(RE_ASSET_URL, function( match, quoteChar, assetUrl ) {
                    quoteChar = quoteChar || EMPTY_STRING;
                    return " url(" + quoteChar + resolveUrl(assetUrl, url) + quoteChar + ") ";
                });
        }
        return EMPTY_STRING;
    };

    // --[ getStyleSheets() ]-----------------------------------------------
    function getStyleSheets() {
        var url, stylesheet;
        for (var c = 0; c < doc.styleSheets.length; c++) {
            stylesheet = doc.styleSheets[c];
            if (stylesheet.href != EMPTY_STRING) {
                url = resolveUrl(stylesheet.href);
                if (url) {
                    stylesheet.cssText = stylesheet.rawCssText = patchStyleSheet( parseStyleSheet( url ) );
                }
            }
        }
    };

    // --[ init() ]---------------------------------------------------------
    function init() {
        applyPatches();

        // :enabled & :disabled polling script (since we can't hook
        // onpropertychange event when an element is disabled)
        if (enabledWatchers.length > 0) {
            setInterval( function() {
                for (var c = 0, cl = enabledWatchers.length; c < cl; c++) {
                    var e = enabledWatchers[c];
                    if (e.disabled !== e.$disabled) {
                        if (e.disabled) {
                            e.disabled = false;
                            e.$disabled = true;
                            e.disabled = true;
                        }
                        else {
                            e.$disabled = e.disabled;
                        }
                    }
                }
            }, 250)
        }
    };

    // Determine the baseUrl and download the stylesheets
    var baseTags = doc.getElementsByTagName("BASE");
    var baseUrl = (baseTags.length > 0) ? baseTags[0].href : doc.location.href;
    getStyleSheets();

    // Bind selectivizr to the ContentLoaded event.
    ContentLoaded(win, function() {
        // Determine the "best fit" selector engine
        for (var engine in selectorEngines) {
            var members, member, context = win;
            if (win[engine]) {
                members = selectorEngines[engine].replace("*", engine).split(".");
                while ((member = members.shift()) && (context = context[member])) {}
                if (typeof context == "function") {
                    selectorMethod = context;
                    init();
                    return;
                }
            }
        }
    });



    /*!
     * ContentLoaded.js by Diego Perini, modified for IE<9 only (to save space)
     *
     * Author: Diego Perini (diego.perini at gmail.com)
     * Summary: cross-browser wrapper for DOMContentLoaded
     * Updated: 20101020
     * License: MIT
     * Version: 1.2
     *
     * URL:
     * http://javascript.nwbox.com/ContentLoaded/
     * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
     *
     */

    // @w window reference
    // @f function reference
    function ContentLoaded(win, fn) {

        var done = false, top = true,
            init = function(e) {
                if (e.type == "readystatechange" && doc.readyState != "complete") return;
                (e.type == "load" ? win : doc).detachEvent("on" + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },
            poll = function() {
                try { root.doScroll("left"); } catch(e) { setTimeout(poll, 50); return; }
                init('poll');
            };

        if (doc.readyState == "complete") fn.call(win, EMPTY_STRING);
        else {
            if (doc.createEventObject && root.doScroll) {
                try { top = !win.frameElement; } catch(e) { }
                if (top) poll();
            }
            addEvent(doc,"readystatechange", init);
            addEvent(win,"load", init);
        }
    };
})(this);



/*
 * respond.js - A small and fast polyfill for min/max-width CSS3 Media Queries
 * Copyright 2011, Scott Jehl, scottjehl.com
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Usage: Check out the readme file or github.com/scottjehl/respond
 */
(function( win, mqSupported ){
    //exposed namespace
    win.respond		= {};

    //define update even in native-mq-supporting browsers, to avoid errors
    respond.update	= function(){};

    //expose media query support flag for external use
    respond.mediaQueriesSupported	= mqSupported;

    //if media queries are supported, exit here
    if( mqSupported ){ return; }

    //define vars
    var doc 			= win.document,
        docElem 		= doc.documentElement,
        mediastyles		= [],
        rules			= [],
        appendedEls 	= [],
        parsedSheets 	= {},
        resizeThrottle	= 30,
        head 			= doc.getElementsByTagName( "head" )[0] || docElem,
        links			= head.getElementsByTagName( "link" ),
        requestQueue	= [],

    //loop stylesheets, send text content to translate
        ripCSS			= function(){
            var sheets 	= links,
                sl 		= sheets.length;

            for( var i = 0; i < sl; i++ ){
                var sheet		= sheets[ i ],
                    href		= sheet.href,
                    media		= sheet.media,
                    isCSS		= sheet.rel && sheet.rel.toLowerCase() === "stylesheet";

                if ( isCSS && sheet.styleSheet.rawCssText && !parsedSheets[ href ] ) {
                    translate( sheet.styleSheet.rawCssText, href, media );
                    parsedSheets[ href ] = true;
                }

                //only links plz and prevent re-parsing
                if( !!href && isCSS && !parsedSheets[ href ] ){
                    if( !/^([a-zA-Z]+?:(\/\/)?(www\.)?)/.test( href )
                        || href.replace( RegExp.$1, "" ).split( "/" )[0] === win.location.host ){
                        requestQueue.push( {
                            href: href,
                            media: media
                        } );
                    }
                    else{
                        parsedSheets[ href ] = true;
                    }
                }
            }
            makeRequests();

        },

    //recurse through request queue, get css text
        makeRequests	= function(){
            if( requestQueue.length ){
                var thisRequest = requestQueue.shift();

                ajax( thisRequest.href, function( styles ){
                    translate( styles, thisRequest.href, thisRequest.media );
                    parsedSheets[ thisRequest.href ] = true;
                    makeRequests();
                } );
            }
        },

    //find media blocks in css text, convert to style blocks
        translate		= function( styles, href, media ){
            var qs		= styles.match( /@media ([^\{]+)\{((?!@media)[\s\S])*(?=\}(?![^\{]*\}))/gmi ),
                ql		= qs && qs.length || 0,
            //try to get CSS path
                href	= href.substring( 0, href.lastIndexOf( "/" )),
                repUrls = function( css ){
                    return css.replace( /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + href + "$2$3" );
                },
                useMedia = !ql && media;

            //if path exists, tack on trailing slash
            if( href.length ){ href += "/"; }

            //if no internal queries exist, but media attr does, use that
            //note: this currently lacks support for situations where a media attr is specified on a link AND
            //its associated stylesheet has internal CSS media queries.
            //In those cases, the media attribute will currently be ignored.
            if( useMedia ){
                ql = 1;
            }


            for( var i = 0; i < ql; i++ ){
                var fullq;

                //media attr
                if( useMedia ){
                    fullq = media;
                    rules.push( repUrls( styles ) );
                }
                //parse for styles
                else{
                    fullq	= qs[ i ].match( /@media ([^\{]+)\{([\S\s]+?)$/ ) && RegExp.$1;
                    rules.push( RegExp.$2 && repUrls( RegExp.$2 ) );
                }

                var eachq	= fullq.split( "," ),
                    eql		= eachq.length;

                for( var j = 0; j < eql; j++ ){
                    var thisq	= eachq[ j ];
                    mediastyles.push( {
                        media	: thisq.match( /(only\s+)?([a-zA-Z]+)(\sand)?/ ) && RegExp.$2,
                        rules	: rules.length - 1,
                        minw	: thisq.match( /\(min\-width:[\s]*([\s]*[0-9]+)px[\s]*\)/ ) && parseFloat( RegExp.$1 ),
                        maxw	: thisq.match( /\(max\-width:[\s]*([\s]*[0-9]+)px[\s]*\)/ ) && parseFloat( RegExp.$1 )
                    } );
                }
            }

            applyMedia();
        },

        lastCall,

        resizeDefer,

    //enable/disable styles
        applyMedia			= function( fromResize ){
            var name		= "clientWidth",
                docElemProp	= docElem[ name ],
                currWidth 	= doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp,
                styleBlocks	= {},
                dFrag		= doc.createDocumentFragment(),
                lastLink	= links[ links.length-1 ],
                now 		= (new Date()).getTime();

            //throttle resize calls
            if( fromResize && lastCall && now - lastCall < resizeThrottle ){
                clearTimeout( resizeDefer );
                resizeDefer = setTimeout( applyMedia, resizeThrottle );
                return;
            }
            else {
                lastCall	= now;
            }

            for( var i in mediastyles ){
                var thisstyle = mediastyles[ i ];
                if( !thisstyle.minw && !thisstyle.maxw ||
                    ( !thisstyle.minw || thisstyle.minw && currWidth >= thisstyle.minw ) &&
                        (!thisstyle.maxw || thisstyle.maxw && currWidth <= thisstyle.maxw ) ){
                    if( !styleBlocks[ thisstyle.media ] ){
                        styleBlocks[ thisstyle.media ] = [];
                    }
                    styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] );
                }
            }

            //remove any existing respond style element(s)
            for( var i in appendedEls ){
                if( appendedEls[ i ] && appendedEls[ i ].parentNode === head ){
                    head.removeChild( appendedEls[ i ] );
                }
            }

            //inject active styles, grouped by media type
            for( var i in styleBlocks ){
                var ss		= doc.createElement( "style" ),
                    css		= styleBlocks[ i ].join( "\n" );

                ss.type = "text/css";
                ss.media	= i;

                if ( ss.styleSheet ){
                    ss.styleSheet.cssText = css;
                }
                else {
                    ss.appendChild( doc.createTextNode( css ) );
                }
                dFrag.appendChild( ss );
                appendedEls.push( ss );
            }

            //append to DOM at once
            head.insertBefore( dFrag, lastLink.nextSibling );
        },
    //tweaked Ajax functions from Quirksmode
        ajax = function( url, callback ) {
            var req = xmlHttp();
            if (!req){
                return;
            }
            req.open( "GET", url, true );
            req.onreadystatechange = function () {
                if ( req.readyState != 4 || req.status != 200 && req.status != 304 ){
                    return;
                }
                callback( req.responseText );
            }
            if ( req.readyState == 4 ){
                return;
            }
            req.send();
        },
    //define ajax obj
        xmlHttp = (function() {
            var xmlhttpmethod = false,
                attempts = [
                    function(){ return new ActiveXObject("Microsoft.XMLHTTP") },
                    function(){ return new ActiveXObject("Msxml3.XMLHTTP") },
                    function(){ return new ActiveXObject("Msxml2.XMLHTTP") },
                    function(){ return new XMLHttpRequest() }
                ],
                al = attempts.length;

            while( al-- ){
                try {
                    xmlhttpmethod = attempts[ al ]();
                }
                catch(e) {
                    continue;
                }
                break;
            }
            return function(){
                return xmlhttpmethod;
            };
        })();

    //translate CSS
    ripCSS();

    //expose update for re-running respond later on
    respond.update = ripCSS;

    //adjust on resize
    function callMedia(){
        applyMedia( true );
    }
    if( win.addEventListener ){
        win.addEventListener( "resize", callMedia, false );
    }
    else if( win.attachEvent ){
        win.attachEvent( "onresize", callMedia );
    }
})(
    this,
    (function( win ){

        //for speed, flag browsers with window.matchMedia support and IE 9 as supported
        if( win.matchMedia ){ return true; }

        var bool,
            doc			= document,
            docElem		= doc.documentElement,
            refNode		= docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
            fakeUsed	= !doc.body,
            fakeBody	= doc.body || doc.createElement( "body" ),
            div			= doc.createElement( "div" ),
            q			= "only all";

        div.id = "mq-test-1";
        div.style.cssText = "position:absolute;top:-99em";
        fakeBody.appendChild( div );

        div.innerHTML = '_<style media="'+q+'"> #mq-test-1 { width: 9px; }</style>';
        if( fakeUsed ){
            docElem.insertBefore( fakeBody, refNode );
        }
        div.removeChild( div.firstChild );
        bool = div.offsetWidth == 9;
        if( fakeUsed ){
            docElem.removeChild( fakeBody );
        }
        else{
            fakeBody.removeChild( div );
        }
        return bool;
    })( this )
);