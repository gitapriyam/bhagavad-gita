import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SlokaListComponent } from './sloka-list/sloka-list.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { provideHttpClient } from '@angular/common/http';
import { SlokaComponent } from './sloka/sloka.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule
  ],
  providers: [
    provideHttpClient()
  ]
})
export class AppModule { }

