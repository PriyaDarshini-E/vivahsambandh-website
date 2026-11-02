/**
 * @file vite.config.ts
 * Vite configuration for VivahSambandh website.
 *
 * Configures:
 * - React 19 + React Compiler presets via `@vitejs/plugin-react` and `@rolldown/plugin-babel`
 * - Tailwind CSS v4 via `@tailwindcss/vite`
 * - Static Site Generation (SSG) via `vite-prerender-plugin` (invoking `src/prerender.tsx`)
 * - Dual pre-compression: Gzip via `vite-plugin-compression` + Brotli via custom `brotliStatic`
 * - Event loop unblocking & socket cleanup via `eventLoopCleanup`
 * - Granular vendor chunk splitting via `rollupOptions.output.manualChunks`
 */

import path from 'node:path';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, constants } from 'node:zlib';
import http from 'node:http';
import https from 'node:https';
import { MessagePort } from 'node:worker_threads';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import * as compressionNs from 'vite-plugin-compression';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import {
  generateAndSaveSitemap,
  fetchSitemapData,
  buildSitemapXml,
} from './src/seo/sitemap/index.ts';

const compression =
  (compressionNs as unknown as { default: typeof import('vite-plugin-compression').default }).default ??
  (compressionNs as unknown as typeof import('vite-plugin-compression').default);

// CRITICAL EVENT-LOOP UNBLOCK FIX:
// React 18/19 scheduler keeps a Node MessagePort open, causing Vite SSG
// builds to hang indefinitely after prerendering finishes.
if (MessagePort && MessagePort.prototype) {
  const origOn = Object.getOwnPropertyDescriptor(MessagePort.prototype, 'onmessage');
  if (origOn && origOn.set) {
    Object.defineProperty(MessagePort.prototype, 'onmessage', {
      set(fn) {
        origOn.set!.call(this, fn);
        const port = this as MessagePort & { unref?: () => void };
        if (fn && typeof port.unref === 'function') {
          port.unref();
        }
      },
      get() {
        return origOn.get?.call(this);
      },
      configurable: true,
      enumerable: true,
    });
  }
}

/**
 * Vite plugin that releases active event-loop handles to prevent build hangs.
 */
function eventLoopCleanup(): Plugin {
  return {
    name: 'event-loop-cleanup',
    apply: 'build',
    closeBundle() {
      // 1. Terminate all pooled HTTP/HTTPS keep-alive connections
      http.globalAgent.destroy();
      https.globalAgent.destroy();

      // 2. Unref or destroy any remaining active handles
      // @ts-expect-error internal node handle inspector
      const handles = process._getActiveHandles?.() ?? [];
      for (const h of handles) {
        if (typeof h?.destroy === 'function') {
          h.destroy();
        } else if (typeof h?.unref === 'function') {
          h.unref();
        }
      }

      // 3. Gracefully exit the build process
      setTimeout(() => {
        process.exit(0);
      }, 100);
    },
  };
}

/**
 * Demotes Vite's `<link rel="modulepreload">` hints to `<link rel="prefetch">`
 * in every emitted HTML page to keep LCP critical path lean.
 * (Deliberately NOT deprioritizing the entry module script — measured TTI
 * regression outweighs the LCP bandwidth gain.)
 */
function deferNonCriticalPreloads(): Plugin {
  const rewriteFile = (full: string): void => {
    let html = readFileSync(full, 'utf8');
    let changed = false;
    // Demote modulepreload hints to prefetch so secondary JS chunks never contend with FCP and LCP
    if (html.includes('rel="modulepreload"')) {
      html = html.replaceAll('rel="modulepreload"', 'rel="prefetch"');
      changed = true;
    }
    // Swiper CSS is below-the-fold: defer via print/all media swap
    if (html.includes('/assets/swiper-') && html.includes('rel="stylesheet"')) {
      html = html.replace(
        /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/swiper-[^"]+\.css)">/g,
        '<link rel="stylesheet" crossorigin href="$1" media="print" onload="this.media=\'all\'">'
      );
      changed = true;
    }
    if (changed) writeFileSync(full, html);
  };
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (full.endsWith('.html')) rewriteFile(full);
    }
  };
  return {
    name: 'defer-non-critical-preloads',
    apply: 'build',
    closeBundle() {
      try {
        walk('dist');
      } catch {
        /* dist directory might not exist */
      }
    },
  };
}

