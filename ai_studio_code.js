// Assume this script is loaded after your SVG has been embedded in the HTML
// either directly or loaded via fetch.
// We'll use a placeholder for your SVG content.

// --- Configuration ---
const AIRFIELD_CENTER_X = 500; // Placeholder: You'll need to define your airfield's center
const AIRFIELD_CENTER_Y = 300; // based on your SVG coordinates.
const SPAWN_DISTANCE = 400; // How far out from the airfield aircraft spawn
const AIRCRAFT_SIZE = 10;   // Size of the square dot
const LABEL_OFFSET_X = 15; // Offset for the label from the aircraft dot

// --- Data Structures ---
let aircrafts = []; // Array to hold all active aircraft objects
let radialsData = []; // To store path data from your SVG's "radials" object

class Aircraft {
    constructor(callsign, x, y, level, speed, heading) {
        this.id = 'ac-' + Date.now() + Math.random().toFixed(0); // Unique ID
        this.callsign = callsign;
        this.x = x;
        this.y = y;
        this.level = level; // e.g., 250 (for 25000 ft)
        this.speed = speed; // e.g., 31 (for 310 kts)
        this.heading = heading; // Angle in degrees
        this.svgElement = null; // Reference to the SVG group element for this aircraft
    }

    getDisplayLevel() {
        return String(this.level).padStart(3, '0');
    }

