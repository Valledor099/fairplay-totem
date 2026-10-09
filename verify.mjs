import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.dirname(fileURLToPath(import.meta.url));
const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
let executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH;
if(!executablePath)for(const candidate of candidates)if(await fs.access(candidate).then(()=>true).catch(()=>false)){executablePath=candidate;break;}
const browser=await chromium.launch({headless:true,executablePath});
const results=[];
try{
for(const [width,height] of [[1080,1920],[720,1280],[2160,3840],[1440,900],[390,844]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(root,`evidence/map-${width}.png`),fullPage:true});
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,pageHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,fonts:document.fonts.status,buttons:[...document.querySelectorAll('button')].filter(el=>el.getClientRects().length).map(el=>({label:el.getAttribute('aria-label')||el.textContent.trim(),height:Math.round(el.getBoundingClientRect().height),width:Math.round(el.getBoundingClientRect().width)}))}));
 assert.equal(layout.overflow,false,'Horizontal overflow');
 if(width===1080||width===720)assert.ok(layout.pageHeight<=height,`La pantalla principal debe entrar en ${width}×${height}`);
 const titles=['El vestuario','La alfombra roja','Comprate un deporte','Lo que no se ve'];
 for(let i=0;i<4;i++){
  await page.locator(`.activity-row[data-detail="${i}"]`).click();
  await page.locator('#detail-title').waitFor({state:'visible'});
  assert.equal(await page.locator('#detail-title').textContent(),titles[i]);
  assert.equal(await page.locator('#nav-info').getAttribute('aria-current'),'page');
  await page.locator('#detail-image').evaluate(el=>el.decode());
  assert.equal(await page.locator('#detail-image').evaluate(el=>el.complete&&el.naturalWidth>0),true);
  if(width===1080||width===720)assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),`La ficha ${i+1} debe entrar completa en el tótem`);
  if(width===1080){await page.waitForTimeout(350);await page.screenshot({path:path.join(root,`evidence/detail-${i+1}-${width}.png`),fullPage:true});}
  await page.locator('[data-action="locate"]').click();
  assert.equal(await page.locator(`.marker[data-marker="${i}"]`).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#selected-location').isVisible(),true);
  await page.locator('[data-action="clear-selection"]').click();
 }
 await page.locator('[data-action="zoom-in"]').click();
 const before=await page.locator('#map-pan').evaluate(el=>el.style.transform);
 assert.match(before,/scale\(1.3\)/);
 await page.locator('[data-action="zoom-reset"]').click();
 assert.match(await page.locator('#map-pan').evaluate(el=>el.style.transform),/scale\(1\)/);
 await page.locator('[data-marker="0"]').click();
 assert.equal(await page.locator('#selected-name').textContent(),'1. El vestuario');
 if(width===1080){await page.waitForTimeout(350);await page.screenshot({path:path.join(root,'evidence/map-selected-1080.png'),fullPage:true});}
 await page.locator('[data-action="selected-detail"]').click();
 assert.equal(await page.locator('#detail-title').textContent(),'El vestuario');
 await page.locator('[data-action="home"]').first().click();
 assert.equal(await page.locator('#selected-location').isVisible(),false);
 await page.locator('#nav-info').click();
 if(width===1080||width===720)assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),'Las experiencias deben entrar completas en el tótem');
 if(width===1080){await page.waitForTimeout(350);await page.screenshot({path:path.join(root,'evidence/experiences-1080.png'),fullPage:true});}
 await page.locator('.experience-card[data-detail="2"]').click();
 await page.locator('[data-action="back"]').click();
 assert.equal(await page.locator('#info-screen').isVisible(),true);
 assert.deepEqual(errors,[]);
 results.push({width,height,layout,errors,flows:'4 fichas, ubicaciones, selección, regreso, inicio y zoom: OK'});
 await page.close();
}
// Virtual time validates the shared-screen reset without waiting two real minutes.
const idle=await browser.newPage({viewport:{width:1080,height:1920}});
await idle.clock.install();
await idle.goto('http://127.0.0.1:4184/');
await idle.locator('.activity-row[data-detail="1"]').click();
await idle.clock.fastForward(101000);
assert.equal(await idle.locator('#idle-dialog').isVisible(),true);
await idle.locator('[data-action="continue"]').click();
assert.equal(await idle.locator('#idle-dialog').isVisible(),false);
await idle.clock.fastForward(121000);
assert.equal(await idle.locator('#map-screen').isVisible(),true);
assert.equal(await idle.locator('#selected-location').isVisible(),false);
results.push({idle:'Aviso, continuar y retorno automático: OK'});
await idle.close();
// Direct file access proves there are no fetch/CDN dependencies.
const offline=await browser.newPage();const offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));
await offline.goto(new URL('./dist/index.html',import.meta.url).href);
await offline.locator('.activity-row[data-detail="3"]').click();
assert.equal(await offline.locator('#detail-title').textContent(),'Lo que no se ve');
await offline.locator('#detail-image').evaluate(el=>el.decode());
assert.equal(await offline.locator('#detail-image').evaluate(el=>el.complete&&el.naturalWidth>0),true);
assert.deepEqual(offlineErrors,[]);
results.push({offline:'Abre como archivo local y navega sin red: OK'});
await offline.close();
}finally{await browser.close();await fs.writeFile(path.join(root,'evidence/verification.json'),JSON.stringify(results,null,2));}
console.log(JSON.stringify(results.map(r=>({width:r.width,height:r.height,pageHeight:r.layout?.pageHeight,viewportHeight:r.layout?.viewportHeight,overflow:r.layout?.overflow,flows:r.flows,idle:r.idle,offline:r.offline})),null,2));
