goog.provide('cz.mzk.authorities.verif.View');
goog.provide('cz.mzk.authorities.verif.View.EventType');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('cz.mzk.authorities.verif.NominatimEvent');

goog.require('cz.mzk.authorities.verif.Map');
goog.require('cz.mzk.authorities.verif.Authority');
goog.require('cz.mzk.authorities.verif.NominatimControl');

goog.require('goog.ui.menuBar');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Container.Orientation');
goog.require('goog.ui.CheckBoxMenuItem');
goog.require('goog.ui.Select');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Button');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');

/**
 * Class representing View
 * @constructor
 * @param {Element} mapElement
 * @param {Element} menuTopElement
 * @param {Element} menuBottomElement
 * @param {Element} infoElement
 * @param {Element} nominatimElement
 * @param {Element} loadingElement
 * @extends {goog.events.EventTarget}
 */
cz.mzk.authorities.verif.View = function(mapElement, menuTopElement, menuBottomElement, infoElement, nominatimElement, loadingElement) {
  goog.events.EventTarget.call(this);
  /**
   * @private
   * @type {?cz.mzk.authorities.verif.Authority}
   */
  this.authority_ = null;
  /**
   * @private
   * @type {cz.mzk.authorities.verif.Map}
   */
  this.map_ = new cz.mzk.authorities.verif.Map(mapElement);
  /**
   * @private
   * @type {goog.ui.Container}
   */
  this.menuTop_ = goog.ui.menuBar.create();
  this.menuTop_.setOrientation(goog.ui.Container.Orientation.VERTICAL);
  /**
   * @private
   * @type {goog.ui.Container}
   */
  this.menuBottom_ = goog.ui.menuBar.create();
  this.menuBottom_.setOrientation(goog.ui.Container.Orientation.VERTICAL);
  /**
   * @private
   * @type {Element}
   */
  this.info_ = infoElement;
  /**
   * @private
   * @type {Element}
   */
  this.nominatimElement_ = nominatimElement;
  /**
   * @private
   * @type {Element}
   */
  this.loadingElement_ = loadingElement;
  /**
   * @type {goog.ui.MenuItem}
   */
  var selectItemCorrect = new goog.ui.MenuItem('Korektní');
  /**
   * @type {goog.ui.MenuItem}
   */
  var selectItemOutside = new goog.ui.MenuItem('Mimo');
  /**
   * @type {goog.ui.MenuItem}
   */
  var selectItemNotfound = new goog.ui.MenuItem('Nenalezení');
  selectItemCorrect.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT);
  selectItemOutside.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE);
  selectItemNotfound.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND);
  /**
   * @private
   * @type {goog.ui.Select}
   */
  this.categorySelect_ = new goog.ui.Select('Vyberte kategorii');
  this.categorySelect_.addItem(selectItemCorrect);
  this.categorySelect_.addItem(selectItemOutside);
  this.categorySelect_.addItem(selectItemNotfound);
  /**
   * @private
   * @type {goog.ui.Select}
   */
  this.levelSelect_ = new goog.ui.Select('Vyberte level');
  this.levelSelect_.setEnabled(false);
  /**
   * If it is set to true, the LEVEL_CHANGED events won't be fired.
   * @private
   * @type {boolean}
   */
  this.silentLevelSelect_ = true;
  /**
   * @private
   * @type {Array.<goog.ui.MenuItem>}
   */
  this.levelSelectItems_ = [];
  /**
   * @private
   * @type {goog.ui.CheckBoxMenuItem}
   */
  this.polygonCheckbox_ = new goog.ui.CheckBoxMenuItem('Zobrazit polygon');
  this.polygonCheckbox_.setEnabled(false);
  this.polygonCheckbox_.setChecked(true);
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToOriginalButton_ = new goog.ui.MenuItem('Přejít na původní souřadnice');
  this.moveToOriginalButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToNominatimButton_ = new goog.ui.MenuItem('Přejít na nominatim souřadnice');
  this.moveToNominatimButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToBothButton_ = new goog.ui.MenuItem('Přejít na obojí');
  this.moveToBothButton_.setEnabled(false);
  /**
   * @private
   * @type {cz.mzk.authorities.verif.NominatimControl}
   */
  this.nominatimControl_ = new cz.mzk.authorities.verif.NominatimControl();
  this.nominatimControl_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.verifiedButton_ = new goog.ui.Button('Správně');
  this.verifiedButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.skipButton_ = new goog.ui.Button('Přeskočit');
  this.skipButton_.setEnabled(false);
  this.menuTop_.addChild(this.categorySelect_, true);
  this.menuTop_.addChild(this.levelSelect_, true);
  this.menuTop_.addChild(this.polygonCheckbox_, true);
  this.menuTop_.addChild(this.moveToOriginalButton_, true);
  this.menuTop_.addChild(this.moveToNominatimButton_, true);
  this.menuTop_.addChild(this.moveToBothButton_, true);
  this.menuBottom_.addChild(this.verifiedButton_, true);
  this.menuBottom_.addChild(this.skipButton_, true);
  this.menuTop_.render(menuTopElement);
  this.menuBottom_.render(menuBottomElement);
  this.nominatimControl_.render(this.nominatimElement_);
  /**
   * @type {cz.mzk.authorities.verif.View}
   */
  var this_ = this;
  goog.events.listen(this.categorySelect_, goog.events.EventType.CHANGE, function(e) {
    this_.polygonCheckbox_.setEnabled(false);
    this_.moveToOriginalButton_.setEnabled(false);
    this_.moveToNominatimButton_.setEnabled(false);
    this_.info_.innerHTML = '';
    this_.verifiedButton_.setEnabled(false);
    this_.skipButton_.setEnabled(false);
    this_.map_.clear();
    this_.dispatchEvent({
      type: cz.mzk.authorities.verif.View.EventType.CATEGORY_CHANGED
    });
  });
  goog.events.listen(this.map_, 'sketchcomplete', function(e) {
    /** @type {OpenLayers.Bounds} */
    var bounds = e['bounds'];
    var array = bounds.toArray();
    this_.authority_.setNominatimWest(array[0]);
    this_.authority_.setNominatimSouth(array[1]);
    this_.authority_.setNominatimEast(array[2]);
    this_.authority_.setNominatimNorth(array[3]);
    this_.setControls_(this_.authority_);
    this_.verifiedButton_.setEnabled(true);
  });
  goog.events.listen(this.levelSelect_, goog.events.EventType.CHANGE, function(e) {
    if (!this_.silentLevelSelect_) {
      this_.dispatchEvent({
        type: cz.mzk.authorities.verif.View.EventType.LEVEL_CHANGED
      });
    }
  });
  goog.events.listen(this.moveToOriginalButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.moveToOriginal(this_.authority_);
  });
  goog.events.listen(this.moveToNominatimButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.moveToNominatim(this_.authority_);
  });
  goog.events.listen(this.moveToBothButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.moveTo(this_.authority_);
  });
  goog.events.listen(this.verifiedButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.dispatchEvent({
      type: cz.mzk.authorities.verif.View.EventType.VERIFIED_ACTION
    });
  });
  goog.events.listen(this.skipButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.dispatchEvent({
      type: cz.mzk.authorities.verif.View.EventType.SKIP_ACTION
    });
  });
  goog.events.listen(this.nominatimControl_, cz.mzk.authorities.verif.NominatimEvent.NOMINATIM_ACTION, function(e) {
    var nominatimData = e.target['nominatim'];
    var west = nominatimData['west'];
    var east = nominatimData['east'];
    var north = nominatimData['north'];
    var south = nominatimData['south'];
    goog.asserts.assertNumber(west);
    goog.asserts.assertNumber(east);
    goog.asserts.assertNumber(north);
    goog.asserts.assertNumber(south);
    this_.authority_.setNominatimWest(west);
    this_.authority_.setNominatimEast(east);
    this_.authority_.setNominatimNorth(north);
    this_.authority_.setNominatimSouth(south);
    if (nominatimData['polygon']) {
      var polygon = nominatimData['polygon'];
      goog.asserts.assertArray(polygon);
      this_.authority_.setNominatimPolygon(polygon);
    } else {
      this_.authority_.setNominatimPolygon(null);
    }
    this_.setControls_(this_.authority_);
    this_.map_.showAuthority(this_.authority_);
  });
};

