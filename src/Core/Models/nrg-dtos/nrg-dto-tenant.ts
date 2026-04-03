export interface AddressDto {
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  County: string;
}

// export interface SocialDto {
//   Facebook: string;
//   Twitter: string;
//   LinkedIn: string;
//   Instagram: string;
//   YouTube: string;
// }

// export interface PrinterDto {
//   Name: string;
//   IpAddress: string;
// }

// export interface WarehouseDto {
//   Name: string;
//   ShortName: string;
//   Description: string;
//   Address: AddressDto;
// }

export interface FacilityDto {
  Name: string;
  Email: string;
  Phone: string;
  TimeZone: string;
  Address: AddressDto;
  // Warehouses: WarehouseDto[];
  // Printers: PrinterDto[];
}

export interface TenantDto {
  CompanyName: string;
  // Website: string;
  Email: string;
  // Phone: string;
  // Fax: string;
  // TollFree: string;
  Address: AddressDto;
  // Social: SocialDto;
  Facilities: FacilityDto[];
}
