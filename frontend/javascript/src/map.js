goog.provide('cz.mzk.authorities.verif.Map');

goog.require('cz.mzk.authorities.verif.Authority');
goog.require('goog.events.EventTarget');
goog.require('goog.asserts');
goog.require('goog.object');


/**
 * Manages OpenLayers Map.
 * @param {Element} element The element under which the Map should be added.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
cz.mzk.authorities.verif.Map = function(element) {
  goog.events.EventTarget.call(this);
  /** @type {cz.mzk.authorities.verif.Map} */
  var this_ = this;
  /**
   * @private
   * @type {!OpenLayers.Layer.Vector}
   */
  this.originalLayer_ = new OpenLayers.Layer.Vector(
    'original-layer',
    {
      displayInLayerSwitcher: false,
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#cc0000',
        fillOpacity: 1.0,
        strokeColor: '#cc0000',
        strokeWidth: 2,
        // Default options
        cursor: 'inherit',
        fontColor: '000000',
        hoverFillColor: 'white',
        hoverFillOpacity: 0.8,
        hoverPointRadius: 1,
        hoverPointUnit: '%',
        hoverStrokeColor: 'red',
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        labelAlign: 'cm',
        labelOutlineColor: 'white',
        labelOutlineWidth: 3,
        pointRadius: 6,
        pointerEvents: 'visiblePainted',
        strokeDashStyle: 'solid',
        strokeLinecap: 'round',
        strokeOpacity: 1
        })
      }
  );
  /**
   * @private
   * @type {!OpenLayers.Layer.Vector}
   */
  this.nominatimLayer_ = new OpenLayers.Layer.Vector(
    'nominatim-layer',
    {
      displayInLayerSwitcher: false,
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#ffffff',
        fillOpacity: 0.3,
        strokeColor: '#002EB8',
        strokeWidth: 2,
        // Default options
        cursor: 'inherit',
        fontColor: '000000',
        hoverFillColor: 'white',
        hoverFillOpacity: 0.8,
        hoverPointRadius: 1,
        hoverPointUnit: '%',
        hoverStrokeColor: 'red',
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        labelAlign: 'cm',
        labelOutlineColor: 'white',
        labelOutlineWidth: 3,
        pointRadius: 6,
        pointerEvents: 'visiblePainted',
        strokeDashStyle: 'solid',
        strokeLinecap: 'round',
        strokeOpacity: 1
      }),
      eventListeners: {
        sketchcomplete: function(e) {
          if (this_.modifyControl_.feature) {
            this_.modifyControl_.unselectFeature(this_.modifyControl_.feature);
          }
          this.removeAllFeatures();
          this_.createBBoxControl_.deactivate();
          this_.nominatimLayer_.setVisibility(true);
          this_.nominatimLayerZoomOut_.setVisibility(false);
          /** @type {OpenLayers.Feature.Vector} */
          var feature = e.feature;
          /** @type {OpenLayers.Geometry} */
          var geometry = feature.geometry;
          var clone = goog.object.unsafeClone(geometry.getBounds());
          goog.asserts.assert(clone instanceof OpenLayers.Bounds);
          /** @type {OpenLayers.Bounds} */
          var bounds = clone;
          bounds.transform(this_.mapProjection_, this_.gpsProjection_);
          e['bounds'] = bounds;
          this_.dispatchEvent(e);
          return true;
        },
        featureadded: function(e) {
          var point = e.feature.geometry.getBounds().getCenterLonLat();
          var geom = new OpenLayers.Geometry.Point(point.lon, point.lat);
          var feature = new OpenLayers.Feature.Vector(geom);
          this_.nominatimLayerZoomOut_.removeAllFeatures();
          this_.nominatimLayerZoomOut_.addFeatures([feature]);
          this_.modifyControl_.selectFeature(e.feature);
        }
      }
    }
  );
  /**
   * @private
   * @type {!OpenLayers.Layer.Vector}
   */
  this.nominatimLayerZoomOut_ = new OpenLayers.Layer.Vector(
    'nominatim-layer-zoomout',
    {
      displayInLayerSwitcher: false,
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#002EB8',
        fillOpacity: 1.0,
        strokeColor: '#002EB8',
        strokeWidth: 2,
        // Default options
        cursor: 'inherit',
        fontColor: '000000',
        hoverFillColor: 'white',
        hoverFillOpacity: 0.8,
        hoverPointRadius: 1,
        hoverPointUnit: '%',
        hoverStrokeColor: 'red',
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        labelAlign: 'cm',
        labelOutlineColor: 'white',
        labelOutlineWidth: 3,
        pointRadius: 6,
        pointerEvents: 'visiblePainted',
        strokeDashStyle: 'solid',
        strokeLinecap: 'round',
        strokeOpacity: 1
      }),
      visibility: false
    }
  );
  /**
   * @private
   * @type {!OpenLayers.Layer.Vector}
   */
  this.polygonLayer_ = new OpenLayers.Layer.Vector(
    'polygon-layer',
    {
      displayInLayerSwitcher: false,
      styleMap: new OpenLayers.StyleMap({
        fillColor: '#FFCC33',
        fillOpacity: 0.3,
        strokeColor: '#FFCC33',
        strokeWidth: 2
      })
    }
  );
  /**
   * @private
   * @type {!OpenLayers.Map}
   */
  this.map_ = new OpenLayers.Map({
    div: element,
    projection: 'EPSG:900913',
    layers: [
      new OpenLayers.Layer.OSM('MapQuest', [
        'http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png',
        'http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png',
        'http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png',
        'http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png'
      ]),
      new OpenLayers.Layer.Google(
        'Google Physical',
        {type: google.maps.MapTypeId.TERRAIN}
      ),
      new OpenLayers.Layer.Google(
        'Google Hybrid',
        {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
      ),
      this.polygonLayer_,
      this.originalLayer_,
      this.nominatimLayer_,
      this.nominatimLayerZoomOut_
    ],
    eventListeners: {
      /** @type {function(this:OpenLayers.Map)}*/
      'zoomend': function() {
        this_.swapNominatimLayers_();
      }
    },
    center: [0, 0],
    zoom: 1
  });
  this.map_.zoomToMaxExtent();
  /**
   * @private
   * @type {!OpenLayers.Projection}
   */
  this.gpsProjection_ = new OpenLayers.Projection('EPSG:4326');
  /**
   * @private
   * @type {!OpenLayers.Projection}
   */
  this.mapProjection_ = new OpenLayers.Projection('EPSG:900913');
  /**
   * @private
   * @type {!OpenLayers.Control.ModifyRectangle}
   */
  this.modifyControl_ = new OpenLayers.Control.ModifyRectangle(
    this.nominatimLayer_, {
      standalone: true,
      clickout: false
    }
  );
  /**
   * @private
   * @type {!OpenLayers.Control.DrawFeature}
   */
  this.createBBoxControl_ = new OpenLayers.Control.DrawFeature(
    this.nominatimLayer_,
    OpenLayers.Handler.RegularPolygon,
    {
      handlerOptions: {
        sides: 4,
        irregular: true
      },
      type: OpenLayers.Control.TYPE_TOGGLE,
      buttonClass: 'create-bbox',
      buttonText: '&#x25a1;'
    }
  );
  /**
   * @private
   * @type {!OpenLayers.Control.Panel}
   */
  this.panelControl_ = new OpenLayers.Control.Panel({
    createControlMarkup: function(control) {
      var element = document.createElement('div');
      var content = document.createElement('div');
      element.className = control.buttonClass;
      content.innerHTML = control.buttonText;
      content.className = control.buttonClass + '-content';
      element.appendChild(content);
      return element;
    },
    autoActivate: false
  });
  this.panelControl_.addControls([this.createBBoxControl_]);

  this.map_.addControl(this.modifyControl_);
  this.map_.addControl(this.createBBoxControl_);
  this.map_.addControl(this.panelControl_);
  this.map_.addControl(new OpenLayers.Control.LayerSwitcher());
};

