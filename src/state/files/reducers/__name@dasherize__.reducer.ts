import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { <%= classify(name) %> } from '../models/<%= dasherize(name) %>.model';
import { <%= classify(name) %>Action, <%= classify(name) %>ActionTypes } from '../actions/<%= dasherize(name) %>.action';

export interface <%= classify(name) %>State extends EntityState<<%= classify(name) %>> {
  loaded: boolean;
  loading: boolean;
  error: any;
  selected<%= classify(name) %>Id: number | null;
}

export const <%= camelize(name) %>Adapter: EntityAdapter<<%= classify(name) %>> = createEntityAdapter<
  <%= classify(name) %>
>({
  selectId: (<%= camelize(name) %>: <%= classify(name) %>) => <%= camelize(name) %>.id
});

export const initialState: <%= classify(name) %>State = <%= camelize(name) %>Adapter.getInitialState({
  loaded: false,
  loading: false,
  error: null,
  selected<%= classify(name) %>Id: null
});

export function <%= classify(name) %>Reducer(
  state: <%= classify(name) %>State = initialState,
  action: <%= classify(name) %>Action
): <%= classify(name) %>State {
  switch (action.type) {
    case <%= classify(name) %>ActionTypes.Load<%= classify(name) %>:
      state = {
        ...state,
        loading: true,
        loaded: false
      };
      break;

    case <%= classify(name) %>ActionTypes.<%= classify(name) %>Loaded:
      state = <%= camelize(name) %>Adapter.addAll(action.payload, {
        ...state,
        loading: false,
        loaded: true
      });
      break;

    case <%= classify(name) %>ActionTypes.<%= classify(name) %>LoadError:
      state = {
        ...state,
        loading: false,
        loaded: false
      };
      break;

    case <%= classify(name) %>ActionTypes.<%= classify(name) %>Select:
      state = {
        ...state,
        selected<%= classify(name) %>Id: action.payload
      };
      break;
  }

  return state;
}
