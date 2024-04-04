import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

const hostUrl = environment.hostUrl;

@Component({
  template: '',
  standalone: true,
})
export class RedirectComponent implements OnInit {
  ngOnInit() {
    console.log('Redirecting');
    window.location.href = `${hostUrl}/not-found`;
  }
}
