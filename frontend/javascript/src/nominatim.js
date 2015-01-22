/*
 * Copyright (C) 2011 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview A class to create a Nominatim autocomplete that will match
 * from an array of data provided via JSONP. The server returns a complex data
 * structure that is used with client-side javascript functions to render the
 * results.
 *
 * More info:
 * http://wiki.openstreetmap.org/wiki/Nominatim
 * http://open.mapquestapi.com/nominatim/
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 */

goog.provide('goog.ui.ac.Nominatim');

goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.NominatimMatcher');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.events');


/**
 * Factory class to create a rich autocomplete widget that autocompletes an
 * inputbox or textarea from data provided via ajax.  The server returns a
 * complex data structure that is used with client-side javascript functions to
 * render the results.
 * @param {!Element} input Input element or text area.
 * @param {Element|null} opt_parent The parent element that will hold autocomplete elements.
 * @param {string=} opt_url The Uri of the Nominatim service.
 * @param {Object=} opt_payload Extra parameters for the Jsonp request.
 * @constructor
 * @extends {goog.ui.ac.AutoComplete}
 */
goog.ui.ac.Nominatim = function(input, opt_parent, opt_url, opt_payload) {
  // Create a custom renderer that renders rich rows returned from server.
  var customRenderer = {};
  customRenderer.renderRow = function(row, token, node) {
    node.innerHTML = row.data['display_name'];
  };

  /**
   * A standard renderer that uses a custom row renderer to display the
   * rich rows generated by this autocomplete widget.
   * @type {!goog.ui.ac.Renderer}
   */
  var renderer = new goog.ui.ac.Renderer(opt_parent || null, customRenderer);

  /**
   * A remote matcher that parses rich results returned via JSONP from a server.
   * @type {!goog.ui.ac.NominatimMatcher}
   * @protected
   */
  this.matcher_ = new goog.ui.ac.NominatimMatcher(
      opt_url, opt_payload);

  /**
   * An input handler that calls select on a row when it is selected.
   * @type {!goog.ui.ac.InputHandler}
   */
  var inputhandler = new goog.ui.ac.InputHandler(null, null, false);
  inputhandler.setThrottleTime(100);
  inputhandler.setUpdateDuringTyping(false);
  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);

  // Create the widget and connect it to the input handler.
  goog.base(this, this.matcher_, renderer, inputhandler);
  goog.events.listen(this, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    input.value = e.row['display_name'];
  });

};
goog.inherits(goog.ui.ac.Nominatim, goog.ui.ac.AutoComplete);


/**
 * Calls matchHandler on a set of matching rows retrieved from server.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
goog.ui.ac.Nominatim.prototype.search =
    function(token, maxMatches, matchHandler) {
  this.matcher_.requestMatchingRows(token, maxMatches, matchHandler);
};
