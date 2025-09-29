// Scroll reveal animation using IntersectionObserver
(function() {
  if (typeof window === 'undefined') return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    var nodes = document.querySelectorAll('.reveal');
    nodes.forEach(function(n) { n.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
})();

// Current year in footer
(function() {
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();