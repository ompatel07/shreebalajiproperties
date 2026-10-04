/**
 * Zero-dependency TypeScript + path-alias support for `node --test`.
 *
 * Node 24 strips types from `.ts` natively, so no transpiler is needed. The
 * only gap is the `@/*` alias from tsconfig, which Node knows nothing about.
 * This resolve hook maps it onto `src/`, which is all the project uses.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./resolve-alias.mjs", pathToFileURL("./tests/"));
