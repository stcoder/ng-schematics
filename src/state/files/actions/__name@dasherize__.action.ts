import { Action } from '@ngrx/store';
import { <%= classify(name) %> } from '../models/<%= dasherize(name) %>.model';

export enum <%= classify(name) %>ActionTypes {
  Load<%= classify(name) %> = '[Load<%= classify(name) %>] Load <%= dasherize(name) %>',
  <%= classify(name) %>Loaded = '[<%= classify(name) %>Loaded] <%= classify(name) %> loaded',
  <%= classify(name) %>LoadError = '[<%= classify(name) %>LoadError] <%= classify(name) %> load error',
  <%= classify(name) %>Select = '[<%= classify(name) %>Select] <%= classify(name) %> select'
}

export class Load<%= classify(name) %> implements Action {
  readonly type = <%= classify(name) %>ActionTypes.Load<%= classify(name) %>;
}

export class <%= classify(name) %>Loaded implements Action {
  readonly type = <%= classify(name) %>ActionTypes.<%= classify(name) %>Loaded;
  constructor(public payload: <%= classify(name) %>[]) {}
}

export class <%= classify(name) %>LoadError implements Action {
  readonly type = <%= classify(name) %>ActionTypes.<%= classify(name) %>LoadError;
  constructor(public payload: any) {}
}

export class <%= classify(name) %>Select implements Action {
  readonly type = <%= classify(name) %>ActionTypes.<%= classify(name) %>Select;
  constructor(public payload: number | null) {}
}

export type <%= classify(name) %>Action =
  | Load<%= classify(name) %>
  | <%= classify(name) %>Loaded
  | <%= classify(name) %>LoadError
  | <%= classify(name) %>Select;

export const from<%= classify(name) %>Actions = {
  Load<%= classify(name) %>,
  <%= classify(name) %>Loaded,
  <%= classify(name) %>LoadError,
  <%= classify(name) %>Select
};
