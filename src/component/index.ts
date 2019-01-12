import { Rule, chain, apply, url, template, move, mergeWith, filter } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { getWorkspace, WorkspaceSchema, WorkspaceProject, buildDefaultPath, parseName, buildSelector, validateName, validateHtmlSelector } from 'schematics-utilities';
import { strings } from '@angular-devkit/core';
import { parsePlatforms, Platforms } from '../utils';
import { formatFiles } from '../utils/rules/format-files';

/**
 * Генерация компонента.
 *
 * Последовательность действий генератора:
 *  1. найти проект который был указан через опцию `--project` и определить все нужные директории.
 *  2. собрать структуру компонента из шаблона и разместить его в ранее определенной директории проекта.
 *
 * Как использовать:
 * `ng g tr:component <name> --project=<proj_name> [--platforms=<platform>,<platform>] [--base]`
 *
 * @param options {any}
 */
export function component(options: any): Rule {
  return chain([
    /** step 1 */ (tree: Tree) => {
      const workspace: WorkspaceSchema = getWorkspace(tree);
      const project: WorkspaceProject = workspace.projects[options.project];
      options.path = buildDefaultPath(project);

      const parsedPath = parseName(options.path, options.name);
      options.name = parsedPath.name;
      options.path = parsedPath.path;
      options.selector = options.selector || buildSelector(options, '');

      const platforms: Platforms[] = parsePlatforms(options);
      options.platforms = platforms;

      validateName(options.name);
      validateHtmlSelector(options.selector);

      return tree;
    },
    /** step 2 */ () => {
      const basePlatformRegExp: RegExp = new RegExp(`(${Object.values(Platforms).join('|')})`);
      const platformRegExp: RegExp = new RegExp(`(${options.platforms.join('|')})`);
      const templateSource = apply(url('./files'), [
        // если указана опцию base
        options.base
          // найти все файлы которые не содержат в названии имена платформ
          ? filter(path => !Boolean(path.match(basePlatformRegExp)))
          // иначе взять все кроме общего компонента
          : filter(path => {
            return Boolean(path.match(platformRegExp))
              || path.startsWith('styles/style-base', 28)
              || path.startsWith('classes', 28);
          }),
        template({
          ...strings,
          'if-flat': (s: string) => options.flat ? '' : s,
          ...options,
        }),
        move(options.path)
      ]);

      return mergeWith(templateSource);
    },
    formatFiles()
  ]);
}
