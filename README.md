# (1) Guild Vendor Validation SFTP & Direct Upload

## 📋 Description

This SuiteScript 2.1 solution automates Vendor validation and file transfer via sftp in NetSuite

Detailed Script attached as **vendValidation.js**

---

## 🚀 Features

- ✅ Vallidates Vendor data
- ✅ Sends notification email to Finance when new vendor is created
- ✅ Connects to SFTP (upload/download)
- ✅ Supports multiple file types: PDF, CSV, PLAINTEXT, EXCEL, WORD
- ✅ Attaches files to vendor record upon creation
- ✅ Logs actions and errors using `N/log`

---

# (2) WorkFlow Design
Attached  as **billApp.png**


# (3) Integration Recomendations
With either tool the first step would be to gather all credentials:

    **username**: 'sftp_user',
    **passwordGuid**: 'your_password_guid',
    **url**: 'sftp.yourserver.com',
    **port**: 22,
    **hostKey**: 'AAAAB3Nz...YOURHOSTKEY...',
    **directory**: '/vendors'

For this written example, I'll be working with a **Restlet**
You can also refer to the **sftpRest.js** file attached for a more detailed approach.

Data validatoin and error handling will be done in Javascript once requirements have been gatnered.
Addiotional system checks/audits will be handled by a third party logging tools (e.g. DataDog ) that will validate all systems
and make the process SOX complaint by exposing the underlying request data.


**Input (upload from client)**:
```json
{
  "upload": true,
  "vendorId": "123",
  "fileName": "invoice.pdf",
  "fileContents": "<base64 or raw>",
  "fileType": "PDF"
}


