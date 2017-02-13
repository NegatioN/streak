export default getStreaksFolder;

const ROOT_FOLDER_NAME = 'Streaks';
const ROOT_FOLDER_MARKER = 'isAnvakaStreakFolderRoot';
let parentStreakFolder;
let isRunning = false;

/**
 * Gets or creates a folder that is a root of all streak projects
 */
function getStreaksFolder() {
  if (parentStreakFolder) {
    // TODO: This promise may be different from gapi.promise
    return new Promise((resolve) => resolve(parentStreakFolder));
  }
  if (isRunning) throw new Error('You are getting into race conditions. Make sure only one folder can exist here');

  isRunning = true;

  return gapi.client.drive.files.list({
    q: `trashed = false and properties has { key='${ROOT_FOLDER_MARKER}' and value='true' }`,
    pageSize: 1,
    fields: 'files(id, name)'
  }).then((response) => {
    const files = response.result.files;
    if (files.length === 0) {
      return makeNewRootFolder().then(folderId => {
        parentStreakFolder = folderId;
        isRunning = false;
        return folderId;
      });
    }

    isRunning = false;
    parentStreakFolder = files[0].id;

    return parentStreakFolder;
  });
}

function makeNewRootFolder() {
  const fileMetadata = {
    name: ROOT_FOLDER_NAME,
    description: 'This folder contains all your "streak" projects',
    mimeType: 'application/vnd.google-apps.folder',
    properties: {
      [ROOT_FOLDER_MARKER]: 'true'
    }
  };

  return gapi.client.drive.files.create({
    resource: fileMetadata,
    fields: 'id'
  }).then(response => response.result.id);
}
