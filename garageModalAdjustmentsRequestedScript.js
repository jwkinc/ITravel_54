
(function(){
  function ensureFromLocationButton(){
    if(typeof startFromMyLocation !== 'function') return;
    const actions = document.querySelector('.route-hud .rh-actions.glass-actions, .route-hud .rh-actions');
    if(!actions) return;

    const existing = actions.querySelector('#rhStartCurrent, .rh-start-current');
    if(existing) {
      existing.textContent = 'My location';
      return;
    }

    const btn = document.createElement('button');
    btn.id = 'rhStartCurrent';
    btn.className = 'tinybtn primary rh-start-current';
    btn.type = 'button';
    btn.textContent = 'My location';
    btn.title = 'Start route from your current location';
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      startFromMyLocation();
    });
    actions.insertBefore(btn, actions.firstElementChild);
  }

  function tightenGarageChoices(){
    const overlay = document.getElementById('garageModalOverlay');
    if(!overlay) return;
    const strip = overlay.querySelector('.garage-modal-strip');
    if(strip) strip.style.justifyContent = window.innerWidth <= 760 ? 'flex-start' : 'center';
  }

  function run(){
    ensureFromLocationButton();
    tightenGarageChoices();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  [100, 350, 900, 1800, 3200, 6000].forEach(ms => setTimeout(run, ms));
  document.addEventListener('click', function(){ setTimeout(run, 80); setTimeout(run, 350); }, false);
})();
