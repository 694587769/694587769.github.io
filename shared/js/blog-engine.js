// ================================================================
// 博客引擎 - 数据驱动的内容列表 + 分页系统
// 读取 /manifest.json 自动渲染首页、文章、学习资料、题库、归档
// ================================================================
(function() {
  const MANIFEST_URL = '/manifest.json';
  let manifest = null;
  let allItems = [];
  let currentPage = 1;
  let pageSize = 10;
  let filterType = 'all'; // 'all' | 'articles' | 'study' | 'quiz'
  let sortBy = 'date';
  let sortOrder = 'desc';

  // ===== 加载 Manifest =====
  async function loadManifest() {
    try {
      const resp = await fetch(MANIFEST_URL);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      manifest = await resp.json();
      buildAllItems();
      return true;
    } catch (e) {
      console.error('加载 manifest.json 失败:', e);
      return false;
    }
  }

  function buildAllItems() {
    allItems = [];
    if (manifest.articles) {
      manifest.articles.forEach(function(item) {
        allItems.push(Object.assign({}, item, { category: 'articles', typeLabel: '文章', typeClass: 'post' }));
      });
    }
    if (manifest.study) {
      manifest.study.forEach(function(item) {
        allItems.push(Object.assign({}, item, { category: 'study', typeLabel: '学习资料', typeClass: 'study' }));
      });
    }
    if (manifest.quiz) {
      manifest.quiz.forEach(function(item) {
        allItems.push(Object.assign({}, item, { category: 'quiz', typeLabel: '题库', typeClass: 'quiz' }));
      });
    }
  }

  // ===== 排序 =====
  function sortItems(items) {
    return items.sort(function(a, b) {
      let va, vb;
      if (sortBy === 'date') {
        va = a.date || '0';
        vb = b.date || '0';
      } else if (sortBy === 'title') {
        va = (a.title || '').toLowerCase();
        vb = (b.title || '').toLowerCase();
      } else if (sortBy === 'size') {
        va = parseFloat(a.size) || 0;
        vb = parseFloat(b.size) || 0;
      } else if (sortBy === 'type') {
        va = a.typeLabel || '';
        vb = b.typeLabel || '';
      }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ===== 过滤 =====
  function getFilteredItems() {
    let items = allItems.slice();
    if (filterType !== 'all') {
      items = items.filter(function(item) { return item.category === filterType; });
    }
    return sortItems(items);
  }

  // ===== 渲染卡片 =====
  function renderCard(item) {
    var target = (item.url.indexOf('http') === 0) ? ' target="_blank" rel="noopener"' : '';
    var url = item.url;
    if (url.indexOf('http') !== 0 && url.indexOf('/') !== 0) url = '/' + url;

    var tagClass = '';
    if (item.typeClass === 'post') tagClass = 'mixed-tag-post';
    else if (item.typeClass === 'study') tagClass = 'mixed-tag-study';
    else if (item.typeClass === 'quiz') tagClass = 'mixed-tag-quiz';

    var metaExtra = '';
    if (item.count) metaExtra = ' · ' + item.count + '题';
    if (item.size) metaExtra = ' · ' + item.size;

    return '<a class="mixed-card" href="' + url + '" data-date="' + item.date + '" data-type="' + item.typeLabel + '" data-size="' + (parseFloat(item.size) || 10) + '"' + target + '>' +
      '<div class="mixed-card-header">' +
        '<span class="mixed-card-tag ' + tagClass + '">' + item.typeLabel + '</span>' +
      '</div>' +
      '<div class="mixed-card-title">' + item.title + '</div>' +
      '<div class="mixed-card-excerpt">' + (item.excerpt || '') + '</div>' +
      '<div class="mixed-card-meta">' + item.date + metaExtra + '</div>' +
    '</a>';
  }

  // ===== 渲染资源卡片（学习资料/题库页用） =====
  function renderResourceCard(item) {
    var target = (item.url.indexOf('http') === 0) ? ' target="_blank" rel="noopener"' : '';
    var url = item.url;
    if (url.indexOf('http') !== 0 && url.indexOf('/') !== 0) url = '/' + url;

    var desc = item.excerpt || '';
    if (item.count) desc = item.title + '，含' + item.count + '道题';

    return '<a class="resource-card" href="' + url + '"' + target + '>' +
      '<div class="resource-card-title">' + item.title + '</div>' +
      '<div class="resource-card-desc">' + desc + '</div>' +
      '<div class="resource-card-date">' + item.date + '</div>' +
    '</a>';
  }

  // ===== 渲染文章行（文章列表页用） =====
  function renderArticleRow(item) {
    var url = item.url;
    if (url.indexOf('http') !== 0 && url.indexOf('/') !== 0) url = '/' + url;

    return '<div class="article-row" data-name="' + item.title + '" data-date="' + (new Date(item.date).getTime() || 0) + '" data-url="' + url + '">' +
      '<div class="article-row-main">' +
        '<a class="article-row-title" href="' + url + '">' + item.title + '</a>' +
        '<div class="article-row-excerpt">' + (item.excerpt || '') + '</div>' +
      '</div>' +
      '<span class="article-row-date">' + item.date + '</span>' +
      '<span class="article-row-views" data-uri="' + url + '">' +
        '<i class="fa fa-eye"></i> <span class="views-value">—</span>' +
      '</span>' +
    '</div>';
  }

  // ===== 渲染分页控件 =====
  function renderPagination(container, totalItems, renderFn) {
    var totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    var html = '<div class="blog-pagination">';
    html += '<div class="pagination-left">';
    html += '<select class="page-size-select" id="pageSizeSelect">';
    [10, 15, 20].forEach(function(n) {
      html += '<option value="' + n + '"' + (pageSize === n ? ' selected' : '') + '>每页 ' + n + ' 条</option>';
    });
    html += '</select>';
    html += '<span class="pagination-info">共 ' + totalItems + ' 条，' + totalPages + ' 页</span>';
    html += '</div>';

    html += '<div class="pagination-center">';
    html += '<button class="page-btn page-first" ' + (currentPage === 1 ? 'disabled' : '') + ' title="首页">«</button>';
    html += '<button class="page-btn page-prev" ' + (currentPage === 1 ? 'disabled' : '') + ' title="上一页">‹</button>';

    // 页码按钮
    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (var i = startPage; i <= endPage; i++) {
      html += '<button class="page-btn page-num' + (i === currentPage ? ' active' : '') + '">' + i + '</button>';
    }

    html += '<button class="page-btn page-next" ' + (currentPage === totalPages ? 'disabled' : '') + ' title="下一页">›</button>';
    html += '<button class="page-btn page-last" ' + (currentPage === totalPages ? 'disabled' : '') + ' title="末页">»</button>';
    html += '</div>';

    html += '<div class="pagination-right">';
    html += '<span class="page-jump-label">跳至</span>';
    html += '<input type="number" class="page-jump-input" id="pageJumpInput" min="1" max="' + totalPages + '" value="' + currentPage + '">';
    html += '<span class="page-jump-label">页</span>';
    html += '<button class="page-btn page-go" id="pageGoBtn">GO</button>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // 绑定事件
    bindPaginationEvents(container, totalItems, totalPages, renderFn);
  }

  function bindPaginationEvents(container, totalItems, totalPages, renderFn) {
    // 每页条数
    var sizeSelect = container.querySelector('#pageSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        refreshList(renderFn);
      });
    }

    // 页码按钮
    container.querySelectorAll('.page-num').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentPage = parseInt(this.textContent);
        refreshList(renderFn);
      });
    });

    // 首页
    var firstBtn = container.querySelector('.page-first');
    if (firstBtn) firstBtn.addEventListener('click', function() {
      if (currentPage > 1) { currentPage = 1; refreshList(renderFn); }
    });

    // 上一页
    var prevBtn = container.querySelector('.page-prev');
    if (prevBtn) prevBtn.addEventListener('click', function() {
      if (currentPage > 1) { currentPage--; refreshList(renderFn); }
    });

    // 下一页
    var nextBtn = container.querySelector('.page-next');
    if (nextBtn) nextBtn.addEventListener('click', function() {
      if (currentPage < totalPages) { currentPage++; refreshList(renderFn); }
    });

    // 末页
    var lastBtn = container.querySelector('.page-last');
    if (lastBtn) lastBtn.addEventListener('click', function() {
      if (currentPage < totalPages) { currentPage = totalPages; refreshList(renderFn); }
    });

    // 跳转
    var goBtn = container.querySelector('#pageGoBtn');
    var jumpInput = container.querySelector('#pageJumpInput');
    if (goBtn && jumpInput) {
      goBtn.addEventListener('click', function() {
        var p = parseInt(jumpInput.value);
        if (p >= 1 && p <= totalPages) {
          currentPage = p;
          refreshList(renderFn);
        }
      });
      jumpInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var p = parseInt(jumpInput.value);
          if (p >= 1 && p <= totalPages) {
            currentPage = p;
            refreshList(renderFn);
          }
        }
      });
    }
  }

  function refreshList(renderFn) {
    var items = getFilteredItems();
    var listEl = document.getElementById('mixedList') || document.getElementById('resourceList') || document.getElementById('articleList');
    var paginationEl = document.getElementById('paginationContainer');

    var start = (currentPage - 1) * pageSize;
    var pageItems = items.slice(start, start + pageSize);

    if (listEl) {
      listEl.innerHTML = pageItems.map(renderFn).join('');
    }
    if (paginationEl) {
      renderPagination(paginationEl, items.length, renderFn);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== 排序栏 =====
  function renderSortBar() {
    return '<div class="sort-bar">' +
      '<button class="sort-btn' + (sortBy === 'date' ? ' active' : '') + '" data-sort="date">' +
        '<i class="fa fa-calendar"></i> 时间' +
      '</button>' +
      '<button class="sort-btn' + (sortBy === 'type' ? ' active' : '') + '" data-sort="type">' +
        '<i class="fa fa-tag"></i> 类型' +
      '</button>' +
      '<button class="sort-btn' + (sortBy === 'title' ? ' active' : '') + '" data-sort="title">' +
        '<i class="fa fa-font"></i> 名称' +
      '</button>' +
    '</div>';
  }

  function bindSortBar(renderFn) {
    document.querySelectorAll('.sort-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var s = this.dataset.sort;
        if (sortBy === s) {
          sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          sortBy = s;
          sortOrder = s === 'title' ? 'asc' : 'desc';
        }
        document.querySelectorAll('.sort-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentPage = 1;
        refreshList(renderFn);
      });
    });
  }

  // ===== 公共初始化 =====
  async function initBlogEngine(options) {
    var loaded = await loadManifest();
    if (!loaded) return;

    filterType = options.filterType || 'all';
    sortBy = options.sortBy || 'date';
    sortOrder = options.sortOrder || 'desc';
    pageSize = options.pageSize || 10;
    currentPage = options.currentPage || 1;

    var items = getFilteredItems();
    var listEl = document.getElementById('mixedList') || document.getElementById('resourceList') || document.getElementById('articleList');
    var paginationEl = document.getElementById('paginationContainer');
    var sortBarEl = document.getElementById('sortBarContainer');

    if (!listEl) return;

    // 渲染排序栏
    if (sortBarEl && options.showSortBar !== false) {
      sortBarEl.innerHTML = renderSortBar();
      bindSortBar(options.renderCard || renderCard);
    }

    // 渲染列表
    var renderFn = options.renderCard || renderCard;
    var start = (currentPage - 1) * pageSize;
    var pageItems = items.slice(start, start + pageSize);
    listEl.innerHTML = pageItems.map(renderFn).join('');

    // 渲染分页
    if (paginationEl) {
      renderPagination(paginationEl, items.length, renderFn);
    }

    // 更新统计
    if (options.onStatsReady && manifest.stats) {
      options.onStatsReady(manifest.stats);
    }

    // 自动更新页脚字数统计
    if (manifest.stats && manifest.stats.totalWordCount) {
      var wc = manifest.stats.totalWordCount;
      var wcEl = document.getElementById('siteWordCount');
      if (wcEl) {
        if (wc >= 10000) {
          wcEl.textContent = (wc / 10000).toFixed(1) + '万';
        } else if (wc >= 1000) {
          wcEl.textContent = (wc / 1000).toFixed(0) + 'k';
        } else {
          wcEl.textContent = wc;
        }
      }
      var rtEl = document.getElementById('siteReadTime');
      if (rtEl && manifest.stats.totalReadMinutes) {
        var mins = manifest.stats.totalReadMinutes;
        if (mins >= 60) {
          rtEl.textContent = (mins / 60).toFixed(1) + ' 小时';
        } else {
          rtEl.textContent = mins + ' 分钟';
        }
      }
    }

    // 暴露API
    window.BlogEngine = {
      manifest: manifest,
      allItems: allItems,
      getFilteredItems: getFilteredItems,
      refresh: function() { refreshList(renderFn); },
      setFilter: function(type) { filterType = type; currentPage = 1; refreshList(renderFn); },
      currentPage: currentPage,
      pageSize: pageSize
    };
  }

  window.initBlogEngine = initBlogEngine;

  // ================================================================
  // 自初始化安全网
  // 如果 HTML 页面内联脚本因任何原因未能调用 initBlogEngine，
  // 这里自动检测页面类型并兜底初始化，防止内容空白。
  // ================================================================
  (function autoInit() {
    var MAX_RETRIES = 10;
    var RETRY_DELAY = 200;
    var retries = 0;
    var started = false;

    function tryInit() {
      if (started) return;

      // 如果页面内联脚本已成功启动，跳过
      if (window._blogEngineStarted) {
        started = true;
        return;
      }

      // 检查目标容器是否就绪
      var listEl = document.getElementById('mixedList') || document.getElementById('resourceList') || document.getElementById('articleList');
      if (!listEl) {
        retries++;
        if (retries < MAX_RETRIES) {
          setTimeout(tryInit, RETRY_DELAY);
        }
        return;
      }

      // 容器已就绪但内容为空，触发自动初始化
      started = true;
      window._blogEngineStarted = true;

      var path = window.location.pathname;
      var opts = {
        sortBy: 'date',
        sortOrder: 'desc'
      };

      if (path.indexOf('/articles/') === 0 || path.indexOf('/articles') === 0 || document.getElementById('articleList')) {
        opts.filterType = 'articles';
        opts.pageSize = 5;
        opts.showSortBar = false;
        opts.renderCard = renderArticleRow;
      } else if (path.indexOf('/study/') === 0 || path.indexOf('/study') === 0) {
        opts.filterType = 'study';
        opts.pageSize = 5;
        opts.renderCard = renderResourceCard;
      } else if (path.indexOf('/quiz/') === 0 || path.indexOf('/quiz') === 0) {
        opts.filterType = 'quiz';
        opts.pageSize = 5;
        opts.renderCard = renderResourceCard;
      } else {
        // 首页
        opts.filterType = 'all';
        opts.pageSize = 10;
        opts.showSortBar = true;
        opts.renderCard = renderCard;
      }

      console.log('[BlogEngine] 自初始化安全网触发，页面类型:', opts.filterType);
      initBlogEngine(opts);
    }

    // 策略1: DOMContentLoaded 后 100ms 尝试
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(tryInit, 100);
      });
    } else {
      // DOM 已就绪，立即尝试
      setTimeout(tryInit, 50);
    }

    // 策略2: 多级延迟兜底，确保即使上述事件丢失也能初始化
    setTimeout(tryInit, 500);
    setTimeout(tryInit, 1500);
    setTimeout(tryInit, 3000);
  })();
})();