
(function(){
  const CURRENT_ID = '__current_location_start__';
  const ACTIVE_COLOR = '#B5121B';
  const PREVIEW_COLOR = '#0E6F46';

  function safe(value){
    if(typeof esc === 'function') return esc(value == null ? '' : value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }
  function q(sel){ return document.querySelector(sel); }
  function storeById(id){ try { return id && typeof loc === 'function' ? loc(id) : null; } catch(e){ return null; } }
  function pointsFromIds(ids){ return (ids || []).map(id => storeById(id)).filter(Boolean); }

  function currentLocationPoint(){
    try{
      if(typeof userPos !== 'undefined' && userPos){
        if(Array.isArray(userPos)) return {id:CURRENT_ID,name:'From Location',lat:+userPos[0],lng:+userPos[1],current:true};
        if(Number.isFinite(+userPos.lat) && Number.isFinite(+userPos.lng)) return {id:CURRENT_ID,name:'From Location',lat:+userPos.lat,lng:+userPos.lng,current:true};
        if(Number.isFinite(+userPos.latitude) && Number.isFinite(+userPos.longitude)) return {id:CURRENT_ID,name:'From Location',lat:+userPos.latitude,lng:+userPos.longitude,current:true};
      }
    }catch(e){}
    return null;
  }

  function ensureCurrentStop(){
    const cur = currentLocationPoint();
    if(!cur) return null;
    try{
      if(typeof ROUTE_EXTRA_STOPS === 'undefined' || !ROUTE_EXTRA_STOPS) window.ROUTE_EXTRA_STOPS = {};
      ROUTE_EXTRA_STOPS[CURRENT_ID] = cur;
    }catch(e){
      window.ROUTE_EXTRA_STOPS = {[CURRENT_ID]:cur};
    }
    return cur;
  }

  function hasActiveRoute(){
    try { return !!(tripRoute && Array.isArray(tripRoute.pts) && tripRoute.pts.length >= 2); }
    catch(e){ return false; }
  }

  function activePts(){
    try{
      if(tripRoute && Array.isArray(tripRoute.pts) && tripRoute.pts.length) return tripRoute.pts;
      if(Array.isArray(tripSel) && tripSel.length) return pointsFromIds(tripSel);
    }catch(e){}
    return [];
  }

  function timeLabel(sec){
    const mins = Math.max(1, Math.round((Number(sec) || 0) / 60));
    if(mins < 60) return mins + ' min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h + '.' + String(m).padStart(2, '0') + ' hr';
  }

  function milesText(m){
    return typeof miles === 'function' ? miles(m) : Math.round((Number(m) || 0) / 1609.344) + ' mi';
  }

  function navUrl(pts){
    const list = pts && pts.length ? pts : activePts();
    return list && list.length ? 'https://www.google.com/maps/dir/' + list.map(p => encodeURIComponent(`${p.lat},${p.lng}`)).join('/') : '#';
  }

  function legDuration(i, pts, route){
    const leg = route && Array.isArray(route.legs) ? route.legs[i] : null;
    if(leg && Number.isFinite(Number(leg.duration)) && Number(leg.duration) > 0) return Number(leg.duration);

    const totalDur = Number(route && route.duration) || 0;
    if(totalDur > 0 && pts && pts.length > 1){
      const legsCount = Math.max(1, pts.length - 1);
      return totalDur / legsCount;
    }
    return 0;
  }

  function stopChipsWithTimes(pts, route){
    let out = '';
    (pts || []).forEach((p, i) => {
      if(i > 0) out += `<span class="rh-seg">${safe(timeLabel(legDuration(i - 1, pts, route)))}</span>`;
      out += `<span class="rh-stop">${i + 1}. ${safe(p.name || 'Stop')}</span>`;
    });
    return out;
  }

  async function routeBetween(pts){
    if(typeof osrmRoute === 'function') return osrmRoute(pts);
    if(typeof routeForPoints === 'function') return routeForPoints(pts);
    throw new Error('Routing unavailable');
  }

  function clearGreenPreview(){
    try{
      if(typeof singleRouteLayer !== 'undefined' && singleRouteLayer && typeof map !== 'undefined' && map){
        map.removeLayer(singleRouteLayer);
        singleRouteLayer = null;
      }
      selectedPreviewRoute = null;
    }catch(e){}
  }
  window.clearSingleRoutePreview = clearSingleRoutePreview = clearGreenPreview;

  function keepActiveRouteRed(){
    try{
      if(typeof routeLayer !== 'undefined' && routeLayer && routeLayer.setStyle){
        routeLayer.setStyle({color:ACTIVE_COLOR, weight:6, opacity:.84, dashArray:null, lineCap:'round', lineJoin:'round'});
      }
      if(routeLayer && routeLayer.bringToFront) routeLayer.bringToFront();
      if(typeof tripStopLayer !== 'undefined' && tripStopLayer && tripStopLayer.eachLayer){
        tripStopLayer.eachLayer(m => m.setZIndexOffset && m.setZIndexOffset(950));
      }
    }catch(e){}
  }

  function routeSummary(route){
    if(typeof tripSummary === 'function' && route === tripRoute){
      try { return tripSummary(); } catch(e){}
    }
    const dist = Number.isFinite(Number(route && route.distance)) ? milesText(route.distance) : '';
    const dur = Number.isFinite(Number(route && route.duration)) ? timeLabel(route.duration) : '';
    return [dist, dur].filter(Boolean).join(' · ');
  }

  window.showRouteHud = showRouteHud = function(){
    const hud = q('#routeHud');
    if(!hud || !hasActiveRoute()) return;
    const pts = activePts();
    hud.innerHTML = `<div class="rh-top"><div class="rh-title">Route visible on map<div class="rh-meta">${safe(routeSummary(tripRoute))} · ${pts.length} stops</div></div><button class="tinybtn" id="rhHide" title="Hide card">Hide</button></div>
      <div class="rh-stops">${stopChipsWithTimes(pts, tripRoute)}</div>
      <div class="rh-actions active-route-actions"><a class="tinybtn primary" id="rhNavigate" href="${navUrl(pts)}" target="_blank" rel="noopener">Navigate</a><button class="tinybtn danger" id="rhClear">Clear route</button></div>`;
    hud.hidden = false;
    const hide = q('#rhHide'); if(hide) hide.onclick = () => { hud.hidden = true; };
    const clear = q('#rhClear'); if(clear) clear.onclick = () => { if(typeof resetRouteState === 'function') resetRouteState('Route cleared'); };
    keepActiveRouteRed();
  };

  function renderInitialPreview(l, rt, message){
    const hud = q('#routeHud');
    if(!hud || !l) return;

    const cur = ensureCurrentStop();
    const pts = cur ? [cur, l] : [l];
    const meta = rt ? routeSummary(rt) : (message || 'Preview route');

    hud.innerHTML = `<div class="rh-top"><div class="rh-title">Preview route to ${safe(l.name)}<div class="rh-meta">${safe(meta)}</div></div><button class="tinybtn" id="rhHide" title="Hide card">Hide</button></div>
      <div class="rh-stops">${stopChipsWithTimes(pts, rt)}</div>
      <div class="rh-actions route-preview-actions"><button class="tinybtn primary" id="rhStartHere" data-store-id="${safe(l.id)}">Start here</button><a class="tinybtn" id="rhNavigate" href="${navUrl(pts)}" target="_blank" rel="noopener">Navigate</a><button class="tinybtn danger" id="rhClear">Clear route</button></div>`;
    hud.hidden = false;

    const hide = q('#rhHide'); if(hide) hide.onclick = () => { hud.hidden = true; };
    const start = q('#rhStartHere');
    if(start) start.onclick = e => {
      e.preventDefault();
      if(typeof addStoreToTrip === 'function') addStoreToTrip(l.id, 'start');
    };
    const clear = q('#rhClear');
    if(clear) clear.onclick = () => { clearGreenPreview(); hud.hidden = true; hud.innerHTML = ''; };
  }

  window.previewStoreRoute = previewStoreRoute = async function(l, fit=false){
    if(!l) return;

    if(hasActiveRoute()){
      if((tripSel || []).includes(l.id)) return showRouteHud();
      return previewTripWithCandidate(l);
    }

    const cur = ensureCurrentStop();
    if(!cur){
      renderInitialPreview(l, null, 'Enable location to preview from From Location.');
      return;
    }

    try{
      const rt = await routeBetween([cur, l]);
      clearGreenPreview();
      selectedPreviewRoute = {store:l, route:rt};

      singleRouteLayer = L.geoJSON(rt.geometry, {
        style:{color:PREVIEW_COLOR, weight:5, opacity:.74, dashArray:'8 8', lineCap:'round', lineJoin:'round'}
      }).addTo(map);
      try{ singleRouteLayer.bringToFront(); }catch(e){}
      if(fit){ try{ map.fitBounds(singleRouteLayer.getBounds().pad(.18)); }catch(e){} }

      renderInitialPreview(l, rt);
    }catch(e){
      renderInitialPreview(l, null, 'Route preview unavailable right now.');
    }
  };

  window.previewTripWithCandidate = previewTripWithCandidate = async function(l){
    if(!l) return;

    if(!hasActiveRoute()) return previewStoreRoute(l, false);

    const pts = activePts();
    if(!pts.length) return;

    if((tripSel || []).includes(l.id)){
      clearGreenPreview();
      showRouteHud();
      return;
    }

    const last = pts[pts.length - 1];

    try{
      // Only green-preview the next leg from the current last stop to the clicked pin.
      const legRt = await routeBetween([last, l]);

      clearGreenPreview();
      keepActiveRouteRed();

      singleRouteLayer = L.geoJSON(legRt.geometry, {
        style:{color:PREVIEW_COLOR, weight:5, opacity:.74, dashArray:'8 8', lineCap:'round', lineJoin:'round'}
      }).addTo(map);
      selectedPreviewRoute = {store:l, route:legRt, candidate:true, segmentOnly:true, from:last.id || last.name};

      try{ if(routeLayer && routeLayer.bringToFront) routeLayer.bringToFront(); }catch(e){}
      try{ singleRouteLayer.bringToFront(); }catch(e){}

      const combinedPts = pts.concat([l]);
      const combinedLegs = (tripRoute && Array.isArray(tripRoute.legs)) ? tripRoute.legs.slice() : [];
      combinedLegs.push({distance:Number(legRt.distance)||0, duration:Number(legRt.duration)||0});
      const combined = {
        pts: combinedPts,
        legs: combinedLegs,
        distance:(Number(tripRoute && tripRoute.distance)||0)+(Number(legRt.distance)||0),
        duration:(Number(tripRoute && tripRoute.duration)||0)+(Number(legRt.duration)||0)
      };

      const hud = q('#routeHud');
      if(hud){
        hud.innerHTML = `<div class="rh-top"><div class="rh-title">Preview next stop to ${safe(l.name)}<div class="rh-meta">${safe(timeLabel(legRt.duration))} from ${safe(last.name || 'last stop')}</div><div class="rh-preview-note">Red is current route · green dotted is preview only</div></div><button class="tinybtn" id="rhHide" title="Hide card">Hide</button></div>
          <div class="rh-stops">${stopChipsWithTimes(combinedPts, combined)}</div>
          <div class="rh-actions candidate-actions"><button class="tinybtn primary" id="rhAddCandidate" data-store-id="${safe(l.id)}">Add stop</button><button class="tinybtn danger" id="rhClear">Clear route</button></div>`;
        hud.hidden = false;

        const hide = q('#rhHide'); if(hide) hide.onclick = () => { hud.hidden = true; };
        const add = q('#rhAddCandidate');
        if(add) add.onclick = e => {
          e.preventDefault();
          clearGreenPreview();
          if(typeof addStoreToTrip === 'function') addStoreToTrip(l.id, 'add');
        };
        const clear = q('#rhClear');
        if(clear) clear.onclick = () => { if(typeof resetRouteState === 'function') resetRouteState('Route cleared'); };
      }
    }catch(e){
      if(typeof toast === 'function') toast('Route preview unavailable right now');
    }
  };

  const oldAddStoreToTrip = typeof window.addStoreToTrip === 'function' ? window.addStoreToTrip : null;
  if(oldAddStoreToTrip && !oldAddStoreToTrip.__routePlannerRestoreWrapped){
    window.addStoreToTrip = addStoreToTrip = async function(id, mode){
      clearGreenPreview();
      const out = await oldAddStoreToTrip.apply(this, arguments);
      clearGreenPreview();
      keepActiveRouteRed();
      if(hasActiveRoute()) setTimeout(() => { try{ showRouteHud(); }catch(e){} }, 120);
      return out;
    };
    window.addStoreToTrip.__routePlannerRestoreWrapped = true;
  }

  window.openLocation = openLocation = function(id){
    const l = storeById(id);
    if(!l) return;

    try{ selectedId = id; }catch(e){}
    const active = hasActiveRoute();

    if(!active){
      try{ if(map && map.panTo) map.panTo([l.lat, l.lng]); }catch(e){}
    }

    try{ if(typeof renderSheetHead === 'function') renderSheetHead(l); }catch(e){}
    try{ if(typeof renderInfoTab === 'function') renderInfoTab(l); }catch(e){}
    try{ if(typeof renderActionsTab === 'function') renderActionsTab(l); }catch(e){}
    try{ if(typeof renderNearbyTab === 'function') renderNearbyTab(l); }catch(e){}
    try{ if(typeof renderTravelTab === 'function') renderTravelTab(l); }catch(e){}
    try{ if(typeof renderNotesTab === 'function') renderNotesTab(l); }catch(e){}
    try{ if(typeof renderPhotosTab === 'function') renderPhotosTab(l); }catch(e){}
    try{ if(typeof openSheet === 'function') openSheet(); }catch(e){}

    if(active && !(tripSel || []).includes(l.id)){
      previewTripWithCandidate(l);
    }else if(active){
      clearGreenPreview();
      showRouteHud();
    }else{
      previewStoreRoute(l, false);
    }
  };

  function init(){
    keepActiveRouteRed();
    if(hasActiveRoute()) showRouteHud();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  [150, 500, 1200, 2500].forEach(ms => setTimeout(init, ms));
})();
