import { Component } from '@angular/core';
import { <%= classify(name) %>Base } from './../classes/<%= dasherize(name) %>-base';

@Component({
  selector: '<%= selector %>',
  templateUrl: './<%= dasherize(name) %>-ionic.component.html',
  styleUrls: [
    './../styles/style-base.scss',
    './../styles/<%= dasherize(name) %>-ionic.scss'
  ],
  host: {
    class: '<%= selector %>'
  }
})
export class <%= classify(name) %>IonicComponent extends <%= classify(name) %>Base {
  constructor() {
    super();
  }
}
