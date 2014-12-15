goog.provide('cz.mzk.authorities.verif.NominatimControl');

goog.require('cz.mzk.authorities.verif.Authority');
goog.require('cz.mzk.authorities.verif.NominatimEvent');
goog.require('goog.ui.Control');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Button');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.ac.Nominatim');
goog.require('goog.asserts');
goog.require('goog.dom.classlist');

/**
 * @constructor
 * @extends {goog.ui.Control}
 */
cz.mzk.authorities.verif.NominatimControl = function() {
  goog.ui.Control.call(this);
  var this_ = this;
  this.setFocused(true);
  this.setAllowTextSelection(true);
  /** @type {!goog.dom.DomHelper} */
  var domHelper = this.getDomHelper();
  /**
   * @private
   * @type {!goog.ui.LabelInput}
   */
  this.searchInput_ = new goog.ui.LabelInput();
  this.searchInput_.createDom();
  this.searchInput_.setParent(this);
  /**
   * @private
   * @type {!goog.ui.ac.Nominatim}
   */
  this.searchInputAc_ = new goog.ui.ac.Nominatim(this.searchInput_.getElementStrict(), this.getElement());
  this.searchButton_ = new goog.ui.Button('Hledat');
  this.searchButton_.setParent(this);
  /**
   * @private
   * @type {goog.ui.Menu}
   */
  this.results_ = new goog.ui.Menu();
  this.results_.setParent(this);
  /**
   * @private
   * @type {?goog.net.Jsonp}
   */
  this.jsonp_ = null;
  /**
   * @private
   * @type {?Object}
   */
  this.jsonpRequest_ = null;
  this.addChild(this.searchInput_, true);
  this.addChild(this.searchButton_, true);
  this.addChild(this.results_, true);

  goog.events.listen(this.searchButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.searchSubmit_();
  });
  goog.events.listen(this.searchInputAc_, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    this_.searchSubmit_();
  });
};

goog.inherits(cz.mzk.authorities.verif.NominatimControl, goog.ui.Control);

/**
 * @override
 * @param {boolean} enable
 */
cz.mzk.authorities.verif.NominatimControl.prototype.setEnabled = function(enable) {
  if (enable) {
    goog.base(this, 'setEnabled', enable);
    // delegate
    this.searchInput_.setEnabled(enable);
    this.searchButton_.setEnabled(enable);
    this.results_.setEnabled(enable);
  } else {
    // delegate
    this.searchInput_.setEnabled(enable);
    this.searchButton_.setEnabled(enable);
    this.results_.setEnabled(enable);
    goog.base(this, 'setEnabled', enable);
  }
};

/**
 * @param {!string} query
 */
cz.mzk.authorities.verif.NominatimControl.prototype.setQuery = function(query) {
  this.searchInput_.setValue(query);
  this.searchSubmit_();
}

/**
 * Handle nominatim searching.
 */
cz.mzk.authorities.verif.NominatimControl.prototype.searchSubmit_ = function() {
  /** @type {cz.mzk.authorities.verif.NominatimControl} */
  var this_ = this;
  if (this_.jsonp_) {
    goog.asserts.assert(this_.jsonpRequest_ != null);
    this_.jsonp_.cancel(this_.jsonpRequest_);
    this_.jsonp_ = null;
  }
  this_.jsonp_ = new goog.net.Jsonp('http://nominatim.mzk.cz', 'json_callback');
  this_.jsonpRequest_ = this_.jsonp_.send(
    {
      'q' : this_.searchInput_.getValue(),
      'polygon' : '1',
      'format' : 'json'
    },
    function(data) {
      this_.results_.removeChildren(true);
      for (var i = 0; i < data.length; i++) {
        goog.asserts.assertString(data[i]['display_name']);
        var item = new goog.ui.MenuItem(data[i]['display_name']);
        item['nominatim'] = {};
        item['nominatim']['south'] = parseFloat(data[i]['boundingbox'][0]);
        item['nominatim']['north'] = parseFloat(data[i]['boundingbox'][1]);
        item['nominatim']['west'] = parseFloat(data[i]['boundingbox'][2]);
        item['nominatim']['east'] = parseFloat(data[i]['boundingbox'][3]);
        if (data[i]['polygonpoints']) {
          item['nominatim']['polygon'] = this_.retypePolygon_(data[i]['polygonpoints']);
        }
        goog.events.listen(item, goog.ui.Component.EventType.ACTION, function(e) {
          var event = new cz.mzk.authorities.verif.NominatimEvent(e.target['nominatim']);
          this.dispatchEvent(event);
        });
        this_.results_.addChild(item, true);
      }
      /** type {?goog.ui.Control} */
      /*var firstItem = this_.results_.getChildAt(0);
      if (firstItem) {
        this_.map_.showAuthority(firstItem['authority']);
      } else {
        this_.map_.clear();
      }*/
      goog.dom.classlist.remove(this_.searchInput_.getElementStrict(), 'goog-loading');
    },
    function(error) {
      goog.dom.classlist.remove(this_.searchInput_.getElementStrict(), 'goog-loading');
    }
  );
  goog.dom.classlist.add(this_.searchInput_.getElementStrict(), 'goog-loading');
};

/**
 * Retypes string values into their number representation.
 * @private
 * @param {Array.<Array.<string>>} polygon
 * @return {Array.<Array.<number>>}
 */
cz.mzk.authorities.verif.NominatimControl.prototype.retypePolygon_ = function(polygon) {
  var result = [];
  for (var i = 0; i < polygon.length; i++) {
    result.push([parseFloat(polygon[i][0]), parseFloat(polygon[i][1])]);
  }
  return result;
};
