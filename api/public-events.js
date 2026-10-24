const ORIGIN=[37.237,127.075];
function dist(lat,lon){const r=Math.PI/180,a=Math.sin((lat-ORIGIN[0])*r/2)**2+Math.cos(lat*r)*Math.cos(ORIGIN[0]*r)*Math.sin((lon-ORIGIN[1])*r/2)**2;return 12742*Math.asin(Math.sqrt(a))}
function iso(v){const s=String(v||'').replace(/\D/g,'');return /^\d{8}$/.test(s)?s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6):null}
function todayKST(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function safeUrl(s){try{const u=new URL(s);return u.protocol==='https:'?u.href:null}catch{return null}}
module.exports=async function(req,res){
res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=1800');
const today=todayKST(),key=process.env.TOUR_API_KEY,events=[],sources=[];
if(key){
 try{
 const start=new Date(Date.now()-365*86400000).toISOString().slice(0,10).replace(/-/g,'');
 const u=new URL('https://apis.data.go.kr/B551011/KorService2/searchFestival2');
 Object.entries({serviceKey:key,MobileOS:'ETC',MobileApp:'NADLE',_type:'json',eventStartDate:start,numOfRows:'1000',pageNo:'1'}).forEach(([k,v])=>u.searchParams.set(k,v));
 const c=new AbortController(),t=setTimeout(()=>c.abort(),9000);let response;try{response=await fetch(u,{signal:c.signal})}finally{clearTimeout(t)}
 if(!response.ok)throw Error('HTTP '+response.status);
 const data=await response.json(),body=data.response?.body;
 let rows=body?.items?.item||[];if(!Array.isArray(rows))rows=[rows];
 for(const x of rows){
 const lat=Number(x.mapy),lon=Number(x.mapx),startDate=iso(x.eventstartdate),endDate=iso(x.eventenddate);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||!startDate||!endDate||endDate<today||dist(lat,lon)>50)continue;
 const url=safeUrl(x.firstpage)||safeUrl(x.homepage)||'https://korean.visitkorea.or.kr/';
 events.push({title:String(x.title||'').slice(0,120),startDate,endDate,place:String(x.addr1||x.title||'').slice(0,130),lat,lon,type:'festival',family:false,url,source:'한국관광공사 TourAPI',distanceKm:Number(dist(lat,lon).toFixed(1))});
 }
 sources.push({name:'TourAPI 축제',status:'ok',count:events.length});
 }catch(e){sources.push({name:'TourAPI 축제',status:'error',count:0})}
}else sources.push({name:'TourAPI 축제',status:'needs_key',count:0});
res.status(200).json({events,sources,checkedAt:new Date().toISOString(),origin:'용인 서천 힐스테이트 인근 (근사 좌표)',radiusKm:50,message:key?'공식 축제 데이터 조회 결과':'TOUR_API_KEY 환경변수 설정 후 자동 수집됩니다.'});
};