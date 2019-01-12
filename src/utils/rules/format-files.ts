import { TaskConfigurationGenerator, TaskConfiguration, Rule, SchematicContext } from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics/src/tree/interface';

export enum FormatType {
  untracked,
  uncommitted
}

class FormatFiles implements TaskConfigurationGenerator<any> {
  constructor(private type: FormatType = FormatType.untracked) { }

  formatOptions() {
    return `--${FormatType[this.type]}`;
  }

  toConfiguration(): TaskConfiguration<any> {
    return {
      name: 'node-package',
      options: {
        packageName: `run format -- ${this.formatOptions()}`,
        quiet: true
      }
    }
  }
}

export function formatFiles(options?: FormatType): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new FormatFiles(options));
    return tree;
  }
}