goog.inherits(cz.mzk.authorities.verif.Map, goog.events.EventTarget);

cz.mzk.authorities.verif.Map.prototype.updateSize = function() {
  this.map_.updateSize();
};

/**
 * Shows Authority on the map.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.showAuthority = function(authority) {
  this.clear();
  this.drawOriginal_(authority);
  this.drawNominatim_(authority);
  this.drawNominatimPolygon_(authority);
  this.addModifyInteraction_();
  this.showPanelControl_();
  this.move_(authority);
  this.swapNominatimLayers_();
};

/**
 * Returns bounding box from nominatim layer.
 * @return {?OpenLayers.Bounds}
 */
cz.mzk.authorities.verif.Map.prototype.getBBox = function() {
  /** @type {?OpenLayers.Bounds} */
  var bbox = this.nominatimLayer_.getDataExtent();
  if (bbox) {
    bbox.transform(this.mapProjection_, this.gpsProjection_);
  }
  return bbox;
};

/**
 * Clear the map.
 */
cz.mzk.authorities.verif.Map.prototype.clear = function() {
  this.removeModifyInteraction_();
  this.hidePanelControl_();
  this.originalLayer_.removeAllFeatures();
  this.nominatimLayer_.removeAllFeatures();
  this.polygonLayer_.removeAllFeatures();
};

