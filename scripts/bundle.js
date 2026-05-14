const fs = require('fs');
const path = require('path');

const extensionDir = path.resolve(__dirname, '../');
const bundleDir = path.join(extensionDir, 'bundle');
const localPythonDir = path.join(extensionDir, 'python_embedded');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isFile()) {
            try {
                fs.copyFileSync(path.join(from, element), path.join(to, element));
            } catch (error) {
                console.warn(`Warning: Failed to copy file ${path.join(from, element)} -> ${path.join(to, element)}: ${error.message}`);
            }
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

console.log('Preparing bundle directory...');
const destPython = path.join(bundleDir, 'python_embedded');

if (!fs.existsSync(bundleDir)) {
    fs.mkdirSync(bundleDir, { recursive: true });
}

// Copy the locally generated python_embedded to the bundle directory
if (fs.existsSync(localPythonDir)) {
    console.log(`Copying local python_embedded to ${destPython}...`);
    if (fs.existsSync(destPython)) {
        fs.rmSync(destPython, { recursive: true, force: true });
    }
    copyFolderSync(localPythonDir, destPython);
} else {
    console.warn(`Warning: Could not find ${localPythonDir}. Make sure download-python.js was run.`);
}

console.log('Bundle complete.');
