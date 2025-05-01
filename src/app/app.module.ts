import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SlokaListComponent } from './sloka-list/sloka-list.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { provideHttpClient } from '@angular/common/http';
import { SlokaComponent } from './sloka/sloka.component';
import { FormsModule } from '@angular/forms';
import { SingleSlokaComponent } from './single-sloka/single-sloka.component';
import { GroupedSlokaComponent } from './grouped-sloka/grouped-sloka.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    AppComponent,
    SlokaListComponent,
    ChaptersComponent,
    SlokaComponent,
    SingleSlokaComponent,
    GroupedSlokaComponent,
  ],
  providers: [provideHttpClient()],
})
export class AppModule {}
