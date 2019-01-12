import { IEntity } from '@tr/shared/models/entity.model';

export class <%= classify(name) %> implements IEntity {
  id: number = void 0;
  title: string = void 0;

  getIdentifier(): number {
    return this.id;
  }
}