goog.inherits(cz.mzk.authorities.verif.View, goog.events.EventTarget);

/**
 * Returns selected category.
 * @return {!cz.mzk.authorities.verif.AuthorityManager.CategoryType}
 */
cz.mzk.authorities.verif.View.prototype.getSelectedCategory = function() {
  var returnedValue = this.categorySelect_.getValue();
  if (returnedValue == cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT) {
    return cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT;
  } else if (returnedValue == cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE) {
    return cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE;
  } else if (returnedValue == cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND) {
    return cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND;
  } else {
    return cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTSPECIFIED;
  }
};

/**
 * Returnes selected level.
 * @return {!number}
 */
cz.mzk.authorities.verif.View.prototype.getSelectedLevel = function() {
  return parseInt(this.levelSelect_.getValue(), 10);
};

/**
 * Shows Authority on the map.
 * @param {!cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.View.prototype.showAuthority = function(authority) {
  this.authority_ = authority;
  this.map_.showAuthority(authority);
  this.map_.setVisibleNominatimPolygon(this.polygonCheckbox_.isChecked());
  this.showInfo_(authority);
  this.setControls_(authority);
  this.nominatimControl_.setQuery(authority.getAddress());
};

/**
 * Show message in the dialog.
 * @param {!string} message
 */
cz.mzk.authorities.verif.View.prototype.alert = function(message) {
  /** @type {goog.ui.Dialog} */
  var dialog = new goog.ui.Dialog();
  dialog.setModal(true);
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
  dialog.setTitle('Info');
  dialog.setContent(message);
  dialog.setVisible(true);
}

/**
 * Clear the View.
 */
