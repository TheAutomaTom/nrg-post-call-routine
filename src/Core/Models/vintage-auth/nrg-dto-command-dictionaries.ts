
export enum DictionaryTypeName {
  Classification = "Classification",
  Department = "Department",
  Prefix = "Prefix",
  Suffix = "Suffix",
  Title = "Title",
  WorkType = "WorkType",
  GeographicScope = "GeographicScope",
  VendorType = "VendorType",
  PaymentTerm = "PaymentTerm"
}

export interface DictionaryManageQuery {
  $type: "DictionaryManageQuery";
  typeName: DictionaryTypeName;
}

export function createDictionaryManageQuery(
  typeName: DictionaryTypeName = DictionaryTypeName.Classification
): DictionaryManageQuery {
  return {
    $type: "DictionaryManageQuery",
    typeName,
  };
}
