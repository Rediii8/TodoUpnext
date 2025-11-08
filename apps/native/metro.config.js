// Learn more https://docs.expo.io/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), {
	input: "./global.css",
	configPath: "./tailwind.config.js",
});

config.resolver.unstable_enablePackageExports = true;

const monorepoRoot = path.resolve(__dirname, "..", "..");

config.watchFolders = Array.from(
	new Set([...(config.watchFolders ?? []), monorepoRoot])
);

config.resolver.nodeModulesPaths = Array.from(
	new Set([
		path.resolve(__dirname, "node_modules"),
		path.resolve(monorepoRoot, "node_modules"),
	])
);

module.exports = config;
