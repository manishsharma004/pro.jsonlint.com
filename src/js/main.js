if (!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
        this.el = el;
        this.getPropertyValue = function(prop) {
            var re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
                prop = prop.replace(re, function () {
                    return arguments[2].toUpperCase();
                });
            }
            return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        }
        return this;
    }
}

/**
 * Helper Function for Caret positioning
 * Gratefully borrowed from the Masked Input Plugin by Josh Bush
 * http://digitalbush.com/projects/masked-input-plugin
**/
$.fn.caret = function (begin, end) {
    if (this.length === 0) {
        return;
    }
    if (typeof begin === 'number') {
        end = (typeof end === 'number') ? end : begin;
        return this.each(function () {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(begin, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', begin);
                range.select();
            }
        });
    } else {
        if (this[0].setSelectionRange) {
            begin = this[0].selectionStart;
            end   = this[0].selectionEnd;
        } else if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            begin = -range.duplicate().moveStart('character', -100000);
            end   = begin + range.text.length;
        }
        return {"begin": begin, "end": end};
    }
};

var utils = {
	/**
	 * Get a URL parameter from the current windows URL.
	 * Courtesy Paul Oppenheim: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
	 * @param name the parameter to retrieve
	 * @return string the url parameter's value, if any
	**/
	_getURLParameter : function (name) {
	    param = (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || ['', null])[1];

	    if (param) {
	        return decodeURIComponent(param);
	    } else {
	        return null;
	    }
	},

	/**
	 * This awesome function created by Rob W
	 * http://stackoverflow.com/users/938089/rob-w
	 * @param input          Required HTMLElement with `value` attribute
	 * @param selectionStart Optional number: Start offset. Default 0
	 * @param selectionEnd   Optional number: End offset. Default selectionStart
	 * @param debug          Optional boolean. If true, the created test layer will not be removed.
	 */
	getTextBoundingRect : function (input, selectionStart, selectionEnd, debug) {
		    // Basic parameter validation
		    if(!input || !('value' in input)) return input;
		    if(typeof selectionStart == "string") selectionStart = parseFloat(selectionStart);
		    if(typeof selectionStart != "number" || isNaN(selectionStart)) {
		        selectionStart = 0;
		    }
		    if(selectionStart < 0) selectionStart = 0;
		    else selectionStart = Math.min(input.value.length, selectionStart);
		    if(typeof selectionEnd == "string") selectionEnd = parseFloat(selectionEnd);
		    if(typeof selectionEnd != "number" || isNaN(selectionEnd) || selectionEnd < selectionStart) {
		        selectionEnd = selectionStart;
		    }
		    if (selectionEnd < 0) selectionEnd = 0;
		    else selectionEnd = Math.min(input.value.length, selectionEnd);

		    // If available (thus IE), use the createTextRange method
		    if (typeof input.createTextRange == "function") {
		        var range = input.createTextRange();
		        range.collapse(true);
		        range.moveStart('character', selectionStart);
		        range.moveEnd('character', selectionEnd - selectionStart);
		        return range.getBoundingClientRect();
		    }
		    // createTextRange is not supported, create a fake text range
		    var offset = getInputOffset(),
		        topPos = offset.top,
		        leftPos = offset.left,
		        width = getInputCSS('width', true),
		        height = getInputCSS('height', true);

		        // Styles to simulate a node in an input field
		    var cssDefaultStyles = "white-space:pre;padding:0;margin:0;",
		        listOfModifiers = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing'];

		    topPos += getInputCSS('padding-top', true);
		    topPos += isNaN(getInputCSS('border-top-width', true)) ? 0 : getInputCSS('border-top-width', true);
		    leftPos += getInputCSS('padding-left', true);
		    leftPos += isNaN(getInputCSS('border-left-width', true)) ? 0 : getInputCSS('border-left-width', true);
		    leftPos += 1; //Seems to be necessary

		    for (var i=0; i<listOfModifiers.length; i++) {
		        var property = listOfModifiers[i];
		        cssDefaultStyles += property + ':' + getInputCSS(property) +';';
		    }
		    // End of CSS variable checks

		    var text = input.value,
		        textLen = text.length,
		        fakeClone = document.createElement("div");
		    if(selectionStart > 0) appendPart(0, selectionStart);
		    var fakeRange = appendPart(selectionStart, selectionEnd);
		    if(textLen > selectionEnd) appendPart(selectionEnd, textLen);

		    // Styles to inherit the font styles of the element
		    fakeClone.style.cssText = cssDefaultStyles;

		    // Styles to position the text node at the desired position
		    fakeClone.style.position = "absolute";
		    fakeClone.style.top = topPos + "px";
		    fakeClone.style.left = leftPos + "px";
		    fakeClone.style.width = width + "px";
		    fakeClone.style.height = height + "px";
		    document.body.appendChild(fakeClone);
		    var returnValue = fakeRange.getBoundingClientRect(); //Get rect

		    if (!debug) fakeClone.parentNode.removeChild(fakeClone); //Remove temp
		    return returnValue;

		    // Local functions for readability of the previous code
		    function appendPart(start, end){
		        var span = document.createElement("span");
		        span.style.cssText = cssDefaultStyles; //Force styles to prevent unexpected results
		        span.textContent = text.substring(start, end);
		        fakeClone.appendChild(span);
		        return span;
		    }
		    // Computing offset position
		    function getInputOffset(){
		        var body = document.body,
		            win = 'defaultView' in document? document.defaultView : document.parentWindow,
		            docElem = document.documentElement,
		            box = document.createElement('div');
		        box.style.paddingLeft = box.style.width = "1px";
		        body.appendChild(box);
		        var isBoxModel = box.offsetWidth == 2;
		        body.removeChild(box);
		        box = input.getBoundingClientRect();
		        var clientTop  = docElem.clientTop  || body.clientTop  || 0,
		            clientLeft = docElem.clientLeft || body.clientLeft || 0,
		            scrollTop  = 'pageYOffset' in win ? win.pageYOffset : body.scrollTop,
		            scrollLeft = 'pageXOffset' in win ? win.pageXOffset : body.scrollLeft;
		        return {
		            top : box.top  + scrollTop  - clientTop,
		            left: box.left + scrollLeft - clientLeft};
		    }
		    function getInputCSS(prop, isnumber){
		        var win = 'defaultView' in document? document.defaultView : document.parentWindow,
		        	val = win.getComputedStyle(input, null).getPropertyValue(prop);
		        return isnumber ? parseFloat(val) : val;
		    }
		}
};

