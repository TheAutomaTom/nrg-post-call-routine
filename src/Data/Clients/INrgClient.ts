import type { WorkOrderDto } from "../../Core/Models/nrg-dtos/WorkOrderDto";
import type { LaborItemDto } from "../../Core/Models/nrg-dtos/LaborItemDto";
import type { MesLaborGridResponseDto } from "../../Core/Models/nrg-dtos/MesLaborGrid";
// import type { DateManagementByMonthDto } from "../../Core/Models/nrg-dtos/DateManagementByMonth";
import type { WorkflowsDto } from "../../Core/Models/nrg-dtos/WorkflowDto";
import type { OperationModelResultModel } from "@/Core/Models/nrg-dtos/OperationModelResultModel";

export interface INrgClient {
  GetWorkOrders(
    user: string,
    pw: string,
    timezone: number,
  ): Promise<WorkOrderDto[]>;
  GetLaborItems(): Promise<LaborItemDto[]>;
  GetLaborKanbanGridItems(): Promise<MesLaborGridResponseDto>;
  // GetDateManagementByMonth(year: number, month: number): Promise<DateManagementByMonthDto>;
  GetWorkflows(): Promise<WorkflowsDto>;
  GetOperations(): Promise<OperationModelResultModel>;
  importEngineeringSyncDataRaw(json: string): Promise<any>;
}
