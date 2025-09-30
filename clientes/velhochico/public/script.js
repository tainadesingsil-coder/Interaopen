// Helpers
function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
function qsa(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

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

// Year
(function(){ var y=qs('#year'); if(y) y.textContent=String(new Date().getFullYear()); })();

// Smooth scroll buttons
qsa('[data-scroll]').forEach(function(btn){ btn.addEventListener('click', function(){ var t = btn.getAttribute('data-scroll'); var el = qs(t); if(!el) return; el.scrollIntoView({behavior:'smooth'}); }); });

// Modal logic
var currentModal = null;
function openModal(id){ var el = qs('#modal-'+id); if(!el) return; el.setAttribute('aria-hidden','false'); currentModal = el; document.body.style.overflow='hidden'; }
function closeModal(){ if(currentModal){ currentModal.setAttribute('aria-hidden','true'); currentModal=null; document.body.style.overflow=''; } }
qsa('[data-modal-open]').forEach(function(btn){ btn.addEventListener('click', function(){ var id = btn.getAttribute('data-modal-open'); if(id==='interest'){ var title = btn.getAttribute('data-interest')||''; var input = qs('#modal-interest input[name="diferencial"]'); if(input) input.value = title; } if(id==='calc'){ // prefill price if parent card defines it
  var card = btn.closest('[data-price]'); if(card){ var price = card.getAttribute('data-price'); var f = qs('#modal-calc form'); if(f){ var v = qs('input[name="valor"]', f); if(v) v.value = price; } }
 }
 openModal(id); }); });
qsa('[data-modal-close]').forEach(function(btn){ btn.addEventListener('click', closeModal); });
qsa('.modal').forEach(function(m){ m.addEventListener('click', function(e){ if(e.target===m) closeModal(); }); });
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });

// Lightbox
(function(){ var overlay = qs('[data-lightbox-overlay]'); var img = qs('.lightbox__image'); if(!overlay||!img) return; qsa('[data-lightbox]').forEach(function(el){ el.addEventListener('click', function(){ img.src = el.getAttribute('src'); overlay.setAttribute('aria-hidden','false'); }); }); qs('[data-lightbox-close]').addEventListener('click', function(){ overlay.setAttribute('aria-hidden','true'); img.src=''; }); overlay.addEventListener('click', function(e){ if(e.target===overlay) { overlay.setAttribute('aria-hidden','true'); img.src=''; } }); document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ overlay.setAttribute('aria-hidden','true'); img.src=''; } }); })();

// Forms (demo only)
qsa('form[data-form]').forEach(function(form){ form.addEventListener('submit', function(e){ e.preventDefault(); var fd = new FormData(form); var payload = {}; fd.forEach(function(v,k){ payload[k]=v; }); console.log('Form submit', form.getAttribute('data-form'), payload); alert('Recebemos seus dados. Entraremos em contato!'); closeModal(); }); });

// Calculator
(function(){ var f = qs('form[data-form="calc"]'); if(!f) return; f.addEventListener('submit', function(e){ e.preventDefault(); var valor = parseFloat(qs('input[name="valor"]', f).value||'0'); var entrada = parseFloat(qs('input[name="entrada"]', f).value||'0'); var taxaAnual = parseFloat(qs('input[name="taxa"]', f).value||'0'); var anos = parseFloat(qs('input[name="prazo"]', f).value||'1'); var pv = Math.max(valor-entrada,0); var i = (taxaAnual/100)/12; var n = Math.max(Math.round(anos*12),1); var parcela = i>0 ? (pv * (i*Math.pow(1+i,n)) / (Math.pow(1+i,n)-1)) : (pv/n); var r = qs('.calc__result', qs('#modal-calc')); if(r) r.textContent = 'Parcela estimada: R$ ' + parcela.toFixed(2).replace('.',','); }); })();