/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/email', 'N/runtime'], function(search, email, runtime) {

    function beforeSubmit(context) {
        //Step 1: Valiate
        if (context.type !==context.UserEventType.CREATE) return;

        let vendName =context.newReocrd.getValue('entityid')
        let contact =context.newReocrd.getValue('contact')
        let location =context.newReocrd.getValue('location')

        if (!contact || !location) {
            throw new Error('Contact and Location are required fields.');
        }
        const vendorSearch = search.create({
            type: search.Type.VENDOR,
            filters: [['entityid', 'is', vendName]],
            columns: ['internalid']
          });
      
          const results = vendorSearch.run().getRange({ start: 0, end: 1 });
          if (results.length > 0) {
            throw new Error(`Vendor with name "${vendName}" already exists.`);
          }
    }
    function afterSubmit(context){
        //Step 2: Send Email
        if (context.type !==context.UserEventType.CREATE) return;
    
        let vendName =context.newReocrd.getValue('entityid')
        let currentUser =runtime.getCurrentUser().id;
        let subject ='A New Vendor has been Created';
        let recipient ='someoneinfinance@snail.com';
        let template =`${vendName} has been created`;
        
        email.send({
            author: currentUser,
            recipients: recipient,
            subject: subject,
            body: template
        });

        try {
            var fileContent = generateVendorFileContent(newVendorRecord);

            //Step 3: Configure SFTP
            const restletUrl = url.resolveScript({
              scriptId: 'customscript_sftpRest',
              deploymentId: 'customdeploy_sftpRest',
              returnExternalUrl: true
            });
      
            const response = https.post({
              url: restletUrl,
              headers: { 'Content-Type': 'application/json' },
              body: fileContent
            });
      
            log.audit('RESTlet Response', response.body);
          } catch (e) {
            log.error('RESTlet call failed', e);
          }
        
      };
      function generateVendorFileContent(vendorRecord) {
        var vendorData = {
            upload: true,
            id: vendorRecord.id,
            fileNmae: `${vendorRecord.getValue('companyname')}.pdf`,
            fileContents: "<base64 string>",
            fileType: 'pdf',
            // Add more fields as needed
        };

        return JSON.stringify(vendorData, null, 2);
    }

    return {
        beforeSubmit: beforeSubmit, afterSubmit: afterSubmit
    }
});
