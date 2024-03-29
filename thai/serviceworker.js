// This code executes in its own worker or thread

const VERSION = "000.000.001";

const CORE_ASSETS_CACHE_ID = "core-assets";

const CORE_CACHE_LIST = [
  "/lib-mdl/material.min.css",
  "/lib-mdl/material.min.js",
  "/thai/app.js",
  "/thai/favicon.png",
  "/thai/index.css",
  "/thai/index.html",
  "/thai/words.json",
  "/thai/icons/icon-512.png",
];

self.addEventListener("install", event => {
  console.log("Service worker installed");
  caches.open(CORE_ASSETS_CACHE_ID)
    .then(cache => cache.addAll(CORE_CACHE_LIST));
});

self.addEventListener("activate", event => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", event => {
  // "Network first" strategy as described in
  // https://web.dev/learn/pwa/serving
  event.respondWith(fetch(event.request).catch(error =>
    caches.match(event.request)));
});
