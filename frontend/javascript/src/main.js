goog.provide('cz.mzk.authorities.verif.main');

goog.require('cz.mzk.authorities.verif.Authority');
goog.require('cz.mzk.authorities.verif.AuthorityManager');
goog.require('cz.mzk.authorities.verif.AuthorityManager.CategoryType');
goog.require('cz.mzk.authorities.verif.View');
goog.require('cz.mzk.authorities.verif.View.EventType');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.asserts');

cz.mzk.authorities.verif.main = function() {
  // Init logger
  goog.debug.Console.autoInstall();

  var authorityManager = new cz.mzk.authorities.verif.AuthorityManager('http://verifikace.mzk.cz/backend');
  //var authorityManager = new cz.mzk.authorities.verif.AuthorityManager('http://devel.auth.verif.mzk.cz/backend');
  var view = new cz.mzk.authorities.verif.View(
      goog.dom.getElement('map-canvas'),
      goog.dom.getElement('map-layer-switcher'),
      goog.dom.getElement('menu-top'),
      goog.dom.getElement('info'),
      goog.dom.getElement('nominatim'),
      goog.dom.getElement('loading-overlay')
  );

  // Define Events
  goog.events.listen(view, cz.mzk.authorities.verif.View.EventType.CATEGORY_CHANGED, function(e) {
    var category = view.getSelectedCategory();
    if (category != cz.mzk.authorities.verif.AuthorityManager.CategoryType.NOTSPECIFIED) {
      view.setLevelSelectEnabled(false);
      authorityManager.setCategory(category);
      view.setLoading(true);
      authorityManager.getLevels(function(code, levels) {
        view.setLoading(false);
        if (code == 'OK') {
          goog.asserts.assert(levels != null);
          view.clearLevels();
          view.setLevels(levels);
          view.setLevelSelectEnabled(true);
        } else if (code == 'ERROR') {
          view.alert('Chyba při přenosu, opakujte akci.');
          view.unselectCategory();
        }
      });
    }
  });
  goog.events.listen(view, cz.mzk.authorities.verif.View.EventType.LEVEL_CHANGED, function(e) {
    if (!view.getSelectedLevel()) {
      return;
    }
    authorityManager.setLevel(view.getSelectedLevel());
    view.setLoading(true);
    authorityManager.getNext(false, function(code, authority, levels) {
      view.setLoading(false);
      if (code == 'OK') {
        goog.asserts.assert(authority instanceof cz.mzk.authorities.verif.Authority);
        goog.asserts.assert(levels instanceof Array);
        view.showAuthority(authority);
        view.setLevels(levels);
      } else if (code == 'EOF') {
        view.alert('Ve vybrané kategorii a levelu se nenácházejí žádne další záznamy.');
        view.clear();
      } else if (code == 'ERROR') {
        view.alert('Chyba při přenosu, opakujte akci.');
        view.clear();
      }
    });
  });
  goog.events.listen(view, cz.mzk.authorities.verif.View.EventType.VERIFIED_ACTION, function(e) {
    var bbox = view.getBBox();
    goog.asserts.assert(bbox != null);
    var bboxArray = bbox.toArray();
    var west = bboxArray[0];
    var south = bboxArray[1];
    var east = bboxArray[2];
    var north = bboxArray[3];
    view.setLoading(true);
    authorityManager.verify(west, east, north, south, function(code, authority, levels) {
      view.setLoading(false);
      if (code == 'OK') {
        goog.asserts.assert(authority instanceof cz.mzk.authorities.verif.Authority);
        goog.asserts.assert(levels instanceof Array);
        view.showAuthority(authority);
        view.setLevels(levels);
      } else if (code == 'EOF') {
        view.alert('Ve vybrané kategorii a levelu se nenácházejí žádne další záznamy.');
        view.clear();
      } else if (code == 'ERROR') {
        view.alert('Chyba při přenosu, opakujte akci.');
      }
    });
  });
  goog.events.listen(view, cz.mzk.authorities.verif.View.EventType.SKIP_ACTION, function(e) {
    view.setLoading(true);
    authorityManager.getNext(true, function(code, authority, levels) {
      view.setLoading(false);
      if (code == 'OK') {
        goog.asserts.assert(authority instanceof cz.mzk.authorities.verif.Authority);
        goog.asserts.assert(levels instanceof Array);
        view.showAuthority(authority);
        view.setLevels(levels);
      } else if (code == 'EOF') {
        view.alert('Ve vybrané kategorii a levelu se nenácházejí žádne další záznamy.');
        view.clear();
      } else if (code == 'ERROR') {
        view.alert('Chyba při přenosu, opakujte akci.');
      }
    });
  });
  goog.events.listen(window, goog.events.EventType.BEFOREUNLOAD, function(e) {
    authorityManager.free();
  });
};

goog.exportSymbol('main', cz.mzk.authorities.verif.main);
