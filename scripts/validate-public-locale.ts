import { resolvePublicLocale } from "../src/i18n/publicLocale";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(resolvePublicLocale() === "en", "Fresh public sessions must use English.");
assert(resolvePublicLocale("es") === "en", "Persisted Spanish locale cookies must not affect public rendering.");

console.log("public_locale_validation=pass");
