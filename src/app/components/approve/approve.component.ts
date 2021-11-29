import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss']
})
export class ApproveComponent implements OnInit {

  @Input() public amount;
  @Input() public token;
  @Input() public approveType = 'unlimited';
  @Output() approveTypeChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

}
