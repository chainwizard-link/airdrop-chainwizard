import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-wallets-modal',
  styleUrls: ['./modal-wallets.component.scss'],
  templateUrl: './modal-wallets.component.html',
})
export class ModalWalletsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }
}
