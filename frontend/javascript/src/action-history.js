goog.provide('cz.mzk.ActionHistory');

goog.require('goog.array')
goog.require('goog.object')
goog.require('goog.ui.Component.EventType')

/**
 * Class for holding history of actions
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cz.mzk.ActionHistory = function() {
  goog.events.EventTarget.call(this);
  /**
   * @private
   * @type {Array.<Object>}
   */
  this.actions_ = [];
  /**
   * @private
   * @type {number}
   */
  this.pointer_ = 0;
}

goog.inherits(cz.mzk.ActionHistory, goog.events.EventTarget);

/**
 * Add action to history.
 * @param {Object} a
 */
cz.mzk.ActionHistory.prototype.addAction = function(a) {
  var action = /** @type {Object} */ (goog.object.unsafeClone(a));
  if (this.actions_.length == 0) {
    this.actions_.push(action);
  } else {
    if (this.actions_.length != this.pointer_ + 1) {
      this.actions_ = goog.array.slice(this.actions_, 0, this.pointer_ + 1);
    }
    this.actions_.push(action);
    this.pointer_++;
  }
  this.dispatchEvent({
    type: goog.ui.Component.EventType.CHANGE
  });
}

/**
 * Returns previous operation.
 * @return {Object}
 */
cz.mzk.ActionHistory.prototype.undo = function() {
  if (this.pointer_ == 0) {
    return null;
  }
  this.pointer_--;
  this.dispatchEvent({
    type: goog.ui.Component.EventType.CHANGE
  });
  var result = this.actions_[this.pointer_];
  return /** @type {Object} */ (goog.object.unsafeClone(result));
}

/**
 * Returns operation, which was undo before.
 * @return {Object}
 */
cz.mzk.ActionHistory.prototype.redo = function() {
  if (this.actions_.length == 0 || this.pointer_ == this.actions_.length - 1) {
    return null;
  }
  this.pointer_++;
  this.dispatchEvent({
    type: goog.ui.Component.EventType.CHANGE
  });
  var result = this.actions_[this.pointer_];
  return /** @type {Object} */ (goog.object.unsafeClone(result));
}

/**
 * @return {boolean}
 */
cz.mzk.ActionHistory.prototype.hasUndo = function() {
  return this.pointer_ != 0;
}

/**
 * @return {boolean}
 */
cz.mzk.ActionHistory.prototype.hasRedo = function() {
  return this.actions_.length != 0 && this.pointer_ != this.actions_.length - 1;
}

/**
 * Clear history
 */
cz.mzk.ActionHistory.prototype.clear = function() {
  this.actions_ = [];
  this.pointer_ = 0;
  this.dispatchEvent({
    type: goog.ui.Component.EventType.CHANGE
  });
}
