import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { <%= classify(name) %>Service } from '../services/<%= dasherize(name) %>.service';
import {
  Load<%= classify(name) %>,
  <%= classify(name) %>ActionTypes,
  <%= classify(name) %>Loaded,
  <%= classify(name) %>LoadError
} from '../actions/<%= dasherize(name) %>.action';
import { <%= classify(name) %> } from '../models/<%= dasherize(name) %>.model';
import { MapUtils } from '@tr/core';

@Injectable()
export class <%= classify(name) %>Effects {
  constructor(
    protected action$: Actions,
    protected <%= camelize(name) %>Service: <%= classify(name) %>Service
  ) {}

  @Effect()
  load<%= classify(name) %>$ = this.action$.pipe(
    ofType<Load<%= classify(name) %>>(<%= classify(name) %>ActionTypes.Load<%= classify(name) %>),
    switchMap(() =>
      this.<%= camelize(name) %>Service
        .getData()
        .pipe(
          map(
            <%= names.plural %> =>
              new <%= classify(name) %>Loaded(
                <%= names.plural %>.map(<%= camelize(name) %> => MapUtils.deserialize(<%= classify(name) %>, <%= camelize(name) %>))
              )
          ),
          catchError(error => of(new <%= classify(name) %>LoadError(error)))
        )
    )
  );
}
