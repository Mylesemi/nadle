const SOURCE='https://www.scc.or.kr/events-3/';
const clean=s=>String(s||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#8211;|&ndash;/gi,'-').replace(/\s+/g,' ').trim();
const kst=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function parse(html){
 const text=clean(html),out=[],seen=new Set(),date=/\b(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\s*[~–-]\s*(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\b/g;
 const iso=(y,m,d)=>y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0'),today=kst();
 for(const m of text.matchAll(date)){
  const startDate=iso(m[1],m[2],m[3]),endDate=iso(m[4],m[5],m[6]);
  if(endDate<today||startDate>endDate)continue;
  const before=text.slice(Math.max(0,m.index-180),m.index).trim();
  const title=before.split(/(?:전시회|컨벤션\/회의|이벤트|주최\/주관\s*[:：]|장소\s*[:：])/).pop().trim().slice(-100);
  if(title.length<3||title.length>100||seen.has(title+'|'+startDate))continue;
  seen.add(title+'|'+startDate);
  out.push({title,startDate,endDate,place:'수원컨벤션센터 · 광교',lat:37.2851,lon:127.0571,type:/공연|콘서트|뮤지컬/.test(title)?'performance':'experience',family:/키즈|어린이|베이비|유아|가족|펫|메가쇼/.test(title),url:SOURCE,source:'수원컨벤션센터 공식 행사 캘린더'});
 }
 return out.slice(0,60);
}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=3600');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const r=await fetch(SOURCE,{signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; NADLE/1.0; event calendar)'}});
  if(!r.ok)throw Error('HTTP '+r.status);
  const html=await r.text(),events=parse(html);
  res.status(200).json({status:events.length?'ok':'unverified',events,checkedAt:new Date().toISOString(),source:SOURCE,message:events.length?'공식 일정 페이지에서 날짜와 행사명을 추출했습니다.':'페이지에 접근했으나 확실한 행사 날짜를 추출하지 못했습니다.'});
 }catch(e){res.status(200).json({status:'error',events:[],checkedAt:new Date().toISOString(),source:SOURCE,message:'공식 일정 페이지 접근 또는 파싱 실패'})}
 finally{clearTimeout(timer)}
};