(function () {
  var t = document.documentElement;
  try {
    var s = localStorage.getItem('theme') || 'dark';
    t.classList.toggle('dark', s === 'dark');
  } catch (_) {
    t.classList.add('dark');
  }
})();
