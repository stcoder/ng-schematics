import { Rule, chain, schematic } from '@angular-devkit/schematics';
import { formatFiles } from '../utils/rules/format-files';
import { WorkspaceSchema, getWorkspace, WorkspaceProject, buildDefaultPath, parseName, validateName } from 'schematics-utilities';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';

export function page(options: any): Rule {
  options.flat = true;
  options.name = `pages/${options.name}`;

  return chain([
    /** step 1 */(tree: Tree) => {
      const workspace: WorkspaceSchema = getWorkspace(tree);
      const project: WorkspaceProject = workspace.projects[options.project];
      options.path = buildDefaultPath(project);

      const parsedPath = parseName(options.path, options.name);
      options.name = parsedPath.name;
      options.path = parsedPath.path;

      validateName(options.name);

      return tree;
    },
    /** step 1 */ schematic('container', {
      ...options,
      postfixName: 'page'
    }),
    formatFiles()
  ]);
}
