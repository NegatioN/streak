import getStreaksFolder from './getStreaksFolder';
import gapiFiles from './gapi/files.js';
import { getParentFolder } from './store/sheetIdToFolder.js';
import { resetProjectFileCache } from './store/cachingDocs.js';

const projectList = {
  error: null,
  loading: true,
  projects: [],
};

export default projectList;

/**
 * Lists all projects in the current user account.
 *
 * TODO: I think this should be the root of application model data. Actual
 * project models (loadProject() results) should live here in the subtree.
 */
export function loadProjects() {
  return getStreaksFolder().then(listFiles);
}

function listFiles(parentId) {
  return new Promise((resolve, reject) => {
    gapi.client.drive.files.list({
      q: `trashed = false and '${parentId}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)'
    }).then((response) => {
      const files = response.result.files;
      projectList.projects = files;
      projectList.loading = false;
      resolve(projectList);
    }, reject);
  });
}

/**
 * Updates existing project. Currently only allows to change name/description
 * Can be extended to change columns, etc.
 *
 * TODO: should probably take projectId, not sheetId?
 */
export function updateNameAndDescription(sheetId, name, description) {
  // rename both parent folder and sheet id for consistency
  const parentFolder = getParentFolder(sheetId);

  if (!parentFolder) throw new Error(`Missing parent folder for ${sheetId}`);

  return Promise.all([
    rename(sheetId, name, description),
    rename(parentFolder, name, description)
  ]).then(all => {
    resetProjectFileCache(parentFolder);
    updateNameInLocalCache(parentFolder, name);
    return all;
  });

  function rename(fileId, name, description) {
    gapiFiles('update', {
      fileId,
      resource: {
        name,
        description
      }
    });
  }
}

function updateNameInLocalCache(projectId, name) {
  const project = findPorject(projectId);
  if (project) {
    // This will update project name only locally. Remote names
    // are updated by updateNameAndDescription() call.
    project.name = name;
  }
}

function findPorject(projectId) {
  const { projects } = projectList;

  for (let i = 0; i < projects.length; ++i) {
    if (projects[i].id === projectId) return projects[i];
  }
}