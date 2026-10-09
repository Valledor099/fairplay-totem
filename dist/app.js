'use strict';
(() => {
  const activities = [
    {name:'El vestuario',location:'Cancha de hockey',image:'vestuario.webp',alt:'Vestuario deportivo con casilleros, camisetas y una pelota.',description:'Conocé las experiencias y emociones que se viven dentro del deporte. Compartí tu historia y escuchá otras miradas.'},
    {name:'La alfombra roja',location:'Gimnasio / básquet',image:'alfombra-v2.webp',alt:'Imagen conceptual de una deportista recorriendo una alfombra salvia entre fotógrafos.',description:'El protagonismo es tuyo. Recorré la alfombra, sacate una foto y contá qué significa el deporte para vos.'},
    {name:'Comprate un deporte',location:'Cancha exterior · mitad 1',image:'deporte-v2.webp',alt:'Imagen conceptual de una pelota de fútbol, una de básquet y una raqueta de tenis sobre pedestales.',description:'Explorá distintas disciplinas y elegí la que más va con vos. Compará opciones y descubrí qué influye en tu elección.'},
    {name:'Lo que no se ve',location:'Cancha exterior · mitad 2',image:'invisible-v2.webp',alt:'Imagen conceptual de un atleta atándose los botines en el vestuario antes de salir a la cancha.',description:'Descubrí lo que hay detrás de cada logro: esfuerzo, emociones y desafíos. Participá y compartí tu reflexión.'}
  ];
  const $ = id => document.getElementById(id);
  const state={screen:'map',detail:0,origin:'map',selected:null,zoom:1,x:0,y:0,lastActivity:Date.now()};
  const idleSeconds=120,warningSeconds=20;
  $('map-pan').innerHTML=window.FAIRPLAY_MAP;
  $('activity-list').innerHTML=activities.map((a,i)=>`<button class="activity-row" data-detail="${i}"><span class="activity-number">${i+1}</span><div><h3>${a.name}</h3><p>${a.location}</p></div><span class="activity-arrow" aria-hidden="true">↗</span></button>`).join('');
  $('experience-grid').innerHTML=activities.map((a,i)=>`<button class="experience-card" data-detail="${i}"><img src="assets/${a.image}" alt="${a.alt}" loading="lazy"><div class="experience-card-body"><span class="activity-number">${i+1}</span><div><h2>${a.name}</h2><p>${a.location}</p></div></div></button>`).join('');
  $('pager-dots').innerHTML=activities.map((a,i)=>`<button data-detail="${i}" aria-label="Ver ${a.name}"><i></i></button>`).join('');
  function announce(text){$('announcement').textContent=text;}
  function show(screen,focus=true){
    state.screen=screen;
    for(const name of ['map','info','detail']) $(`${name}-screen`).hidden=name!==screen;
    for(const name of ['map','info']){
      const active=name===screen||(screen==='detail'&&name==='info');
      $(`nav-${name}`).classList.toggle('active',active);
      if(active) $(`nav-${name}`).setAttribute('aria-current','page');else $(`nav-${name}`).removeAttribute('aria-current');
    }
    window.scrollTo({top:0,behavior:'instant'});
    if(focus) $(`${screen}-title`).focus({preventScroll:true});
  }
  function renderDetail(){
    const a=activities[state.detail];
    $('detail-title').textContent=a.name;
    $('detail-number').textContent=state.detail+1;
    $('detail-location').textContent=a.location;
    $('detail-venue').textContent=a.location;
    $('detail-description').textContent=a.description;
    $('detail-step').textContent=`Experiencia ${state.detail+1} de 4`;
    $('detail-image').src=`assets/${a.image}`;$('detail-image').alt=a.alt;
    document.querySelector('[data-action="previous"]').disabled=state.detail===0;
    document.querySelector('[data-action="next"]').disabled=state.detail===3;
    for(const dot of $('pager-dots').children){if(Number(dot.dataset.detail)===state.detail) dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');}
  }
  function openDetail(i){
    if(state.screen!=='detail') state.origin=state.screen;
    state.detail=i;renderDetail();show('detail');
  }
  function select(i){
    state.selected=i;
    const map=document.querySelector('.map-art');map.classList.toggle('has-selection',i!==null);
    document.querySelectorAll('[data-zone]').forEach(el=>el.classList.toggle('selected',Number(el.dataset.zone)===i&&i!==null));
    document.querySelectorAll('[data-marker]').forEach(el=>{const selected=Number(el.dataset.marker)===i&&i!==null;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
    document.querySelectorAll('.activity-row').forEach(el=>el.classList.toggle('selected',Number(el.dataset.detail)===i&&i!==null));
    $('selected-location').hidden=i===null;
    if(i!==null){$('selected-name').textContent=`${i+1}. ${activities[i].name}`;announce(`${activities[i].name}: ${activities[i].location}. Zona resaltada en el mapa.`);}
  }
  function transform(){
    const viewport=$('map-viewport');
    const maxX=(.35+(state.zoom-1)/2)*viewport.clientWidth,maxY=(.35+(state.zoom-1)/2)*viewport.clientHeight;
    state.x=Math.max(-maxX,Math.min(maxX,state.x));state.y=Math.max(-maxY,Math.min(maxY,state.y));
    $('map-pan').style.transform=`translate(${state.x}px,${state.y}px) scale(${state.zoom})`;
    document.querySelector('[data-action="zoom-out"]').disabled=state.zoom<=1;
    document.querySelector('[data-action="zoom-in"]').disabled=state.zoom>=2.5;
  }
  function resetZoom(){state.zoom=1;state.x=state.y=0;transform();}
  function home(){if($('idle-dialog').open)$('idle-dialog').close();select(null);resetZoom();state.detail=0;state.origin='map';state.lastActivity=Date.now();show('map');}
  function activity(){state.lastActivity=Date.now();}
  const actions={
    map(){show('map');},info(){show('info');},back(){show(state.origin);},home,
    locate(){show('map');resetZoom();select(state.detail);},
    'selected-detail'(){if(state.selected!==null)openDetail(state.selected);},
    'clear-selection'(){select(null);},
    previous(){if(state.detail>0){state.detail--;renderDetail();show('detail');}},
    next(){if(state.detail<3){state.detail++;renderDetail();show('detail');}},
    'zoom-in'(){state.zoom=Math.min(2.5,state.zoom+.3);transform();announce(`Zoom ${Math.round(state.zoom*100)} por ciento.`);},
    'zoom-out'(){state.zoom=Math.max(1,state.zoom-.3);transform();announce(`Zoom ${Math.round(state.zoom*100)} por ciento.`);},
    'zoom-reset'(){resetZoom();announce('Mapa completo.');},
    continue(){activity();$('idle-dialog').close();},
    async fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('La pantalla completa no está disponible en este navegador.');}}
  };
  let dragged=false;
  document.addEventListener('click',e=>{
    activity();if(dragged){dragged=false;return;}
    const marker=e.target.closest('[data-marker]');
    if(marker){select(Number(marker.dataset.marker));return;}
    const detail=e.target.closest('[data-detail]');
    if(detail){openDetail(Number(detail.dataset.detail));return;}
    const button=e.target.closest('[data-action]');
    if(button&&!button.disabled)actions[button.dataset.action]?.();
  });
  document.addEventListener('keydown',e=>{activity();const marker=e.target.closest('[data-marker]');if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(Number(marker.dataset.marker));}});
  document.addEventListener('fullscreenchange',()=>{const on=!!document.fullscreenElement;document.querySelector('.fullscreen').setAttribute('aria-label',on?'Salir de pantalla completa':'Activar pantalla completa');});
  // Pointer Events support mouse, single-finger pan and two-finger pinch.
  const viewport=$('map-viewport'),pointers=new Map();let gesture=null;
  const distance=()=>{const a=[...pointers.values()];return a.length===2?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0;};
  const center=()=>{const a=[...pointers.values()];return {x:a.reduce((sum,p)=>sum+p.x,0)/a.length,y:a.reduce((sum,p)=>sum+p.y,0)/a.length};};
  function startGesture(){if(!pointers.size){gesture=null;return;}const p=center();gesture={x:p.x,y:p.y,startX:state.x,startY:state.y,startZoom:state.zoom,distance:distance()};}
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;activity();if(!pointers.size)dragged=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});startGesture();});
  viewport.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const p=center(),dx=p.x-gesture.x,dy=p.y-gesture.y;
    if(pointers.size===2&&gesture.distance){state.zoom=Math.max(1,Math.min(2.5,gesture.startZoom*distance()/gesture.distance));dragged=true;}
    if(dragged||Math.abs(dx)>6||Math.abs(dy)>6){state.x=gesture.startX+dx;state.y=gesture.startY+dy;dragged=true;}
    if(dragged){activity();viewport.classList.add('dragging');if(!viewport.hasPointerCapture(e.pointerId))viewport.setPointerCapture(e.pointerId);transform();}
  });
  const endPointer=e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);startGesture();if(!pointers.size){viewport.classList.remove('dragging');if(dragged)setTimeout(()=>{dragged=false;},100);}};
  window.addEventListener('pointerup',endPointer);window.addEventListener('pointercancel',endPointer);
  viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const moves={ArrowLeft:[80,0],ArrowRight:[-80,0],ArrowUp:[0,80],ArrowDown:[0,-80]};if(!moves[e.key])return;e.preventDefault();activity();state.x+=moves[e.key][0];state.y+=moves[e.key][1];transform();});
  window.addEventListener('resize',transform);
  document.addEventListener('pointerdown',activity,{passive:true});document.addEventListener('wheel',activity,{passive:true});
  $('idle-dialog').addEventListener('cancel',activity);
  setInterval(()=>{
    const elapsed=(Date.now()-state.lastActivity)/1000;
    // The initial map needs no reset; only a changed session starts the countdown.
    const changed=state.screen!=='map'||state.selected!==null||state.zoom!==1||state.x!==0||state.y!==0;
    if(!changed)return;
    if(elapsed>=idleSeconds){home();return;}
    if(elapsed>=idleSeconds-warningSeconds){$('idle-count').textContent=Math.max(1,Math.ceil(idleSeconds-elapsed));if(!$('idle-dialog').open)$('idle-dialog').showModal();}
  },1000);
  transform();
})();
