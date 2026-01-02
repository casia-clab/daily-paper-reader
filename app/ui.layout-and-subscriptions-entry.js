// 全局 UI 行为：布局 + 订阅入口按钮
// 1. API Base：区分本地开发与线上部署
(function() {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.API_BASE_URL = 'http://127.0.0.1:8008';
  } else {
    window.API_BASE_URL = '';
  }
})();

// 1.1 小屏侧边栏显隐：使用自定义类 dpr-sidebar-open，同步 Docsify 的 close 状态
(function () {
  var BREAKPOINT = 768;

  function handleMobileSidebarToggle(e) {
    var btn = e.target.closest && e.target.closest('.sidebar-toggle');
    if (!btn) return;

    var w =
      window.innerWidth || document.documentElement.clientWidth || 0;
    if (w > BREAKPOINT) return; // 只在小屏下同步状态，桌面端完全交给 Docsify

    // 不拦截事件，让 Docsify 自己先切换 body.close，
    // 然后在本轮事件结束后读取最新状态，同步到 dpr-sidebar-open。
    setTimeout(function () {
      var isClosed = document.body.classList.contains('close');
      document.body.classList.toggle('dpr-sidebar-open', !isClosed);
    }, 0);
  }

  function handleResize() {
    var w =
      window.innerWidth || document.documentElement.clientWidth || 0;
    if (w > BREAKPOINT) {
      // 回到大屏时，移除小屏专用类，完全交给 Docsify
      document.body.classList.remove('dpr-sidebar-open');
    }
  }

  function initMobileSidebarControl() {
    document.addEventListener('click', handleMobileSidebarToggle);
    window.addEventListener('resize', handleResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSidebarControl);
  } else {
    initMobileSidebarControl();
  }
})();

// 2. 侧边栏宽度拖拽脚本
(function() {
  function setupSidebarResizer() {
    if (window.innerWidth <= 768) return;
    if (document.getElementById('sidebar-resizer')) return;

    var resizer = document.createElement('div');
    resizer.id = 'sidebar-resizer';
    document.body.appendChild(resizer);

    var dragging = false;

    resizer.addEventListener('mousedown', function (e) {
      dragging = true;
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var styles = getComputedStyle(document.documentElement);
      var min =
        parseInt(styles.getPropertyValue('--sidebar-min-width')) || 180;
      var max =
        parseInt(styles.getPropertyValue('--sidebar-max-width')) || 480;
      var newWidth = e.clientX;
      if (newWidth < min) newWidth = min;
      if (newWidth > max) newWidth = max;
      document.documentElement.style.setProperty(
        '--sidebar-width',
        newWidth + 'px',
      );
    });

    window.addEventListener('mouseup', function () {
      dragging = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebarResizer);
  } else {
    setupSidebarResizer();
  }

  window.addEventListener('resize', function () {
    var resizer = document.getElementById('sidebar-resizer');
    if (window.innerWidth <= 768) {
      if (resizer) resizer.style.display = 'none';
    } else {
      if (resizer) {
        resizer.style.display = 'block';
      } else {
        setupSidebarResizer();
      }
    }
  });
})();

// 3. 自定义订阅管理入口按钮脚本（左下角 📚）
(function() {
  function createCustomButton() {
    if (document.getElementById('custom-toggle-btn')) return;

    var sidebarToggle = document.querySelector('.sidebar-toggle');
    if (!sidebarToggle) {
      setTimeout(createCustomButton, 100);
      return;
    }

    var btn = document.createElement('button');
    btn.id = 'custom-toggle-btn';
    btn.className = 'custom-toggle-btn';
    btn.innerHTML = '⚙️';
    btn.title = '后台管理';

    btn.addEventListener('click', function () {
      var event = new CustomEvent('ensure-arxiv-ui');
      document.dispatchEvent(event);

      setTimeout(function () {
        var loadEvent = new CustomEvent('load-arxiv-subscriptions');
        document.dispatchEvent(loadEvent);

        var overlay = document.getElementById('arxiv-search-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              overlay.classList.add('show');
            });
          });
        }
      }, 100);
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCustomButton);
  } else {
    createCustomButton();
  }
})();
