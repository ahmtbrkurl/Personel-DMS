function newPersonId_(){
  const s=sheet_(SHEETS.PERSONNEL);
  const n=Math.max(1,s.getLastRow());
  return `PER-${new Date().getFullYear()}-${String(n).padStart(6,'0')}`;
}

function createPersonnel_(p){
  ensureHeaders_();
  const personId=newPersonId_();
  const person={
    personId, groupId:p.groupId, formVersion:p.formVersion||'1.0',
    firstName:p.firstName,lastName:p.lastName,nationalId:p.nationalId,
    passportNumber:p.passportNumber||'',phone:p.phone||'',status:'IN_PROGRESS'
  };
  const folder=createPersonFolder_(person);
  const manageToken=Utilities.getUuid().replace(/-/g,'').slice(0,32).toUpperCase();
  appendRow_(SHEETS.PERSONNEL,[personId,person.groupId,person.formVersion,person.firstName,person.lastName,
    person.nationalId,person.passportNumber,person.phone,folder.getId(),person.status,manageToken,new Date(),new Date()]);
  appendRow_(SHEETS.DOCUMENT_LOG,[new Date(),personId,person.groupId,'SYSTEM','PERSON_CREATED',1,'','', 'SYSTEM','']);
  return {ok:true,personId,folderId:folder.getId(),manageToken};
}
