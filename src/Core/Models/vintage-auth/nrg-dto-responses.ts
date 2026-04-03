// ============ Request Types ============

export interface EnvironmentRequest {
  Environment: string;
}

// ============ Authentication Response ============

export enum AuthResultType {
  Success = 0,
  Failure = 1,
  CaptchaRequired = 2,
}

export interface AuthenticationResult {
  ResultType: AuthResultType;
  OutcomeDescription: string;
  SiteKey: string | null;
  CaptchaUrl: string | null;
}

// ============ Session/App State Response ============

export interface TenantInfo {
  id: string;
  companyName: string;
  isKioskAuthenticationWhitelistRequired: boolean;
  companyWeekStartDay: number;
  payrollWeekStartDay: number;
  requireCompanyForContact: boolean;
  isMaterialDeliveryLocationRequired: boolean;
  rememberLastMaterialDeliveryLocation: boolean;
  materialReservationEnabled: boolean;
  allowMaterialRequestsWithoutRestrictions: boolean;
  payrollEnabled: boolean;
  excludeStagedFromMaterialsToBuy: boolean;
}

export interface UserInfo {
  id: string;
  loginEmail: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  currentDate: { date: string };
  permissions: number[];
}

export interface ZendeskConfig {
  isEnabled: boolean;
  portalHost: string | null;
  jsonWebToken: string | null;
  userName: string | null;
  userEmail: string | null;
  userOrganization: string | null;
}

export interface AhaConfig {
  isEnabled: boolean;
  portalUrl: string;
}

export interface TelemetryConfig {
  enableFrontendTelemetry: boolean;
  enableDependencyTracking: boolean;
  instrumentationKey: string;
}

export interface PendoConfig {
  isEnabled: boolean;
  login: string;
  fullName: string;
  account: string;
  apiKey: string;
}

export interface FileViewerConfig {
  licenseKey: string;
  webViewerServerURL: string | null;
  maxAnnotationRepresentationLength: number;
  supportedWebViewerServerFileFormats: string[];
}

export interface DateAndTimeFormat {
  dateType: number;
  timeType: number;
  dateFormat: string;
  dateTimeFormat: string;
  timeFormat: string;
}

export interface BrowserRequirement {
  name: string;
  minVersion: number;
}

export interface SupportedBrowserProfile {
  browserList: BrowserRequirement[];
}

export interface AccountingExportFormat {
  exportFormatName: string;
  exportFormatValue: number;
}

export interface HubSpotConfig {
  isEnabled: boolean;
  trackingCodeUrl: string | null;
}

export interface DevExtremeConfig {
  licenseKey: string;
}

export interface IntercomConfig {
  isLauncherEnabled: boolean;
  areLinksEnabled: boolean;
  appId: string;
  helpCenterUrl: string;
  sessionDuration: number;
  userJwtToken: string;
}

export interface SessionStateResponse {
  tenant: TenantInfo;
  user: UserInfo;
  zendesk: ZendeskConfig;
  aha: AhaConfig;
  telemetry: TelemetryConfig;
  pendo: PendoConfig;
  fileViewer: FileViewerConfig;
  currentEnvironment: number;
  dateAndTimeFormat: DateAndTimeFormat;
  currencySymbol: string;
  currencyCode: string;
  cultureName: string;
  ianaTimezoneName: string;
  supportedBrowserProfile: SupportedBrowserProfile;
  expenseUponReceiptValidationEnabled: boolean;
  unallocatedTimeWarningEnabled: boolean;
  autoAddStagedMilestoneDateBehavior: number;
  currentDeviceName: string;
  currentDeviceIsTrusted: boolean;
  currentAccountingExportFormat: AccountingExportFormat;
  showRefreshAllCosts: boolean;
  showGridAiChat: boolean;
  newKioskEnabled: boolean;
  useGst: boolean;
  hubSpot: HubSpotConfig;
  enableShopFloorWorkOrderGrid: boolean;
  crdAsyncReportingEnabled: boolean;
  crdAdHocReportingEnabled: boolean;
  devExtreme: DevExtremeConfig;
  wrapTextInGridHeaders: boolean;
  intercom: IntercomConfig;
  legacyProposalPdfEnabled: boolean;
  timeTrackingGridQueryDateRangeLimitInYears: number;
  engineeringSyncRequestAndFulfillEnabled: boolean;
  draftingOnDemandEnabled: boolean;
  loadOnlyVisibleColumnsInGrids: boolean;
  aiSheetsRecognitionEnabled: boolean;
}

// ============ Grid/List Response Types ============

export interface GridLinkParent {
  Id: string;
  Type: string | null;
}

export interface GridLink {
  ObjectType: string | null;
  TypeName: string | null;
  DisplayName: string | null;
  Condition: string | null;
  ObjectId: string;
  Parents: GridLinkParent[];
  IsActive: boolean;
  ShowXWhenInactive: boolean;
  Url: string | null;
  OpenInNewTab: boolean;
  Title: string | null;
}

export interface GridEmail {
  Mail: string;
}

export interface GridWebsite {
  url: string;
  name: string;
}

export interface GridStringList {
  List: string[];
  SearchString: string;
}

export interface GridDescription {
  Text: string;
}

export interface GridPhone {
  Number: string;
}

export interface GridCurrency {
  Symbol: string;
  Code: string;
}

export interface GridMoneyValue {
  Value: number;
  Currency: GridCurrency | null;
  IsEmpty: boolean;
  AsDifferential: boolean;
  ShowZero: boolean;
  RoundingPrecision: number;
}

export interface GridDateTime {
  dateTime: string | null;
}

export interface GridDate {
  date: string | null;
}

export interface GridAddress {
  Address1: string | null;
  Address2: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Country: string | null;
  County: string | null;
  SearchString: string;
}

