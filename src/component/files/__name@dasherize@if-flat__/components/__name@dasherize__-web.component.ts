import { Component } from '@angular/core';
import { <%= classify(name) %>Base } from './../classes/<%= dasherize(name) %>-base';

@Component({
  selector: '<%= selector %>',
  templateUrl: './<%= dasherize(name) %>-web.component.html',
  styleUrls: [
    './../styles/style-base.scss',
    './../styles/<%= dasherize(name) %>-web.scss'
  ],
  host: {
    class: '<%= selector %>'
  }
})
export class <%= classify(name) %>WebComponent extends <%= classify(name) %>Base {
  constructor() {
    super();
  }
}
