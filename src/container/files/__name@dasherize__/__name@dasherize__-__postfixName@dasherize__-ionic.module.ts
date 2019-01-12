import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkIonicModule } from '@tr/sdk/sdk-ionic.module';
import { <%= classify(name) %>IonicComponent } from './components/<%= dasherize(name) %>-ionic.component';

@NgModule({
  imports: [
    CommonModule,
    SdkIonicModule
  ],
  exports: [<%= classify(name) %>IonicComponent],
  declarations: [<%= classify(name) %>IonicComponent]
})
export class <%= classify(name) %><%= classify(postfixName) %>IonicModule { }
