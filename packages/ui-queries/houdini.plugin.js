import { fs, path, plugin } from "houdini";
import { statSync } from "fs";

/**
 * Accepts some filepath and a target filepath.
 * This checks that:
 *  - There are no unresolved $houdini imports
 *  - The file either has an extension (.js or .ts), or is a directory
 *  - If no extension, add .js
 *  - If a directory, add /index.js
 * @param {string} importer
 * @param {string} target
 * @param {string} houdiniRoot
 * @returns {string}
 */
function disambiguate(importer, target, houdiniRoot) {
  // Do $Houdini Resolution
  target = target.replace(/(?:\.\.\/)*\$houdini/g, () => {
    return path.relative(path.dirname(importer), houdiniRoot);
  });
  const targetPath = path.resolve(path.dirname(importer), target);
  const dirStat = statSync(targetPath, { throwIfNoEntry: false });
  if (dirStat?.isDirectory()) {
    return `${target}/index.js`;
  }
  const fileStat = statSync(targetPath + ".js", { throwIfNoEntry: false });
  if (fileStat?.isFile()) {
    return `${target}.js`;
  }
  return target;
}

const plug = async (/** @type {{outfile: string}} */ { outfile }) => {
  const out = {
    order: "after",
    async generate({ config, documents }) {
      const pluginDir = path.join(
        config.pluginDirectory("houdini-library-mode")
      );

      const relativeToPlugin = (/** @type {string} */ targetPath) =>
        path.relative(pluginDir, targetPath);
      await fs
        .mkdirp(pluginDir)
        .catch((/** @type {Error & { code?: string }} */ e) => {
          if (e.code !== "EEXIST") {
            throw e;
          }
        });
      // Reexport all of the artifact types
      // This helps keep the outputs of our library more useful
      await buildArtifactReexporter(
        documents,
        relativeToPlugin,
        config.artifactPath,
        pluginDir
      );

      // Build the index file
      // This would be the "main" field in your package.json
      await buildIndexFile(
        config.pluginConfig("houdini-svelte"),
        config.pluginDirectory("houdini-svelte"),
        relativeToPlugin,
        pluginDir,
        outfile
      );

      // We are copying the configuration file into our packaged library and fixing the reference
      // This prevents houdini from trying to reach out of the dist dir
      await materializeConfigFile(config.runtimeDirectory, config.filepath);

      await updateSvelteClientPath(config.rootDir);
      const allFiles = await fs.glob(
        path.join(config.rootDir, "**", "*.{js,ts}")
      );

      await Promise.all(
        allFiles.map(forceExplicitImportExports(config.rootDir))
      );
    },
  };
  return out;
};

const myPlugin = plugin("houdini-library-mode", plug);

export default myPlugin;

/**
 * Forces explicit import and export statements to use .js extensions.
 *
 * This function reads a file and updates any import or export statements that
 * do not explicitly include a .js extension. It writes the modified content back
 * to the file.
 *
 * @param {string} rootDir - The root directory of the project.
 */
function forceExplicitImportExports(rootDir) {
  /**
   * @param {string} p - The path to the file to process.
   */
  return async (p) => {
    const fileContent = await fs.readFile(p);
    if (!fileContent) {
      return;
    }

    let modified = fileContent;

    const exportSpec =
      /(export|import)\s+(.+)\s+from\s*(["'])(?!.*\.[jt]s)([^'"]+)\3/g;
    modified = modified.replaceAll(exportSpec, (_, kind, content, _2, name) => {
      const target = disambiguate(p, name, rootDir);

      return `${kind} ${content} from "${target}"`;
    });
    const inlineImportSpec = /import\((["'])(?!.*\.[jt]s)([^'"]+)\1\)(.*)/g;
    modified = modified.replaceAll(inlineImportSpec, (_, _2, name, rest) => {
      const target = disambiguate(p, name, rootDir);
      return `import("${target}")${rest}`;
    });

    if (modified !== fileContent) {
      await fs.writeFile(p, modified);
    }
  };
}

/**
 * Updates the Svelte client path by modifying import statements in 'client.js'.
 *
 * This function reads the 'client.js' file located in the Svelte runtime directory,
 * finds any import statements with a '.ts' extension, and replaces them with '.js'.
 * It writes the modified content back to 'client.js'.
 *
 * @param {string} rootDir - Root directory of the project.
 */
