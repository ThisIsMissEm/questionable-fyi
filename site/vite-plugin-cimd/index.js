// @ts-nocheck

import { resolve, join } from "node:path";
import { readFile, constants } from "node:fs/promises";
import { loadEnv } from "vite";
import {
  oauthClientMetadataSchema,
  oauthScopeSchema,
  httpsUriSchema,
  privateUseUriSchema,
} from "@atcute/oauth-types";

function throwCimdError(message, path) {
  if (path) {
    throw new Error(`vite-plugin-cimd: ${message} at ${path}`);
  } else {
    throw new Error(`vite-plugin-cimd: ${message}`);
  }
}

function safeParse(input, onError) {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (err instanceof SyntaxError) {
      onError(err);
      return undefined;
    }
    throw err;
  }
}

function defineEnvVars(parent, variables, location) {
  return Object.keys(variables).reduce((env, key) => {
    if (typeof location === "string") {
      env[`${location}.${key.toUpperCase()}`] = variables[key];
    } else {
      env[key.toUpperCase()] = variables[key];
    }
    return env;
  }, parent ?? {});
}

async function requestCimd(metadata) {
  const response = await fetch("https://cimd-service.fly.dev/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    return throwCimdError(`Failed to register CIMD: ${await response.text()}`);
  }

  const json = await response.json();

  if (
    !Object.hasOwn(json, "client_id") ||
    !Object.hasOwn(json, "expiresAfter")
  ) {
    return throwCimdError(`Failed to register CIMD: unknown error`);
  }

  return {
    client_id: json.client_id,
    expires: Date.parse(json.expiresAfter),
  };
}

function canParseRedirectUri(input) {
  if (input.startsWith("https://")) {
    return URL.canParse(input);
  }
  return false;
}

const cimdCache = new Map();
async function readCimdFromDisk(resolvedRoot, file) {
  const cimdPath = join("public", file);
  const existing = cimdCache.get(cimdPath);
  if (existing) {
    return existing;
  }

  const cimdContents = await readFile(resolve(resolvedRoot, cimdPath), {
    encoding: "utf-8",
    flag: constants.O_RDONLY,
  }).catch((err) => {
    if (err instanceof Error && Object.hasOwn(err, "code")) {
      if (err.code === "ENOENT") {
        return throwCimdError("failed to load CIMD JSON", cimdPath);
      }
    }
    throw err;
  });

  const parsedCimd = safeParse(cimdContents, (err) => {
    if (err instanceof SyntaxError) {
      return throwCimdError(
        `CIMD contained syntax error: ${err.message}`,
        cimdPath,
      );
    }
  });

  const cimd = oauthClientMetadataSchema.try(parsedCimd);

  if (!cimd.ok) {
    return throwCimdError(`CIMD contained errors: ${cimd.message}`, cimdPath);
  }

  cimdCache.set(cimdPath, cimd.value);

  return cimd.value;
}

function validateCimd(cimd, config) {
  const metadata = { ...cimd };
  const expectedHostname = `127.0.0.1:${config.server.port}`;
  for (let redirectUriIdx in cimd.redirect_uris) {
    const redirectUri = cimd.redirect_uris[redirectUriIdx];

    if (!canParseRedirectUri(redirectUri)) {
      return throwCimdError(`Invalid redirect_uri: ${redirectUri}`, cimdPath);
    }

    const parsed = URL.parse(redirectUri);
    if (parsed.protocol !== "http:" && parsed.hostname !== expectedHostname) {
      const newUri = new URL(parsed.pathname, `http://${expectedHostname}/`);
      metadata.redirect_uris[redirectUriIdx] = newUri.toString();
    }
  }

  // Note: doesn't actually validate the scope string yet, just validates it's an OAuth Scope
  const scopes = oauthScopeSchema.try(cimd.scope);
  if (!scopes.ok) {
    return throwCimdError(`Invalid scopes: ${scopes.message}`, cimdPath);
  }

  return metadata;
}

function CIMDPlugin(options = {}) {
  const { file = "oauth-client-metadata.json" } = options;

  return {
    name: "vite-plugin-cimd",
    async config({ root = process.cwd() }, { command, mode }) {
      const cimd = await readCimdFromDisk(root, file);
      if (command !== "build") {
        return {};
      }

      return {
        define: defineEnvVars(
          {},
          {
            VITE_CIMD_CLIENT_ID: JSON.stringify(cimd.client_id),
            VITE_CIMD_REDIRECT_URI: JSON.stringify(cimd.redirect_uris[0]),
            VITE_CIMD_SCOPE: JSON.stringify(cimd.scope ?? "atproto"),
          },
          "import.meta.env",
        ),
      };
    },
    async configResolved(resolvedConfig) {
      const resolvedRoot = resolve(resolvedConfig.root);
      const stateFile = resolve(resolvedConfig.root, ".cimd-state.json");

      const cimd = await readCimdFromDisk(resolvedRoot, file);

      if (
        resolvedConfig.command === "serve" &&
        ["development", "test"].includes(resolvedConfig.mode)
      ) {
        resolvedConfig.logger.info(
          `vite-plugin-cimd: fetching CIMD from ${"https://cimd-service.fly.dev"}`,
        );

        const metadata = validateCimd(cimd, resolvedConfig);
        const result = await requestCimd(metadata);

        resolvedConfig.logger.info(result.client_id);
        resolvedConfig.logger.info(`vite-plugin-cimd: done!`);
        resolvedConfig.env = defineEnvVars(resolvedConfig.env ?? {}, {
          VITE_CIMD_CLIENT_ID: result.client_id,
          VITE_CIMD_REDIRECT_URI: metadata.redirect_uris[0],
          VITE_CIMD_SCOPE: metadata.scope ?? "atproto",
        });

        // Required for AT Protocol OAuth:
        resolvedConfig.server.host = "127.0.0.1";
        resolvedConfig.server.allowedHosts = [
          ...resolvedConfig.server.allowedHosts,
          "localhost",
          "127.0.0.1",
        ];
      }

      return resolvedConfig;
    },
  };
}
export { CIMDPlugin as default };
