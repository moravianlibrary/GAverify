goog.provide('cz.mzk.authorities.verif.AuthorityManager');
goog.provide('cz.mzk.authorities.verif.AuthorityManager.CategoryType');

goog.require('cz.mzk.authorities.verif.Authority');

goog.require('goog.net.XhrIo');
goog.require('goog.json');
goog.require('goog.Uri');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.debug.LogManager');
goog.require('goog.asserts');

/**
 * Class for managing authorities.
 * @constructor
 * @param {string} ajaxUrl Url of service, which provides functions for managing authorities
 * @param {string=} callback The parameter name that is used to specify the callback. Defaults to 'callback'.
 */
cz.mzk.authorities.verif.AuthorityManager = function(ajaxUrl, callback) {
  /**
   * @private
   * @type {!string}
   */
  this.ajaxUrl_ = ajaxUrl;
  /**
   * @private
   * @type {!string}
   */
  this.callback_ = callback || 'callback';
  /**
   * @private
   * @type {cz.mzk.authorities.verif.AuthorityManager.CategoryType}
   */
  this.category_ = cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTSPECIFIED;
  /**
   * @private
   * @type {?number}
   */
  this.level_ = null;
  /**
   * @private
   * @type {goog.net.XhrIo}
   */
  this.authorityXhrIo_ = new goog.net.XhrIo();
  /**
   * @private
   * @type {goog.net.XhrIo}
   */
  this.levelsXhrIo_ = new goog.net.XhrIo();
  /**
   * @private
   * @type {goog.net.XhrIo}
   */
  this.freeXhrIo_ = new goog.net.XhrIo();
  /**
   * @private
   * @type {?cz.mzk.authorities.verif.Authority}
   */
  this.authority_ = null;
};

/**
 * Sets category of authorities, which will be returned after calling method
 * {@link cz.mzk.authorities.verif.AuthorityManager.prototype.getNext}
 * @param {!cz.mzk.authorities.verif.AuthorityManager.CategoryType} value
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.setCategory = function(value) {
  this.category_ = value;
};

/**
 * Sets level of authorities, which will be returned after calling method.
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.setLevel = function(value) {
  this.level_ = value;
};


/**
 * Returns next nonverified authority from choosed category and level.
 * @param {boolean} skip
 * @param {function(string, cz.mzk.authorities.verif.Authority=, Array.<number>=)} callback Function called after data is obtained.
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.getNext = function(skip, callback) {
  if (this.authorityXhrIo_.isActive()) {
    this.authorityXhrIo_.abort();
  }
  /** @type {cz.mzk.authorities.verif.AuthorityManager} */
  var this_ = this;
  var uri = new goog.Uri(this.ajaxUrl_);
  uri.setParameterValue('action', 'get_authority');
  var params = {
    'category': this.getCategoryName_(),
    'level': this.level_,
    'uuid': this.authority_ ? this.authority_.getUuid() : null,
    'skip': skip
  };
  var data = goog.json.serialize(params);
  this.authorityXhrIo_.send(uri, 'POST', data);
  goog.events.listenOnce(this.authorityXhrIo_, goog.net.EventType.SUCCESS, function() {
    var data = this.getResponseJson();
    if (data['code'] == 'OK') {
      var authority = new cz.mzk.authorities.verif.Authority({
        id: data['id'],
        address: data['address'],
        type: data['type'],
        originalWest: data['original_west'],
        originalEast: data['original_east'],
        originalNorth: data['original_north'],
        originalSouth: data['original_south'],
        nominatimWest: data['nominatim_west'],
        nominatimEast: data['nominatim_east'],
        nominatimNorth: data['nominatim_north'],
        nominatimSouth: data['nominatim_south'],
        nominatimPolygon: data['nominatim_polygon'],
        uuid: data['uuid']
      });
      this_.authority_ = authority;
      callback('OK', authority, data['levels']);
    } else {
      callback(data['code']);
    }
  });
  goog.events.listenOnce(this.authorityXhrIo_, goog.net.EventType.ERROR, function() {
    var logger = goog.debug.LogManager.getLogger(
      'cz.mzk.authorities.verif.AuthorityManager.prototype.getNext');
    logger.severe('Error at getting Jsonp response: ' + this.getLastError());
    callback('ERROR');
  });
}

