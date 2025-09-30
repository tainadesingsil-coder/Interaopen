// Intersection Observer for reveal
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const io = new IntersectionObserver((entries)=>{
  for(const entry of entries){
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  }
},{threshold:.16, rootMargin:'0px 0px -40px 0px'});
revealEls.forEach(el=>io.observe(el));

// Parallax for hero boat and background
const boat = document.querySelector('.hero-boat');
const heroImage = document.querySelector('.hero-image');
const heroSection = document.getElementById('hero');
let lastY = 0;
function onScroll(){
  const y = window.scrollY || window.pageYOffset;
  // Apply slight parallax when within hero
  if(boat){
    const dy = Math.min(60, y * 0.15);
    boat.style.transform = `translateY(${dy}px)`;
  }
  if(heroImage){
    const posY = Math.min(40, y * 0.05);
    heroImage.style.backgroundPosition = `center ${posY}px`;
    heroImage.style.backgroundSize = 'cover';
    heroImage.style.backgroundRepeat = 'no-repeat';
  }
  lastY = y;
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Imgur oEmbed: extract first image as hero background
async function setHeroFromImgur(){
  if(!heroSection) return;
  const albumUrl = heroSection.getAttribute('data-imgur');
  if(!albumUrl) return;
  try{
    const oembedUrl = `https://api.imgur.com/oembed.json?url=${encodeURIComponent(albumUrl)}`;
    const res = await fetch(oembedUrl, {headers:{'Accept':'application/json'}});
    if(!res.ok) return;
    const data = await res.json();
    let imageUrl = '';
    if(typeof data?.thumbnail_url === 'string') imageUrl = data.thumbnail_url.replace(/(h|l)\.jpg$/,'h.jpg');
    if(!imageUrl && typeof data?.url === 'string') imageUrl = data.url;
    if(imageUrl && heroImage){
      heroImage.style.backgroundImage = `url('${imageUrl}')`;
      heroImage.style.opacity = 0.6;
    }
  }catch(err){
    // silent fail
  }
}
setHeroFromImgur();

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