/**
 * Pre-compresses emitted static text assets with Brotli at level 11.
 */
function brotliStatic(threshold = 1024): Plugin {
  const filter = /\.(js|mjs|css|html|svg|json|xml)$/i;
  return {
    name: 'brotli-static',
    apply: 'build',
    closeBundle() {
      const walk = (dir: string): void => {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry);
          if (statSync(full).isDirectory()) {
            walk(full);
            continue;
          }
          if (!filter.test(full) || full.endsWith('.br')) continue;
          const size = statSync(full).size;
          if (size < threshold) continue;
          try {
            if (statSync(`${full}.br`).isFile()) continue;
          } catch {
            /* missing — compress */
          }
          const compressed = brotliCompressSync(readFileSync(full), {
            params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
          });
          writeFileSync(`${full}.br`, compressed);
        }
      };
      try {
        walk('dist');
      } catch {
        /* dist directory might not exist */
      }
    },
  };
}

/**
 * Serves the CKEditor 4 distribution.
 *
 * CKEditor 4 is a classic script: it mounts over a `<textarea>` and pulls its
 * own skins, languages and plugins from a base path at runtime, so it cannot
 * be bundled. This plugin exposes `node_modules/ckeditor4` at `/ckeditor/`
 * during dev and stages the subset the editor actually needs into
 * `dist/ckeditor` on build.
 */
