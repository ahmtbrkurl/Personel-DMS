function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, service:'STS Personnel Document System', version:'1.0'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;

    if (action === 'getForm') return json_(getForm_(payload.token));
    if (action === 'createLink') return json_(createApplicationLink_(payload));
    if (action === 'createGroup') return json_(createGroup_(payload));
    if (action === 'saveField') return json_(saveFormField_(payload));
    if (action === 'getManage') return json_(getManage_(payload.token));
    if (action === 'replaceDocument') return json_(replaceDocument_(payload));

    return json_({ok:false,error:'UNKNOWN_ACTION'});
  } catch (err) {
    return json_({ok:false,error:String(err),stack:err.stack});
  }
}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
