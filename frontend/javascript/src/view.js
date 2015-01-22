goog.provide('cz.mzk.authorities.verif.View');
goog.provide('cz.mzk.authorities.verif.View.EventType');

goog.require('goog.asserts');
goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('cz.mzk.authorities.verif.NominatimEvent');

goog.require('cz.mzk.authorities.verif.Map');
goog.require('cz.mzk.authorities.verif.Authority');
goog.require('cz.mzk.authorities.verif.NominatimControl');

goog.require('cz.mzk.ui.Select');
goog.require('cz.mzk.ui.Label');

goog.require('goog.ui.menuBar');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Container.Orientation');
goog.require('goog.ui.CheckBoxMenuItem');
goog.require('goog.ui.Select');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuSeparator');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Button');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.FlatButtonRenderer');

/**
 * Class representing View
 * @constructor
 * @param {Element} mapElement
 * @param {Element} mapLayerSwitcherElement
 * @param {Element} menuTopElement
 * @param {Element} infoElement
 * @param {Element} nominatimElement
 * @param {Element} loadingElement
 * @extends {goog.events.EventTarget}
 */
cz.mzk.authorities.verif.View = function(mapElement, mapLayerSwitcherElement,
    menuTopElement, infoElement, nominatimElement, loadingElement) {
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
  this.layerSelect_ = this.createLayerSelect_();
  /**
   * @private
   * @type {goog.ui.Container}
   */
  this.menuTop_ = goog.ui.menuBar.create();
  this.menuTop_.setOrientation(goog.ui.Container.Orientation.VERTICAL);
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
  var selectItemCorrect = new goog.ui.MenuItem('Shoda');
  /**
   * @type {goog.ui.MenuItem}
   */
  var selectItemOutside = new goog.ui.MenuItem('Neshoda');
  /**
   * @type {goog.ui.MenuItem}
   */
  var selectItemNotfound = new goog.ui.MenuItem('Nenalezeno');
  selectItemCorrect.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.CORRECT);
  selectItemOutside.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.OUTSIDE);
  selectItemNotfound.setValue(cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTFOUND);
  /**
   * @private
   * @type {goog.ui.Select}
   */
  this.categorySelect_ = new cz.mzk.ui.Select('Míra shody');
  this.categorySelect_.addItem(selectItemCorrect);
  this.categorySelect_.addItem(selectItemOutside);
  this.categorySelect_.addItem(selectItemNotfound);
  /**
   * @private
   * @type {goog.ui.Select}
   */
  this.levelSelect_ = new cz.mzk.ui.Select('Náročnost zpracování');
  this.levelSelect_.addItem(new goog.ui.MenuItem('Základní'));
  this.levelSelect_.addItem(new goog.ui.MenuItem('Obtížná'));
  this.levelSelect_.addItem(new goog.ui.MenuItem('Velmi obtížná'));
  this.levelSelect_.setEnabled(false);
  /**
   * @private
   * @type {cz.mzk.ui.Label}
   */
  this.buttonsLabel_ = new cz.mzk.ui.Label('Navigace');
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToOriginalButton_ = new goog.ui.MenuItem('Původní souřadnice');
  this.moveToOriginalButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToNominatimButton_ = new goog.ui.MenuItem('Nominatim souřadnice');
  this.moveToNominatimButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.MenuItem}
   */
  this.moveToBothButton_ = new goog.ui.MenuItem('Obojí');
  this.moveToBothButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.CheckBoxMenuItem}
   */
  this.polygonCheckbox_ = new goog.ui.CheckBoxMenuItem('Zobrazit polygon');
  this.polygonCheckbox_.setEnabled(false);
  this.polygonCheckbox_.setChecked(true);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.verifiedButton_ = new goog.ui.Button('Uložit výběr',
      goog.ui.FlatButtonRenderer.getInstance());
  this.verifiedButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.skipButton_ = new goog.ui.Button('Obtížná',
      goog.ui.FlatButtonRenderer.getInstance());
  this.skipButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.createBBoxButton_ = this.createCreateBBoxButton_();
  this.createBBoxButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.undoButton_ = this.createHistoryButton_('undo');
  this.undoButton_.setEnabled(false);
  /**
   * @private
   * @type {goog.ui.Button}
   */
  this.redoButton_ = this.createHistoryButton_('redo');
  this.redoButton_.setEnabled(false);
  /**
   * @private
   * @type {cz.mzk.authorities.verif.NominatimControl}
   */
  this.nominatimControl_ = new cz.mzk.authorities.verif.NominatimControl();
  this.nominatimControl_.setEnabled(false);
  this.menuTop_.addChild(this.categorySelect_, true);
  this.menuTop_.addChild(this.levelSelect_, true);
  this.menuTop_.addChild(this.buttonsLabel_, true);
  this.menuTop_.addChild(this.moveToOriginalButton_, true);
  this.menuTop_.addChild(this.moveToNominatimButton_, true);
  this.menuTop_.addChild(this.moveToBothButton_, true);
  this.menuTop_.addChild(new goog.ui.MenuSeparator, true);
  this.menuTop_.addChild(this.polygonCheckbox_, true);
  this.menuTop_.addChild(this.verifiedButton_, true);
  this.menuTop_.addChild(this.skipButton_, true);
  this.menuTop_.addChild(this.createBBoxButton_, true);
  this.menuTop_.addChild(this.undoButton_, true);
  this.menuTop_.addChild(this.redoButton_, true);

  this.layerSelect_.render(mapLayerSwitcherElement);
  this.menuTop_.render(menuTopElement);
  this.nominatimControl_.render(this.nominatimElement_);
  /**
   * @type {cz.mzk.authorities.verif.View}
   */
  var this_ = this;
  goog.events.listen(this.layerSelect_, goog.events.EventType.CHANGE, function(e) {
    this_.map_.setBaseLayer(this.getValue());
  });
  goog.events.listen(this.categorySelect_, goog.events.EventType.CHANGE, function(e) {
    this_.polygonCheckbox_.setEnabled(false);
    this_.nominatimControl_.setEnabled(false);
    this_.createBBoxButton_.setEnabled(false);
    this_.polygonCheckbox_.setEnabled(false);
    this_.moveToOriginalButton_.setEnabled(false);
    this_.moveToNominatimButton_.setEnabled(false);
    this_.moveToBothButton_.setEnabled(false);
    this_.info_.innerHTML = '';
    this_.verifiedButton_.setEnabled(false);
    this_.skipButton_.setEnabled(false);
    this_.map_.clear();
    this_.dispatchEvent({
      type: cz.mzk.authorities.verif.View.EventType.CATEGORY_CHANGED
    });
  });
  goog.events.listen(this.map_,
      cz.mzk.authorities.verif.Map.EventType.BBOX_CHANGED, function(e) {
    /** @type {OpenLayers.Bounds} */
    var bounds = e.bounds;
    var array = bounds.toArray();
    this_.authority_.setNominatimWest(array[0]);
    this_.authority_.setNominatimSouth(array[1]);
    this_.authority_.setNominatimEast(array[2]);
    this_.authority_.setNominatimNorth(array[3]);
    this_.setControls_(this_.authority_);
    this_.verifiedButton_.setEnabled(true);
    this_.createBBoxButton_.setChecked(false);
  });
  goog.events.listen(this.levelSelect_, goog.events.EventType.CHANGE, function(e) {
    this_.dispatchEvent({
      type: cz.mzk.authorities.verif.View.EventType.LEVEL_CHANGED
    });
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
  goog.events.listen(this.createBBoxButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.setActivateCreateBBox(this.isChecked());
  });
  goog.events.listen(this.undoButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.undo();
  });
  goog.events.listen(this.redoButton_, goog.ui.Component.EventType.ACTION, function(e) {
    this_.map_.redo();
  });
  goog.events.listen(this.map_, cz.mzk.authorities.verif.Map.EventType.HISTORY_CHANGED, function(e) {
    this_.undoButton_.setEnabled(this.hasUndo());
    this_.redoButton_.setEnabled(this.hasRedo());
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
    this_.map_.showAuthority(this_.authority_, false);
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
  return /** @type {number} */ (this.levelSelect_.getValue());
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
  this.nominatimControl_.setQuery(authority.getInfo()['151']['a']);
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
  this.moveToBothButton_.setEnabled(false);
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
  this.levelSelect_.setSelectedItem(null);
};

/**
 * Sets items of levelSelect.
 * @param {!Array.<number>} levels
 */
cz.mzk.authorities.verif.View.prototype.setLevels = function(levels) {
  goog.array.sort(levels);
  var selectedItem = this.levelSelect_.getSelectedItem();
  var item1 = this.levelSelect_.getItemAt(0);
  var item2 = this.levelSelect_.getItemAt(1);
  var item3 = this.levelSelect_.getItemAt(2);
  item1.setValue(1);
  item2.setValue(2);
  item3.setValue(goog.array.peek(levels));
  item1.setEnabled(goog.array.contains(levels, 1) || item1 == selectedItem);
  item2.setEnabled(goog.array.contains(levels, 2) || item2 == selectedItem);
  item3.setEnabled(goog.array.some(levels, function(e, i, a) {return e >= 3}) ||
      item3 == selectedItem);
};

/**
 * Sets enabled of levelSelect.
 * @param {boolean} val
 */
cz.mzk.authorities.verif.View.prototype.setLevelSelectEnabled = function(val) {
  if (!val) {
    this.levelSelect_.setSelectedItem(null);
  }
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

  var authInfo = authority.getInfo();
  for (var marcCode in authInfo) {
    var field = authInfo[marcCode];
    this.info_.innerHTML += '<strong>' + marcCode + '</strong>';
    if (typeof(field) == 'string') {
      this.info_.innerHTML += ':&nbsp;' + field + '<br/>';
    } else if (typeof(field) == 'object') {
      this.info_.innerHTML += '<br/>';
      for (var fieldCode in field) {
        this.info_.innerHTML += '&nbsp;&nbsp<strong>' + fieldCode + '</strong>';
        this.info_.innerHTML += ':&nbsp;' + field[fieldCode] + '<br/>';
      }
    }
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
  this.createBBoxButton_.setEnabled(true);
};

/**
 * Creates LayerSwitcher
 * @return {goog.ui.Select}
 */
cz.mzk.authorities.verif.View.prototype.createLayerSelect_ = function() {
  var select = new goog.ui.Select();
  select.setRenderMenuAsSibling(true);
  var layers = this.map_.getMapLayers();
  for (var i = 0; i < layers.length; i++) {
    var item = new goog.ui.MenuItem(layers[i].name);
    item.setValue(layers[i]);
    select.addItem(item);
  }
  select.setSelectedIndex(0);
  return select;
}

/**
 * Creates CreateBBoxButton
 * @return {goog.ui.Button}
 */
cz.mzk.authorities.verif.View.prototype.createCreateBBoxButton_ = function() {
  var content = goog.dom.createElement('div');
  var img = goog.dom.createDom('img', {'src': '/img/createbbox.png'});
  var span = goog.dom.createDom('span', {}, 'Označit oblast výběrem');
  goog.dom.appendChild(content, img);
  goog.dom.appendChild(content, span);
  var button = new goog.ui.ToggleButton(content,
      /** @type {goog.ui.FlatButtonRenderer} */
      (goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.FlatButtonRenderer, 'goog-image-button')));
  return button;
}

/**
 * Creates History Button
 * @param {string} type
 * @return {goog.ui.Button}
 */
cz.mzk.authorities.verif.View.prototype.createHistoryButton_ = function(type) {
  var content = goog.dom.createElement('div');
  var img;
  if (type == 'undo') {
    img = goog.dom.createDom('img', {'src': '/img/undo.png'});
  } else if (type == 'redo') {
    img = goog.dom.createDom('img', {'src': '/img/redo.png'});
  }
  goog.dom.appendChild(content, /** @type {Node} */ (img));
  var button = new goog.ui.Button(content,
      /** @type {goog.ui.FlatButtonRenderer} */
      (goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.FlatButtonRenderer, 'goog-image-button')));
  button.addClassName('goog-image-button-' + type);
  return button;
}

/**
 * @enum {!string}
 */
cz.mzk.authorities.verif.View.EventType = {
    CATEGORY_CHANGED : 'category-changed',
    LEVEL_CHANGED : 'level-changed',
    VERIFIED_ACTION : 'verified-action',
    SKIP_ACTION : 'skip-action'
}