var jsonCompositeTemplate = '<div id="json-composite"><div id="validator-placeholder1"></div><div id="validator-placeholder2"></div><div id="diff-placeholder"></div><a href="#" title="Tips and Tricks" id="help"><span class="icon">Tips and Tricks</span></a><div id="tips-and-tricks"><a id="close-tips" class="close-btn" href="#">X</a><h1>JSON Lint Pro</h1><h2>The easiest way to validate and format JSON</h2><ul><li>Type your JSON into the textarea, or enter a remote URL</li><li>Use the split mode to speed up your workflow, or to run a diff.</li><li>Use the delete button to quickly clear your input.</li></ul><p>A project from the <a href="http://lab.arc90.com">Arc90 Lab</a>. Check out the source on <a href="https://github.com/arc90/jsonlintpro">GitHub</a>. Props to <a href="http://www.crockford.com/">Douglas Crockford</a> of <a href="http://www.json.org">JSON</a> and <a href="http://www.jslint.com">JS Lint</a>, and <a href="http://zaa.ch/">Zach Carter</a>, who provided the <a href="https://github.com/zaach/jsonlint"> JS implementation of JSONlint</a>.</p></div></div>',
	validatorTemplate = '<form class="JSONValidate" method="post" action="." name="JSONValidate"><textarea class="json_input" name="json_input" class="json_input" rows="30" cols="100" spellcheck="false" placeholder="Enter json or a url to validate..."></textarea><a href="#" title="Run validation" class="button validate"><span class="icon">Lint Me!</span></a><a href="#" title="Compare two JSON sets" class="button split-view"><span class="icon">Split View</span></a>	<a href="#" title="Delete the current data" class="button reset"><span class="icon">Reset</span></a><a href="#" title="Run validation and perform a diff" class="button diff"><span class="icon">Diff</span></a></form>',
	errorTemplate = '<div class="error-view"><a class="close-btn" href="#">X</a><span class="arrow-down"></span><pre class="results"></pre></div>',
	diffTemplate = '<div id="diff-view"><a href="#" title="Run validation and perform a diff" class="button diff"><span class="icon">Diff</span></a><a href="#" title="Cancel diff" class="button cancel-diff"><span class="icon">Cancel diff</span></a><div class="json_input" contenteditable="true"></div></div>';


