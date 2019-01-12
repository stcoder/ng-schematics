import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkWebModule } from '@tr/sdk/sdk-web.module';
import { <%= classify(name) %>WebComponent } from './components/<%= dasherize(name) %>-web.component';

@NgModule({
  imports: [
    CommonModule,
    SdkWebModule
  ],
  exports: [<%= classify(name) %>WebComponent],
  declarations: [<%= classify(name) %>WebComponent]
})
export class <%= classify(name) %><%= classify(postfixName) %>WebModule { }
