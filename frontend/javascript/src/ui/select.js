goog.provide('cz.mzk.ui.Select');

goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.MenuRenderer');

goog.require('goog.ui.Select');
goog.require('goog.dom');

/**
 * @param {goog.ui.ControlContent=} opt_caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 *     Defaults to no caption.
 * @param {goog.ui.Menu=} opt_menu Menu containing selection options.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the control; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM hepler, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 * @constructor
 * @extends {goog.ui.Select}
 */
cz.mzk.ui.Select = function(opt_caption, opt_menu, opt_renderer, opt_domHelper,
    opt_menuRenderer) {
  var renderer;
  var menuRenderer;
  if (opt_renderer) {
    renderer = opt_renderer;
  } else {
    renderer = goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.CustomButtonRenderer,
        'goog-menu-select');
  }
  if (opt_menuRenderer) {
    menuRenderer = opt_menuRenderer;
  } else {
    menuRenderer = goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.MenuRenderer,
        'goog-menu-select-items');
  }
  goog.ui.Select.call(this, opt_caption, opt_menu,
      /** @type {goog.ui.CustomButtonRenderer} */ (renderer), opt_domHelper,
      /** @type {!goog.ui.MenuRenderer} */ (menuRenderer));
}

goog.inherits(cz.mzk.ui.Select, goog.ui.Select);

/** @override */
cz.mzk.ui.Select.prototype.enterDocument = function() {
  cz.mzk.ui.Select.superClass_.enterDocument.call(this);
  this.renderMenu_();
}

/** @override */
cz.mzk.ui.Select.prototype.setOpen = function(open, opt_e) {
  // Do nothing
}

/** @override */
cz.mzk.ui.Select.prototype.updateCaption = function() {
  // Do nothing
}

/** @override */
cz.mzk.ui.Select.prototype.setMenu = function(menu) {
  var oldMenu = cz.mzk.ui.Select.superClass_.setMenu.call(this, menu);
  var selectionModel = this.getSelectionModel();
  if (this.isEnabled() &&
      selectionModel.getSelectionHandler() != this.handleSelectItem_) {
    selectionModel.setSelectionHandler(this.handleSelectItem_);
  }
  return oldMenu;
}

/** @override */
cz.mzk.ui.Select.prototype.addItem = function(item) {
  cz.mzk.ui.Select.superClass_.addItem.call(this, item);
  var selectionModel = this.getSelectionModel();
  if (this.isEnabled() &&
      selectionModel.getSelectionHandler() != this.handleSelectItem_) {
    selectionModel.setSelectionHandler(this.handleSelectItem_);
  }
}

/** @override */
cz.mzk.ui.Select.prototype.addItemAt = function(item, index) {
  cz.mzk.ui.Select.superClass_.addItemAt.call(this, item, index);
  var selectionModel = this.getSelectionModel();
  if (this.isEnabled() &&
      selectionModel.getSelectionHandler() != this.handleSelectItem_) {
    selectionModel.setSelectionHandler(this.handleSelectItem_);
  }
}

/** @override */
cz.mzk.ui.Select.prototype.setEnabled = function(enabled) {
  cz.mzk.ui.Select.superClass_.setEnabled.call(this, enabled);
  var selectionModel = this.getSelectionModel();
  if (!selectionModel) {
    return;
  }
  if (enabled) {
    if (selectionModel.getSelectionHandler() != this.handleSelectItem_) {
      selectionModel.setSelectionHandler(this.handleSelectItem_);
    }
  } else {
    if (selectionModel.getSelectionHandler() == this.handleSelectItem_) {
      selectionModel.setSelectionHandler(null);
    }
  }
  if (!enabled) {
    for (var i = 0; i < this.getItemCount(); i++) {
      this.getItemAt(i).setEnabled(enabled);
    }
  }
}

/**
 * @private
 */
cz.mzk.ui.Select.prototype.renderMenu_ = function() {
  if (!this.getMenu().isInDocument()) {
    this.getMenu().render(/** @type {Element} */ (this.getElement()));
  }
  this.getMenu().setVisible(true);
}

/**
 * @param {Object} item Item to select or deselect.
 * @param {boolean} select If true, the object will be selected; if false, it
 *     will be deselected.
 * @private
 */
cz.mzk.ui.Select.prototype.handleSelectItem_ = function(item, select) {
  var menuItem = /** @type {goog.ui.MenuItem} */ (item);
  if (select) {
    menuItem.addClassName('goog-menuitem-selected');
  } else {
    menuItem.removeClassName('goog-menuitem-selected');
  }
}
