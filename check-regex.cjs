const fs = require('fs');
const u = fs.readFileSync('lucide-umd.js', 'utf8');
const names = [...u.matchAll(/\"([a-z0-9-]+)\"/g)].map(m => m[1]);
const set = new Set(names);
const icons = ['droplet', 'shield', 'landmark', 'toilet', 'shower-head', 'washing-machine', 'soap-dispenser-droplet', 'apple', 'utensils', 'wifi', 'smartphone-charging', 'sofa', 'bed', 'building', 'parking-circle', 'truck', 'wrench', 'lock', 'map-pin', 'id-card', 'home', 'scale', 'stethoscope', 'brain', 'heart-handshake', 'siren'];
icons.forEach(i => { if (!set.has(i)) console.log("MISSING:", i); });