cz.mzk.authorities.verif.View.prototype.clear = function() {
  this.unselectCategory();
  this.clearLevels();
  this.levelSelect_.setEnabled(false);
  this.polygonCheckbox_.setEnabled(false);
  this.moveToOriginalButton_.setEnabled(false);
  this.moveToNominatimButton_.setEnabled(false);
  this.info_.innerHTML = '';
  this.nominatimControl_.setEnabled(false);
  this.verifiedButton_.setEnabled(false);
  this.skipButton_.setEnabled(false);
  this.map_.clear();
};

/**
 * Unselects category.
 */
cz.mzk.authorities.verif.View.prototype.unselectCategory = function() {
  this.categorySelect_.setSelectedItem(null);
};

/**
 * Clear items of levelSelect.
 */
cz.mzk.authorities.verif.View.prototype.clearLevels = function() {
  for (var i = 0; i < this.levelSelectItems_.length; i++) {
    this.levelSelect_.removeItem(this.levelSelectItems_[i]);
  }
  this.levelSelectItems_ = [];
};

/**
 * Sets items of levelSelect.
 * @param {!Array.<number>} levels
 */
cz.mzk.authorities.verif.View.prototype.setLevels = function(levels) {
  this.silentLevelSelect_ = true;
  var level = this.levelSelect_.getValue();
  this.clearLevels();
  for (var i = 0; i < levels.length; i++) {
    var menuItem = new goog.ui.MenuItem(levels[i].toString());
    this.levelSelect_.addItem(menuItem);
    this.levelSelectItems_.push(menuItem);
  }
  this.levelSelect_.setValue(level);
  this.silentLevelSelect_ = false;
};

/**
 * Sets enabled of levelSelect.
 * @param {boolean} val
 */
cz.mzk.authorities.verif.View.prototype.setLevelSelectEnabled = function(val) {
  this.levelSelect_.setEnabled(val);
};

/**
 * Returns bounding box of verified authority.
 * @return {?OpenLayers.Bounds}
 */
cz.mzk.authorities.verif.View.prototype.getBBox = function() {
  return this.map_.getBBox();
};

/**
 * Sets visible of loading overlay.
 * @param {boolean} val
 */
cz.mzk.authorities.verif.View.prototype.setLoading = function(val) {
  if (val) {
    this.loadingElement_.style.display = 'block';
  } else {
    this.loadingElement_.style.display = 'none';
  }
};

/**
 * Shows info about authority.
 * @param {!cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.View.prototype.showInfo_ = function(authority) {
  this.info_.innerHTML = '<strong>Informace o autoritě</strong><br/>';
  this.info_.innerHTML += '<i>ID: </i>' + authority.getId() + '<br/>';
  this.info_.innerHTML += '<i>Adresa: </i>' + authority.getAddress() + '<br/>';
  this.info_.innerHTML += '<i>Typ: </i>' + authority.getType() + '<br/>';
  if (authority.hasOriginalCoors()) {
    this.info_.innerHTML += '<strong>Původní souřadnice:</strong><br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>W: </i>' + authority.getOriginalWest() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>E: </i>' + authority.getOriginalEast() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>N: </i>' + authority.getOriginalNorth() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>S: </i>' + authority.getOriginalSouth() + '°<br/>';
  }
  if (authority.hasNominatimCoors()) {
    this.info_.innerHTML += '<strong>Souřadnice nalezené nominatimem:</strong><br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>W: </i>' + authority.getNominatimWest() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>E: </i>' + authority.getNominatimEast() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>N: </i>' + authority.getNominatimNorth() + '°<br/>';
    this.info_.innerHTML += '&nbsp;&nbsp;<i>S: </i>' + authority.getNominatimSouth() + '°<br/>';
  }
};

/**
 * Sets ui controls in menu.
 * @param {!cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.View.prototype.setControls_ = function(authority) {
  if (authority.hasNominatimPolygon()) {
    this.polygonCheckbox_.setEnabled(true);
    goog.events.removeAll(this.polygonCheckbox_, goog.ui.Component.EventType.ACTION);

    var map = this.map_;
    goog.events.listen(this.polygonCheckbox_, goog.ui.Component.EventType.ACTION, function(e) {
      map.setVisibleNominatimPolygon(e.target.isChecked());
    });
  } else {
    this.polygonCheckbox_.setEnabled(false);
    goog.events.removeAll(this.polygonCheckbox_, goog.ui.Component.EventType.ACTION);
  }
  if (authority.hasOriginalCoors() && authority.hasNominatimCoors()) {
    this.moveToBothButton_.setEnabled(true);
  }
  if (authority.hasOriginalCoors()) {
    this.moveToOriginalButton_.setEnabled(true);
  }
  if (authority.hasNominatimCoors()) {
    this.moveToNominatimButton_.setEnabled(true);
    this.verifiedButton_.setEnabled(true);
  }
  this.nominatimControl_.setEnabled(true);
  this.skipButton_.setEnabled(true);
};

/**
 * @enum {!string}
 */
cz.mzk.authorities.verif.View.EventType = {
    CATEGORY_CHANGED : 'category-changed',
    LEVEL_CHANGED : 'level-changed',
    VERIFIED_ACTION : 'verified-action',
    SKIP_ACTION : 'skip-action'
}
