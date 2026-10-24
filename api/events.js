const SOURCE='https://www.starfield.co.kr/suwon/main.do';
const FALLBACK='https://www.starfield.co.kr/suwon/eventBenefit/events';
function clean(v){return String(v||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
function dates(text,year){const m=[...text.matchAll(/(\d{1,2})\.(\d{1,2})\s*\([^)]*\)\s*[-~–]\s*(\d{1,2})\.(\d{1,2})/g)];const one=[...text.matchAll(/(\d{1,2})\.(\d{1,2})\s*\([^)]+\)/g)];if(m.length){const x=m[0];return [year+'-'+x[1].padStart(2,'0')+'-'+x[2].padStart(2,'0'),year+'-'+x[3].padStart(2,'0')+'-'+x[4].padStart(2,'0')]}if(one.length){const x=one[0];const d=year+'-'+x[1].padStart(2,'0')+'-'+x[2].padStart(2,'0');return [d,d]}return null}
function parse(html,year,source=SOURCE,place='스타필드 수원'){const out=[];const seen=new Set();const re=/<a\b([^>]*href=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;for(const m of html.matchAll(re)){const text=clean(m[3]);const href=m[2].replace(/&amp;/g,'&');if(!text||text.length>220||!/(키즈|공연|강연|체험|태권도|치어|축제|프로그램|이벤트)/.test(text))continue;const d=dates(text,year);if(!d)continue;let url;try{url=new URL(href,source)}catch{continue}if(url.hostname!=='www.starfield.co.kr'&&url.hostname!=='starfield.co.kr')continue;const title=text.replace(/\d{1,2}\.\d{1,2}\s*\([^)]+\)\s*(?:[-~–]\s*\d{1,2}\.\d{1,2}\s*\([^)]+\))?/g,' ').trim().slice(0,100);if(!title)continue;const key=title+'|'+d.join('|');if(seen.has(key))continue;seen.add(key);out.push({title,startDate:d[0],endDate:d[1],url:url.href,place,type:/태권도/.test(title)?'🥋 태권도':/치어/.test(title)?'📣 치어리딩':'🎭 행사'});}return out.slice(0,30)}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 const year=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date());
 const venues=[{name:'스타필드 수원',url:SOURCE},{name:'스타필드 안성',url:'https://m.starfield.co.kr/anseong'}];
 const results=await Promise.all(venues.map(async venue=>{
  const controller=new AbortController();const t=setTimeout(()=>controller.abort(),8000);
  try{const r=await fetch(venue.url,{signal:controller.signal,headers:{'User-Agent':'NADLE/10.0 public-events'}});if(!r.ok)throw Error('HTTP '+r.status);
   const html=await r.text();return {venue:venue.name,status:'ok',events:parse(html,year,venue.url,venue.name)};
  }catch(e){return {venue:venue.name,status:'error',events:[]};}finally{clearTimeout(t)}
 }));
 const events=results.flatMap(x=>x.events);
 res.status(200).json({status:events.length?'parsed':results.every(x=>x.status==='error')?'error':'unverified',events,venues:results.map(x=>({name:x.venue,status:x.status,count:x.events.length})),checkedAt:new Date().toISOString(),source:'official Starfield Suwon and Anseong websites',message:events.length?'공식 페이지에서 날짜가 확인된 행사만 추출했습니다.':'공식 행사 날짜를 확인하지 못했습니다. 행사가 없다는 의미는 아닙니다.'});
};