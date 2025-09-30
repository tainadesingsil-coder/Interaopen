// Disable reveal animations: show all
const revealEls = Array.from(document.querySelectorAll('.reveal'));
revealEls.forEach(el=>el.classList.add('is-visible'));

// No parallax/scroll transforms
const boat = document.querySelector('.hero-boat');
const heroImage = document.querySelector('.hero-image');
const heroSection = document.getElementById('hero');

// Set hero from explicit image URL (data-hero-image)
function setHeroFromImage(){
  if(!heroSection || !heroImage) return;
  const imageUrl = heroSection.getAttribute('data-hero-image');
  if(!imageUrl) return;
  heroImage.style.backgroundImage = `url('${imageUrl}')`;
  heroImage.style.opacity = 0.65;
  heroImage.style.backgroundPosition = 'center';
  heroImage.style.backgroundSize = 'contain';
  heroImage.style.backgroundRepeat = 'no-repeat';
}
setHeroFromImage();
// No 3D tilt listeners

// Mobile carousel drag (simple)
const track = document.querySelector('.carousel-track');
if(track){
  let isDown = false; let startX = 0; let scrollLeft = 0;
  track.addEventListener('mousedown', (e)=>{isDown=true;startX=e.pageX-track.offsetLeft;scrollLeft=track.scrollLeft});
  track.addEventListener('mouseleave', ()=>{isDown=false});
  track.addEventListener('mouseup', ()=>{isDown=false});
  track.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX-track.offsetLeft; const walk=(x-startX)*1.2; track.scrollLeft=scrollLeft-walk;});
  // Touch
  track.addEventListener('touchstart', (e)=>{isDown=true;startX=e.touches[0].pageX-track.offsetLeft;scrollLeft=track.scrollLeft},{passive:true});
  track.addEventListener('touchend', ()=>{isDown=false});
  track.addEventListener('touchmove', (e)=>{ if(!isDown) return; const x=e.touches[0].pageX-track.offsetLeft; const walk=(x-startX)*1.2; track.scrollLeft=scrollLeft-walk;},{passive:true});
}

// Form handling
const form = document.getElementById('lead-form');
if(form){
  const toast = form.querySelector('.form-toast');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    // rudimentary validation
    const name = String(fd.get('name')||'').trim();
    const email = String(fd.get('email')||'').trim();
    const phone = String(fd.get('phone')||'').trim();
    const visit = String(fd.get('visit')||'').trim();
    if(!name || !email || !phone || !visit){
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }
    // Simulate async submission
    await new Promise(r=>setTimeout(r, 600));
    if(toast){ toast.hidden = false; toast.style.opacity = 0; requestAnimationFrame(()=>{ toast.style.transition = 'opacity .4s ease'; toast.style.opacity = 1; }); }
    form.reset();
  });
}

// Footer year
const yEl = document.getElementById('year');
if(yEl){ yEl.textContent = String(new Date().getFullYear()); }

