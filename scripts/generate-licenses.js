const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('Generating Node.js licenses...');
try {
    execSync('npx license-checker --production --out ThirdPartyNotices_Node.txt', { 
        stdio: 'inherit',
        cwd: rootDir 
    });
} catch (e) {
    console.warn('Failed to generate Node licenses or license-checker is missing.');
    fs.writeFileSync(path.join(rootDir, 'ThirdPartyNotices_Node.txt'), 'Failed to generate Node licenses.\n');
}

console.log('Generating Python licenses...');
const pipLicenses = path.join(rootDir, 'python_embedded', 'Scripts', 'pip-licenses.exe');
const pythonOutPath = path.join(rootDir, 'ThirdPartyNotices_Python.txt');
if (fs.existsSync(pipLicenses)) {
    try {
        execSync(`"${pipLicenses}" --format=plain-vertical --with-license-file --output-file="${pythonOutPath}"`, { 
            stdio: 'inherit',
            cwd: rootDir 
        });
    } catch (e) {
        console.warn('Failed to generate Python licenses via pip-licenses.');
        fs.writeFileSync(pythonOutPath, 'Failed to generate Python licenses.\n');
    }
} else {
    console.warn(`pip-licenses.exe not found at ${pipLicenses}, skipping Python licenses.`);
    fs.writeFileSync(pythonOutPath, 'Python licenses not generated.\n');
}

console.log('Concatenating notices...');
const nodeNoticesPath = path.join(rootDir, 'ThirdPartyNotices_Node.txt');
const pythonNoticesPath = path.join(rootDir, 'ThirdPartyNotices_Python.txt');
const pythonRuntimeLicensePath = path.join(rootDir, 'python_embedded', 'LICENSE.txt');

let nodeNotices = fs.existsSync(nodeNoticesPath) ? fs.readFileSync(nodeNoticesPath, 'utf8') : '';
let pythonNotices = fs.existsSync(pythonNoticesPath) ? fs.readFileSync(pythonNoticesPath, 'utf8') : '';
const pythonRuntimeLicense = fs.existsSync(pythonRuntimeLicensePath) ? fs.readFileSync(pythonRuntimeLicensePath, 'utf8') : 'Python runtime license not found.';

// Strip local PC paths and unneeded file path pointers for published cleanliness
const sanitizePaths = (text) => {
    let sanitized = text.split(rootDir).join('<extension-root>');
    // Remove the verbose "path: " and "licenseFile: " lines
    sanitized = sanitized.split(/\r?\n/).filter(line => !line.match(/^[├│└\s]*─ (path|licenseFile):/)).join('\n');
    return sanitized;
};

nodeNotices = sanitizePaths(nodeNotices);
pythonNotices = sanitizePaths(pythonNotices);

const combined = `THIRD-PARTY SOFTWARE NOTICES AND INFORMATION\n\nThis project incorporates components from the projects listed below.\n\n` + 
                 `==================================================\n` +
                 `Python Runtime (CPython)\n` +
                 `==================================================\n\n${pythonRuntimeLicense}\n\n` +
                 `==================================================\n` +
                 `Node.js Dependencies\n` +
                 `==================================================\n\n${nodeNotices}\n\n` + 
                 `==================================================\n` +
                 `Python Dependencies (Pip)\n` +
                 `==================================================\n\n${pythonNotices}\n`;

fs.writeFileSync(path.join(rootDir, 'ThirdPartyNotices.txt'), combined, 'utf8');

// Clean up
if (fs.existsSync(nodeNoticesPath)) fs.unlinkSync(nodeNoticesPath);
if (fs.existsSync(pythonNoticesPath)) fs.unlinkSync(pythonNoticesPath);

console.log('ThirdPartyNotices.txt generated successfully.');