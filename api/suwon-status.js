// Official public information-page connectivity diagnostic, NOT live availability.
const SOURCES=[{id:'suwon',url:'https://smuseum.suwon.go.kr/sw/contents/view?contentsNo=102&menuLevel=3&menuNo=83'},{id:'gwanggyo',url:'https://www.suwon.go.kr/web/reserv/index.do'}];
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const sources=await Promise.all(SOURCES.map(async s=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
  try{const response=await fetch(s.url,{method:'GET',redirect:'follow',signal:controller.signal,headers:{'User-Agent':'NADLE/8.0 public-information-check'}});
   return {...s,reachable:response.ok,httpStatus:response.status};
  }catch(e){return {...s,reachable:false,httpStatus:null,error:'connectivity_check_failed'};}finally{clearTimeout(timer)}
 }));
 res.status(200).json({verified:false,liveAvailability:false,checkedAt:new Date().toISOString(),sources,message:'연결 진단일 뿐 잔여석 조회가 아닙니다.'});
};
