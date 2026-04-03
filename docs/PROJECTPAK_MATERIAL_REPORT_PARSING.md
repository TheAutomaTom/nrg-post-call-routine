# ProjectPak Material Report Parsing

This document describes how the ProjectPak Material Library Export xlsx files are parsed and converted to the Innergy Material Import format.

## Overview

The parser reads ProjectPak Material Library Export files (`.xlsx`) with merged cells and extracts material data. The data is then converted to the Innergy import format and can be exported as a new Excel file.

## Input File Structure

The parser expects an Excel file with the following structure:

### Row Types

1. **Category Rows** - Identified by cells merged from columns A to P
2. **Item Rows** - Identified by cells merged from columns A to B

### Column Mappings

| Field | Columns | Merge Range | Parsing Rules |
|-------|---------|-------------|---------------|
| **Category** | A-P | Merged | Full row is a category header. All following items inherit this category until a new category row is found. Rows containing "Material" in the text are ignored. |
| **Name** | A-B | Merged | Item name. Rows starting with "Code / Description" or "Material" are skipped. Text after the first newline is discarded. |
| **LastDate** | E | Single | Date value normalized to `MM/DD/YY` format. Text after newline is ignored. Supports multiple input formats including `MM/DD/YY`, `MM/DD/YYYY`, and full date strings. |
| **Price** | F | Single | Numeric value with 2 decimal places. Non-numeric characters are stripped before parsing. |
| **UOM** | G | Single | Unit of measure. Text after newline is ignored. "Tax? N" suffix (with leading spaces) is removed. |
| **GlCostType** | J-L | Merged | GL Cost Type. Full cell text is used. |
| **Vendor** | M-P | Merged | Vendor name. Text after newline is ignored. The following prefixes cause the value to be ignored: `N/A Stock:`, `In Stock:`, `Stock:` |

## Output Format

### `ProjectPakMaterialReportitem` (Intermediate)

```typescript
interface ProjectPakMaterialReportitem {
  Name: string | null;
  Category: string | null;
  Price: number | null;
  LastDate: string | null;
  Uom: string | null;
  GlCostType: string | null;
  Vendor: string | null;
}
```

### `InnergyMaterialForImport` (Export)

The parsed items are converted to the Innergy import format with the following field mappings:

| Innergy Field | Source Field | Notes |
|---------------|--------------|-------|
| MaterialName | Name | Required |
| Location | Category | |
| Cost | Price | |
| Margin | - | Always null |
| BudgetGroup | Category | Same as Location |
| Status | - | Always null |
| UoMGroup | - | Always null |
| MRPType | - | Always null |
| Description | - | Always null |
| Note | LastDate | Date stored as note |
| ExpenseOrCostOfGoodsSoldGLAccount | GlCostType | |
| DefaultCommonUoM | Uom | |
| Weight | - | Always null |
| Manufacturer | - | Always null |
| ManufacturerSKU | - | Always null |
| ExternalID | - | Always null |
| Stock | - | Always null |
| GrainDirection | - | Always null |
| ExternalApproval | - | Always null |
| ExpenseUponReceipt | - | Always null |
| Vendor | Vendor | |
| VendorSKU | - | Always null |
| LeadTime | - | Always null |
| InventoryGLAccount | - | Always null |
| AccountsPayableGLAccount | - | Always null |

## Date Normalization

The `LastDate` field supports multiple input formats:

- `MM/DD/YY` → `MM/DD/YY` (padded)
- `MM/DD/YYYY` → `MM/DD/YY` (year truncated)
- `M/D/YY` → `MM/DD/YY` (padded)
- Full date strings (e.g., `Sun Feb 24 2008 17:00:00 GMT-0700`) → `MM/DD/YY`

## Merged Cell Handling

The parser uses ExcelJS to read merged cells. For merged cell ranges:
- The value is always read from the top-left (master) cell
- The parser checks if a row is the first row of a merge to avoid duplicate processing

## Vendor Filtering

Vendor values are filtered to exclude stock information:
- Values starting with `N/A Stock:` are set to null
- Values starting with `In Stock:` are set to null  
- Values starting with `Stock:` are set to null
- Text after newlines is discarded

## UOM Cleaning

UOM values are cleaned:
- Text after newlines is discarded
- The suffix `Tax? N` (with any leading whitespace) is removed

## Usage

1. Upload a ProjectPak Material Library Export `.xlsx` file
2. The parser extracts materials and displays the count
3. Export the converted data as a new Innergy-compatible `.xlsx` file

## File Locations

- **Parser**: `src/Data/States/ProjectPakMaterialReportParser/ProjectPakMaterialReportParserReceiver.ts`
- **Input Model**: `src/Core/Models/ProjectPak/MaterialReportParser/ProjectPakMaterialReportitem.ts`
- **Output Model**: `src/Core/Models/ProjectPak/MaterialReportParser/InnergyMaterialForImport.ts`
