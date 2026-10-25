module.exports=async function(req,res){
 res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=3600');
 const u=new URL('https://api.open-meteo.com/v1/forecast');
 Object.entries({latitude:'37.2367',longitude:'127.0765',timezone:'Asia/Seoul',forecast_days:'16',current:'temperature_2m,weather_code,is_day',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'}).forEach(([k,v])=>u.searchParams.set(k,v));
 const c=new AbortController(),t=setTimeout(()=>c.abort(),9000);
 try{const r=await fetch(u,{signal:c.signal});if(!r.ok)throw Error('upstream '+r.status);const j=await r.json();const d=j.daily;if(!Array.isArray(d?.time))throw Error('invalid daily');
 const days=d.time.map((date,i)=>({date,code:d.weather_code?.[i],high:d.temperature_2m_max?.[i],low:d.temperature_2m_min?.[i],rain:d.precipitation_probability_max?.[i]}));
 res.status(200).json({status:'ok',source:'Open-Meteo',area:'서천 힐스테이트 인근',current:j.current||null,days,checkedAt:new Date().toISOString()});
 }catch(e){res.status(200).json({status:'error',source:'Open-Meteo',days:[],message:'날씨 조회 실패'});}finally{clearTimeout(t)}
};