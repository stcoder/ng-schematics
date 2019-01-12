import { Rule, chain, schematic, noop, Tree } from '@angular-devkit/schematics';
import { ModuleOptions, findModuleFromOptions, WorkspaceSchema, getWorkspace, WorkspaceProject, buildDefaultPath, readIntoSourceFile, addExportToModule, buildRelativePath, InsertChange } from 'schematics-utilities';
import { strings } from '@angular-devkit/core';
import { Platforms, parsePlatforms } from '../utils';
import { formatFiles } from '../utils/rules/format-files';

/**
 * Генерация sdk компонента.
 *
 * Последовательность действий генератора:
 *  1. генерируем компонент на основе component schematics.
 *  2. если указан параметр `--base` то подключать компонент в соответствующие базовые модули sdk.
 *
 * Как использовать:
 *  `ng g tr:sdk <name> [--component:base] [--platforms=<platform>,<platform>] [--base]`
 *
 * @param options {any}
 */
export function sdk(options: any): Rule {
  options.name = options.project ? `sdk/${options.name}` : options.name;
  options.project = options.project ? options.project : 'sdk';

  /**
   * Имя файла компонента.
   * @param platform {Platforms}
   * @return {string}
   */
  function componentNamePath(platform?: Platforms): string {
    return strings.dasherize(`${options.name}${platform ? ' ' + platform : ''}.component`)
  }

  /**
   * Класс компонента.
   * @param platform {Platforms}
   * @return {string}
   */
  function componentClassName(platform?: Platforms): string {
    return strings.classify(`${options.name} ${platform ? platform : ''} component`);
  }

  /**
   * Возвращает путь до компонента.
   * @param projectPath {string}
   * @return {string}
   */
  function componentPath(projectPath: string, platform?: Platforms): string {
    return `/${projectPath}/${strings.dasherize(options.name)}/components/${componentNamePath(platform)}`;
  }

  /**
   * Добавляет sdk компонент в модуль в зависимости от платформы.
   * @param tree {Tree}
   * @param projectPath {string}
   * @param platform {Platforms}
   * @return {Tree}
   */
  function addComponentToModule(tree: Tree, projectPath: string, platform: Platforms = <Platforms>''): Tree {
    // ищем путь до модуля
    const modulePath: string = <string>findModuleFromOptions(tree, <ModuleOptions>{
      module: `${strings.dasherize('sdk' + (platform ? ` ${platform}` : ''))}.module.ts`,
      path: projectPath
    });
    const moduleSource = readIntoSourceFile(tree, modulePath);
    const relativePath = buildRelativePath(modulePath, componentPath(projectPath, platform));
    const changes = addExportToModule(moduleSource, modulePath, strings.classify(componentClassName(platform)), relativePath);

    const record = tree.beginUpdate(modulePath);

      for(const change of changes) {
        if (change instanceof InsertChange) {
          record.insertLeft(change.pos, change.toAdd);
        }
      }

      tree.commitUpdate(record);

      return tree;
  }

  return chain([
    /** step 1 */ schematic('component', {
      ...options,
      base: (options.base && !options.platforms) || options['component:base']
    }),
    options.base ? /** step 2 */ (tree: Tree) => {
      const workspace: WorkspaceSchema = getWorkspace(tree);
      const project: WorkspaceProject = workspace.projects[options.project];
      const projectPath = buildDefaultPath(project);

      if (options.platforms) {
        const platforms = parsePlatforms(options);

        for (const platform of platforms) {
          tree = addComponentToModule(tree, projectPath, platform);
        }
      } else {
        tree = addComponentToModule(tree, projectPath)
      }

      return tree;

    } : noop(),
    formatFiles()
  ]);
}
