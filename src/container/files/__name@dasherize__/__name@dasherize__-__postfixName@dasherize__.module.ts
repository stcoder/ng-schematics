import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkModule } from '@tr/sdk/sdk.module';
import { <%= classify(name) %>Component } from './components/<%= dasherize(name) %>.component';

@NgModule({
  imports: [
    CommonModule,
    SdkModule
  ],
  exports: [<%= classify(name) %>Component],
  declarations: [<%= classify(name) %>Component]
})
export class <%= classify(name) %><%= classify(postfixName) %>Module { }
