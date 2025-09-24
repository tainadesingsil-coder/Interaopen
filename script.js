// Configuração e interações básicas da landing page
(function () {
  const app = document.getElementById('app');
  if (!app) return;

  const driveUrl = app.getAttribute('data-drive-url') || '#';
  const contactEmail = app.getAttribute('data-contact-email') || '';
  const whatsapp = app.getAttribute('data-whatsapp') || '';

  // Atribui CTAs ao Drive
  document.querySelectorAll('[data-drive-cta]').forEach((el) => {
    el.setAttribute('href', driveUrl);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  // Footer contatos
  const footerEmail = document.getElementById('footer-email');
  if (footerEmail) {
    footerEmail.setAttribute('href', contactEmail ? `mailto:${contactEmail}` : '#');
  }
  const footerWhatsapp = document.getElementById('footer-whatsapp');
  if (footerWhatsapp) {
    const waLink = whatsapp ? `https://wa.me/${whatsapp}` : '#';
    footerWhatsapp.setAttribute('href', waLink);
  }

  // Animação de revelação ao rolar
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Formulário: compõe e abre mailto com os dados
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const nome = formData.get('nome') || '';
      const email = formData.get('email') || '';
      const telefone = formData.get('telefone') || '';
      const imobiliaria = formData.get('imobiliaria') || '';

      const subject = encodeURIComponent('Quero ser parceiro — Portal do Velho Chico');
      const body = encodeURIComponent(
        `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nImobiliária: ${imobiliaria}`
      );

      if (!contactEmail) {
        if (feedback) {
          feedback.textContent = 'Configurar e-mail de contato para envio.';
        }
        return;
      }

      const mailto = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailto;

      if (feedback) {
        feedback.textContent = 'Abrindo seu aplicativo de e-mail…';
      }
      form.reset();
    });
  }
})();

