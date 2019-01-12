import { Rule, chain, schematic, template, url, apply, mergeWith, filter, Tree, move } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { parsePlatforms, Platforms } from '../utils';
import { WorkspaceSchema, getWorkspace, WorkspaceProject, buildDefaultPath, parseName, validateName } from 'schematics-utilities';
import { formatFiles } from '../utils/rules/format-files';

/**
 * Генерация контейнера.
 *
 * Последовательность действий генератора:
 *  1. найти проект и определить все директории.
 *  2. сгенерировать файлы модулей на основе параметров --base и --platforms
 *  3. сгенерировать компонент контейнера
 *
 * Как использовать:
 *  `ng g tr:container <name> [--platforms=<platform>,<platform>] [--base]`
 *
 * @param options {any}
 */
export function container(options: any): Rule {
  const prefix = options.flat ? '' : 'containers/';
  options.postfixName = options.postfixName ? options.postfixName : 'container';
  options.name = options.project ? `${prefix}${options.name}` : options.name;
  options.project = options.project ? options.project : 'containers';

  return chain([
    /** step 1 */ (tree: Tree) => {
      const workspace: WorkspaceSchema = getWorkspace(tree);
      const project: WorkspaceProject = workspace.projects[options.project];
      options.path = buildDefaultPath(project);

      const parsedPath = parseName(options.path, options.name);
      options.name = parsedPath.name;
      options.path = parsedPath.path;

      const platforms: Platforms[] = parsePlatforms(options);
      options.platforms = platforms;

      validateName(options.name);

      return tree;
    },
    /** step 2 */ () => {
      const basePlatformRegExp: RegExp = new RegExp(`(${Object.values(Platforms).join('|')})`);

      const platformRegExp: RegExp = new RegExp(`(${options.platforms.join('|')})`);

      const templateSource = apply(url('./files'), [
        // если указан флаг - базовый
        options.base
          ? filter(path => !Boolean(path.match(basePlatformRegExp)))
          : filter(path => Boolean(path.match(platformRegExp))),
        template({
          ...options,
          ...strings
        }),
        move(options.path)
      ]);

      return mergeWith(templateSource);
    },
    /** step 3 */ schematic('component', {
      ...options,
      flat: false
    }),
    formatFiles()
  ]);
}
