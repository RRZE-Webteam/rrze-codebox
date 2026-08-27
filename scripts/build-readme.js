#!/usr/bin/env node

/**
 * Synchronizes readme.txt from the canonical metadata in package.json.
 *
 * Deliberately a separate script from build-version.js so the two stay
 * independently composable, per "Leitfaden: Einheitlicher Build- und
 * Versionsprozess für WordPress-Plugins": run via `npm run readme`, always
 * AFTER a version:* step. The composed `npm run dev|prod|release` scripts
 * in package.json already call them in that order; call `npm run readme`
 * on its own only to re-sync readme.txt without changing the version.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const README_TXT = path.join(ROOT, 'readme.txt');

function fail(message) {
    console.error('[build-readme] ' + message);
    process.exit(1);
}

function readJson(file) {
    if (!fs.existsSync(file)) {
        fail('Missing required file: ' + file);
    }
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        fail('Could not parse ' + file + ': ' + error.message);
    }
}

function replaceOrFail(content, pattern, replacement, label) {
    if (!pattern.test(content)) {
        fail('Could not find "' + label + '" in ' + README_TXT + '; refusing to write a partially synced file.');
    }
    return content.replace(pattern, replacement);
}

function main() {
    if (!fs.existsSync(README_TXT)) {
        fail('Missing required file: ' + README_TXT);
    }

    const pkg = readJson(PACKAGE_JSON);
    const compat = pkg.compatibility || {};

    let content = fs.readFileSync(README_TXT, 'utf8');

    content = replaceOrFail(content, /Stable tag:\s*[^\r\n]+/, 'Stable tag: ' + pkg.version, 'Stable tag');

    if (compat.wprequires) {
        content = replaceOrFail(
            content,
            /Requires at least:\s*[^\r\n]+/,
            'Requires at least: ' + compat.wprequires,
            'Requires at least'
        );
    }

    if (compat.wptestedup) {
        content = replaceOrFail(
            content,
            /Tested up to:\s*[^\r\n]+/,
            'Tested up to: ' + compat.wptestedup,
            'Tested up to'
        );
    }

    if (compat.phprequires) {
        content = replaceOrFail(
            content,
            /Requires PHP:\s*[^\r\n]+/,
            'Requires PHP: ' + compat.phprequires,
            'Requires PHP'
        );
    }

    fs.writeFileSync(README_TXT, content);

    console.log('[build-readme] readme.txt synchronized to version ' + pkg.version + '.');
}

main();
