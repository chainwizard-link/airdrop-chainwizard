import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { PrepareComponent } from './pages/prepare/prepare.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule} from '@angular/forms';
import {
  AddressInputDirective,
  AmountInputDirective,
  BigNumberFormat,
  ExplorerUrl,
  TokenInputDirective
} from './providers/blockchains/blockchains';
import { AddressesComponent } from './pages/addresses/addresses.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ModalMessageComponent } from './components/modal-message/modal-message.component';
import {MatDialogModule} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ModalWalletsComponent} from './components/modal-wallets/modal-wallets';
import { SubmitComponent } from './pages/submit/submit.component';
import {MatSliderModule} from '@angular/material/slider';
import { ApproveComponent } from './components/approve/approve.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import {HttpClientModule} from '@angular/common/http';
import { FooterComponent } from './components/footer/footer.component';

export function appInitializerFactory(): any {
  return () =>
    new Promise<any>((resolve: any, reject) => {
      const onLoadPage = () => {
        setTimeout(() => {
          resolve(null);
        }, 1000);
      };
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
          onLoadPage();
        });
      } else {
        onLoadPage();
      }
    });
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PrepareComponent,

    TokenInputDirective,

    AddressesComponent,
    AddressInputDirective,
    AmountInputDirective,

    ExplorerUrl,
    BigNumberFormat,

    ModalMessageComponent,
    ModalWalletsComponent,
    SubmitComponent,
    ApproveComponent,
    PageHeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ScrollingModule,
    MatDialogModule,
    MatSliderModule,
    HttpClientModule
  ],
  providers: [
    {
      deps: [],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
