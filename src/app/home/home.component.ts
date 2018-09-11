import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    houses = [
        { id_room : 1,
            name_room : 'house1', price_room : 200000,
            lat_long : [{lat : 40.728657, long: -73.631744, title: 'Garden City', lable: 'Garden City 1'}]},
        { id_room : 2, name_room : 'house2', price_room : 2000,
            lat_long : [{lat : 40.7920441, long: -73.5398476, title: 'Jericho', lable: 'Jericho 1'}]}
        ];

    latitude = 40.728657;
    longitude = -73.631744;
    locationChosen = false;
    zoom:number = 16;

  constructor() { }

  ngOnInit() {

  }

    onChoseLocation(event) {
        this.latitude = event.coords.lat;
        this.longitude = event.coords.lng;
        this.locationChosen = true;
    }

}
