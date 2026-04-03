/**
 * pnpm hook — resolves `workspace:*` references left in published @mohasinac/*
 * packages (publishing bug: pnpm workspace protocol was not replaced with the
 * real version before `npm publish`). Maps every `workspace:*` peer/dep to the
 * actual npm version so that `pnpm install` succeeds.
 */
function readPackage(pkg, context) {
  const fix = (deps) => {
    if (!deps) return deps;
    for (const [name, version] of Object.entries(deps)) {
      if (version === "workspace:*" && name.startsWith("@mohasinac/")) {
        deps[name] = "^0.1.0";
        context.log(`fixed workspace:* → ^0.1.0 for ${name} in ${pkg.name}`);
      }
    }
    return deps;
  };

  pkg.dependencies = fix(pkg.dependencies);
  pkg.peerDependencies = fix(pkg.peerDependencies);
  pkg.optionalDependencies = fix(pkg.optionalDependencies);

  return pkg;
}

module.exports = { hooks: { readPackage } };
