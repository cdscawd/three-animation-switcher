import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const target = join(
  __dirname,
  '../node_modules/@gatsby/liquidglassui/dist/index.js',
)

let source = readFileSync(target, 'utf8')
let changed = false

const observerBroken = `\ts(() => {
\t\tif (!S) return;
\t\tlet e = T.current;
\t\tif (!e) return;
\t\tlet t = () => {
\t\t\tP.current !== null && cancelAnimationFrame(P.current), P.current = requestAnimationFrame(() => {
\t\t\t\tP.current = null;
\t\t\t\tlet { width: t, height: n } = e.getBoundingClientRect(), r = Math.round(t), i = Math.round(n);
\t\t\t\tF.current !== null && window.clearTimeout(F.current), F.current = window.setTimeout(() => {
\t\t\t\t\tF.current = null, B(r, i);
\t\t\t\t}, 32);
\t\t\t});
\t\t};
\t\tt();
\t\tlet n = new ResizeObserver(t);
\t\treturn n.observe(e), () => {
\t\t\tn.disconnect(), P.current !== null && cancelAnimationFrame(P.current), j.current !== null && ae(j.current), F.current !== null && window.clearTimeout(F.current);
\t\t};
\t}, [S, B]);`

const observerFixed = `\ts(() => {
\t\tif (!S) return;
\t\tlet cancelled = !1, rafId = 0, observer;
\t\tlet measure = () => {
\t\t\tlet el = T.current;
\t\t\tif (!el) return;
\t\t\tP.current !== null && cancelAnimationFrame(P.current), P.current = requestAnimationFrame(() => {
\t\t\t\tP.current = null;
\t\t\t\tlet { width: t, height: n } = el.getBoundingClientRect(), r = Math.round(t), i = Math.round(n);
\t\t\t\tF.current !== null && window.clearTimeout(F.current), F.current = window.setTimeout(() => {
\t\t\t\t\tF.current = null, B(r, i);
\t\t\t\t}, 32);
\t\t\t});
\t\t};
\t\tlet attach = () => {
\t\t\tlet el = T.current;
\t\t\tif (!el) {
\t\t\t\tif (!cancelled) rafId = requestAnimationFrame(attach);
\t\t\t\treturn;
\t\t\t}
\t\t\tmeasure();
\t\t\tobserver = new ResizeObserver(measure);
\t\t\tobserver.observe(el);
\t\t};
\t\tattach();
\t\treturn () => {
\t\t\tcancelled = !0, cancelAnimationFrame(rafId), observer?.disconnect(), P.current !== null && cancelAnimationFrame(P.current), j.current !== null && ae(j.current), F.current !== null && window.clearTimeout(F.current);
\t\t};
\t}, [S, B]);`

if (source.includes(observerBroken)) {
  source = source.replace(observerBroken, observerFixed)
  changed = true
  console.log('[patch-liquidglassui] fixed ResizeObserver attach')
}

const idleMapGen = `\t\tz.current !== n && (z.current = n, A({
\t\t\twidth: e,
\t\t\theight: t
\t\t}), j.current !== null && ae(j.current), j.current = ie(() => {
\t\t\tj.current = null, O(K({
\t\t\t\twidth: e,
\t\t\t\theight: t,
\t\t\t\t...g
\t\t\t}));
\t\t}));`

const syncMapGen = `\t\tz.current !== n && (z.current = n, A({
\t\t\twidth: e,
\t\t\theight: t
\t\t}), O(K({
\t\t\twidth: e,
\t\t\theight: t,
\t\t\t...g
\t\t})));`

if (source.includes(idleMapGen)) {
  source = source.replace(idleMapGen, syncMapGen)
  changed = true
  console.log('[patch-liquidglassui] made displacement map generation synchronous')
}

const anchorBroken = `let { hostRef: l, filterId: u, mapId: d, mapUrl: f, filterSize: g, filterStyle: _, borderRadius: v, variantClass: y, isFilterActive: b } = Y(e, {
\t\tbaseClass: "anchor-liquid-glass",
\t\tvariant: r
\t}),`

const anchorFixed = `let { hostRef: l, filterId: u, mapId: d, mapUrl: f, filterSize: g, filterStyle: _, borderRadius: v, variantClass: y, isFilterActive: b } = Y(e, {
\t\tbaseClass: "anchor-liquid-glass",
\t\tvariant: r,
\t\tfilterMode: t,
\t\tnestedPolicy: n
\t}),`

if (source.includes(anchorBroken)) {
  source = source.replace(anchorBroken, anchorFixed)
  changed = true
  console.log('[patch-liquidglassui] fixed AnchorLiquidGlass filterMode passthrough')
}

if (changed) {
  writeFileSync(target, source)
} else {
  console.log('[patch-liquidglassui] already up to date')
}
