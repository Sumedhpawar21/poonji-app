const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });
const upstreamResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath.replace(/\\/g, '/');
  const relativeInsidePackage =
    moduleName.startsWith('.') &&
    (origin.includes('/node_modules/@tanstack/') || origin.includes('/node_modules/@react-navigation/'));
  const nextContext = relativeInsidePackage
    ? { ...context, unstable_enablePackageExports: false }
    : context;

  if (typeof upstreamResolve === 'function') {
    return upstreamResolve(nextContext, moduleName, platform);
  }
  return context.resolveRequest(nextContext, moduleName, platform);
};

module.exports = config;