/**
 * Move the map to the center of the original coordinates.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.moveToOriginal = function(authority) {
  var originalWest = authority.getOriginalWest();
  var originalEast = authority.getOriginalEast();
  var originalNorth = authority.getOriginalNorth();
  var originalSouth = authority.getOriginalSouth();
  goog.asserts.assert(originalWest !== null);
  goog.asserts.assert(originalEast !== null);
  goog.asserts.assert(originalNorth !== null);
  goog.asserts.assert(originalSouth !== null);
  var bounds = new OpenLayers.Bounds(originalWest, originalSouth, originalEast, originalNorth);
  bounds.transform(this.gpsProjection_, this.mapProjection_);
  this.map_.zoomToExtent(bounds, false);
};

/**
 * Move the map to the center of the nominatim coordinates.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.moveToNominatim = function(authority) {
  var nominatimWest = authority.getNominatimWest();
  var nominatimEast = authority.getNominatimEast();
  var nominatimNorth = authority.getNominatimNorth();
  var nominatimSouth = authority.getNominatimSouth();
  goog.asserts.assert(nominatimWest !== null);
  goog.asserts.assert(nominatimEast !== null);
  goog.asserts.assert(nominatimNorth !== null);
  goog.asserts.assert(nominatimSouth !== null);
  var bounds = new OpenLayers.Bounds(nominatimWest, nominatimSouth, nominatimEast, nominatimNorth);
  bounds.transform(this.gpsProjection_, this.mapProjection_);
  this.map_.zoomToExtent(bounds, false);
};

/**
 * Move the map to show original and nominatim coordinates.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.moveTo = function(authority) {
  // original
  var originalWest = authority.getOriginalWest();
  var originalEast = authority.getOriginalEast();
  var originalNorth = authority.getOriginalNorth();
  var originalSouth = authority.getOriginalSouth();
  // nominatim
  var nominatimWest = authority.getNominatimWest();
  var nominatimEast = authority.getNominatimEast();
  var nominatimNorth = authority.getNominatimNorth();
  var nominatimSouth = authority.getNominatimSouth();
  // original
  goog.asserts.assert(originalWest !== null);
  goog.asserts.assert(originalEast !== null);
  goog.asserts.assert(originalNorth !== null);
  goog.asserts.assert(originalSouth !== null);
  // nominatim
  goog.asserts.assert(nominatimWest !== null);
  goog.asserts.assert(nominatimEast !== null);
  goog.asserts.assert(nominatimNorth !== null);
  goog.asserts.assert(nominatimSouth !== null);
  // bounds
  var originalBounds = new OpenLayers.Bounds(originalWest, originalSouth, originalEast, originalNorth);
  var nominatimBounds = new OpenLayers.Bounds(nominatimWest, nominatimSouth, nominatimEast, nominatimNorth);
  var bounds = new OpenLayers.Bounds();
  bounds.extend(originalBounds);
  bounds.extend(nominatimBounds);
  bounds.transform(this.gpsProjection_, this.mapProjection_);
  this.map_.zoomToExtent(bounds, false);
};

/**
 * Sets the visibility of the Nominatim polygon.
 * @param {boolean} value
 */
cz.mzk.authorities.verif.Map.prototype.setVisibleNominatimPolygon = function(value) {
  this.polygonLayer_.setVisibility(value);
};

/**
 * Draw nominatim bounding box or point on the map.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.drawOriginal_ = function(authority) {
  if (authority.hasOriginalCoors()) {
    if (authority.getOriginalWest() == authority.getOriginalEast() &&
        authority.getOriginalNorth() == authority.getOriginalSouth()) {
      this.drawPoint_(
        [authority.getOriginalWest(), authority.getOriginalNorth()],
        this.originalLayer_
      );
    } else {
      this.drawPolygon_(
        [
          [authority.getOriginalWest(), authority.getOriginalNorth()],
          [authority.getOriginalEast(), authority.getOriginalNorth()],
          [authority.getOriginalEast(), authority.getOriginalSouth()],
          [authority.getOriginalWest(), authority.getOriginalSouth()],
          [authority.getOriginalWest(), authority.getOriginalNorth()]
        ],
        this.originalLayer_
      );
    }
  }
};

/**
 * Draw nominatim bounding box or point on the map.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.drawNominatim_ = function(authority) {
  if (authority.hasNominatimCoors()) {
    if (authority.getNominatimWest() == authority.getNominatimEast() &&
      authority.getNominatimNorth() == authority.getNominatimSouth()) {
      this.drawPoint_(
        [authority.getNominatimWest(), authority.getNominatimNorth()],
        this.nominatimLayer_
      );
    } else {
      this.drawPolygon_(
        [
          [authority.getNominatimWest(), authority.getNominatimNorth()],
          [authority.getNominatimEast(), authority.getNominatimNorth()],
          [authority.getNominatimEast(), authority.getNominatimSouth()],
          [authority.getNominatimWest(), authority.getNominatimSouth()],
          [authority.getNominatimWest(), authority.getNominatimNorth()]
        ],
        this.nominatimLayer_
      );
    }
  }
};

/**
 * Draw polygon boundaries of authority found by Nominatim.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.drawNominatimPolygon_ = function(authority) {
  if (authority.hasNominatimPolygon()) {
    this.drawPolygon_(
      authority.getNominatimPolygon(),
      this.polygonLayer_
    );
  }
};

/**
 * Move the map to the center of the bounding box of authority.
 * @param {cz.mzk.authorities.verif.Authority} authority
 */
