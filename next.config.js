/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@google-cloud/common",
    "google-auth-library",
    "google-gax",
    "gaxios",
    "gtoken",
    "jws",
    "teeny-request",
    "http-proxy-agent",
    "https-proxy-agent",
    "configstore",
    "graceful-fs",
    "make-dir",
    "write-file-atomic",
    "dot-prop",
    "json-file-plus",
    "@mohasinac/sievejs",
  ],
};

module.exports = nextConfig;
