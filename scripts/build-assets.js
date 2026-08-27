#!/usr/bin/env node

/**
 * Asset-build wrapper around `wp-scripts`, implementing the dev/prod
 * distinction from "Leitfaden: Einheitlicher Build- und Versionsprozess
 * für WordPress-Plugins" (== Standard section 35.1):
 *
 *   dev / build   unminified, source maps generated, no version change
 *   prod          minified, source maps removed
 *   dev --watch   unminified, source maps, rebuilds on change (wp-scripts start)
 *
 * `wp-scripts build` reads NODE_ENV to pick webpack's mode; setting
 * NODE_ENV=development yields an unminified one-off build (the same
 * mechanism `wp-scripts start` uses internally), NODE_ENV=production is
 * the default minified build. This script never changes any version
 * number itself — that is scripts/build-version.js's job, composed
 * separately in package.json.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const MODES = ['dev', 'prod'];

function fail(message) {
    console.error('[build-assets] ' + message);
    process.exit(1);
}

function run(command, args, env) {
    const result = spawnSync(command, args, {
        cwd: ROOT,
        stdio: 'inherit',
        env: { ...process.env, ...env },
        shell: process.platform === 'win32',
    });

    if (result.error) {
        fail(result.error.message);
    }

    if (result.status !== 0) {
        process.exit(result.status === null ? 1 : result.status);
    }
}

function removeSourceMapsRecursively(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            removeSourceMapsRecursively(full);
        } else if (entry.name.endsWith('.map')) {
            fs.unlinkSync(full);
        }
    }
}

function main() {
    const mode = process.argv[2] || 'dev';
    const watch = process.argv.includes('--watch');

    if (!MODES.includes(mode)) {
        fail('Unknown mode "' + mode + '". Use dev or prod.');
    }

    if (watch) {
        if (mode !== 'dev') {
            fail('--watch is only supported together with mode "dev".');
        }

        // wp-scripts start already builds unminified with source maps and
        // rebuilds continuously (Standard section 35.1, development assets).
        run('npx', ['wp-scripts', 'start']);
        return;
    }

    if (mode === 'dev') {
        run('npx', ['wp-scripts', 'build'], { NODE_ENV: 'development' });
    } else {
        run('npx', ['wp-scripts', 'build'], { NODE_ENV: 'production' });

        // Safety net: production output MUST NOT ship source maps
        // (Standard section 35.1/41), even if a future webpack/plugin
        // config change starts emitting them again by accident.
        removeSourceMapsRecursively(BUILD_DIR);
    }

    console.log('[build-assets] Done (mode: ' + mode + (watch ? ', watch' : '') + ').');
}

main();
