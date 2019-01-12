import { Rule, chain, Tree, apply, url, template, move, mergeWith, filter, noop } from '@angular-devkit/schematics';
import { WorkspaceSchema, getWorkspace, WorkspaceProject, buildDefaultPath, parseName, InsertChange, Change, findNodes, insertAfterLastOccurrence, insertImport, readIntoSourceFile, findNode } from 'schematics-utilities';
import { strings, normalize } from '@angular-devkit/core';
import * as ts from 'typescript';
import { insertExport, commitChange } from '../utils';
import { plural } from 'pluralize';
import { formatFiles, FormatType } from '../utils/rules/format-files';


/**
 * Генерация ngrx состояния.
 *
 * Последовательность действия генератора:
 *
 *
 * @param options {any}
 */
export function state(options: any): Rule {
  let shared: any = null;

  const as = `from${plural(strings.classify(options.name))}`;
  const propertyName = plural(strings.camelize(options.name));

  /**
   * Добавляет экспорт в index файл для модуля.
   * @param tree {Tree}
   * @param pathIndex {string} - в какой файл добавляем экспорт
   * @param pathExport {string} - путь до файла который экспортим
   */
  function addExportInIndexFileForModule(tree: Tree, pathIndex: string, pathExport: string): Tree {
    let sourceText: string;

    if (!tree.exists(pathIndex)) {
      tree.create(pathIndex, `export * from '${pathExport}'`);
      return tree;
    }

    const buffer: Buffer | null = tree.read(pathIndex);
    sourceText = buffer ? buffer.toString('utf-8') : '';

    const source: ts.SourceFile = ts.createSourceFile(pathIndex, sourceText, ts.ScriptTarget.Latest, true);
    const change: Change = insertExport(source, pathIndex, undefined, pathExport);

    commitChange(tree, change, pathIndex);

    return tree;
  }

  /**
   * Добавляет редуктор в модуль.
   * @param tree {Tree}
   * @param pathIndex {string}
   * @param pathImport {string}
   */
  function addReducerDeclarationForModule(tree: Tree, pathIndex: string, pathImport: string): Tree {
    if (!tree.exists(pathIndex)) {
      throw new Error(`В модуле не найден файл index для reducer (${pathIndex})`);
    }

    /** добавление импорта */ (() => {
      const source: ts.SourceFile = readIntoSourceFile(tree, pathIndex);
      const change: Change = insertImport(source, pathIndex, `* as ${as}`, pathImport, true);

      commitChange(tree, change, pathIndex);
    })();

    /** добавление записи в интерфейс стейта */(() => {
      const source: ts.SourceFile = readIntoSourceFile(tree, pathIndex);
      const allInterfaces = findNodes(source, ts.SyntaxKind.InterfaceDeclaration, 1);

      if (allInterfaces.length === 0) {
        throw new Error(`В reducer не указан интефейс состояния`);
      }

      const stateInterface: ts.InterfaceDeclaration = allInterfaces[0] as ts.InterfaceDeclaration;
      const props = stateInterface.members.filter(node => node.kind === ts.SyntaxKind.PropertySignature);

      if (props.map((node) => node.getChildAt(0)).filter(node => node.getText() === propertyName).length > 0) {
        return;
      }

      const range: ts.TextRange = { pos: stateInterface.members.pos, end: stateInterface.members.end };
      const prop = `${propertyName}: ${as}.${strings.classify(options.name)}State`;
      const toAdd = `\n  ${prop};`;

      const change = props.length === 0
        ? new InsertChange(pathIndex, range.end, toAdd)
        : insertAfterLastOccurrence(props, toAdd, pathIndex, range.end, ts.SyntaxKind.PropertySignature);

      commitChange(tree, change, pathIndex);
    })();

    /** добавление записи в reducers */ (() => {
      const source: ts.SourceFile = readIntoSourceFile(tree, pathIndex);
      const allVariables = findNodes(source, ts.SyntaxKind.VariableDeclarationList);

      // ищем переменую reducers
      const relevantReducers = allVariables.filter(node => {
        return findNode(node, ts.SyntaxKind.Identifier, 'reducers');
      });

      if (relevantReducers.length === 0) {
        throw new Error(`Не удалось найти переменную 'reducers' в файле ${pathIndex}`);
      }

      const reduceNode: ts.Node = relevantReducers[0];
      const resolveObjectLiteral: ts.Node[] = findNodes(reduceNode, ts.SyntaxKind.ObjectLiteralExpression);

      if (resolveObjectLiteral.length === 0) {
        throw new Error(`У переменной 'reducers' в файле ${pathIndex} не определено значение, присвойте ей пустой объект {}`);
      }

      const objectLiteral: ts.ObjectLiteralExpression = resolveObjectLiteral[0] as ts.ObjectLiteralExpression;
      const allProps: ts.NodeArray<ts.Node> = objectLiteral.properties;

      // ищем текущую переменую объявленную в reducers { <my property name> }
      const relevantProperty: ts.Node[] = allProps.filter(prop => findNode(prop, ts.SyntaxKind.Identifier, propertyName));

      if (relevantProperty.length > 0) {
        return;
      }

      const fallbackPos: number = allProps.slice(-1).map(prop => prop.getEnd())[0] || allProps.end;
      const insertAtFirst: boolean = allProps.length === 0;
      const separator: string = insertAtFirst ? '' : ',\n  ';
      const toInsert: string = `${separator}${propertyName}: ${as}.${strings.classify(options.name)}Reducer`;
      const change: InsertChange = new InsertChange(pathIndex, fallbackPos, toInsert);

      commitChange(tree, change, pathIndex);

    })();

    return tree;
  }

  /**
   * Добавляет селектор в модуль.
   * @param tree {Tree}
   * @param pathIndex {string}
   * @param pathImport {string}
   */
  function addSelectorDeclarationForModule(tree: Tree, pathIndex: string, pathImport: string): Tree {
    if (!tree.exists(pathIndex)) {
      throw new Error(`В модуле не найден файл index для selectors (${pathIndex})`);
    }

    /** добавление импорта */(() => {
      const source: ts.SourceFile = readIntoSourceFile(tree, pathIndex);
      const change: Change = insertImport(source, pathIndex, `get${strings.classify(options.name)}Selectors`, pathImport);

      commitChange(tree, change, pathIndex);
    })();

    /** объявление константы */(() => {
      const source: ts.SourceFile = readIntoSourceFile(tree, pathIndex);
      const allVariables: ts.Node[] = findNodes(source, ts.SyntaxKind.VariableDeclarationList);

      const relevantFeatureSelector = allVariables.filter(node => {
        return findNode(node, ts.SyntaxKind.Identifier, 'createFeatureSelector');
      });

      if (relevantFeatureSelector.length === 0) {
        throw new Error(`В файле ${pathIndex} не найдено определение createFeatureSelector`);
      }

      const featureSelectorNode: ts.Node = relevantFeatureSelector[0];
      const featureSelectorIdentifier: ts.Identifier = <ts.Identifier>(findNodes(featureSelectorNode, ts.SyntaxKind.Identifier, 1)[0]);
      const constName = `${strings.camelize(options.name)}Selector`;

      if (findNode(source, ts.SyntaxKind.Identifier, constName)) {
        return tree;
      }

      const toInsert =
        `export const ${constName} = get${strings.classify(options.name)}Selectors(${featureSelectorIdentifier.text}, '${propertyName}');\n`;

      const change: Change = new InsertChange(pathIndex, source.end, toInsert);

      commitChange(tree, change, pathIndex);
    })();

    return tree;
  }

  return chain([
    /** step 1 */ (tree: Tree) => {
      const workspace: WorkspaceSchema = getWorkspace(tree);
      const project: WorkspaceProject = workspace.projects[options.project];
      options.path = buildDefaultPath(project);

      const parsedPath = parseName(options.path, options.name);
      options.name = parsedPath.name;
      options.path = parsedPath.path;

      if (options.shared) {
        shared = {};
        shared.project = workspace.projects.shared;
        shared.path = buildDefaultPath(shared.project);

        const parseSharedPath = parseName(shared.path, 'shared');
        shared.name = parseSharedPath.name;
        shared.path = parseSharedPath.path;
      }

      options.names = {
        def: options.name,
        camelize: strings.camelize(options.name),
        dasherize: strings.dasherize(options.name),
        classify: strings.classify(options.name),
        plural: plural(strings.camelize(options.name))
      };

      return tree;
    },
    /** step 2 */ () => {
      const templateSource = apply(url('./files'), [
        !options.service ? filter(path => !(path.endsWith('service.ts') || path.endsWith('effect.ts'))) : noop(),
        template({
          ...strings,
          ...options,
          as,
          propertyName
        }),
        move(shared ? shared.path : options.path)
      ]);

      return mergeWith(templateSource);
    },
    /** step 3 */ (tree: Tree) => {

      for (const key of ['action', 'effect', 'model', 'reducer', 'selector']) {
        const pathIndex: string = normalize(`${options.path}/${key}s/index.ts`);
        const resolve: string = options.shared ? '@tr/shared' : `${options.path}`;
        const pathExport: string = `${resolve}/${key}s/${options.names.dasherize}.${key}`;

        switch(key) {
          case 'action':
          case 'effect':
          case 'model':
            tree = addExportInIndexFileForModule(tree, pathIndex, pathExport);
          break;
          case 'reducer':
            tree = addReducerDeclarationForModule(tree, pathIndex, pathExport);
          break;
          case 'selector':
            tree = addSelectorDeclarationForModule(tree, pathIndex, pathExport);
          break;
        }
      }

      return tree;
    },
    formatFiles(FormatType.untracked),
    formatFiles(FormatType.uncommitted)
  ]);
}