var FADE_SPEED = 100,
	TABCHARS = "    ",
	PADDING = 40,
	FADE_SPEED = 150,
	ARROW_OFFSET = 10,
	JSONComposite = Backbone.View.extend({
		events : {
			'click #close-tips' : 'onHideHelp',
			'click #help'       : 'onShowHelp'
		},

		initialize : function () {
			_.bindAll(this);

			this.json 			= this.options.json;
			this.windowObject 	= this.options.windowObject;

			$(this.windowObject).resize(this.resize);

	        this.render();
		},

		render : function () {
			var el = $(jsonCompositeTemplate);

			this.$el.replaceWith(el);
			this.setElement(el);

			this.loadSubviews();
		},

		loadSubviews : function () {
			// this needs to be in a composite
			this.primaryValidator = new ValidatorView({
			    el 			: this.$('#validator-placeholder1'),
				json	 	: this.options.json,
				className	: 'primary'
		    });

		    this.secondaryValidator  = new SecondaryValidatorView({
			    el 	: this.$('#validator-placeholder2')
		    });

		    this.diffView  = new DiffView({
			    el 	: this.$('#diff-placeholder')
		    });

			this.primaryValidator.on('split:enter', 	this.enterSplitMode);
			this.secondaryValidator.on('split:exit',   	this.exitSplitMode);
			this.secondaryValidator.on('diff',   		this.enterDiffMode);
			this.diffView.on('diff:cancel',   			this.exitDiffMode);
			this.diffView.on('diff',   					this._setDiff);

			this.$('.json_input').linedtextarea();

	        _.delay(this.resize, 150);
		},

		onShowHelp : function (ev) {
			ev.preventDefault();

			this.$('#tips-and-tricks').fadeIn(FADE_SPEED);
		},

		onHideHelp : function (ev) {
			ev.preventDefault();

			this.$('#tips-and-tricks').fadeOut(FADE_SPEED);
		},

		resize : function () {
			var height = $(this.windowObject).height();

			this.$('.json_input').height(height);
		},

		enterSplitMode : function () {
		    this.primaryValidator.enterSplitMode();
		},

	    exitSplitMode : function () {
		    this.primaryValidator.exitSplitMode(this.secondaryValidator.resetView);
	    },

	    enterDiffMode : function () {
		    if (this._setDiff()) {
			    if (!this.diffView.isActive()) {
				    this.primaryValidator.enterDiffMode();

				    this.secondaryValidator.enterDiffMode();

				  	this.diffView.onShow();
			  	}
		    }
	    },

	    exitDiffMode : function () {
		  	this.primaryValidator.exitDiffMode();

		    this.secondaryValidator.exitDiffMode();

		  	this.diffView.onHide();
	    },

	    _setDiff : function () {
	    	this.primaryValidator.validate();
		    this.secondaryValidator.validate();

		   	var valA = this.primaryValidator.getValue(),
		  		valB = this.secondaryValidator.getValue(),
		  		diff;

		  	if (valA.length && valB.length) {
		  		diff = htmlDiff(valA, valB);

			  	this.diffView.setHTML(diff);
			  	return true;
		  	}

		  	return false;
	    }
	}),
	ValidatorView = Backbone.View.extend({
		events : {
			'click .validate' 		: 'onValidate',
			'keyup .json_input' 	: 'onKeyUp',
			'keydown .json_input' 	: 'onKeyDown',
			'click .reset' 			: 'onReset',
			'click .split-view'     : 'onSplitView',
			'click .diff'			: 'onDiff'
		},

		initialize : function () {
			_.bindAll(this);

			_.defaults(this.options, {
				reformat 	 : true,
				json 		 : false,
				windowObject : window,
				className	 : ''
			});

			this.json 	= this.options.json;
			this.reformat 	= this.options.reformat;
			this.windowObject = this.options.windowObject;

			$(this.windowObject).resize(this.resize);

	        this.render();
		},

		render : function () {
			var el = $(validatorTemplate);

			this.$el.replaceWith(el);
			this.setElement(el);

			this.$el.addClass(this.options.className);

			this.textarea = this.$('.json_input');

			this.textarea.scroll(_.bind(function () {
				var offset = this.textarea.scrollTop();

				this.errorView.setScrollOffset(offset);
			}, this));

			this._checkForJSON();
            $(".JSONValidate .json_input")[0].onkeydown = function (e) {
                var $this = this;
                if ((e.key == '|') && e.ctrlKey) {
                    this.value = JSON.stringify(JSON.parse(this.value));
                    e.preventDefault();
                } else if ((e.key == '\\' || e.key == 'Enter') && e.ctrlKey) {
                    $(".JSONValidate").filter(function (x) { return $(this).find($this).length > 0 }).find('.button.validate').click();
                    e.preventDefault();
                } else if (e.key == 'Escape') {
                    $(".close-btn").click();
                    e.preventDefault();
                }
            }
			this.createErrorView();

	        _.delay(this.resize, 150);
		},

		createErrorView : function () {
			this.errorView = new ErrorView({
				container : this.$el
			});

			this.errorView.on('error:hide', this.resetErrors);

			this.$el.append(this.errorView.$el);
		},

		resize : function () {
			var height = $(this.windowObject).height();

			this.$el.height(height);
			this.textarea.height(height - PADDING);
		},

		/**
		* Validate any json passes in through the URL
		* @usage: ?json={}
		*/
		_checkForJSON : function () {
	        if (this.json) {
	            this.textarea.val(this.json);

	            this.validate();
	        }
		},

		onValidate : function (ev) {
			ev.preventDefault();

	        if ($.trim(this.textarea.val()).length === 0) {
	        	return;
	        }

	        var jsonVal = $.trim(this.textarea.val());

	        if (jsonVal.substring(0, 4).toLowerCase() === "http") {
	            $.post("js/utils/proxy.php", {"url": jsonVal}, _.bind(function (responseObj) {
	                this.textarea.val(responseObj.content);

	                this.validate();

	            }, this), 'json');

	        } else {
	            this.validate();
	        }
		},

		onKeyUp : function (ev) {
			this.$('.validate').removeClass('error success');
		},

		onKeyDown : function (ev) {
			if (ev.keyCode === 9) {
	            ev.preventDefault();
	            this._insertAtCaret(TABCHARS);
	        }
		},

		onReset : function (ev) {
			ev.preventDefault();

			this.resetView();
		},

		resetView : function () {
			this.textarea.val('').focus();
			this.resetErrors();
		},

		resetErrors : function () {
			this.errorView.hide();
			this.$('.validate').removeClass('error success');
		},

		validate : function (options) {
			options || (options = {});

		    _.defaults(options, {
			   success : $.noop,
			   error : $.noop
		    });

	        var jsonVal = this.textarea.val(),
	            result;

	        try {
	            result = jsl.parser.parse(jsonVal);

	            if (result) {
	                this._appendResult(jsonVal);

	                options.success();

	                return;
	            }

	            options.error();

	        } catch (parseException) {
	        	this._handleParseException()

	            options.error();
	        }
		},

		 _appendResult : function (jsonVal) {
	    	var tab_chars = this.reformat ? TABCHARS : "";

	        this.textarea.val(JSON.stringify(JSON.parse(jsonVal), null, tab_chars));

			this.$('.validate').removeClass('error').addClass('success');
			this.errorView.hide();
	    },

	    /**
	     * If we failed to validate, run our manual formatter and then re-validate so that we
	     * can get a better line number. On a successful validate, we don't want to run our
	     * manual formatter because the automatic one is faster and probably more reliable.
	    **/
	    _handleParseException : function () {
	        var jsonVal = this.textarea.val(),
	            result;

	        try {
	            if (this.reformat) {
	                jsonVal = jsl.format.formatJson(jsonVal);

	                this.textarea.val(jsonVal);

	                result = jsl.parser.parse(jsonVal);
	            }
	        } catch(e) {
	            parseException = e;
	        }

	        var lineMatches = parseException.message.match(/line ([0-9]*)/),
				lineNum,
				lineStart,
				lineEnd,
				offset;

	        if (lineMatches && typeof lineMatches === "object" && lineMatches.length > 1) {
	            lineNum = parseInt(lineMatches[1], 10);

	            if (lineNum === 1) {
	                lineStart = 0;
	            } else {
	                lineStart = this._getNthPos(jsonVal, "\n", lineNum - 1);
	            }

	            lineEnd = jsonVal.indexOf("\n", lineStart);
	            if (lineEnd < 0) {
	                lineEnd = jsonVal.length;
	            }

	            this.textarea.focus().caret(lineStart, lineEnd);

	            offset = utils.getTextBoundingRect(this.textarea[0],lineStart, lineEnd, false);
	        }

	        this.showValidationError(offset);
	    },

	    showValidationError : function (offset) {
		    this.errorView.setError(parseException.message);
		    this.errorView.setPosition(offset);
		    this.errorView.show();

	        this.$('.validate').removeClass('success').addClass('error');
	    },

	    /**
	     * Function to insert our tab spaces
	     */
	    _insertAtCaret : function (text) {
	    	element = this.textarea[0];

	        if (document.selection) {
	            element.focus();
	            var sel = document.selection.createRange();
	            sel.text = text;
	            element.focus();
	        } else if (element.selectionStart || element.selectionStart === 0) {
	            var startPos = element.selectionStart,
	            	endPos = element.selectionEnd,
	            	scrollTop = element.scrollTop;

	            element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
	            element.focus();
	            element.selectionStart = startPos + text.length;
	            element.selectionEnd = startPos + text.length;
	            element.scrollTop = scrollTop;
	        } else {
	            element.value += text;
	            element.focus();
	        }
	    },

	    /**
	     * Get the Nth position of a character in a string
	     * @searchStr the string to search through
	     * @char the character to find
	     * @pos int the nth character to find, 1 based.
	     *
	     * @return int the position of the character found
	    **/
	    _getNthPos : function (searchStr, char, pos) {
	        var i,
	            charCount = 0,
	            strArr = searchStr.split(char);

	        if (pos === 0) {
	            return 0;
	        }

	        for (i = 0; i < pos; i++) {
	            if (i >= strArr.length) {
	                return -1;
	            }

	            // +1 because we split out some characters
	            charCount += strArr[i].length + char.length;
	        }

	        return charCount;
	    },

	    hideSplitToggle : function () {
		  	this.$('.split-view').hide();
	    },

	    showSplitToggle : function () {
		  	this.$('.split-view').show();
	    },

	    enterSplitMode : function (callback) {
	    	callback || (callback = $.noop);

	    	this.hideSplitToggle();

		    this.$el.animate({
			   width : '50%'
		    }, FADE_SPEED, callback);
	    },

	    exitSplitMode : function (callback) {
	    	callback || (callback = $.noop);

		   	this.$el.animate({
			   width : '100%'
		    }, FADE_SPEED, _.bind(function () {
			    callback();
			    this.showSplitToggle();
		    }, this));
	    },

	    enterDiffMode : function () {
		  	this.$el.animate({
			   width : '33%'
		    }, FADE_SPEED);
	    },

	    exitDiffMode : function () {
		    this.$el.animate({
			   width : '50%'
		    }, FADE_SPEED);
	    },

	    onSplitView : function (ev) {
		    ev.preventDefault();

		    this.trigger('split:enter');
	    },

	    onDiff : function (ev) {
		    ev.preventDefault();

		    this.trigger('diff');
	    },

	    getValue : function () {
		    return this.textarea.val();
	    }
	}),
	SecondaryValidatorView = ValidatorView.extend({
		render : function () {
			ValidatorView.prototype.render.call(this);

			this.$('.split-view').addClass('cancel');

			this.$('.diff').css('display', 'block');
		},

	    onSplitView : function (ev) {
		    ev.preventDefault();

		    this.trigger('split:exit');
	    },

	    enterDiffMode : function () {
		    this.$el.animate({
			   width : '33%',
			   left: '67%'
		    }, FADE_SPEED);

		    this.$('.diff, .split-view').hide();
	    },

	    exitDiffMode : function () {
		    this.$el.animate({
			   width : '50%',
			   left: '50%'
		    }, FADE_SPEED);

		    this.$('.diff, .split-view').show();
	    }
	}),
	DiffView = Backbone.View.extend({
		events : {
			'click .diff' : 'onDiff',
			'click .cancel-diff' : 'onCancel'
		},

		initialize : function () {
			_.bindAll(this);

			this.windowObject = this.options.windowObject;

			$(this.windowObject).resize(this.resize);

	        this.render();
		},

		render : function () {
			var el = $(diffTemplate);

			this.$el.replaceWith(el);
			this.setElement(el);

			this.$('.diff').show();

	        _.delay(this.resize, 150);
		},

		resize : function () {
			var height = $(this.windowObject).height();

			this.$('.json_input').height(height);
		},

		setHTML : function (html) {
			this.$('.json_input').html(html);
		},

		isActive : function () {
			return this.$el.hasClass('active');
		},

		onShow : function () {
			if (!this.$el.hasClass('active')) {
				this.$el.addClass('active')
			}
		},

		onDiff : function (ev) {
			ev.preventDefault();
			this.trigger('diff');
		},

		onHide : function () {
			if (this.$el.hasClass('active')) {
				this.$el.removeClass('active')
			}
		},

		onCancel : function (ev) {
			ev.preventDefault();

			this.trigger('diff:cancel');
		}
	}),
	ErrorView = Backbone.View.extend({
		events : {
			'click .close-btn' : 'onClose'
		},

		initialize : function () {
			_.bindAll(this);

			this.container = this.options.container;

	        this.render();
		},

		render : function () {
			var el = $(errorTemplate);

			this.$el.replaceWith(el);
			this.setElement(el);
		},

		setPosition : function (offset) {
			var topOffset =  offset.top - this.$el.outerHeight() - ARROW_OFFSET,
				leftOffset = offset.left - this.container.offset().left;

			if (topOffset < 0) {
				topOffset = offset.bottom + ARROW_OFFSET;

				this.$el.addClass('reverse');
			} else {
				this.$el.removeClass('reverse');
			}

			this.topOffset = topOffset;

			this.$el.css({
				top : topOffset,
				left : leftOffset
			});
		},

		setScrollOffset : function (offset) {
			this.$el.css({
				top: this.topOffset - offset
			});
		},

		setError : function (error) {
			this.$('.results').text(error);
		},

		show : function () {
			if (!this.$el.is(':visible')) {
				this.$el.show();
			}
		},

		hide : function () {
			if (this.$el.is(':visible')) {
				this.$el.hide();
			}
		},

		onClose : function (ev) {
			ev.preventDefault();

			this.trigger('error:hide');
		}
	});

$(function () {
	var JSON_PARAM = utils._getURLParameter('json');

	// this needs to be in a composite
	new JSONComposite({
	    el 		: $('#json-composite-placeholder'),
		json 	: JSON_PARAM
    });
});
