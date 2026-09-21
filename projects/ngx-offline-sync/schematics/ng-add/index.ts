import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';

import { Schema } from './schema';

const SERVICE_WORKER_FILE = 'ngx-offline-sync-sw.js';

export function ngAdd(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists('/angular.json')) {
      throw new SchematicsException(
        'Could not find angular.json. ngx-offline-sync requires an Angular workspace.',
      );
    }

    const angularJson = JSON.parse(tree.readText('/angular.json'));

    const projects = angularJson.projects ?? {};

    const projectName =
      options.project ??
      Object.keys(projects).find((name) => projects[name]?.projectType === 'application');

    if (!projectName) {
      throw new SchematicsException('Could not determine the Angular application project.');
    }

    const project = projects[projectName];

    if (project.projectType !== 'application') {
      throw new SchematicsException(`Project "${projectName}" is not an application.`);
    }

    const buildOptions = project.architect?.build?.options;

    if (!buildOptions) {
      throw new SchematicsException(
        `Could not find build configuration for project "${projectName}".`,
      );
    }

    const sourceRoot = project.sourceRoot ?? (project.root ? `${project.root}/src` : 'src');

    const assetsPath = `${sourceRoot}/assets`;

    const assets = buildOptions.assets ?? [];

    const alreadyConfigured = assets.some(
      (asset: unknown) =>
        typeof asset === 'object' &&
        asset !== null &&
        (asset as any).glob === SERVICE_WORKER_FILE &&
        (asset as any).input === assetsPath &&
        (asset as any).output === '/',
    );

    if (!alreadyConfigured) {
      buildOptions.assets = [
        ...assets,
        {
          glob: SERVICE_WORKER_FILE,
          input: assetsPath,
          output: '/',
        },
      ];
    }

    tree.overwrite('/angular.json', JSON.stringify(angularJson, null, 2) + '\n');

    context.logger.info(`Configuring ngx-offline-sync for project "${projectName}"...`);

    return chain([mergeWith(apply(url('./files'), [move(`/${assetsPath}`)]))]);
  };
}
