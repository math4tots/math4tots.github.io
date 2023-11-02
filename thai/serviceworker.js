// This code executes in its own worker or thread

const VERSION = "000.000.001";

self.addEventListener("install", event => {
    console.log("Service worker installed");
});
self.addEventListener("activate", event => {
    console.log("Service worker activated");
});
