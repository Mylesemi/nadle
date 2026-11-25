const origin='https://www.starfield.co.kr';
const branches=[{slug:'suwon',name:'스타필드 수원'},{slug:'anseong',name:'스타필드 안성'}];
const clean=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();

function parseDates(text,today){
 const match=text.match(/(?:(20\d{2})[./-])?(\d{1,2})[./-](\d{1,2})\s*\([월화수목금토일]\)(?:\s*[-~–]\s*(?:(20\d{2})[./-])?(\d{1,2})[./-](\d{1,2})(?:\s*\([월화수목금토일]\))?)?/);
 if(!match)return null;
 const [,firstYear,month,day,lastYear,endMonth,endDay]=match;
 let year=Number(firstYear||today.slice(0,4));
 const iso=(y,m,d)=>y+'-'+m.padStart(2,'0')+'-'+d.padStart(2,'0');
 if(!firstYear&&today.slice(5,7)==='01'&&Number(month)===12)year--;
 if(!firstYear&&today.slice(5,7)==='12'&&Number(month)===1)year++;
 const startDate=iso(year,month,day);
 const endDate=endMonth?iso(lastYear||year+Number(Number(endMonth)<Number(month)),endMonth,endDay):startDate;
 if(endDate<today||startDate>endDate||[startDate,endDate].some(value=>{
  const parsed=new Date(value+'T00:00:00Z');
  return !Number.isFinite(+parsed)||parsed.toISOString().slice(0,10)!==value;
 }))return null;
 return {startDate,endDate,label:match[0]};
}

function parse(html,branch,today){
 const events=[];
 const links=/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
 for(const [,href,body] of html.matchAll(links)){
  let url;
  try{url=new URL(href.replace(/&amp;/g,'&'),origin)}catch{continue}
  if(url.origin!==origin||!url.pathname.startsWith('/'+branch.slug+'/'))continue;
  const detail=/\/eventBenefit\/events\/EV\d+\/?$/i.test(url.pathname);
  const program=/\/starfieldLibrary\/(?:kids|library)\.do$/i.test(url.pathname);
  if(!detail&&!program)continue;
  const visible=clean(body),alt=clean(body.match(/<img\b[^>]*\balt=["']([^"']*)["']/i)?.[1]);
  const explicitTitle=clean(body.match(/<[^>]*\bclass=["'][^"']*\bsubj\b[^"']*["'][^>]*>([\s\S]*?)<\//i)?.[1]);
  const dates=parseDates(visible,today)||parseDates(alt,today);
  if(!dates)continue;
  const {startDate,endDate,label}=dates;
  const title=(explicitTitle||visible.replace(label,'')||alt.split(label)[0]).replace(/^EVENT\s+/i,'').replace(/[\s,·:|–-]+$/,'').trim();
  if(!title||title.length>120||/신규\s*오픈\s*브랜드|이번\s*달.*브랜드\s*행사|\d{1,2}월의\s*브랜드\s*행사|온라인몰/.test(title))continue;
  const location=(visible+' '+alt).match(/(?:[1-9]층|[1-9]F)\s*(?:[,·]\s*)?([^,|]{0,32})/i);
  const floor=location?.[0].match(/^[1-9](?:층|F)/i)?.[0];
  const type=/축제|페스티벌/.test(title)?'festival':/강연|공연|콘서트|연주|뮤지컬/.test(title)?'performance':'experience';
  if(detail){url.search='';url.hash=''}
  events.push({
   title,startDate,endDate,url:url.href,place:branch.name,
   type,family:/키즈|어린이|유아|가족/.test(title),
   ...(program?{scheduleOverview:true}:{}),
   ...(floor?{floor,venueName:[floor,location[1].trim()].filter(Boolean).join(' ')}:{}),
   source:detail?'스타필드 공식 행사 상세':'스타필드 공식 프로그램 안내'
  });
 }
 return events;
}

const verified=[
 {title:'쓱데이 BYD 전시 팝업',startDate:'2026-10-30',endDate:'2026-11-08',place:'스타필드 안성',venueName:'1층 자라 아트리움',floor:'1F',type:'experience',family:false,description:'BYD 친환경차 전시 팝업. 공식 안내에 행사 장소가 1층 자라 아트리움으로 명시되어 있습니다.',url:origin+'/anseong/eventBenefit/events/EV202610291016153106',source:'스타필드 공식 행사 상세'}
];

module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const results=await Promise.all(branches.map(async branch=>{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  const urls=['/main.do','/eventBenefit/events'].map(path=>origin+'/'+branch.slug+path);
  const pages=await Promise.all(urls.map(async url=>{
   try{
    const response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; NADLE/1.0)'}});
    return response.ok?{url,html:await response.text()}:null;
   }catch{return null}
  }));
  clearTimeout(timeout);
  const checked=pages.filter(Boolean);
  const candidates=[...verified.filter(e=>e.place===branch.name&&e.endDate>=today),...checked.flatMap(page=>parse(page.html,branch,today))];
  const distinct=new Map();
  for(const event of candidates){
   const key=[event.url,event.startDate,event.endDate].join('|');
   if(!distinct.has(key))distinct.set(key,event);
  }
  const events=[...distinct.values()];
  return {name:branch.name,status:events.length?'ok':checked.length?'unverified':'error',events,checkedPages:checked.map(page=>page.url)};
 }));
 const events=results.flatMap(item=>item.events);
 res.status(200).json({
  status:events.length?'parsed':results.every(item=>item.status==='error')?'error':'unverified',
  events,
  venues:results.map(({name,status,events,checkedPages})=>({name,status,count:events.length,checkedPages})),
  checkedAt:new Date().toISOString(),
  source:'official Starfield Suwon and Anseong websites',
  message:events.length?'공식 페이지에 표시된 일정입니다.':'공식 페이지에서 날짜가 표시된 행사를 확인하지 못했습니다.'
 });
};
