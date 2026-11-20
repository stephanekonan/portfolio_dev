/**
 * Plugin PostCSS, après Tailwind : renomme ses variables `--tw-*` en `--u-*`
 * et retire les commentaires de licence. Les détecteurs de technologies
 * reconnaissent Tailwind à ces variables (`--tw-translate`, `--tw-shadow`…).
 * Le CSS produit reste identique, seul le nom des variables change.
 */
const FROM = /--tw-/g;
const TO = "--u-";

const plugin = () => ({
  postcssPlugin: "postcss-discretion",
  OnceExit(root) {
    root.walkDecls((decl) => {
      if (decl.prop.includes("--tw-")) decl.prop = decl.prop.replace(FROM, TO);
      if (decl.value.includes("--tw-")) decl.value = decl.value.replace(FROM, TO);
    });
    root.walkAtRules((rule) => {
      if (rule.params.includes("--tw-")) rule.params = rule.params.replace(FROM, TO);
    });
    root.walkRules((rule) => {
      if (rule.selector.includes("--tw-")) rule.selector = rule.selector.replace(FROM, TO);
    });
    root.walkComments((comment) => {
      if (/tailwind/i.test(comment.text)) comment.remove();
    });
  },
});
plugin.postcss = true;

module.exports = plugin;