function ckeditorAssets(): Plugin {
  const rootDir = import.meta.dirname ?? '.';
  const sourceDir = path.resolve(rootDir, 'node_modules/ckeditor4');
  const targetDir = path.resolve(rootDir, 'dist/ckeditor');

  /** Root files the editor loads by name. */
  const rootFiles = ['ckeditor.js', 'config.js', 'styles.js', 'contents.css', 'LICENSE.md'];

  /** Plugins the editor loads on demand (see `EXTRA_PLUGINS` in the editor). */
  const pluginDirs = [
    'font',
    'colordialog',
    'colorbutton',
    'showblocks',
    'justify',
    'smiley',
    'pagebreak',
    'iframe',
    'codesnippet',
    'preview',
  ];

  /**
   * Default plugins whose code is bundled into `ckeditor.js` but whose
   * dialogs, icons and styles still live in `plugins/<name>/`. Without these
   * directories the editor's toolbar renders, but opening Link, Image or
   * Table fails with "failed when loading definition" on a static host.
   */
  const bundledPluginDirs = ['dialog', 'widget', 'image', 'link', 'table', 'tabletools'];

  /**
   * Collects the plugins a set of plugins depends on. CKEditor stores the
   * dependency list in the plugin file itself (`requires:"a,b"`); anything
   * that also ships as a directory has to be staged next to its dependant.
   */
  const resolvePluginClosure = (names: string[]): string[] => {
    const collected = new Set<string>();

    const visit = (name: string): void => {
      if (collected.has(name)) return;
      const pluginDir = join(sourceDir, 'plugins', name);
      if (!existsSync(pluginDir)) return;
      collected.add(name);

      // Default plugins are bundled into ckeditor.js and have no plugin.js,
      // but their dialogs/icons still need to be staged.
      const entry = join(pluginDir, 'plugin.js');
      if (!existsSync(entry)) return;

      const source = readFileSync(entry, 'utf8');
      const requires = source.match(/requires\s*:\s*"([^"]*)"/);
      if (!requires) return;
      for (const dependency of requires[1].split(',')) {
        const trimmed = dependency.trim();
        if (!trimmed) continue;
        if (existsSync(join(sourceDir, 'plugins', trimmed))) visit(trimmed);
      }
    };

    names.forEach(visit);
    return [...collected];
  };

  /** The only skin the panel uses. */
  const skinDirs = ['moono-lisa'];

  /** The editor runs in English; every other locale is dead weight. */
  const locales = ['en'];

  const contentType = (file: string): string => {
    switch (path.extname(file).toLowerCase()) {
      case '.js':
        return 'application/javascript; charset=utf-8';
      case '.css':
        return 'text/css; charset=utf-8';
      case '.html':
      case '.htm':
        return 'text/html; charset=utf-8';
      case '.json':
        return 'application/json; charset=utf-8';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.svg':
        return 'image/svg+xml';
      case '.ico':
        return 'image/x-icon';
      case '.woff':
        return 'font/woff';
      case '.woff2':
        return 'font/woff2';
      case '.ttf':
        return 'font/ttf';
      case '.eot':
        return 'application/vnd.ms-fontobject';
      default:
        return 'application/octet-stream';
    }
  };

  const copyFile = (from: string, to: string): void => {
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, to);
  };

  const copyTree = (from: string, to: string, skip: (name: string) => boolean = () => false): void => {
    mkdirSync(to, { recursive: true });
    for (const entry of readdirSync(from, { withFileTypes: true })) {
      if (skip(entry.name)) continue;
      const source = join(from, entry.name);
      const destination = join(to, entry.name);
      if (entry.isDirectory()) {
        copyTree(source, destination, skip);
      } else {
        copyFileSync(source, destination);
      }
    }
  };

  return {
    name: 'ckeditor-assets',
    configureServer(server) {
      server.middlewares.use('/ckeditor', (req, res, next) => {
        if (!req.url) return next();
        const relative = decodeURIComponent(req.url.split('?')[0]);
        const requested = path.resolve(join(sourceDir, relative));
        // Block path traversal out of the package directory.
        if (requested !== sourceDir && !requested.startsWith(sourceDir + path.sep)) {
          return next();
        }
        if (!existsSync(requested) || !statSync(requested).isFile()) {
          // Answer with a real 404 instead of letting Vite's SPA fallback
          // serve index.html. CKEditor probes `<plugin>/<plugin>.js` before
          // `<plugin>/plugin.js` and treats any 2xx as a loaded plugin — an
          // HTML body would register nothing and break the whole toolbar.
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Not found');
          return;
        }
        res.setHeader('Content-Type', contentType(requested));
        res.setHeader('Cache-Control', 'no-cache');
        res.end(readFileSync(requested));
      });
    },
    closeBundle() {
      try {
        rmSync(targetDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
        mkdirSync(targetDir, { recursive: true });

        for (const file of rootFiles) {
          const source = join(sourceDir, file);
          if (existsSync(source)) copyFile(source, join(targetDir, file));
        }

        for (const locale of locales) {
          const source = join(sourceDir, 'lang', `${locale}.js`);
          if (existsSync(source)) copyFile(source, join(targetDir, 'lang', `${locale}.js`));
        }

        for (const skin of skinDirs) {
          const source = join(sourceDir, 'skins', skin);
          if (existsSync(source)) copyTree(source, join(targetDir, 'skins', skin));
        }

        for (const plugin of resolvePluginClosure([...pluginDirs, ...bundledPluginDirs])) {
          const source = join(sourceDir, 'plugins', plugin);
          if (!existsSync(source)) continue;
          const destination = join(targetDir, 'plugins', plugin);
          // Copy the plugin itself, but only the English strings.
          copyTree(source, destination, (name) => name === 'lang');
          for (const locale of locales) {
            const lang = join(source, 'lang', `${locale}.js`);
            if (existsSync(lang)) copyFile(lang, join(destination, 'lang', `${locale}.js`));
          }
          // CKEditor probes `<plugin>/<plugin>.js` before `<plugin>/plugin.js`.
          // Ship both names so the first probe succeeds on any host — a
          // missing file that the host answers with the SPA shell would be
          // read as "plugin loaded" and silently break the toolbar.
          const entry = join(source, 'plugin.js');
          if (existsSync(entry)) copyFile(entry, join(destination, `${plugin}.js`));
        }
      } catch (err) {
        console.warn('[ckeditor-assets] could not stage the editor bundle:', err);
      }
    },
  };
}

/**
 * Vite plugin that calls the getSitemap API at build time and generates dynamic sitemap.xml.
 */
