export interface ILocation {
    type: 'Point';
    coordinates: [number, number];   // [lng, lat]
}

export interface IAddress {
    address: string;
    city: string;
    pincode: string;
    location: ILocation
}
