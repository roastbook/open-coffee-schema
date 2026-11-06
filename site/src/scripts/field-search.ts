const input = document.querySelector<HTMLInputElement>("#field-query");
const count = document.querySelector<HTMLElement>("[data-field-count]");
const fields = [
  ...document.querySelectorAll<HTMLElement>("[data-field-search]"),
];
const groups = [
  ...document.querySelectorAll<HTMLDetailsElement>("details.field-children"),
];
const sections = [...document.querySelectorAll<HTMLElement>(".schema-section")];
const fold = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const entries = fields.map((element) => ({
  element,
  text: fold(element.dataset.fieldSearch ?? ""),
}));
let savedGroups: boolean[] | null = null;

function search() {
  if (!input || !count) return;
  const words = fold(input.value).trim().split(/\s+/).filter(Boolean);
  if (words.length && !savedGroups)
    savedGroups = groups.map((group) => group.open);
  let matches = 0;
  for (const { element, text } of entries) {
    const match = words.every((word) => text.includes(word));
    element.hidden = !match;
    if (match) matches++;
  }
  for (const { element, text } of entries) {
    if (!words.every((word) => text.includes(word))) continue;
    let parent = element.parentElement;
    while (parent) {
      if (parent.matches("[data-field-search]")) parent.hidden = false;
      if (words.length && parent instanceof HTMLDetailsElement)
        parent.open = true;
      parent = parent.parentElement;
    }
  }
  for (const section of sections)
    section.hidden = !section.querySelector(
      "[data-field-search]:not([hidden])",
    );
  if (!words.length && savedGroups) {
    groups.forEach((group, index) => {
      group.open = savedGroups?.[index] ?? true;
    });
    savedGroups = null;
  }
  count.textContent = words.length
    ? `${matches} matching field${matches === 1 ? "" : "s"}${matches ? "" : ". Try another name or clear the search."}`
    : `${fields.length} fields. Search names, dotted paths and descriptions.`;
}

function revealHash() {
  let id: string;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (!target?.matches("[data-field-search]")) return;
  if (input?.value) {
    input.value = "";
    search();
  }
  let parent = target.parentElement;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
  requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
}
input?.addEventListener("input", search);
for (const [selector, open] of [
  ["[data-fields-expand]", true],
  ["[data-fields-collapse]", false],
] as const) {
  document.querySelector(selector)?.addEventListener("click", () => {
    if (input) input.value = "";
    search();
    for (const group of groups) group.open = open;
  });
}
window.addEventListener("hashchange", revealHash);
search();
revealHash();
