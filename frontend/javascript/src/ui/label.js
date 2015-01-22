goog.provide('cz.mzk.ui.Label');

goog.require('goog.ui.Component');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');

/**
 * @param {goog.ui.ControlContent=} opt_content Text caption or DOM structure
 *     to display as the content of the control (if any).
 * @param {goog.ui.ControlRenderer=} opt_renderer Renderer used to render or
 *     decorate the component; defaults to {@link goog.ui.ControlRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
cz.mzk.ui.Label = function(opt_content, opt_renderer, opt_domHelper) {
  var renderer;
  if (opt_renderer) {
    renderer = opt_renderer;
  } else {
    renderer = goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.ControlRenderer,
        'goog-menu-label');
  }
  goog.ui.Control.call(this, opt_content, renderer, opt_domHelper);
  this.setStateInternal(goog.ui.Component.State.DISABLED);
}

goog.inherits(cz.mzk.ui.Label, goog.ui.Control);
