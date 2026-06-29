
(function(){
  function photosContext(){
    return {
      storeId: (typeof selectedId !== 'undefined' ? selectedId : null),
      until: Date.now() + 120000
    };
  }

  function rememberPhotosContext(){
    window.__photoPreviewReturnContext = photosContext();
  }

  function restorePhotosPage(){
    const ctx = window.__photoPreviewReturnContext || photosContext();
    const storeId = ctx && ctx.storeId ? ctx.storeId : (typeof selectedId !== 'undefined' ? selectedId : null);
    if(!storeId) return;

    setTimeout(function(){
      try{
        const l = (typeof loc === 'function') ? loc(storeId) : null;
        if(!l) return;

        selectedId = l.id;

        if(typeof renderSheetHead === 'function') renderSheetHead(l);
        if(typeof renderInfoTab === 'function') renderInfoTab(l);
        if(typeof renderActionsTab === 'function') renderActionsTab(l);
        if(typeof renderNotesTab === 'function') renderNotesTab(l);
        if(typeof renderPhotosTab === 'function') renderPhotosTab(l);
        if(typeof renderNearbyTab === 'function') renderNearbyTab(l);
        if(typeof renderTravelTab === 'function') renderTravelTab(l);
        if(typeof openSheet === 'function') openSheet();

        if(typeof switchTab === 'function') {
          switchTab('photos');
        } else {
          document.querySelectorAll('#sheet .stab').forEach(b => b.classList.toggle('on', b.dataset.tab === 'photos'));
          document.querySelectorAll('#sheet .tab-pane').forEach(p => p.classList.remove('active'));
          const pane = document.getElementById('tabPhotos');
          if(pane) pane.classList.add('active');
        }

        const sheet = document.getElementById('sheet');
        if(sheet) sheet.classList.add('open');
      }catch(e){}
    }, 35);
  }

  // Record the store before the older click handler opens the preview and stops propagation.
  ['pointerdown','mousedown','touchstart'].forEach(type => {
    document.addEventListener(type, function(e){
      const photo = e.target && e.target.closest && e.target.closest('#tabPhotos [data-photo-open], #tabPhotos .photo-thumb');
      if(photo) rememberPhotosContext();
    }, true);
  });

  function watchLightbox(){
    const box = document.getElementById('photoLightbox');
    if(!box || box.__returnToPhotosWatched) return;
    box.__returnToPhotosWatched = true;
    let wasOpen = box.classList.contains('open');
    const obs = new MutationObserver(function(){
      const isOpen = box.classList.contains('open');
      if(wasOpen && !isOpen) restorePhotosPage();
      wasOpen = isOpen;
    });
    obs.observe(box, {attributes:true, attributeFilter:['class']});
    box.addEventListener('click', function(){
      setTimeout(function(){
        if(!box.classList.contains('open')) restorePhotosPage();
      }, 25);
    }, true);
  }

  // Support older genModal preview path too.
  function watchGenModal(){
    const modal = document.getElementById('genModal');
    if(!modal || modal.__returnToPhotosWatched) return;
    modal.__returnToPhotosWatched = true;
    let wasOpen = modal.classList.contains('open');
    const looksLikePhoto = function(){
      const inner = document.getElementById('genInner');
      return !!(inner && inner.querySelector && inner.querySelector('.photo-preview-large, img'));
    };
    const obs = new MutationObserver(function(){
      const isOpen = modal.classList.contains('open');
      if(wasOpen && !isOpen && looksLikePhoto()) restorePhotosPage();
      wasOpen = isOpen;
    });
    obs.observe(modal, {attributes:true, attributeFilter:['class']});

    modal.addEventListener('click', function(e){
      if(e.target === modal || (e.target.closest && e.target.closest('[data-close]'))){
        setTimeout(function(){
          if(!modal.classList.contains('open')) restorePhotosPage();
        }, 35);
      }
    }, true);
  }

  function init(){
    watchLightbox();
    watchGenModal();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  [100, 400, 1000, 2000].forEach(ms => setTimeout(init, ms));
  document.addEventListener('click', function(){ setTimeout(init, 50); }, true);
})();
