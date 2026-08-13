function createGroup_(p){
  ensureHeaders_();
  const id='GRP-'+Utilities.getUuid().slice(0,8).toUpperCase();
  appendRow_(SHEETS.GROUPS,[id,p.name,p.description||'',true,new Date()]);
  return {ok:true,groupId:id};
}

function saveFormField_(p){
  ensureHeaders_();
  const id=p.fieldId || 'FLD-'+Utilities.getUuid().slice(0,8).toUpperCase();
  appendRow_(SHEETS.FORM_FIELDS,[
    id,p.groupId,p.page||1,p.sortOrder||1,p.type,p.code||'',p.label,
    !!p.required,(p.accept||[]).join(','),p.maxMB||10,
    p.replaceAllowed!==false,!!p.hrApproval,p.active!==false
  ]);
  return {ok:true,fieldId:id};
}

function createApplicationLink_(p){
  ensureHeaders_();
  const token=Utilities.getUuid().replace(/-/g,'').slice(0,20).toUpperCase();
  const expires=new Date(Date.now()+(Number(p.days||7)*86400000));
  appendRow_(SHEETS.LINKS,[token,p.groupId,p.name||'',expires,true,new Date()]);
  return {ok:true,token,expiresAt:expires.toISOString()};
}

function getForm_(token){
  ensureHeaders_();
  const rows=sheet_(SHEETS.LINKS).getDataRange().getValues();
  const now=new Date();
  const link=rows.slice(1).find(r=>String(r[0])===String(token)&&r[4]===true&&new Date(r[3])>now);
  if(!link) return {ok:false,error:'INVALID_OR_EXPIRED_TOKEN'};
  const fields=sheet_(SHEETS.FORM_FIELDS).getDataRange().getValues().slice(1)
    .filter(r=>String(r[1])===String(link[1])&&r[12]!==false)
    .sort((a,b)=>(a[2]-b[2])||(a[3]-b[3]))
    .map(r=>({fieldId:r[0],groupId:r[1],page:r[2],sortOrder:r[3],type:r[4],code:r[5],label:r[6],required:r[7],accept:r[8]?String(r[8]).split(','):[],maxMB:r[9],replaceAllowed:r[10],hrApproval:r[11]}));
  return {ok:true,groupId:link[1],fields};
}