    getDisplaySpeed() {
        return String(this.speed).padStart(2, '0');
    }

    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
        if (this.svgElement) {
            this.svgElement.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${this.heading})`);
            // You might want to rotate the dot, but labels typically stay upright
            // Or rotate the whole group and then counter-rotate the text
        }
    }
}

// --- Utility Functions ---

function generateCallsign() {
    const prefixes = ['UAL', 'AAL', 'DAL', 'SWA', 'EZY', 'RYR', 'BAW', 'KLM', 'AFR'];
    const suffix = Math.floor(100 + Math.random() * 900); // 100-999
    return prefixes[Math.floor(Math.random() * prefixes.length)] + suffix;
}

function getRandomLevel() {
    // Example: Between 10000ft (100) and 35000ft (350)
    return Math.floor(100 + Math.random() * 25) * 10; // Multiples of 10 for simplicity
}

function getRandomSpeed() {
    // Example: Between 250kts (25) and 400kts (40)
    return Math.floor(25 + Math.random() * 15);
}

// Function to calculate angle in degrees from point1 to point2
function getAngle(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return (Math.atan2(dy, dx) * 180 / Math.PI) + 90; // +90 to make 0 degrees point upwards
}

// --- SVG Drawing and Updates ---

function drawAircraft(aircraft) {
    const svg = document.getElementById('atc-map'); // Your main SVG element

    // Create a group for each aircraft, allowing easy translation and rotation
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute('id', aircraft.id);
    g.setAttribute('class', 'aircraft');
    g.setAttribute('transform', `translate(${aircraft.x}, ${aircraft.y}) rotate(${aircraft.heading})`);

    // The square dot (aircraft symbol)
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    dot.setAttribute('x', -AIRCRAFT_SIZE / 2); // Center the dot on the x,y
    dot.setAttribute('y', -AIRCRAFT_SIZE / 2); // Center the dot on the x,y
    dot.setAttribute('width', AIRCRAFT_SIZE);
    dot.setAttribute('height', AIRCRAFT_SIZE);
    dot.setAttribute('fill', 'white');
    dot.setAttribute('stroke', 'black');
    dot.setAttribute('stroke-width', '1');

    // Text label group (to potentially counter-rotate if the whole aircraft group is rotated)
    const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    textGroup.setAttribute('transform', `translate(${LABEL_OFFSET_X}, 0)`); // Offset from the dot
    // If you want the text to always be upright even if the dot rotates, you'd add:
    // textGroup.setAttribute('transform', `translate(${LABEL_OFFSET_X}, 0) rotate(${-aircraft.heading})`);

    const callsignText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    callsignText.setAttribute('x', 0);
    callsignText.setAttribute('y', -5); // Position relative to the textGroup
    callsignText.setAttribute('font-size', '10px');
    callsignText.setAttribute('fill', 'white');
    callsignText.textContent = aircraft.callsign;

    const infoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    infoText.setAttribute('x', 0);
    infoText.setAttribute('y', 5); // Position relative to the textGroup
    infoText.setAttribute('font-size', '10px');
    infoText.setAttribute('fill', 'white');
    infoText.textContent = `${aircraft.getDisplayLevel()} ${aircraft.getDisplaySpeed()}`;

    textGroup.appendChild(callsignText);
    textGroup.appendChild(infoText);

    g.appendChild(dot);
    g.appendChild(textGroup);

    svg.appendChild(g);
    aircraft.svgElement = g; // Store reference
}

// --- Aircraft Generation Logic ---

function spawnAircraft(numAircraft) {
    aircrafts = []; // Clear existing aircraft for a fresh spawn

    // Pre-parse the radial lines from your SVG
    // This is a placeholder. You'll need to select the actual path elements
    // that constitute your "radials" layer/group in the SVG.
    // Example using D3.js: radialsData = d3.selectAll("#radials path").nodes();
    // Using plain JS: radialsData = document.querySelectorAll('#radialsGroup path');

    // For demonstration, let's assume 'radialsData' is populated with relevant SVG elements
    if (radialsData.length === 0) {
        console.warn("No 'radials' paths found in the SVG. Aircraft will spawn randomly.");
        // Fallback: If no radials, all aircraft spawn randomly.
    }


    for (let i = 0; i < numAircraft; i++) {
        let x, y, initialHeading;

        // 70% spawn on radials
        if (radialsData.length > 0 && Math.random() < 0.7) {
            // Pick a random radial
            const radial = radialsData[Math.floor(Math.random() * radialsData.length)];
            // This is the tricky part without a full SVG library:
            // How to get a random point *on* the radial path.
            // A simple approximation for straight lines might be `lerp`
            // For complex paths, you'd need `SVGPathElement.getPointAtLength()`
            // For now, let's use a simplified approach or assume radials are long enough.

            // --- Simplified Radial Spawn (concept) ---
            // For actual implementation, you'd parse the 'd' attribute of the path
            // to get its start/end points, or use getPointAtLength() with a random length.
            // Example: Find a point along a line from AIRFIELD_CENTER to some far point on the radial.
            // Let's just generate a point at SPAWN_DISTANCE along a random angle.
            // This means we're not truly using the *path* but simulating a radial spawn.
            const angleFromCenter = Math.random() * Math.PI * 2; // Random angle
            x = AIRFIELD_CENTER_X + Math.cos(angleFromCenter) * SPAWN_DISTANCE;
            y = AIRFIELD_CENTER_Y + Math.sin(angleFromCenter) * SPAWN_DISTANCE;
            // --- End Simplified Radial Spawn ---

        } else {
            // 30% or if no radials: random spawn around the airfield
            const angle = Math.random() * Math.PI * 2; // Full circle
            x = AIRFIELD_CENTER_X + Math.cos(angle) * SPAWN_DISTANCE;
            y = AIRFIELD_CENTER_Y + Math.sin(angle) * SPAWN_DISTANCE;
        }

        // Calculate initial heading pointing towards the airfield
        initialHeading = getAngle(x, y, AIRFIELD_CENTER_X, AIRFIELD_CENTER_Y);

        // For approx 30% of ALL aircraft, add a deviation
        if (Math.random() < 0.3) {
            initialHeading += (Math.random() * 60) - 30; // Randomly add/subtract up to 30 degrees
        }

        const callsign = generateCallsign();
        const level = getRandomLevel();
        const speed = getRandomSpeed();

        const newAircraft = new Aircraft(callsign, x, y, level, speed, initialHeading);
        aircrafts.push(newAircraft);
        drawAircraft(newAircraft); // Draw it immediately
    }
}

// --- Initial Setup (Call this when the DOM and SVG are ready) ---
function initATCApp() {
    // 1. Load your SVG into the #atc-container if it's not already in the HTML
    //    (e.g., using fetch and innerHTML, or D3.xml)
    //    For this example, let's assume your SVG is already in the HTML with id="atc-map"

    // 2. Parse radials: Find your "radials" layer/group in the SVG and get its paths
    const radialsGroup = document.getElementById('radialsGroup'); // Assuming you have a group with this ID
    if (radialsGroup) {
        radialsData = Array.from(radialsGroup.querySelectorAll('path'));
        // If your radials are simpler (e.g., just lines), you might query for 'line' elements
        // radialsData = Array.from(radialsGroup.querySelectorAll('line'));
    }

    // Example: Spawn 10 aircraft
    spawnAircraft(10);

    // Add UI for spawning more, selecting, etc.
    // For now, let's make a button to respawn
    const spawnButton = document.createElement('button');
    spawnButton.textContent = 'Respawn Aircraft';
    spawnButton.onclick = () => {
        document.getElementById('atc-map').innerHTML = ''; // Clear SVG contents
        spawnAircraft(parseInt(document.getElementById('numAircraftInput').value || 10));
    };
    document.body.appendChild(spawnButton);

    const numAircraftInput = document.createElement('input');
    numAircraftInput.type = 'number';
    numAircraftInput.id = 'numAircraftInput';
    numAircraftInput.value = '10';
    numAircraftInput.min = '1';
    numAircraftInput.max = '50';
    document.body.appendChild(numAircraftInput);
}

// Call init when the document is fully loaded
document.addEventListener('DOMContentLoaded', initATCApp);

// --- Styling (Basic CSS for dark background and aircraft display) ---
/*
body {
    background-color: #333;
    color: white;
    font-family: sans-serif;
    margin: 0;
    padding: 20px;
}
#atc-map {
    border: 1px solid #666;
    background-color: #222;
    width: 1000px; // Match your SVG viewBox width
    height: 600px; // Match your SVG viewBox height
}
.aircraft rect {
    fill: white;
    stroke: black;
}
.aircraft text {
    fill: white;
    font-family: monospace;
    font-size: 10px;
}
*/