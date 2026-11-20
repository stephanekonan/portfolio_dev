/**
 * Discrétion sur la pile technique : les détecteurs (Wappalyzer et
 * semblables) reconnaissent un site aux variables globales que ses
 * librairies posent sur `window` (`next.version`, `TURBOPACK`,
 * `MotionIsMounted`, `gsapVersions`, `va`, `hj`…). Ils ne retiennent qu'une
 * propriété *propre* de `window` (`hasOwnProperty`).
 *
 * Ce script, exécuté en tête de page, range ces variables derrière un
 * accesseur posé sur `Window.prototype` : `window.next = …` passe par le
 * setter, `window.next` par le getter, les librairies fonctionnent comme
 * avant, mais `window` n'a plus de propriété propre de ce nom. Une variable
 * déjà posée (script arrivé avant celui-ci) est déplacée de la même façon.
 * L'objet `window.next` perd en plus `version`, `appDir` et `turbopack`, que
 * Next écrit sans jamais les relire.
 */
const HIDDEN = [
  "next",
  "TURBOPACK",
  "TURBOPACK_CHUNK_LISTS",
  "TURBOPACK_NEXT_CHUNK_URLS",
  "TURBOPACK_ASSET_SUFFIX",
  "MotionIsMounted",
  "MotionHandoffAnimation",
  "MotionHasOptimisedAnimation",
  "MotionHandoffMarkAsComplete",
  "MotionHandoffIsComplete",
  "MotionCancelOptimisedAnimation",
  "MotionCheckAppearSync",
  "gsapVersions",
  "va",
  "vaq",
  "vai",
  "vam",
  "hj",
  "_hjSettings",
];

export const DISCRETION_SCRIPT = `try{(function(){var W=window,P=Window.prototype,S={};function scrub(n,v){if(n==="next"&&v&&typeof v==="object"){["version","appDir","turbopack"].forEach(function(k){delete v[k];try{Object.defineProperty(v,k,{configurable:true,get:function(){},set:function(){}})}catch(e){}})}return v}${JSON.stringify(HIDDEN)}.forEach(function(n){var d=Object.getOwnPropertyDescriptor(W,n);if(d){if(!d.configurable)return;S[n]=scrub(n,W[n]);delete W[n]}Object.defineProperty(P,n,{configurable:true,get:function(){return S[n]},set:function(v){S[n]=scrub(n,v)}})})})()}catch(e){}`;
