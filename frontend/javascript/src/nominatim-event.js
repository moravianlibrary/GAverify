goog.provide('cz.mzk.authorities.verif.NominatimEvent');

goog.require('goog.events.Event');

/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {!Object} nominatimData
 */
cz.mzk.authorities.verif.NominatimEvent = function(nominatimData) {
  goog.events.Event.call(this, cz.mzk.authorities.verif.NominatimEvent.NOMINATIM_ACTION);
  /**
   * @type {!Object}
   */
  this.nominatimData = nominatimData;
};

cz.mzk.authorities.verif.NominatimEvent.NOMINATIM_ACTION = 'NOMINATIM_ACTION'

goog.inherits(cz.mzk.authorities.verif.NominatimEvent, goog.events.Event);