function dynamicSitemapPlugin(): Plugin {
  return {
    name: 'dynamic-sitemap',
    async buildStart() {
      try {
        const rootDir = process.cwd();
        const { count, blogCount } = await generateAndSaveSitemap({ rootDir });
        console.log(
          `[sitemap] Generated dynamic sitemap at build time with ${count} URLs (${blogCount} active blogs).`,
        );
      } catch (err) {
        console.warn('[sitemap] Failed to generate dynamic sitemap at buildStart:', err);
      }
    },
    async closeBundle() {
      try {
        const rootDir = process.cwd();
        const publicSitemap = path.resolve(rootDir, 'public/sitemap.xml');
        const distSitemap = path.resolve(rootDir, 'dist/sitemap.xml');
        if (existsSync(publicSitemap) && existsSync(path.resolve(rootDir, 'dist'))) {
          copyFileSync(publicSitemap, distSitemap);
        }
      } catch (err) {
        console.warn('[sitemap] Failed to copy sitemap to dist during closeBundle:', err);
      }
    },
    configureServer(server) {
      server.middlewares.use('/sitemap.xml', async (_req, res) => {
        try {
          const apiData = await fetchSitemapData();
          const xml = buildSitemapXml(apiData);
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(xml);
        } catch {
          const fallback = readFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), 'utf8');
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(fallback);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    dynamicSitemapPlugin(),
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    // Static Site Generation (SSG) with typed Schema.org JSON-LD
    vitePrerenderPlugin({
      prerenderScript: path.resolve(import.meta.dirname ?? '.', 'src/prerender.tsx'),
      renderTarget: '#root',
      additionalPrerenderRoutes: [
        '/hi',
        '/about',
        '/hi/about',
        '/stories',
        '/hi/stories',
        // '/membership',
        // '/hi/membership',
        '/contact',
        '/hi/contact',
        '/blogs',
        '/hi/blogs',
        '/privacy',
        '/hi/privacy',
        '/terms',
        '/hi/terms',
        '/guidelines',
        '/hi/guidelines',
        '/help-center',
        '/hi/help-center',
        '/registration',
        '/hi/registration',
        // Aliases the router resolves too — without prerendered HTML the host
        // serves the home page fallback here, which hydrates against a
        // different route tree and crashes with React error #418.
        '/register',
        '/hi/register',
        '/success-stories',
        '/hi/success-stories',
        '/admin-register',
        '/hi/admin-register',
        '/download',
        '/hi/download',
      ],
    }),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    deferNonCriticalPreloads(),
    brotliStatic(),
    ckeditorAssets(),
    eventLoopCleanup(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname ?? '.', './src'),
    },
  },
  server: {
    // Firebase Phone Auth rejects real-number OTP sends from `localhost` origins
    // (firebase-js-sdk#8387). Serve dev on 127.0.0.1 and keep `127.0.0.1`
    // in Firebase Auth → Settings → Authorized domains.
    host: '127.0.0.1',
    // Member photos are served without CORS headers. Proxying them through the
    // dev origin lets the PDF exporter read the pixels instead of rasterising
    // an empty image box.
    proxy: {
      '/crmapi': {
        target: 'https://vivahsambandh.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    proxy: {
      '/crmapi': {
        target: 'https://vivahsambandh.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    modulePreload: {
      resolveDependencies(_url, deps) {
        // Only preload critical react core; keep mobile bandwidth 100% free
        // for hero LCP banner image and critical CSS.
        return deps.filter((dep) => dep.includes('react'));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const p = id.replace(/\\/g, '/');
          // Server renderer (prerender script only) — never shipped to clients.
          // Covers the package entry shims (server.*.js) and the compiled
          // implementation (cjs/react-dom-server.*).
          if (
            /\/node_modules\/react-dom\/(server[^/]*\.js|cjs\/react-dom-server[^/]*)/.test(
              p,
            )
          )
            return 'ssr-renderer';
          if (/\/node_modules\/(react|react-dom|scheduler|react-is)\//.test(p)) return 'react';
          if (/gsap/.test(p)) return 'gsap';
          if (/\/lenis\//.test(p)) return 'lenis';
          // motion/framer-motion → separate chunk so it never loads on first paint
          if (/motion|framer-motion/.test(p)) return 'motion';
          // lucide-react + Radix UI primitives → ui-vendor chunk (tree-shaken by rollup)
          if (/lucide-react|@radix-ui|radix-ui/.test(p)) return 'ui-vendor';
          if (/swiper/.test(p)) return 'swiper';
          if (/dompurify/.test(p)) return 'dompurify';
          if (/@tanstack/.test(p)) return 'tanstack';
          if (/i18next/.test(p)) return 'i18n';
          return undefined;
        },
      },
    },
  },
});


