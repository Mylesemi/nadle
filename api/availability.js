// NADLE: public, same-day reservation table adapter. No credentials or bypass.
const SOURCE='https://www.namuk.or.kr/kr/1333/subview.do';
const TIMES=['10:10~11:10','11:30~12:30','13:40~14:40','15:10~16:10','16:40~17:40'];
const labels=TIMES.map((time,i)=>({label:`${i+1}회차`,time:time.replace('~',' ~ ')}));
function todayKST(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function decode(s){return s.replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function parse(html){
 const plain=decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' '));
 const start=plain.indexOf('오늘의 관람예약 현황');
 if(start<0)throw Error('reservation heading missing');
 const end=plain.indexOf('어린이박물관 예약 바로가기',start);
 if(end<0||end-start>3500)throw Error('reservation table bounds missing');
 const block=plain.slice(start,end);
 const re=/([1-5])\s*회차\s*(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})\s*(\d+)\s*\/\s*(\d+)\s*명/g;
 const found=[...block.matchAll(re)];
 if(found.length!==5)throw Error('expected exactly five sessions');
 return found.map((m,i)=>{
  const time=`${m[2]}~${m[3]}`;const remaining=Number(m[4]);const total=Number(m[5]);
  if(Number(m[1])!==i+1||time!==TIMES[i]||total!==55||remaining<0||remaining>total)throw Error('unexpected session structure');
  return {...labels[i],remaining,total};
 });
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 const date=String(req.query.date||'');
 const unknown=(reason)=>({verified:false,date,sessions:[],reason});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return res.status(400).json(unknown('Invalid date'));
 if(date!==todayKST())return res.status(200).json(unknown('Official public table covers today only'));
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
  let response;
  try{response=await fetch(SOURCE,{signal:controller.signal,headers:{'Accept':'text/html','User-Agent':'NADLE-ReservationDashboard/3.0'}})}finally{clearTimeout(timer)}
  if(!response.ok)throw Error('Official page HTTP '+response.status);
  const html=await response.text();
  const sessions=parse(html);
  return res.status(200).json({verified:true,date,checkedAt:new Date().toISOString(),source:SOURCE,sessions});
 }catch(err){return res.status(200).json(unknown('Official page unavailable or layout changed'));}
};
module.exports._parse=parse;