cz.mzk.authorities.verif.Map.prototype.move_ = function(authority) {
  if (authority.hasOriginalCoors() && authority.hasNominatimCoors()) {
    this.moveTo(authority);
  } else if (authority.hasOriginalCoors()) {
    this.moveToOriginal(authority);
  } else if (authority.hasNominatimCoors()) {
    this.moveToNominatim(authority);
  } else {
    this.map_.setCenter([0, 0], this.map_.getMinZoom());
  }
};

/**
 * Draw point.
 * @param {Array.<number>} coordinates Coordinates in EPSG:4326.
 * @param {OpenLayers.Layer.Vector} layer
 */
cz.mzk.authorities.verif.Map.prototype.drawPoint_ = function(
  coordinates, layer) {
  var coors = new OpenLayers.LonLat(coordinates[0], coordinates[1])
                  .transform(this.gpsProjection_, this.mapProjection_);
  var point = new OpenLayers.Geometry.Point(coors.lon, coors.lat);
  var feature = new OpenLayers.Feature.Vector(point);
  layer.addFeatures([feature]);
};

/**
 * Draw polygon.
 * @param {Array.<Array.<number>>} coordinates Coordinates in EPSG:4326.
 * @param {OpenLayers.Layer.Vector} layer
 * @param {boolean=} optTransformCoors
 */
cz.mzk.authorities.verif.Map.prototype.drawPolygon_ = function(
  coordinates, layer, optTransformCoors) {
  /** @type {boolean} */
  var transformCoors = goog.isDef(optTransformCoors) ? optTransformCoors : true;
  /** @type {Array.<OpenLayers.LonLat>} */
  var coors = [];
  if (transformCoors) {
    for (var i = 0; i < coordinates.length; i++) {
      var coor = new OpenLayers.LonLat(coordinates[i][0], coordinates[i][1]);
      coor.transform(this.gpsProjection_, this.mapProjection_);
      coors.push(coor);
    }
  } else {
    for (var i = 0; i < coordinates.length; i++) {
      coors.push(new OpenLayers.LonLat(coordinates[i][0], coordinates[i][1]));
    }
  }
  var polygonPoints = [];
  for (var i = 0; i < coors.length; i++) {
    polygonPoints.push(new OpenLayers.Geometry.Point(
      coors[i].lon, coors[i].lat));
  }
  var polygon = new OpenLayers.Geometry.Polygon(
    [new OpenLayers.Geometry.LinearRing(polygonPoints)]);
  var feature = new OpenLayers.Feature.Vector(polygon);
  layer.addFeatures([feature]);
};

/**
 * Removes interaction, which modifies bounding box.
 */
cz.mzk.authorities.verif.Map.prototype.removeModifyInteraction_ = function() {
  if (this.modifyControl_.feature) {
    this.modifyControl_.unselectFeature(this.modifyControl_.feature);
  }
  this.modifyControl_.deactivate();
};

/**
 * Add interaction, which modifies bounding box.
 */
cz.mzk.authorities.verif.Map.prototype.addModifyInteraction_ = function() {
  this.modifyControl_.activate();

};

/**
 * Hide control panel with control buttons.
 */
cz.mzk.authorities.verif.Map.prototype.hidePanelControl_ = function() {
  this.panelControl_.deactivate();
};

/**
 * Show control panel with control buttons.
 */
cz.mzk.authorities.verif.Map.prototype.showPanelControl_ = function() {
  this.panelControl_.activate();
};

/**
 * Swaps nominatimLayerZoomOut and nominatimLayer if it is necessary.
 */
cz.mzk.authorities.verif.Map.prototype.swapNominatimLayers_ = function() {
  if (!this.map_) {
    return;
  }
  var mapExtent = this.map_.getExtent();
  var bboxExtent = this.nominatimLayer_.getDataExtent();
  if (!bboxExtent) {
    return;
  }
  var bboxArea = bboxExtent.getWidth() * bboxExtent.getHeight();
  var mapArea = mapExtent.getWidth() * mapExtent.getHeight();
  var ratio = bboxArea / mapArea;
  if (ratio < 0.0009) {
    this.nominatimLayer_.setVisibility(false);
    this.nominatimLayerZoomOut_.setVisibility(true);
  } else {
    this.nominatimLayer_.setVisibility(true);
    this.nominatimLayerZoomOut_.setVisibility(false);
  }
};
