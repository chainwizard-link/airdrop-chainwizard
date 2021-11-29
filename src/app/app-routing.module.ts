import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrepareComponent } from './pages/prepare/prepare.component';
import {AddressesComponent} from './pages/addresses/addresses.component';
import {SubmitComponent} from './pages/submit/submit.component';


const routes: Routes = [
  {
    component: PrepareComponent,
    path: '',
  }, {
    component: AddressesComponent,
    path: 'addresses',
  }, {
    component: PrepareComponent,
    path: 'edit',
    data: {
      editMode: true
    },
  }, {
    component: SubmitComponent,
    path: 'submit'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