async function updateSvelteClientPath(rootDir) {
  {
    const svelteRuntimeDir = path.join(
      rootDir,
      "plugins",
      "houdini-svelte",
      "runtime"
    );
    // lexical scoping
    const clientContent = await fs.readFile(
      path.join(svelteRuntimeDir, "client.js")
    );
    if (clientContent) {
      // Find client import statements with .ts extension and replace with .js
      const clientImportRegex =
        /(client\s*=\s*\(await\s*import\(["'])([^"']+)\.ts(["']\)\)\.default;)/g;
      const modified = clientContent.replace(
        clientImportRegex,
        (match, prefix, path, suffix) => {
          return `${prefix}${path}.js${suffix}`;
        }
      );
      await fs.writeFile(path.join(svelteRuntimeDir, "client.js"), modified);
    }
  }
}

/**
 * Copies the Houdini configuration file to the 'imports' directory
 * within the runtime directory and replaces the 'config.js' with one that contains
 * the copied configuration filepath.
 *
 * @param {string} runtimeDirectory - The directory where the runtime is located.
 * @param {string} filepath - The path to the Houdini configuration file to be copied.
 */
async function materializeConfigFile(runtimeDirectory, filepath) {
  const importsDir = path.join(runtimeDirectory, "imports");
  await fs.copyFile(filepath, path.join(importsDir, "houdini.config.js"));
  await fs.writeFile(
    path.join(importsDir, "config.js"),
    `
      import config from './houdini.config.js'
      export default config
      `.trim()
  );
}

/**
 * Builds the index file for the plugin, exporting necessary modules and clients.
 * If the 'houdini-svelte' plugin is configured, it includes exports for Svelte stores and the API client.
 * Also re-exports types from 'artifacts.d.ts'. Optionally writes to an output file.
 *
 * @param {any} svelteConfig - Configuration for the 'houdini-svelte' plugin.
 * @param {string} svelteDirectory - Directory where the 'houdini-svelte' plugin is located.
 * @param {(targetPath: string) => string} relativeToPlugin - Function to compute relative paths from the plugin directory.
 * @param {string} pluginDir - Directory where the plugin is located.
 * @param {string} [outfile] - Optional output file path for writing the index exports.
 */
async function buildIndexFile(
  svelteConfig,
  svelteDirectory,
  relativeToPlugin,
  pluginDir,
  outfile
) {
  let indexFileContent = "";
  if (svelteConfig) {
    const svelteStoresPath = relativeToPlugin(
      path.join(svelteDirectory, "stores", "index.js")
    );
    indexFileContent += `export * from '${svelteStoresPath}';\n`;

    const clientFilePath = path.resolve(svelteConfig.client);
    indexFileContent += `import apiClient from '${relativeToPlugin(clientFilePath.replace(".ts", ".js"))}'\n`;
    indexFileContent += `export default apiClient\n`;
  }
  indexFileContent += `export * from "./artifacts.d.ts"\n`;
  const indexPath = path.join(pluginDir, "index.js");
  await fs.writeFile(indexPath, indexFileContent);
  if (outfile) {
    await fs.writeFile(
      outfile,
      `export * from './${path.relative(path.resolve(path.dirname(outfile)), indexPath)}';`
    );
  }
}

/**
 * Builds artifacts.d.ts, which re-exports the types for every generated artifact (e.g. MyQuery$result, MyQuery$input, and so on)
 * @param {any[]} documents - This type won't resolve, should be an array of Houdini Document
 * @param {(targetPath: string) => string} relativeToPlugin
 * @param {(document: any) => string} buildArtifactPath - Function to compute the path for a given document.
 * @param {string} pluginDir
 */
async function buildArtifactReexporter(
  documents,
  relativeToPlugin,
  buildArtifactPath,
  pluginDir
) {
  const artifactPaths = [];
  for (const document of documents) {
    try {
      artifactPaths.push(
        `export * from '${relativeToPlugin(buildArtifactPath(document.document))}'`
      );
    } catch (e) {
      // no-op, this can fail safely
    }
  }
  await fs.writeFile(
    path.join(pluginDir, "artifacts.d.ts"),
    artifactPaths.join("\n")
  );
}
