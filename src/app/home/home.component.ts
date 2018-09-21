import { Component, Input, ViewChild, NgZone, OnInit } from '@angular/core';
import { MapsAPILoader, AgmMap } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services';

declare var google: any;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    circleRadius:number = 5000;

    geocoder: any;

    public myIcon: any = {
        url: '/assets/img/house.png',
        scaledSize: {
            width: 78,
            height: 52
        },labelOrigin:{x:40,y:20}
    };

    public soldIcon: any = {
        url: '/assets/img/soldHouse.png',
        scaledSize: {
            width: 78,
            height: 52
        },labelOrigin:{x:40,y:20}
    };

    public location: Location = {
        lat: 40.738657,
        lng: -73.631744,
        marker: {
            lat: 51.678418,
            lng: 7.809007,
            draggable: true
        },
        zoom: 5
    };

    public markers: Marker[] = [
        {
            lat: 40.738657,
            lng: -73.631744,
            label: {
                color: 'red',
                fontFamily: '',
                fontSize: '14px',
                fontWeight: 'bold',
                text: '$1.0 M'
            },
            draggable: true,
            icon: this.myIcon
        },
        {
            lat: 40.728657,
            lng: -73.641784,
            label: '$900,000',
            draggable: false,
            icon: this.myIcon
        },
        {
            lat: 40.718657,
            lng: -73.611814,
            label: {
                color: 'red',
                fontFamily: '',
                fontSize: '14px',
                fontWeight: 'bold',
                text: '$1.5 M'
            },
            draggable: true,
            icon: this.soldIcon
        }
    ]

    @ViewChild(AgmMap) map: AgmMap;
    // google maps zoom level
    zoom: number = 13;

    // initial center position for the map
    lat: number = 40.728657;
    lng: number = -73.631744;

    constructor(public mapsApiLoader: MapsAPILoader,
                private zone: NgZone,
                private wrapper: GoogleMapsAPIWrapper) {
        this.mapsApiLoader = mapsApiLoader;
        this.zone = zone;
        this.wrapper = wrapper;
        this.mapsApiLoader.load().then(() => {
            this.geocoder = new google.maps.Geocoder();
        });
    }

    ngOnInit() {
        this.location.marker.draggable = true;
    }


    updateOnMap() {
        let full_address: string = this.location.address_line_1 || '';
        if (this.location.address_line_2) {
            full_address = full_address + ' ' + this.location.address_line_2;
        }
        if (this.location.address_state) {
            full_address = full_address + ' ' + this.location.address_state;
        }
        if (this.location.address_country) {
            full_address = full_address + ' ' + this.location.address_country;
        }

        this.findLocation(full_address);
    }


    findLocation(address) {
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder();
        }
        this.geocoder.geocode({
            'address': address
        }, (results, status) => {
            console.log(results);
            if (status === google.maps.GeocoderStatus.OK) {
                for (var i = 0; i < results[0].address_components.length; i++) {
                    let types = results[0].address_components[i].types

                    if (types.indexOf('locality') !== -1) {
                        this.location.address_line_2 = results[0].address_components[i].long_name;
                    }
                    if (types.indexOf('country') !== -1) {
                        this.location.address_country = results[0].address_components[i].long_name;
                    }
                    if (types.indexOf('postal_code') !== -1) {
                        this.location.address_zip = results[0].address_components[i].long_name;
                    }
                    if (types.indexOf('administrative_area_level_1') !== -1) {
                        this.location.address_state = results[0].address_components[i].long_name;
                    }
                }

                if (results[0].geometry.location) {
                    this.location.lat = results[0].geometry.location.lat();
                    this.location.lng = results[0].geometry.location.lng();
                    this.location.marker.lat = results[0].geometry.location.lat();
                    this.location.marker.lng = results[0].geometry.location.lng();
                    this.location.marker.draggable = true;
                    this.location.viewport = results[0].geometry.viewport;
                }

                this.map.triggerResize();
            } else {
                alert('Sorry, this search produced no results.');
            }
        });
    }



    clickedMarker(label: string, index: number) {
        console.log(`clicked the marker: ${label || index}`)
    }

    mapClicked($event) {
        this.markers.push({
            lat: $event.coords.lat,
            lng: $event.coords.lng,
            draggable: true
        });
    }


    markerDragEnd(m: any, $event: any) {
        this.location.marker.lat = m.coords.lat;
        this.location.marker.lng = m.coords.lng;
        this.findAddressByCoordinates();
    }

    findAddressByCoordinates() {
        this.geocoder.geocode({
            'location': {
                lat: this.location.marker.lat,
                lng: this.location.marker.lng
            }
        }, (results, status) => {
            this.decomposeAddressComponents(results);
        })
    }


    decomposeAddressComponents(addressArray) {
        if (addressArray.length === 0) return false;
        let address = addressArray[0].address_components;

        for(let element of address) {
            if (element.length === 0 && !element['types']) {
                continue;
            }

            if (element['types'].indexOf('street_number') > -1) {
                this.location.address_line_1 = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('route') > -1) {
                this.location.address_line_1 += ', ' + element['long_name'];
                continue;
            }
            if (element['types'].indexOf('locality') > -1) {
                this.location.address_line_2 = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('administrative_area_level_1') > -1) {
                this.location.address_state = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('country') > -1) {
                this.location.address_country = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('postal_code') > -1) {
                this.location.address_zip = element['long_name'];
                continue;
            }
        }
    }


    milesToRadius(value) {
        this.circleRadius = value / 0.00062137;
    }

    circleRadiusInMiles() {
        return this.circleRadius * 0.00062137;
    }

}

// just an interface for type safety.
interface Marker {
    lat: number;
    lng: number;
    label?: any;
    draggable: boolean;
    icon?: any;
}


interface Location {
    lat: number;
    lng: number;
    viewport?: Object;
    zoom: number;
    address_line_1?: string;
    address_line_2?: string;
    address_country?: string;
    address_zip?: string;
    address_state?: string;
    marker?: Marker;
}