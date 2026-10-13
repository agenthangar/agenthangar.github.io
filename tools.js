// Progressive enhancement: without JavaScript, every tool remains readable.
const picker = document.querySelector('.tool-picker');
const buttons = [...picker.querySelectorAll('[data-tool]')];
const panels = buttons.map(button => document.getElementById(button.dataset.tool));
picker.setAttribute('role', 'tablist');
buttons.forEach((button, index) => {
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].tabIndex = 0;
});
function selectTool(index, focus = false) {
  buttons.forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
    if (i !== index) panels[i].querySelectorAll('video').forEach(video => video.pause());
  });
  if (focus) buttons[index].focus();
}
function selectFromHash(hash = location.hash) {
  const target = document.getElementById(hash.slice(1));
  const index = panels.findIndex(panel => panel === target || panel.contains(target));
  if (index >= 0) selectTool(index);
}
buttons.forEach((button, index) => {
  button.addEventListener('click', () => selectTool(index));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTool(next, true); }
  });
});
selectTool(0);
selectFromHash();
window.addEventListener('hashchange', () => selectFromHash());
// Also handle repeated same-fragment links after the selected tab changes.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => selectFromHash(link.getAttribute('href')));
});
