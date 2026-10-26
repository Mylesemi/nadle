const cache=new Map();let lastRequest=0;
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
 const lat=Number(req.query.lat),lon=Number(req.query.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<33||lat>39||lon<124||lon>132)return res.status(400).json({name:null});
 const key=lat.toFixed(4)+','+lon.toFixed(4);if(cache.has(key))return res.json(cache.get(key));
 try{
  const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
  let response;try{response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'NADLE-family-events/1.0 (venue-name lookup; https://nadle-lyart.vercel.app/)','Accept-Language':'ko,en'}})}finally{clearTimeout(timer)}
  if(!response.ok)throw Error('upstream');
  const data=await response.json(),type=String(data.type||''),category=String(data.category||data.class||'');
  const suitable=/^(tourism|amenity|leisure|historic|building|shop)$/.test(category)&&!/^(yes|house|residential|apartments|road|street|parking|footway|path)$/.test(type);
  const name=String(data.name||'').trim();
  const result={name:suitable&&name.length>=2&&name.length<=60?name:null,source:'OpenStreetMap contributors'};
  cache.set(key,result);return res.json(result);
 }catch{return res.status(200).json({name:null})}
};