export interface GridFscCertification {
  url: string;
  name: string;
}

export interface CompanyGridItem {
  Id: string;
  Name: GridLink;
  Email: GridEmail;
  Website: GridWebsite | null;
  Duns: string;
  ExternalIdentifier: string;
  NoContacts: number;
  NoOffices: number;
  Classifications: GridStringList;
  VendorTypes: GridStringList;
  WorkTypes: GridStringList;
  Description: GridDescription;
  CorporatePhone: GridPhone;
  AverageProjectSize: GridMoneyValue;
  AnnualRevenue: GridMoneyValue;
  SelectedPaymentTerm: string | null;
  SelectedGeographicScope: string | null;
  FscCocNumber: string;
  FscCertification: GridFscCertification;
  CreatedBy: string;
  CreatedDate: GridDateTime;
  ModifiedBy: string | null;
  ModifiedDate: GridDateTime;
  Logo: string | null;
  BusinessNumber: string | null;
  CustomFields: unknown | null;
}

export interface CompanyListResponse {
  data: CompanyGridItem[];
  totalCount: number;
  groupCount: number;
  summary: unknown | null;
}

// ============ Dictionary Response Types ============

export interface DictionaryItem {
  id: string;
  name: string;
  isActive: boolean;
  orderIndex: number;
  isRequired: boolean;
  typeName: string;
}

export interface SystemInformation {
  createdBy: GridLink;
  modifiedBy: GridLink | null;
  createdDate: GridDateTime | null;
  modifiedDate: GridDateTime | null;
}

export interface DictionaryResponse {
  name: string;
  displayName: string;
  description: string;
  utilization: unknown | null;
  items: DictionaryItem[];
  systemInformation: SystemInformation;
}

// ============ Contact Grid Response ============

export interface ContactGridItem {
  Id: string;
  OfficeId: string;
  Photo: string | null;
  FirstName: GridLink;
  LastName: GridLink;
  Titles: GridStringList;
  Company: GridLink;
  Office: GridLink;
  DirectPhoneNumber: GridPhone;
  CellPhoneNumber: GridPhone;
  Email: GridEmail;
  Prefix: string;
  Suffix: string;
  Department: string;
  ReportsTo: string;
  PhysicalAddress: GridAddress;
  CorrespondenceAddress: GridAddress;
  PhoneNumber: GridPhone;
  TollFreeNumber: GridPhone;
  FaxNumber: GridPhone;
  Description: GridDescription;
  Age: number | null;
  BirthDate: GridDate;
  IsCompanyVendor: boolean;
  IsPreferredPurchaseOrderContact: boolean | null;
  Classifications: string;
  CustomFields: unknown | null;
}

export interface ContactListResponse {
  data: ContactGridItem[];
  totalCount: number;
  groupCount: number;
  summary: unknown | null;
}

// ============ Company Edit Response ============

export interface LinkValue {
  LinkAddress: string | null;
}

export interface MoneyValue {
  value: number;
  currencyCode: string;
}

export interface SocialLinks {
  Facebook: string | null;
  Twitter: string | null;
  LinkedIn: string | null;
  Instagram: string | null;
  YouTube: string | null;
}

export interface SelectableTypeItem {
  id: string;
  name: string;
  value: number | null;
  groupName: string | null;
}

export interface SelectableItem {
  id: string;
  name: string;
  groupName: string | null;
}

export interface CompanyEditResponse {
  id: string;
  name: string;
  externalIdentifier: string | null;
  description: GridDescription;
  website: LinkValue;
  corporateEmail: GridEmail;
  corporatePhone: GridPhone;
  dunsNo: string | null;
  fscCocNumber: string | null;
  fscCertification: LinkValue;
  logo: string | null;
  selectedTypeIds: string[];
  selectedVendorTypeIds: string[];
  selectedWorkTypeIds: string[];
  specialClassifications: number[];
  averageProjectSize: MoneyValue;
  annualRevenue: MoneyValue;
  selectedPaymentTermId: string | null;
  selectedGeographicScopeId: string | null;
  social: SocialLinks;
  availableTypes: SelectableTypeItem[];
  availableVendorTypes: SelectableItem[];
  availableWorkTypes: SelectableItem[];
  availableGeoScopes: SelectableItem[];
  availablePaymentTerms: SelectableItem[];
  isVendor: boolean;
  isGeneralContractor: boolean;
  isConstructionManager: boolean;
  businessNumber: string | null;
}

// ============ Office Grid Response ============

export interface OfficeGridItem {
  Id: string;
  Name: GridLink;
  ExternalId: string | null;
  CompanyId: string;
  CompanyName: GridLink;
  Email: GridEmail;
  Phone: GridPhone;
  TollFree: GridPhone;
  Fax: GridPhone;
  PhysicalAddress: GridAddress;
  MailingAddress: GridAddress;
  Description: GridDescription;
  Grade: string;
  PrimaryShippingMethod: string | null;
  Classifications: string;
  CustomFields: unknown | null;
}

export interface OfficeListResponse {
  data: OfficeGridItem[];
  totalCount: number;
  groupCount: number;
  summary: unknown | null;
}

// ============ Command Response Types ============

export enum ApiMessageType {
  Success = 0,
  Warning = 1,
  Error = 2,
  Info = 3,
}

export interface ApiMessage {
  Message: string;
  Type: ApiMessageType;
}

export interface CommandResponse<T = unknown> {
  RedirectUrl: string | null;
  Data: T | null;
  ErrorView: string | null;
  IsSuccess: boolean;
  Messages: ApiMessage[];
  OutcomeType: number;
  OutcomeDescription: string | null;
  KeyMessages: string[];
}
