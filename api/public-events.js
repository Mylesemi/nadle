const ORIGIN=[37.237,127.075];
const VISIT_KOREA='https://korean.visitkorea.or.kr';
// Verified by TourAPI ID and edition. IDs can be reused for a different year.
const EVENT_PAGES={
 '3035607':['2026','https://korean.visitseoul.net/events/2026GwanghwamunMarket/KOP0rc1ic'], // 광화문 마켓
 '4060434':['2026','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=1589452'], // 국악공연 진연
 '2809535':['2026',VISIT_KOREA+'/detail/fes_detail.do?cotid=b935940d-f80b-4ba8-9d27-3fa2e7dca57e'], // 남산봉수의식
 '2598331':['2026','https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=157652&menuNo=200110'], // 문화가 흐르는 서울광장
 '3367405':['2027','https://www.veganbeautyfair.com/page/11'], // 비건·할랄뷰티페어
 '292961':['2026','https://www.royalguard.kr/royalguard_process'], // 서울 왕궁수문장 교대의식
 '1095732':['2026',VISIT_KOREA+'/kfes/detail/fstvlDetail.do?fstvlCntntsId=bcd79254-697d-47f5-a408-e022f0e9f7fd'], // 서울빛초롱축제
 '4178037':['2026',VISIT_KOREA+'/kfes/detail/fstvlDetail.do?fstvlCntntsId=688a3c80-7d7b-44f0-94f9-bc35d8da095c'], // 서울한국춤페스티벌
 '293030':['2026','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=104321'], // 안성 남사당 상설 공연
 '3522322':['2026','https://ohslowmarket.com/tickets'], // 오슬로우 빈티지 크리스마스 마켓
 '3049823':['2026','https://xn--h89ak68bzfap6a619b.kr/214'], // 제4회 겨울엔 양평
 '2785797':['2026',VISIT_KOREA+'/kfes/detail/fstvlDetail.do?Flag=Y&cmsCntntsId=2785797'], // 청계천의 빛
 '4058556':['2026','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=1589272'], // 컬처라운지 경기, 장
 '4115260':['2026','https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159621&menuNo=200010'], // 쿼드 서안화차
 '4115275':['2026','https://www.quad.or.kr/product/performance/1278'], // 쿼드 화염
 '4082595':['2026','https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=158419&menuNo=200110'], // 팔색찬란
 '3481597':['2022',VISIT_KOREA+'/kperformance/performance/959f016b-6125-4cfa-b246-ed2dc01f2b59'], // 페인터즈
 '4108260':['2026','https://www.hugrun.kr/info'], // 허그런
 '2802077':['2026','https://sgf.kosac.re.kr/sgf2026'], // 과학영재교육 페스티벌
 '3492276':['2026','https://clik.nanet.go.kr/event/detail.do?eventId=3492276&listReturnUrl=%2Fevent%2Findex.do%3Fquery%3D%26stDateYm%3D%26endDateYm%3D%26ctgryCl1%3DEV01%26pageIndex%3D1'], // 문화가 있는 날
 '2720203':['2026','https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=157655&menuNo=200008'], // 구석구석라이브
 '3107059':['2026',VISIT_KOREA+'/detail/fes_detail.do?cotid=21890175-b6a5-400c-ad96-4687c32c03a1'], // 숭례문 파수의식
 '2515174':['2026','https://festival.ailearn4all.kr/festival/2026_aifestival/overview/'], // 전국민 AI 페스티벌
 '2630385':['2026',VISIT_KOREA+'/detail/fes_detail.do?cotid=45db7483-a28b-47a5-98c0-38ac5415ad1a'], // 2027 코리아그랜드세일
 '4101384':['2026',VISIT_KOREA+'/detail/fes_detail.do?cotid=930773a4-6636-445b-9035-d17b2584a8a4'], // 20세기 사진 거장전
 '3113265':['2026',VISIT_KOREA+'/detail/fes_detail.do?cotid=cbcaef77-54c2-4f28-831b-192aa19acc8c'], // APAP 작품투어
 '3473295':['2026','https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=158747&menuNo=200044'], // DDP 건축투어
 '4144229':['2026','https://sca.seoul.go.kr/seoulhour/site/urbanArch/exhibition/exhibitPre/1329'], // MATERIALISM
 '4127713':['2026','https://www.mcst.go.kr/site/s_culture/culture/cultureView.jsp?pRo=626&pSeq=76715'] // 소장품, 시대의 장면들
};
function dist(lat,lon){const r=Math.PI/180,a=Math.sin((lat-ORIGIN[0])*r/2)**2+Math.cos(lat*r)*Math.cos(ORIGIN[0]*r)*Math.sin((lon-ORIGIN[1])*r/2)**2;return 12742*Math.asin(Math.sqrt(a))}
function iso(v){const s=String(v||'').replace(/\D/g,'');return /^\d{8}$/.test(s)?s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6):null}
function todayKST(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function plain(v){return String(v||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
function officialUrl(value){
 const raw=String(value||'');
 const links=Array.from(raw.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi),match=>match[1]??match[2]??match[3]);
 for(const candidate of [...links,plain(raw)]){
  try{
   const url=new URL(candidate.trim().replace(/&amp;|&#38;/gi,'&'));
   if(url.protocol!=='https:'||url.username||url.password)continue;
   if(/^(?:www\.|korean\.|english\.)?visitkorea\.or\.kr$/.test(url.hostname)&&/^(?:\/|\/main\/main\.do|\/svc\/main\/index\.do)$/i.test(url.pathname))continue;
   return url.href;
  }catch{}
 }
 return null;
}
function searchUrl(title){
 const url=new URL('/search/search_list.do',VISIT_KOREA);
 url.searchParams.set('keyword',title);
 return url.href;
}
async function details(key,id){
 if(!id)return {};
 const url=new URL('https://apis.data.go.kr/B551011/KorService2/detailCommon2');
 const params={serviceKey:key,MobileOS:'ETC',MobileApp:'NADLE',_type:'json',contentId:id,defaultYN:'Y',overviewYN:'Y',numOfRows:'1',pageNo:'1'};
 for(const [name,value] of Object.entries(params))url.searchParams.set(name,value);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4500);
 try{
  const response=await fetch(url,{signal:controller.signal});
  if(!response.ok)return {};
  const data=await response.json();
  const raw=data.response?.body?.items?.item;
  const item=Array.isArray(raw)?raw[0]:raw;
  if(!item)return {};
  const description=plain(item.overview).slice(0,2400);
  return {description,overview:description,homepage:officialUrl(item.homepage)};
 }catch{return {}}
 finally{clearTimeout(timeout)}
}
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
 const contentId=String(x.contentid||''),title=plain(x.title).slice(0,120);
 if(!title)continue;
 const verified=EVENT_PAGES[contentId];
 const direct=(verified?.[0]===startDate.slice(0,4)?verified[1]:null)||officialUrl(x.firstpage)||officialUrl(x.homepage);
 events.push({contentId,title,startDate,endDate,place:String(x.addr1||x.title||'').slice(0,130),lat,lon,type:'festival',family:false,url:direct||searchUrl(title),guideKind:direct?'detail':'search',source:'한국관광공사 TourAPI',distanceKm:Number(dist(lat,lon).toFixed(1))});
 }
 const enriched=await Promise.all(events.slice(0,35).map(e=>details(key,e.contentId)));
 enriched.forEach((detail,i)=>{
  const event=events[i];
  Object.assign(event,detail);
  if(event.guideKind==='search'&&detail.homepage){
   event.url=detail.homepage;
   event.guideKind='detail';
  }
 });
 sources.push({name:'TourAPI 축제',status:'ok',count:events.length,detailsEnriched:enriched.filter(x=>x.description).length});
 }catch(e){sources.push({name:'TourAPI 축제',status:'error',count:0})}
}else sources.push({name:'TourAPI 축제',status:'needs_key',count:0});
res.status(200).json({events,sources,checkedAt:new Date().toISOString(),origin:'용인 서천 힐스테이트 인근 (근사 좌표)',radiusKm:50,message:key?'공식 축제 데이터 조회 결과':'TOUR_API_KEY 환경변수 설정 후 자동 수집됩니다.'});
};
