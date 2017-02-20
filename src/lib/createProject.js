/**
 * Creates a new project in google docs;
 *
 * The project is always stored in its own folder, which is a child of all streaks folder.
 * Each project has at least one spreadsheet file, where project log is saved.
 */
import getStreaksFolder from './getStreaksFolder';

export default createProject;

function createProject(name, columns) {
  return getStreaksFolder()
    .then(createProjectFolder)
    .then(createLogFile);

  function createProjectFolder(parent) {
    if (!parent) throw new Error('Parent was not specified');

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parent],
      properties: {
        createdByStreak: 'true'
      }
    };

    return gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }).then(response => response.result.id);
  }

  function createLogFile(parentFolderId) {
    const properties = {
      createdByStreak: 'true',
      columns: JSON.stringify(columns.map(column => ({
        name: column.name,
        type: column.type.value
      })))
    };

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [parentFolderId],
      properties
    };

    return gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }).then(response => {
      return response.result.id;
    }).then(spreadsheetId => updateSheetTemplate(spreadsheetId, name, columns))
      .then(() => parentFolderId);
  }
}

function updateSheetTemplate(spreadsheetId, name, columns) {
  // Since we've just created this template, the sheetId should be 0 (if I understand
  // this correctly).
  const sheetId = 0;

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requests: [{
      updateSheetProperties: {
        fields: 'title,gridProperties.frozenRowCount',
        properties: {
          sheetId,
          index: 0,
          title: name,
          gridProperties: {
            // We want the first row to be frozen
            frozenRowCount: 1,
          },
        }
      }
    }, {
      appendCells: {
        sheetId,
        fields: '*',
        rows: [{
          values: columns.map(column => header(column.name))
        }]
      }
    }]
  }).then(() => spreadsheetId);
}


function header(text) {
  return {
    userEnteredValue: {
      stringValue: text
    },
    userEnteredFormat: {
      horizontalAlignment: 'CENTER',
      textFormat: {
        bold: true,
      },
    },
  };
}
