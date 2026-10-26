const cache=new Map();
function distanceMeters(a,b,c,d){const r=Math.PI/180;const x=(d-b)*Math.cos((a+c)*r/2)*111320,y=(c-a)*110540;return Math.hypot(x,y)}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
 const lat=Number(req.query.lat),lon=Number(req.query.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<33||lat>39||lon<124||lon>132)return res.status(400).json({name:null,confidence:'none'});
 const key=lat.toFixed(4)+','+lon.toFixed(4);if(cache.has(key))return res.json(cache.get(key));
 try{
  const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon);
  const controller=new AbortController(),timer=setTimeout(()=>c.abort(),4500);const c=controller;
  let response;try{response=await fetch(url,{signal:c.signal,headers:{'User-Agent':'NADLE-family-events/1.0 (https://nadle-lyart.vercel.app/)','Accept-Language':'ko,en'}})}finally{clearTimeout(timer)}
  if(!response.ok)throw Error('upstream');
  const data=await response.json(),type=String(data.type||''),category=String(data.category||data.class||'');
  const suitable=/^(tourism|amenity|leisure|historic|building)$/.test(category)&&!/^(yes|house|residential|apartments|road|street|parking|footway|path)$/.test(type);
  const name=String(data.name||'').trim(),meters=distanceMeters(lat,lon,Number(data.lat),Number(data.lon));
  const good=suitable&&name.length>=2&&name.length<=60&&Number.isFinite(meters)&&meters<=35;
  const result={name:good?name:null,confidence:good?'medium':'none',distanceMeters:Number.isFinite(meters)?Math.round(meters):null,source:'OpenStreetMap contributors'};
  cache.set(key,result);return res.json(result);
 }catch{return res.status(200).json({name:null,confidence:'none'})}
};