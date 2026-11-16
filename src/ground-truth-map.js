import L from 'leaflet';

const STOCKTON_CENTER = [37.951, -121.302];

const markerArt = {
  shelter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-6 9 6v12H3z"/><path d="M7 12h10M7 16h10M9 21v-5h6v5"/></svg>',
  clinic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v6a4 4 0 0 0 8 0V3M4 3h4M12 3h4M10 13v3a4 4 0 0 0 8 0v-1"/><circle cx="18" cy="13" r="2"/></svg>'
};

function markerIcon(pin, selected) {
  return L.divIcon({
    className: 'gt-div-icon',
    html: `<span class="gt-map-marker gt-map-marker--${pin.type}${selected ? ' is-selected' : ''}">${markerArt[pin.type]}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function createReferenceGrid() {
  const ReferenceGrid = L.GridLayer.extend({
    createTile() {
      const tile = L.DomUtil.create('canvas', 'gt-reference-tile');
      const size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;
      const context = tile.getContext('2d');
      context.strokeStyle = 'rgba(148, 163, 184, .30)';
      context.lineWidth = 1;
      for (let pixel = 0.5; pixel < size.x; pixel += 32) {
        context.beginPath();
        context.moveTo(pixel, 0);
        context.lineTo(pixel, size.y);
        context.stroke();
      }
      for (let pixel = 0.5; pixel < size.y; pixel += 32) {
        context.beginPath();
        context.moveTo(0, pixel);
        context.lineTo(size.x, pixel);
        context.stroke();
      }
      return tile;
    }
  });
  return new ReferenceGrid({ pane: 'referenceGrid', tileSize: 256, updateWhenIdle: false });
}

function zoneIcon(zone, selected) {
  return L.divIcon({
    className: 'gt-zone-label-icon',
    html: `<span class="gt-zone-label${selected ? ' gt-map-record-label is-selected' : ''}">${zone.recordId}</span>`,
    iconSize: [116, 24],
    iconAnchor: [58, 12]
  });
}

export function createGroundTruthMap(element, pins, zones, onPinSelect, onZoneSelect) {
  const map = L.map(element, {
    zoomControl: false,
    scrollWheelZoom: false,
    preferCanvas: true,
    maxZoom: 18
  }).setView(STOCKTON_CENTER, 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    className: 'gt-map-tiles',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    maxZoom: 19
  }).addTo(map);

  map.createPane('referenceGrid');
  map.getPane('referenceGrid').style.zIndex = 450;
  map.getPane('referenceGrid').style.pointerEvents = 'none';
  const grid = createReferenceGrid().addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);

  const markers = new Map(pins.map(pin => {
    const marker = L.marker(pin.latLng, { icon: markerIcon(pin, false), title: pin.title, keyboard: true })
      .bindTooltip(`${pin.title} · ${pin.address}`, { direction: 'top', offset: [0, -16] })
      .on('click', () => onPinSelect(pin.id))
      .addTo(map);
    return [pin.id, marker];
  }));
  const zoneLayer = L.layerGroup().addTo(map);
  const zoneCircles = new Map();
  const zoneLabels = new Map();
  zones.forEach(zone => {
    const circle = L.circle(zone.center, {
      renderer: L.svg(),
      radius: zone.radius,
      color: '#fb7185',
      weight: 2,
      dashArray: '6 5',
      fillColor: '#e11d48',
      fillOpacity: 0.12,
      className: 'gt-field-zone'
    }).bindTooltip(`${zone.name} · approximate field verification area`, { sticky: true })
      .on('click', () => onZoneSelect(zone.recordId))
      .addTo(zoneLayer);
    const label = L.marker(zone.center, {
      icon: zoneIcon(zone, false),
      title: `${zone.recordId} · ${zone.name} approximate field verification area`,
      keyboard: true,
      zIndexOffset: 900
    }).on('click', () => onZoneSelect(zone.recordId)).addTo(zoneLayer);
    zoneCircles.set(zone.recordId, circle);
    zoneLabels.set(zone.recordId, label);
  });
  let contextLayer = null;
  let recordLabel = null;
  const cityRecordBadge = L.DomUtil.create('div', 'gt-map-record-city', map.getContainer());
  cityRecordBadge.hidden = true;

  return {
    invalidateSize() { map.invalidateSize(false); },
    showOverview() {
      map.invalidateSize(false);
      const bounds = L.latLngBounds(pins.map(pin => pin.latLng));
      zones.forEach(zone => bounds.extend(zoneCircles.get(zone.recordId).getBounds()));
      map.fitBounds(bounds, { animate: false, maxZoom: 13, padding: [38, 38] });
    },
    setLayerVisible(type, visible) {
      const layer = type === 'grid' ? grid : type === 'zones' ? zoneLayer : markers.get(type === 'clinic' ? 'apl' : 'shelter');
      if (!layer) return;
      if (visible) layer.addTo(map);
      else map.removeLayer(layer);
    },
    focus(context) {
      map.invalidateSize(false);
      if (contextLayer) map.removeLayer(contextLayer);
      if (recordLabel) map.removeLayer(recordLabel);
      contextLayer = null;
      recordLabel = null;
      cityRecordBadge.hidden = context.kind !== 'city' || !context.recordId;
      cityRecordBadge.textContent = context.recordId ? `${context.recordId} · ${context.kind === 'city' ? 'CITYWIDE CONTEXT' : ''}` : '';
      pins.forEach(pin => markers.get(pin.id).setIcon(markerIcon(pin, context.kind === 'point' && context.pinId === pin.id)));
      zones.forEach(zone => {
        const selected = context.recordId === zone.recordId;
        zoneLabels.get(zone.recordId).setIcon(zoneIcon(zone, selected));
        zoneCircles.get(zone.recordId).setStyle({ color: selected ? '#fda4af' : '#fb7185', weight: selected ? 3 : 2, fillOpacity: selected ? 0.19 : 0.12 });
      });
      const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (context.kind === 'point') {
        const pin = pins.find(item => item.id === context.pinId);
        if (pin) {
          map.setView(pin.latLng, 13, { animate });
          recordLabel = createRecordLabel(pin.latLng, context.recordId);
        }
      } else if (context.kind === 'area') {
        const selectedZone = zoneCircles.get(context.recordId);
        if (!selectedZone) {
          contextLayer = L.circle(context.center, {
            renderer: L.svg(),
            radius: context.radius,
            color: '#fbbf24',
            weight: 2,
            dashArray: '5 6',
            fillColor: '#f59e0b',
            fillOpacity: 0.13,
            className: 'gt-selected-area',
            interactive: false
          }).addTo(map);
          recordLabel = createRecordLabel(context.center, context.recordId);
        }
        map.fitBounds((selectedZone || contextLayer).getBounds().pad(0.45), { animate, maxZoom: 13 });
      } else {
        map.setView(STOCKTON_CENTER, 12, { animate });
      }
    }
  };

  function createRecordLabel(latLng, recordId) {
    if (!recordId) return null;
    return L.marker(latLng, {
      icon: L.divIcon({
        className: 'gt-record-label-icon',
        html: `<span class="gt-map-record-label">${recordId}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 52]
      }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 1000
    }).addTo(map);
  }
}
