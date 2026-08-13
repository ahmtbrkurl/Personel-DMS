function getManage_(token){
  ensureHeaders_();
  const rows=sheet_(SHEETS.PERSONNEL).getDataRange().getValues();
  const r=rows.slice(1).find(x=>String(x[10])===String(token));
  if(!r) return {ok:false,error:'INVALID_MANAGE_TOKEN'};
  const docs=sheet_(SHEETS.DOCUMENTS).getDataRange().getValues().slice(1)
    .filter(x=>String(x[0])===String(r[0]))
    .map(x=>({code:x[1],fileId:x[2],fileName:x[3],version:x[4],status:x[5],updatedAt:x[6]}));
  return {ok:true,person:{personId:r[0],firstName:r[3],lastName:r[4],groupId:r[1],status:r[9]},documents:docs};
}

function replaceDocument_(p){
  // Production endpoint should receive a server-side file/blob reference.
  // This function intentionally requires validated backend upload handling.
  // Never accept an arbitrary Drive file ID from an untrusted browser.
  return {ok:false,error:'UPLOAD_ENDPOINT_REQUIRES_MULTIPART_BACKEND_IMPLEMENTATION'};
}
