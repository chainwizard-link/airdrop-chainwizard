import {AfterContentChecked, AfterContentInit, Component, OnInit, ViewChild} from '@angular/core';
import {InterfaceAccount, WalletsProvider} from '../../providers/wallets/wallets';
import {WALLETS_NETWORKS} from '../../providers/wallets/constants/networks';
import {ModalWalletsComponent} from '../modal-wallets/modal-wallets';
import {MatDialog} from '@angular/material/dialog';
import {BlockchainsProvider} from '../../providers/blockchains/blockchains';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterContentInit {

  @ViewChild('navigation') navigation;

  private latestOpenedItem;

  constructor() {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.initNavigation();
    });
  }

  private initNavigation(): void {
    const element = this.navigation.nativeElement;

    element.addEventListener('click', ($event) => {
      let parent = $event.target;
      let checked;
      let abort;

      while ((parent !== element) && !checked && !abort) {
        if (parent.classList.contains('with-submenu')) {
          checked = true;
        } else
        if (parent.classList.contains('submenu')) {
          abort = true;
        } else {
          parent = parent.parentElement;
        }
      }

      if (checked) {
        $event.preventDefault();
        $event.stopPropagation();
        if (parent.classList.contains('opened')) {
          parent.classList.remove('opened');
        } else {
          if (this.latestOpenedItem) {
            this.latestOpenedItem.classList.remove('opened');
          }
          this.latestOpenedItem = parent;
          parent.classList.add('opened');
        }
      }
    });

    window.addEventListener('click', () => {
      if (this.latestOpenedItem) {
        this.latestOpenedItem.classList.remove('opened');
      }
    });

  }



}
