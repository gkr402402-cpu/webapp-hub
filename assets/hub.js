(function () {
  "use strict";

  var STATUS = {
    all: "전체",
    live: "사용 가능",
    beta: "시험 중",
    planned: "준비 중"
  };

  var apps = Array.isArray(window.HUB_APPS) ? window.HUB_APPS : [];
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var q = document.getElementById("q");
  var filters = document.getElementById("filters");
  var current = "all";

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // 같은 사이트 안의 상대 경로만 링크로 허용합니다.
  function safePath(path) {
    if (typeof path !== "string" || !path) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.indexOf("//") === 0) return "";
    return path;
  }

  function card(app) {
    var href = app.status === "planned" ? "" : safePath(app.path);
    var root = el(href ? "a" : "div", "card" + (href ? "" : " is-disabled"));
    if (href) root.href = href;
    root.style.setProperty("--accent", /^#[0-9a-f]{6}$/i.test(app.color) ? app.color : "#3d405b");

    var top = el("div", "card-top");
    top.appendChild(el("span", "emoji", app.emoji || "📦"));
    top.appendChild(el("span", "badge badge-" + app.status, STATUS[app.status] || app.status));
    root.appendChild(top);

    root.appendChild(el("h2", "card-title", app.name));
    root.appendChild(el("p", "card-desc", app.description));

    var tags = el("ul", "tags");
    (app.tags || []).forEach(function (t) { tags.appendChild(el("li", null, t)); });
    root.appendChild(tags);

    root.appendChild(el("span", "card-cta", href ? "열기 →" : "곧 만나요"));
    return root;
  }

  function render() {
    var term = q.value.trim().toLowerCase();
    var list = apps.filter(function (a) {
      if (current !== "all" && a.status !== current) return false;
      if (!term) return true;
      return [a.name, a.description].concat(a.tags || []).join(" ").toLowerCase().indexOf(term) !== -1;
    });
    grid.replaceChildren.apply(grid, list.map(card));
    empty.hidden = list.length !== 0;
  }

  Object.keys(STATUS).forEach(function (key) {
    var b = el("button", "chip", STATUS[key]);
    b.type = "button";
    b.setAttribute("aria-pressed", String(key === current));
    b.addEventListener("click", function () {
      current = key;
      Array.prototype.forEach.call(filters.children, function (c) { c.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      render();
    });
    filters.appendChild(b);
  });

  q.addEventListener("input", render);
  render();
})();
