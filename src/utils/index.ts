import * as ts from 'typescript';
import { Change, findNodes, NoopChange, insertAfterLastOccurrence, InsertChange } from 'schematics-utilities';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';

/**
 * Список доступных платформ.
 */
export enum Platforms {
  web = 'web',
  ionic = 'ionic'
}

/**
 * Возвращает список платформ, если платформы не указаны вернет значение по умолчанию.
 * @param options {any}
 * @param defs {Platforms[]}
 */
export function parsePlatforms(options: any, defs: Platforms[] = [Platforms.web, Platforms.ionic]) {
  let platforms: Platforms[] = defs;

  if (options.platforms) {
    platforms = options.platforms
      .split(',')
      .map((platform: string) => platform.toLowerCase())
      .filter((platform: any) => Boolean(Platforms[platform]))
      .map((platform: any) => Platforms[platform]);
  }

  return platforms;
}

/**
 * Комитит изменения в файл.
 * @param tree {Tree}
 * @param change {Change}
 * @param pathFile {string}
 */
export function commitChange(tree: Tree, change: Change, pathFile: string) {
  if (change instanceof InsertChange) {
    const recorder = tree.beginUpdate(pathFile);
    recorder.insertLeft(change.pos, change.toAdd);

    tree.commitUpdate(recorder);
  }
}

/**
 * Генерация строки экспорта
 *
 * `export * from 'filename';`
 *
 * @param source
 * @param fileToEdit
 * @param symbolName
 * @param fileName
 */
export function insertExport(
  source: ts.SourceFile,
  fileToEdit: string,
  symbolName: string | undefined,
  fileName: string
): Change {
  const rootNode = source;
  const allExports = findNodes(rootNode, ts.SyntaxKind.ExportDeclaration);

  // получаем все export узлы
  const relevantExports = allExports.filter(node => {
    // собираем экспортированные файлы
    const exportFiles = node
      .getChildren()
      .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
      .map(n => (n as ts.StringLiteral).text);

    // проверяем, подключен ли fileName
    return exportFiles.some(file => file === fileName);
  });

  // если fileName уже подключен
  if (relevantExports.length > 0) {
    let exportsAsterisk: boolean = false;
    // массив экспортов из файла
    const exports: ts.Node[] = [];
    relevantExports.forEach(node => {
      // ищем все экспортированные идентификаторы из файла и добавляем в массив
      exports.push(...findNodes(node, ts.SyntaxKind.Identifier));

      // ищем звездочку
      if (findNodes(node, ts.SyntaxKind.AsteriskToken).length > 0) {
        exportsAsterisk = true;
      }
    });

    // если export * fileName, ничего не делаем
    if (exportsAsterisk) {
      return new NoopChange();
    }

    // ищем symbolName среди экспортированных идентификаторов
    const exportTextNodes = exports.filter(node => (node as ts.Identifier).text === symbolName);

    // не нашли symbolName
    if (exportTextNodes.length === 0) {
      const fallbackPos =
        findNodes(relevantExports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
        findNodes(relevantExports[0], ts.SyntaxKind.FromKeyword)[0].getStart();

      return insertAfterLastOccurrence(exports, `, ${symbolName}`, fileToEdit, fallbackPos);
    }

    return new NoopChange();
  }

  const open = symbolName === void 0 ? '' : '{ ';
  const close = symbolName === void 0 ? '' : ' }';
  symbolName = symbolName === void 0 ? '*' : symbolName;

  const insertAtBeginning = allExports.length === 0;
  const separator = insertAtBeginning ? '' : ';\n';
  const toInsert = `${separator}export ${open}${symbolName}${close} from '${fileName}'`;

  return insertAfterLastOccurrence(allExports, toInsert, fileToEdit, 0, ts.SyntaxKind.StringLiteral);
}
