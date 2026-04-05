document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('note-search-input');
  var container = document.getElementById('search-results');

  if (!input || !container || !window.NOTES_SEARCH_PATH) {
    return;
  }

  var notes = [];

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(text) {
    return (text || '').toLowerCase();
  }

  function preview(content) {
    return (content || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 96);
  }

  function render(items, keyword) {
    if (!keyword) {
      container.innerHTML = '<p class="search-empty">输入关键词后，这里会显示匹配到的笔记。</p>';
      return;
    }

    if (!items.length) {
      container.innerHTML = '<p class="search-empty">没有找到相关笔记，试试标题、标签或正文里的其他词。</p>';
      return;
    }

    container.innerHTML = items.map(function (item) {
      return [
        '<a class="search-result" href="' + item.url + '">',
        '<strong>' + escapeHtml(item.title || item.url) + '</strong>',
        '<span>' + escapeHtml(preview(item.content)) + '</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  fetch(window.NOTES_SEARCH_PATH)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      notes = Array.isArray(data) ? data : [];
      render([], '');
    })
    .catch(function () {
      container.innerHTML = '<p class="search-empty">搜索索引加载失败，但页面仍然可以正常浏览。</p>';
    });

  input.addEventListener('input', function (event) {
    var keyword = normalize(event.target.value.trim());
    if (!keyword) {
      render([], '');
      return;
    }

    var results = notes.filter(function (item) {
      var tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
      var categories = Array.isArray(item.categories) ? item.categories.join(' ') : '';
      var haystack = normalize([item.title, item.content, tags, categories].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 12);

    render(results, keyword);
  });
});
