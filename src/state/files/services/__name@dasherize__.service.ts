import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '@tr/core';
import { EntityService } from '@tr/shared/services/entity.service';
import { <%= classify(name) %> } from '../models/<%= dasherize(name) %>.model';

@Injectable()
export class <%= classify(name) %>Service extends EntityService<<%= classify(name) %>> {
  private readonly _<%= camelize(name) %>Url = '/public/user/<%= names.plural %>';

  constructor(
    protected http: HttpClient,
    protected configService: ConfigService
  ) {
    super(http);
  }

  protected getUrl() {
    return `${this.configService.get('api_url')}${this._<%= camelize(name) %>Url}`;
  }

  protected getQueryParams() {
    return {};
  }
}
