import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AppComponent,
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([]),
  ],
  providers: [provideHttpClient(), CookieService],
  bootstrap: [],
})
export class AppModule {}
