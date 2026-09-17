#!/usr/bin/env node

/**
 * Version-only script per "Leitfaden: Einheitlicher Build- und
 * Versionsprozess für WordPress-Plugins" and Standard section 6/39.7 —
 * with one deliberate deviation from both documents' literal examples,
 * see below.
 *
 * Scheme: Major.Minor.Patch-Build, e.g. "2.5.3-17".
 *
 *   dev      Build++                          (npm run dev / version:dev)
 *   prod     Patch++, Build=0                 (npm run prod / version:prod)
 *   release  Minor++, Patch=0, Build=0        (npm run release / version:release)
 *   major    Major++, Minor=Patch=Build=0     (manual only — see warning below)
 *
 * DEVIATION FROM THE STANDARD'S "_BUILD" EXAMPLES: the Leitfaden and
 * Standard section 6 write this scheme with an underscore ("2.5.3_17").
 * That is not valid SemVer (verified against the official regex from
 * semver.org) and npm's own `npm version` family of commands rejects it,
 * even though `npm install`/`npm ci` happen to tolerate it. A hyphen
 * ("2.5.3-17") is valid SemVer — it is the standard PRERELEASE separator —
 * and was verified to work with `npm install`, `npm ci`, and even npm's
 * native `npm version prerelease` bump. This project deliberately uses the
 * hyphen for that reason; both the RRZE Standard and the Leitfaden are
 * still evolving documents, and technical correctness against real
 * tooling was chosen over matching their literal example text. If a
 * future revision of either document settles on a different delimiter,
 * update VERSION_RE and formatVersion() below to match.
 *
 * package.json is the canonical source. This script propagates the result
 * into the plugin header ("Version", "Requires at least", "Requires PHP")
 * and the RRZE_CODEBOX_VERSION constant in rrze-codebox.php.
 *
 * readme.txt is deliberately NOT touched here — run `npm run readme`
 * (scripts/build-readme.js) afterward, or use the composed `npm run dev`
 * / `prod` / `release` commands in package.json, which already do both in
 * the documented order.
 *
 * Exits non-zero on a malformed version or a missing/unexpected target
 * file, rather than writing a partially synced state (Standard section 40).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PLUGIN_FILE = path.join(ROOT, 'rrze-codebox.php');

const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)-(\d+)$/;
const MODES = ['dev', 'prod', 'release', 'major'];

function fail(message) {
    console.error('[build-version] ' + message);
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

function parseVersion(version) {
    const match = VERSION_RE.exec(version);
    if (!match) {
        fail(
            'Version "' + version + '" does not match the required Major.Minor.Patch-Build scheme (example: "1.0.0-0").'
        );
    }
    const [, major, minor, patch, build] = match;
    return {
        major: parseInt(major, 10),
        minor: parseInt(minor, 10),
        patch: parseInt(patch, 10),
        build: parseInt(build, 10),
    };
}

function formatVersion(v) {
    return v.major + '.' + v.minor + '.' + v.patch + '-' + v.build;
}

function bump(version, mode) {
    const v = parseVersion(version);

    if (mode === 'dev') {
        v.build += 1;
    } else if (mode === 'prod') {
        v.patch += 1;
        v.build = 0;
    } else if (mode === 'release') {
        v.minor += 1;
        v.patch = 0;
        v.build = 0;
    } else if (mode === 'major') {
        v.major += 1;
        v.minor = 0;
        v.patch = 0;
        v.build = 0;
    }

    return formatVersion(v);
}

function replaceOrFail(content, pattern, replacement, file, label) {
    if (!pattern.test(content)) {
        fail('Could not find "' + label + '" in ' + file + '; refusing to write a partially synced file.');
    }
    return content.replace(pattern, replacement);
}

function syncPluginHeader(pkg) {
    if (!fs.existsSync(PLUGIN_FILE)) {
        fail('Missing required file: ' + PLUGIN_FILE);
    }

    let content = fs.readFileSync(PLUGIN_FILE, 'utf8');
    const compat = pkg.compatibility || {};

    content = replaceOrFail(
        content,
        /Version:\s*[^\r\n]+/,
        'Version:            ' + pkg.version,
        PLUGIN_FILE,
        'Version'
    );

    if (compat.wprequires) {
        content = replaceOrFail(
            content,
            /Requires at least:\s*[^\r\n]+/,
            'Requires at least:  ' + compat.wprequires,
            PLUGIN_FILE,
            'Requires at least'
        );
    }

    if (compat.phprequires) {
        content = replaceOrFail(
            content,
            /Requires PHP:\s*[^\r\n]+/,
            'Requires PHP:       ' + compat.phprequires,
            PLUGIN_FILE,
            'Requires PHP'
        );
    }

    content = replaceOrFail(
        content,
        /define\('RRZE_CODEBOX_VERSION',\s*'[^']*'\);/,
        "define('RRZE_CODEBOX_VERSION', '" + pkg.version + "');",
        PLUGIN_FILE,
        'RRZE_CODEBOX_VERSION constant'
    );

    fs.writeFileSync(PLUGIN_FILE, content);
}

function main() {
    const mode = process.argv[2];

    if (!mode || !MODES.includes(mode)) {
        fail('Usage: node scripts/build-version.js <' + MODES.join('|') + '>');
    }

    const pkg = readJson(PACKAGE_JSON);

    // Validate even when a given mode doesn't touch every segment, so a
    // malformed version is caught immediately rather than propagated.
    parseVersion(pkg.version);

    if (mode === 'major') {
        console.warn(
            '[build-version] "major" marks an incompatible/breaking change (Standard section 6). ' +
            'This MUST be a deliberate, reviewed decision — never wire it into an automated dev/prod/release chain.'
        );
    }

    pkg.version = bump(pkg.version, mode);
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 4) + '\n');

    syncPluginHeader(pkg);

    console.log('[build-version] Synchronized version ' + pkg.version + ' (mode: ' + mode + ').');
}

main();
