// The generated HTML contains the full archive, already newest first.
// JavaScript only adds category filters and batches; no service is needed.
function initializeArchive() {
  const archive = document.querySelector('[data-archive]');
  if (!archive) return;

  const entries = Array.from(archive.querySelectorAll('[data-archive-entry]'));
  const categories = Array.from(archive.querySelectorAll('[data-category][aria-pressed]'));
  const count = archive.querySelector('[data-archive-count]');
  const empty = archive.querySelector('[data-archive-empty]');
  const more = archive.querySelector('[data-archive-more]');
  const progress = archive.querySelector('[data-archive-progress]');
  const load = archive.querySelector('[data-archive-load]');
  const batchSize = 12;
  const articleLabel = n => `${n} article${n === 1 ? '' : 's'}`;
  let limit = batchSize;
  let selectedCategory = '';

  const requestedCategory = new URLSearchParams(window.location.search).get('theme') || '';
  if (categories.some(button => button.dataset.category === requestedCategory)) {
    selectedCategory = requestedCategory;
  }

  function updateAddress() {
    const url = new URL(window.location.href);
    if (selectedCategory) url.searchParams.set('theme', selectedCategory);
    else url.searchParams.delete('theme');
    // Clean up links saved while the experimental search/sort controls existed.
    url.searchParams.delete('q');
    url.searchParams.delete('ordre');
    window.history.replaceState(null, '', url);
  }

  function render() {
    const matches = entries.filter(entry =>
      !selectedCategory || entry.dataset.category === selectedCategory
    );
    const visible = matches.slice(0, limit);
    const visibleSet = new Set(visible);
    entries.forEach(entry => { entry.hidden = !visibleSet.has(entry); });
    categories.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.category === selectedCategory));
    });
    count.textContent = selectedCategory
      ? `${articleLabel(matches.length)} sur ${entries.length}`
      : articleLabel(entries.length);
    empty.hidden = matches.length > 0;
    more.hidden = matches.length <= limit;
    progress.textContent = `${visible.length} sur ${articleLabel(matches.length)}`;
    updateAddress();
    return visible;
  }

  categories.forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    limit = batchSize;
    render();
  }));
  load.addEventListener('click', () => {
    const previousLimit = limit;
    limit += batchSize;
    const visible = render();
    visible[previousLimit]?.querySelector('h2 a')?.focus();
  });

  render();
  archive.querySelectorAll('[data-archive-controls]').forEach(control => { control.hidden = false; });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeArchive, { once: true });
} else {
  initializeArchive();
}
