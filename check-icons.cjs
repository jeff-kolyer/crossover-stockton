const fs = require('fs');
const umd = fs.readFileSync('lucide-umd.js', 'utf8');

// The exported icons in UMD are assigned to `exports.IconName = ...`
// Or inside a giant object.
// Let's just find all sequence of `"icon-name"` that lucide uses for its SVG attributes.
// Lucide defines shapes like: ["circle", {cx: "12", cy: "12", r: "10"}]
// Each icon is an array: ["icon-name", [["shape", {...}], ...]] or similar.
// Wait, we can just run the code with a mock window and it will expose the list!

const vm = require('vm');
const context = { window: {}, document: {} };
vm.createContext(context);
try {
    vm.runInContext(umd, context);
} catch (e) { }

const lucide = context.window.lucide || context.lucide;
if (!lucide || !lucide.icons) {
    console.log("Failed to parse lucide icons object.", Object.keys(context));
    process.exit(1);
}

const icons = [
    'droplet', 'shield', 'landmark', 'toilet', 'shower-head', 'washing-machine',
    'soap-dispenser-droplet', 'apple', 'utensils', 'wifi', 'smartphone-charging',
    'sofa', 'bed', 'building', 'parking-circle', 'truck', 'wrench', 'lock',
    'map-pin', 'id-card', 'home', 'scale', 'stethoscope', 'brain', 'heart-handshake', 'siren'
];

function toPascalCase(str) {
    const camel = str.replace(/-([a-z])/g, g => g[1].toUpperCase());
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

icons.forEach(i => {
    const p = toPascalCase(i);
    if (!lucide.icons[p]) {
        console.log("MISSING:", i, p);
    } else {
        // console.log("FOUND:", i);
    }
});
