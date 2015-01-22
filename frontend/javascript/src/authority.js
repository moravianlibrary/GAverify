goog.provide('cz.mzk.authorities.verif.Authority');

/**
 * @typedef {{id: (string|undefined),
 *          info: (Object|undefined),
 *          originalWest: (number|undefined),
 *          originalEast: (number|undefined),
 *          originalNorth: (number|undefined),
 *          originalSouth: (number|undefined),
 *          nominatimWest: (number|undefined),
 *          nominatimEast: (number|undefined),
 *          nominatimNorth: (number|undefined),
 *          nominatimSouth: (number|undefined),
 *          nominatimPolygon: (Array.<Array.<number>>|undefined),
 *          uuid: string}}
 */
cz.mzk.authorities.verif.AuthorityOptions;

/**
 * Class representing geographic authority.
 * @constructor
 * @param {cz.mzk.authorities.verif.AuthorityOptions} options
 */
cz.mzk.authorities.verif.Authority = function(options) {
  /**
   * @private
   * @type {!string}
   */
  this.id_ = options.id || "";
  /**
   * @private
   * @type {!Object}
   */
  this.info_ = options.info || {};
  /**
   * @private
   * @type {?number}
   */
  this.originalWest_ = options.originalWest || null;
  /**
   * @private
   * @type {?number}
   */
  this.originalEast_ = options.originalEast || null;
  /**
   * @private
   * @type {?number}
   */
  this.originalNorth_ = options.originalNorth || null;
  /**
   * @private
   * @type {?number}
   */
  this.originalSouth_ = options.originalSouth || null;
  /**
   * @private
   * @type {?number}
   */
  this.nominatimWest_ = options.nominatimWest || null;
  /**
   * @private
   * @type {?number}
   */
  this.nominatimEast_ = options.nominatimEast || null;
  /**
   * @private
   * @type {?number}
   */
  this.nominatimNorth_ = options.nominatimNorth || null;
  /**
   * @private
   * @type {?number}
   */
  this.nominatimSouth_ = options.nominatimSouth || null;
  /**
   * @private
   * @type {?Array.<Array.<number>>}
   */
  this.nominatimPolygon_ = options.nominatimPolygon || null;
  /**
   * @private
   * @type {!string}
   */
  this.uuid_ = options.uuid;
}

/**
 * Getter method for id.
 * @return {!string}
 */
cz.mzk.authorities.verif.Authority.prototype.getId = function() {
  return this.id_;
}

/**
 * Setter method for id.
 * @param {!string} value
 */
cz.mzk.authorities.verif.Authority.prototype.setId = function(value) {
  this.id_ = value;
}

/**
 * Getter method for type.
 * @return {!Object}
 */
cz.mzk.authorities.verif.Authority.prototype.getInfo = function() {
  return this.info_;
}

/**
 * Setter method for type.
 * @param {!Object} value
 */
cz.mzk.authorities.verif.Authority.prototype.setInfo = function(value) {
  this.info_ = value;
}

/**
 * Getter method for originalWest.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getOriginalWest = function() {
  return this.originalWest_;
}

/**
 * Setter method for originalWest.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setOriginalWest = function(value) {
  this.originalWest_ = value;
}

/**
 * Getter method for originalEast.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getOriginalEast = function() {
  return this.originalEast_;
}

/**
 * Setter method for originalEast.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setOriginalEast = function(value) {
  this.originalEast_ = value;
}

/**
 * Getter method for originalNorth.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getOriginalNorth = function() {
  return this.originalNorth_;
}

/**
 * Setter method for originalNorth.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setOriginalNorth = function(value) {
  this.originalNorth_ = value;
}

/**
 * Getter method for originalSouth.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getOriginalSouth = function() {
  return this.originalSouth_;
}

/**
 * Setter method for originalSouth.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setOriginalSouth = function(value) {
  this.originalSouth_ = value;
}

/**
 * Getter method for nominatimWest.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getNominatimWest = function() {
    return this.nominatimWest_;
}

/**
 * Setter method for nominatimWest.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setNominatimWest = function(value) {
  this.nominatimWest_ = value;
}

/**
 * Getter method for nominatimEast.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getNominatimEast = function() {
  return this.nominatimEast_;
}

/**
 * Setter method for nominatimEast.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setNominatimEast = function(value) {
  this.nominatimEast_ = value;
}

/**
 * Getter method for nominatimNorth.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getNominatimNorth = function() {
  return this.nominatimNorth_;
}

/**
 * Setter method for nominatimNorth.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setNominatimNorth = function(value) {
  this.nominatimNorth_ = value;
}

/**
 * Getter method for nominatimSouth.
 * @return {?number}
 */
cz.mzk.authorities.verif.Authority.prototype.getNominatimSouth = function() {
  return this.nominatimSouth_;
}

/**
 * Setter method for nominatimSouth.
 * @param {?number} value
 */
cz.mzk.authorities.verif.Authority.prototype.setNominatimSouth = function(value) {
  this.nominatimSouth_ = value;
}

/**
 * Getter method for nominatimPolygon.
 * @return {?Array.<Array.<number>>}
 */
cz.mzk.authorities.verif.Authority.prototype.getNominatimPolygon = function() {
  return this.nominatimPolygon_;
}

/**
 * Setter method for nominatimPolygon.
 * @param {?Array.<Array.<number>>} value
 */
cz.mzk.authorities.verif.Authority.prototype.setNominatimPolygon = function(value) {
  this.nominatimPolygon_ = value;
}

/**
 * Returns uuid.
 * @return {!string}
 */
cz.mzk.authorities.verif.Authority.prototype.getUuid = function() {
  return this.uuid_;
};

/**
 * Returns if authority has set original coordinates.
 * @return {!boolean}
 */
cz.mzk.authorities.verif.Authority.prototype.hasOriginalCoors = function() {
  return this.originalWest_ != null && this.originalEast_ != null
      && this.originalNorth_ != null && this.originalSouth_ != null;
}

/**
 * Returns if authority has set nominatim coordinates.
 * @method
 * @return {!boolean}
 */
cz.mzk.authorities.verif.Authority.prototype.hasNominatimCoors = function() {
  return this.nominatimWest_ != null && this.nominatimEast_ != null
      && this.nominatimNorth_ != null && this.nominatimSouth_ != null;
}

/**
 * Returns if authority has set nominatim polygon.
 * @method
 * @return {!boolean}
 */
cz.mzk.authorities.verif.Authority.prototype.hasNominatimPolygon = function() {
  return this.nominatimPolygon_ != null;
}
