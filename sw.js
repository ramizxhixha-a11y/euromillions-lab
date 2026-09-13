const CACHE='emlab-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html']).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||!req.url.startsWith(self.location.origin))return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const cached=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
    if(cached){e.waitUntil(net);return cached}
    const r=await net;
    return r||(await c.match('./index.html'))||Response.error();
  }));
});