/**
 * Verifies authority and returns next authority from choosed category and level.
 * @param {number} west West coordinate of verified authority.
 * @param {number} east East coordinate of verified authority.
 * @param {number} north North coordinate of verified authority.
 * @param {number} south South coordinate of verified authority.
 * @param {function(string, cz.mzk.authorities.verif.Authority=, Array.<number>=)} callback Function called after data is obtained.
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.verify = function(
  west, east, north, south, callback) {
  if (this.authorityXhrIo_.isActive()) {
    this.authorityXhrIo_.abort();
  }
  goog.asserts.assert(this.authority_ != null);
  /** @type {cz.mzk.authorities.verif.AuthorityManager} */
  var this_ = this;
  var uri = new goog.Uri(this.ajaxUrl_);
  uri.setParameterValue('action', 'verify_authority');
  var params = {
    'category': this.getCategoryName_(),
    'level': this.level_,
    'uuid': this.authority_.getUuid(),
    'verified_west': west,
    'verified_east': east,
    'verified_north': north,
    'verified_south': south
  };
  var data = goog.json.serialize(params);
  this.authorityXhrIo_.send(uri, 'POST', data);
  goog.events.listenOnce(this.authorityXhrIo_, goog.net.EventType.SUCCESS, function() {
    var data = this.getResponseJson();
    if (data['code'] == 'OK') {
      var authority = new cz.mzk.authorities.verif.Authority({
        id: data['id'],
        address: data['address'],
        type: data['type'],
        originalWest: data['original_west'],
        originalEast: data['original_east'],
        originalNorth: data['original_north'],
        originalSouth: data['original_south'],
        nominatimWest: data['nominatim_west'],
        nominatimEast: data['nominatim_east'],
        nominatimNorth: data['nominatim_north'],
        nominatimSouth: data['nominatim_south'],
        nominatimPolygon: data['nominatim_polygon'],
        uuid: data['uuid']
      });
      this_.authority_ = authority;
      callback('OK', authority, data['levels']);
    } else {
      callback(data['code']);
    }
  });
  goog.events.listenOnce(this.authorityXhrIo_, goog.net.EventType.ERROR, function() {
    var logger = goog.debug.LogManager.getLogger(
      'cz.mzk.authorities.verif.AuthorityManager.prototype.getNext');
    logger.severe('Error at getting Jsonp response: ' + this.getLastError());
    callback('ERROR');
  });
}


/**
 * Returns list of possible levels for category.
 * @param {function(!string, Array.<number>=)} callback Function called after data is obtained.
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.getLevels = function(callback) {
  if (this.levelsXhrIo_.isActive()) {
    this.levelsXhrIo_.abort();
  }
  var uri = new goog.Uri(this.ajaxUrl_);
  uri.setParameterValue('action', 'get_levels');
  var params = {
    'category': this.getCategoryName_()
  };
  var data = goog.json.serialize(params);
  this.levelsXhrIo_.send(uri, 'POST', data);
  goog.events.listenOnce(this.levelsXhrIo_, goog.net.EventType.SUCCESS, function() {
    var data = this.getResponseJson();
    goog.asserts.assert(data instanceof Array);
    callback('OK', data);
  });
  goog.events.listenOnce(this.levelsXhrIo_, goog.net.EventType.ERROR, function() {
    var logger = goog.debug.LogManager.getLogger(
      'cz.mzk.authorities.verif.AuthorityManager.prototype.getLevels');
    logger.severe('Error at getting Jsonp response: ' + this.getLastError());
    callback('ERROR');
  });
};

/**
 * Free current authority.
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.free = function() {
  if (this.authority_ == null) {
    return;
  }
  if (this.freeXhrIo_.isActive()) {
    this.freeXhrIo_.abort();
  }
  var uri = new goog.Uri(this.ajaxUrl_);
  uri.setParameterValue('action', 'free_authority');
  var params = {
    'uuid': this.authority_.getUuid()
  };
  var data = goog.json.serialize(params);
  this.freeXhrIo_.send(uri, 'POST', data);
  goog.events.listenOnce(this.freeXhrIo_, goog.net.EventType.SUCCESS, function() {
    var data = this.getResponseJson();
    if (data['code'] != 'OK') {
      var logger = goog.debug.LogManager.getLogger(
        'cz.mzk.authorities.verif.AuthorityManager.prototype.getLevels');
      logger.severe('Error code: ' + data['code']);
    }
  });
  goog.events.listenOnce(this.freeXhrIo_, goog.net.EventType.ERROR, function() {
    var logger = goog.debug.LogManager.getLogger(
      'cz.mzk.authorities.verif.AuthorityManager.prototype.getLevels');
    logger.severe('Error at getting Jsonp response: ' + this.getLastError());
  });
};

/**
 * Returns action name according to choosed category
 * @private
 * @return {?string}
 */
cz.mzk.authorities.verif.AuthorityManager.prototype.getCategoryName_ = function() {
  if (this.category_ == cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT) {
    return 'correct';
  }
  if (this.category_ == cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE) {
    return 'outside';
  }
  if (this.category_ == cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND) {
    return 'notfound';
  }
  return null;
}

/**
 * @enum {string}
 */
cz.mzk.authorities.verif.AuthorityManager.CategoryType = {
    NOTSPECIFIED : 'cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTSPECIFIED',
    CORRECT : 'cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT',
    OUTSIDE : 'cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE',
    NOTFOUND : 'cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND'
};
