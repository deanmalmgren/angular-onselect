(function() {
  'use strict';

  angular.module('onSelect')
    .factory('RangeService', RangeService);

  /**
   * @typedef {object} Options
   * @property {boolean} snapToWord expand selection to include whole words
   * @property {boolean} highlight automatically highlight selection
   *
   * @description
   * Options passed to the RangeService.process function to define additional behaviors
   * of processing.
   */

  /**
   * @namespace RangeService
   * @memberOf onselect
   * @param {$window} $window the window object
   *
   * @description
   * The range service has a single method (process) for returning back data describing
   * the selected region.
   *
   * @ngInject
   */
  function RangeService($window) {
    var service = {};

    service.process = process;
    service.Selection = Selection;

    return service;

    /**
     * @mamberOf onselect.RangeService
     * @name process
     * @param {Options} options the options for processing
     * @returns {onselect.Selection} the selection
     *
     * @description
     * Process the current selection (as reported by $window.getSelection()) and create a
     * selection object based upon the FIRST range. Apply default behaviors based upon the
     * options as well.
     */
    function process(options) {
      var windowSelection = $window.getSelection();
      var range = windowSelection.getRangeAt(0);

      var selection = service.Selection(range);

      if (options.snapToWord) {
        selection.snapToWord();
      }

      if (options.highlight) {
        selection.highlight('span', function (node) {
          node.style.background = 'yellow';
        });
      }

      return selection;
    }

    /**
     * @namespace Selection
     * @memberOf onselect
     * @param {Range} range the range that was surrounded
     * @constructor
     *
     * @description
     * The Selection object contains all of the behaviors for a selection including the
     * ability to expand to word boundaries, highlight and get the text content.
     */
    function Selection(range) {
      var selection = {};

      /**
       * @type {Range}
       * @desc The range
       */
      selection.range = range;

      /**
       * @type {Element}
       * @desc the HTML element that was added to surround the highlighted text or undefined if none exists.
       * @private
       */
      selection._highlighter = undefined;

      selection.isHighlighted = isHighlighted;
      selection.snapToWord = snapToWord;
      selection.highlight = highlight;
      selection.removeHighlight = removeHighlight;
      selection.getText = getText;

      return selection;

      /**
       * Returns true if this selection has already been highlighted (automatically or otherwise).
       *
       * @memeberOf onselect.Selection
       * @name isHighlighted
       *
       * @returns {boolean} true
       */
      function isHighlighted() {
        return !!selection._highlighter;
      }

      /**
       * Expand the current range so that both the beginning and end end at word boundaries.
       *
       * @memeberOf onselect.Selection
       * @name snapToWord
       */
      function snapToWord() {
        var start = selection.range.startOffset;
        var startNode = selection.range.startContainer;

        while (startNode.textContent.charAt(start) != ' ' && start > 0) {
          start--;
        }
        if (start != 0 && start != selection.range.startOffset) {
          start++;
        }

        var end = selection.range.endOffset;
        var endNode = selection.range.endContainer;
        while (endNode.textContent.charAt(end) != ' ' && end < endNode.length) {
          end++;
        }

        selection.range.setStart(startNode, start);
        selection.range.setEnd(endNode, end);
      }

      /**
       * Select the current range with a new HTML Element of the given tag type. The
       * passed decorator will be called with the created HTML Element to which it can
       * add additional styles, classes or attributes. If the contents have already been
       * highlighted, the previous highlighting will be removed first.
       *
       * This will not work if the selected text crosses HTML nodes.  In other words, the
       * selection must be in the same Text node.
       *
       * @memeberOf onselect.Selection
       * @name highlight
       *
       * @param {string} tag the tag name of the element to create
       * @param {function} decorator the function that will get called to decorate teh created element
       */
      function highlight(tag, decorator) {
        if (selection._highlighter) {
          selection.removeHighlight();
        }

        if (range.startContainer === range.endContainer) {
          selection._highlighter = $window.document.createElement(tag);
          decorator(selection._highlighter);

          range.surroundContents(selection._highlighter);
        }
      }

      /**
       * Remove highlighting if it currently exists.
       *
       * @memeberOf onselect.Selection
       * @name removeHighlight
       */
      function removeHighlight() {
        if (selection._highlighter) {
          var parent = selection._highlighter.parentNode;
          while (selection._highlighter.firstChild) {
            parent.insertBefore(selection._highlighter.firstChild, selection._highlighter);
          }
          parent.removeChild(selection._highlighter);
          selection._highlighter = undefined;
        }
      }

      /**
       * Return the text contents of the currently highlighted range.
       *
       * @returns {string}
       */
      function getText() {
        return range.toString();
      }
    }
  }

})();