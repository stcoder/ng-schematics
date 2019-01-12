import { Component } from '@angular/core';
import { <%= classify(name) %>Base } from './../classes/<%= dasherize(name) %>-base';

@Component({
  selector: '<%= selector %>',
  templateUrl: './<%= dasherize(name) %>.component.html',
  styleUrls: ['./../styles/style-base.scss'],
  host: {
    class: '<%= selector %>'
  }
})
export class <%= classify(name) %>Component extends <%= classify(name) %>Base {
  constructor() {
    super();
  }
}
