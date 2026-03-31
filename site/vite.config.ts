import type { UserConfig } from "vite";
import CIMDPlugin from "./vite-plugin-cimd";

export default {
  plugins: [CIMDPlugin({ file: "web-client-metadata.json" })],
} satisfies UserConfig;
