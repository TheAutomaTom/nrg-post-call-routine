import type {
  GridLink,
  GridLinkParent,
  GridEmail,
  GridPhone,
  GridStringList,
  GridDescription,
  GridAddress,
  GridDate,
  GridDateTime,
  ContactGridItem,
  ContactListResponse,
  DictionaryItem,
  DictionaryResponse,
  SystemInformation,
} from './nrg-dto-responses';

// Re-export for convenience
export type {
  GridLink,
  GridLinkParent,
  GridEmail,
  GridPhone,
  GridStringList,
  GridDescription,
  GridAddress,
  GridDate,
  GridDateTime,
  ContactGridItem,
  ContactListResponse,
  DictionaryItem,
  DictionaryResponse,
  SystemInformation,
};

export interface SortOption {
  selector: string;
  desc: boolean;
}

export interface DataSourceLoadOptionsDto {
  $type: "DataSourceLoadOptionsDto";
  requireTotalCount: boolean;
  isCountQuery: boolean;
  skip: number;
  take: number;
  sort: SortOption[] | null;
  group: unknown | null;
  remoteGrouping: boolean;
  primaryKey: string | null;
  defaultSort: string | null;
}

export interface CompanyListQuery {
  $type: "CompanyListQuery";
  LoadOptions: DataSourceLoadOptionsDto;
}

export interface CompanyEditQuery {
  $type: "CompanyEditQuery";
  companyId: string;
}

export function createCompanyEditQuery(companyId: string): CompanyEditQuery {
  return {
    $type: "CompanyEditQuery",
    companyId,
  };
}

export interface OfficeListQuery {
  $type: "OfficeListQuery";
  CompanyId: string | null;
  LoadOptions: DataSourceLoadOptionsDto;
}

export function createOfficeListQuery(
  companyId: string | null = null,
  skip = 0,
  take = 500
): OfficeListQuery {
  return {
    $type: "OfficeListQuery",
    CompanyId: companyId,
    LoadOptions: {
      $type: "DataSourceLoadOptionsDto",
      requireTotalCount: true,
      isCountQuery: false,
      skip,
      take,
      sort: [
        { selector: "CompanyName", desc: false },
        { selector: "Name", desc: false },
      ],
      group: null,
      remoteGrouping: true,
      primaryKey: null,
      defaultSort: null,
    },
  };
}

export enum ContactSortField {
  LastName = "LastName",
  FirstName = "FirstName",
  Email = "Email",
  Company = "Company",
}

export interface ContactListQuery {
  $type: "ContactListQuery";
  officeId: string | null;
  companyId: string | null;
  loadOptions: DataSourceLoadOptionsDto;
}

// Factory function for creating default query
export function createCompanyListQuery(
  skip = 0,
  take = 500,
  sortSelector = "Name",
  sortDesc = false
): CompanyListQuery {
  return {
    $type: "CompanyListQuery",
    LoadOptions: {
      $type: "DataSourceLoadOptionsDto",
      requireTotalCount: true,
      isCountQuery: false,
      skip,
      take,
      sort: [{ selector: sortSelector, desc: sortDesc }],
      group: null,
      remoteGrouping: true,
      primaryKey: null,
      defaultSort: null,
    },
  };
}

export function createContactListQuery(
  skip = 0,
  take = 500,
  sortSelector: ContactSortField = ContactSortField.LastName,
  sortDesc = true,
  officeId: string | null = null,
  companyId: string | null = null
): ContactListQuery {
  return {
    $type: "ContactListQuery",
    officeId,
    companyId,
    loadOptions: {
      $type: "DataSourceLoadOptionsDto",
      requireTotalCount: true,
      isCountQuery: false,
      skip,
      take,
      sort: [{ selector: sortSelector, desc: sortDesc }],
      group: null,
      remoteGrouping: true,
      primaryKey: null,
      defaultSort: null,
    },
  };
}

// ============ Command Types ============

export interface Address {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  county: string | null;
}

export interface SocialLink {
  linkAddress: string;
}

export interface Social {
  facebook: SocialLink;
  twitter: SocialLink;
  linkedIn: SocialLink;
  instagram: SocialLink;
  youTube: SocialLink;
  googlePlus: SocialLink | null;
}

export interface OfficeCreateCommand {
  $type: "OfficeCreateCommand";
  id: string;
  name: string;
  externalId: string;
  companyId: string;
  physicalAddress: Address;
  correspondenceAddress: Address;
  correspondenceAddressOtherThanPhysical: boolean;
  faxNumber: string;
  phoneNumber: string;
  tollFreeNumber: string;
  officeMail: string;
  description: string;
  social: Social;
  gradeId: string | null;
  gradeName: string;
}

export function createOfficeCreateCommand(
  companyId: string,
  name: string,
  id?: string
): OfficeCreateCommand {
  const emptyAddress: Address = {
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    county: null,
  };

  const emptySocial: Social = {
    facebook: { linkAddress: "" },
    twitter: { linkAddress: "" },
    linkedIn: { linkAddress: "" },
    instagram: { linkAddress: "" },
    youTube: { linkAddress: "" },
    googlePlus: null,
  };

  return {
    $type: "OfficeCreateCommand",
    id: id ?? crypto.randomUUID(),
    name,
    externalId: "",
    companyId,
    physicalAddress: { ...emptyAddress },
    correspondenceAddress: { ...emptyAddress },
    correspondenceAddressOtherThanPhysical: false,
    faxNumber: "",
    phoneNumber: "",
    tollFreeNumber: "",
    officeMail: "",
    description: "",
    social: emptySocial,
    gradeId: null,
    gradeName: "",
  };
}
