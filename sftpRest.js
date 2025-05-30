/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/sftp', 'N/file', 'N/record', 'N/log'], (sftp, file, record, log) => {

  const sftpConfig = {
    username: 'sftp_user',
    passwordGuid: 'your_password_guid',
    url: 'sftp.yourserver.com',
    port: 22,
    hostKey: 'AAAAB3Nz...YOURHOSTKEY...',
    directory: '/vendors'
  };

  const SUPPORTED_TYPES = {
    PDF: file.Type.PDF,
    PLAINTEXT: file.Type.PLAINTEXT,
    CSV: file.Type.CSV,
    EXCEL: file.Type.EXCEL,
    WORD: file.Type.WORD
  };
  
  function post(body){
    const vendorId = body.vendorId;
    const fileName = body.fileName;
    const upload = body.upload || false;

    if (!vendorId || !fileName) {
      return { success: false, message: 'Missing vendorId or fileName.' };
    }

    try {
      let fileContents, fileType;
      
      //Techincally a bidirectional call to the SFTP to cover all scenarios ;)
      //Hence the upload flag

      if (upload === true) {
        // Upload directly from provided contents
        if (!body.fileContents || !body.fileType) {
          return { success: false, message: 'Missing fileContents or fileType.' };
        }

        fileContents = body.fileContents;
        fileType = SUPPORTED_TYPES[body.fileType.toUpperCase()];
        
        if (!fileType) {
          return { success: false, message: 'Unsupported file type.' };
        }

        log.audit('Direct Upload', `Uploading ${fileName} from client`);
      } else {
        // Pull from SFTP
        log.audit('SFTP Mode', `Connecting to SFTP for ${fileName}`);

        const sftpConnection = sftp.createConnection({
          username: sftpConfig.username,
          passwordGuid: sftpConfig.passwordGuid,
          url: sftpConfig.url,
          port: sftpConfig.port,
          hostKey: sftpConfig.hostKey,
          directory: sftpConfig.directory
        });

        const downloaded = sftpConnection.download({
          directory: sftpConfig.directory,
          filename: fileName
        });

        fileContents = downloaded.getContents();
        fileType = file.Type.PDF; // Assume PDF by default
      }

      const nsFile = file.create({
        name: fileName,
        fileType: fileType,
        contents: fileContents,
        folder: -15 // Attachments Received
      });

      const fileId = nsFile.save();

      record.attach({
        record: {
          type: 'file',
          id: fileId
        },
        to: {
          type: record.Type.VENDOR,
          id: vendorId
        }
      }
    );

      return {
        success: true,
        fileId,
        message: upload ? 'Uploaded and attached file to vendor.' : 'SFTP file downloaded and attached.'
      };

    } catch (e) {
      log.error('RESTlet Error', e);
      return { success: false, message: e.message };
    }
  };

  return { post };
});
