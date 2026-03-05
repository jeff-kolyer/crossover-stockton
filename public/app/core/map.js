// public/app/core/map.js

/**
 * Transforms resources into a valid GeoJSON FeatureCollection.
 * Crucial: Maps geo.lng to index 0 and geo.lat to index 1.
 */
export function convertToGeoJSON(resources) {
    return {
        type: "FeatureCollection",
        features: resources
            .filter(r => r.location && r.location.geo && r.location.geo.lat && r.location.geo.lng)
            .map(r => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [r.location.geo.lng, r.location.geo.lat] // RFC 7946 standard
                },
                properties: {
                    id: r.id,
                    name: r.name,
                    description: r.description
                }
            }))
    };
}

let mapInstance = null;
let markersLayer = null;
let markerLayerById = {};

export function initMap(containerId, geojsonData) {
    const el = document.getElementById(containerId);
    if (!el || typeof L === "undefined") return;

    // Clear placeholder text
    if (el.innerHTML.includes("placeholder")) {
        el.innerHTML = "";
    }

    if (!mapInstance) {
        // Initialize Leaflet map centered on Stockton
        mapInstance = L.map(containerId).setView([37.9577, -121.2908], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);
    } else {
        if (markersLayer) {
            mapInstance.removeLayer(markersLayer);
        }
    }

    // Default markers for a calm and dignified aesthetic without extraneous UI
    markerLayerById = {};
    markersLayer = L.geoJSON(geojsonData, {
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.id) {
                markerLayerById[feature.properties.id] = layer;
            }
            if (feature.properties && feature.properties.name) {
                layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }
        }
    }).addTo(mapInstance);
}

export function updateMap(geojsonData) {
    if (!mapInstance) return;

    if (markersLayer) {
        mapInstance.removeLayer(markersLayer);
    }

    markerLayerById = {};
    markersLayer = L.geoJSON(geojsonData, {
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.id) {
                markerLayerById[feature.properties.id] = layer;
            }
            if (feature.properties && feature.properties.name) {
                layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }
        }
    }).addTo(mapInstance);
}

export function panToMarker(id) {
    if (!mapInstance || !markerLayerById[id]) return;

    const layer = markerLayerById[id];
    // Pan and zoom the map smoothly to the marker's location
    if (layer.getLatLng) {
        mapInstance.flyTo(layer.getLatLng(), 15, { animate: true, duration: 0.5 });
    }
    layer.openPopup();
}
