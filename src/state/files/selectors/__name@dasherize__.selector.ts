import { createSelector, MemoizedSelector } from '@ngrx/store';
import { <%= camelize(name) %>Adapter, <%= classify(name) %>State } from '../reducers/<%= dasherize(name) %>.reducer';

export function get<%= classify(name) %>Selectors<T>(
  memoizedState: MemoizedSelector<object, T>,
  storeSelector: string
) {
  const get<%= classify(name) %>State = createSelector(
    memoizedState,
    (state: T) => state[storeSelector]
  );

  const {
    selectIds: get<%= classify(name) %>Ids,
    selectAll: get<%= classify(name) %>All,
    selectEntities: get<%= classify(name) %>Entities,
    selectTotal: get<%= classify(name) %>Total
  } = <%= camelize(name) %>Adapter.getSelectors(get<%= classify(name) %>State);

  const getSelected<%= classify(name) %>Id = createSelector(
    get<%= classify(name) %>State,
    (state: <%= classify(name) %>State) => state.selected<%= classify(name) %>Id
  );

  const getSelected<%= classify(name) %> = createSelector(
    get<%= classify(name) %>Entities,
    getSelected<%= classify(name) %>Id,
    (entities, selectedId) => selectedId && entities[selectedId]
  );

  return {
    getSelected<%= classify(name) %>Id,
    getSelected<%= classify(name) %>,
    get<%= classify(name) %>Ids,
    get<%= classify(name) %>All,
    get<%= classify(name) %>Entities,
    get<%= classify(name) %>Total
  };
}
