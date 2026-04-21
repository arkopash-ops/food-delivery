export interface ILocation {
    type: 'Point';
    coordinates: [number, number];   // [lng, lat]
}

export interface IDefaultAddress {
    address: string;
    city: string;
    pincode: string;
    location: ILocation
}
