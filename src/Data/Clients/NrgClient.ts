import type {
  ProjectDto,
  ProjectsChunckedApiResponseDto,
} from "@/Core/Models/nrg-dtos/ProjectDto";
import type { TenantDto } from "@/Core/Models/nrg-dtos/nrg-dto-tenant";
import type {
  LaborItemDto,
  LaborItemsResponseDto,
} from "../../Core/Models/nrg-dtos/LaborItemDto";
import type { MesLaborGridResponseDto } from "../../Core/Models/nrg-dtos/MesLaborGrid";
// import type { DateManagementByMonthDto } from "../../Core/Models/nrg-dtos/DateManagementByMonth";
import type { WorkflowsDto } from "../../Core/Models/nrg-dtos/WorkflowDto";
import type {
  WorkOrdersChunckedApiResponseDto,
  WorkOrderDto,
} from "../../Core/Models/nrg-dtos/WorkOrderDto";
import type { INrgClient } from "./INrgClient";
// import { ResponseState } from "../ResponseState";
import type { OperationModelResultModel } from "@/Core/Models/nrg-dtos/OperationModelResultModel";
import type { ProjectModelResultModel } from "@/Core/Models/nrg-dtos/ProjectModelResultModel";
import type { ProjectWorkOrderResultModel } from "@/Core/Models/nrg-dtos/ProjectWorkOrderResultModel";

export class NrgClient implements INrgClient {
  _apiUrlBase: string;
  _proxyTag: string =
    (import.meta.env.VITE_PROXY_TAG as string | undefined) ?? "";
  _urlGetProjects: string = "/api/projects";
  _urlGetWorkOrders: string = "/api/projectWorkOrders?status=Open";
  _urlGetLaborItems: string = "/api/labors";
  _urlGetLaborKanbanGridItems: string = "/api/laborKanbanGridItems";
  _urlGetWorkflows: string = "/api/projects/workflows";
  _urlGetTenantInfo: string = "/api/ourCompanyInfo";
  _urlGetVersion: string = "/api/version";
  // _urlPostPunch: string = "/api/timeTracking";
  key: string = "";

  constructor() {
    // Normalize and harden base so production always uses same-origin "/proxy".
    const norm = (s: string) => s.replace(/\/+$/g, "");
    const ensureLeading = (s: string) => (s.startsWith("/") ? s : "/" + s);

    const proxyTag =
      this._proxyTag && this._proxyTag.length > 0
        ? ensureLeading(this._proxyTag)
        : "/proxy";

    if (import.meta.env.DEV) {
      // In dev we use Vite's proxy on the same path (see vite.config.ts)
      this._apiUrlBase = proxyTag;
    } else {
      // In production (Cloudflare Workers), keep calls same-origin via "/proxy".
      const baseEnv =
        (import.meta.env.VITE_BASE_URL as string | undefined) ?? "/";
      const base = ensureLeading(norm(baseEnv || "/"));
      this._apiUrlBase = norm(base) + proxyTag;
    }
  }

  SetKey(pw: string): boolean {
    this.key = pw;
    return this.key == pw;
  }

  async get(url: string): Promise<Response> {
    return await fetch(this._apiUrlBase + url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Api-Key": this.key,
      },
    });
  }

  async post(url: string, toPost: string): Promise<Response> {
    //
    // console.warn(`==> NrgClient.post(${url})`);
    // console.log("post url: " + this._apiUrlBase + url);
    // console.dir(`toPost: ${toPost}`);
    //
    return await fetch(this._apiUrlBase + url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Api-Key": this.key,
        "Content-Type": "application/json",
      },
      body: toPost,
    });
  }
  //===================================================================================//

  async GetLaborItems(): Promise<LaborItemDto[]> {
    const res = await this.get(this._urlGetLaborItems);

    if (res.ok) {
      const data = (await res.json()) as LaborItemsResponseDto;
      const flatItems: LaborItemDto[] = data.Items.flat();

      // console.log("GetLaborItems()");
      // console.dir(flatItems as LaborItemDto[]);

      return flatItems as LaborItemDto[];
    } else {
      throw Error(res.statusText);
    }
  }

  async GetWorkOrders(key: string): Promise<WorkOrderDto[]> {
    this.key = key;
    const res = await this.get(this._urlGetWorkOrders);
    console.warn(`==> NrgClient.GetWorkOrders`);
    console.dir(res);

    if (res.ok) {
      const data = (await res.json()) as WorkOrdersChunckedApiResponseDto;
      console.dir(data);
      const flatItems: WorkOrderDto[] = data.Items.flat();
      console.dir(flatItems);
      return flatItems as WorkOrderDto[];
    } else {
      throw Error(res.statusText);
    }
  }

  async GetLegacyProjects(key: string): Promise<ProjectDto[]> {
    this.key = key;
    const res = await this.get(this._urlGetProjects);
    console.warn(`==> NrgClient.GetProjects`);
    console.dir(res);

    if (res.ok) {
      const data = (await res.json()) as ProjectsChunckedApiResponseDto;
      console.dir(data);

      const flatItems: ProjectDto[] = data.Items.flat();
      return flatItems as ProjectDto[];
    } else {
      throw Error(res.statusText);
    }
  }

  async GetProjects(): Promise<ProjectModelResultModel> {
    const res = await this.get(this._urlGetProjects);
    if (res.ok) {
      return (await res.json()) as ProjectModelResultModel;
    } else {
      throw Error(res.statusText);
    }
  }

  async GetTenantInfo(key: string): Promise<TenantDto> {
    this.key = key;
    const res = await this.get(this._urlGetTenantInfo);
    console.warn("==> NrgClient.GetTenantInfo");
    console.dir(res);
    if (res.ok) {
      const data = (await res.json()) as TenantDto;
      return data;
    } else {
      throw Error(res.statusText);
    }
  }

  async GetServerVersion(): Promise<{ ServerVersion: string }> {
    // Add a cache buster to avoid any stale SW/proxy caches in dev.
    const versionUrl = `${this._urlGetVersion}?t=${Date.now()}`;
    const res = await this.get(versionUrl);
    if (res.ok) {
      const raw = await res.text();
      if (!raw) {
        throw new Error(
          `Empty response from ${this._apiUrlBase}${versionUrl} (did the dev proxy forward the request?)`,
        );
      }
      const data = JSON.parse(raw) as { ServerVersion: string };
      return data;
    } else {
      throw Error(res.statusText);
    }
  }

  async GetLaborKanbanGridItems(): Promise<MesLaborGridResponseDto> {
    const res = await this.get(this._urlGetLaborKanbanGridItems);
    console.warn("==> NrgClient.GetLaborKanbanGridItems");
    console.dir(res);
    if (res.ok) {
      const data = (await res.json()) as MesLaborGridResponseDto;
      console.dir(data);
      return data;
    } else {
      throw Error(res.statusText);
    }
  }

  // async GetDateManagementByMonth(year: number, month: number): Promise<DateManagementByMonthDto> {
  //   const url = `/api/dateManagement/${year}/${month}`;
  //   const res = await this.get(url);
  //   console.warn(`==> NrgClient.GetDateManagementByMonth(${year}, ${month})`);
  //   console.dir(res);
  //   if (res.ok) {
  //     const data = (await res.json()) as DateManagementByMonthDto;
  //     console.dir(data);
  //     return data;
  //   } else {
  //     throw Error(res.statusText);
  //   }
  // }

  async GetWorkflows(): Promise<WorkflowsDto> {
    const res = await this.get(this._urlGetWorkflows);
    console.warn("==> NrgClient.GetWorkflows");
    console.dir(res);
    if (res.ok) {
      const data = (await res.json()) as WorkflowsDto;
      console.dir(data);
      return data;
    } else {
      throw Error(res.statusText);
    }
  }

  async importEngineeringSyncData(
    payload: import("@/Core/Models/nrg-dtos/ImportEngineeringSyncDataModel").ImportEngineeringSyncDataModel,
  ): Promise<
    import("@/Core/Models/nrg-dtos/ImportEngineeringSyncDataModel").ResultTypeExceptionDetails
  > {
    const url = "/api/engineeringsync/importjson";
    const res = await this.post(url, JSON.stringify(payload));
    if (res.ok) {
      return (await res.json()) as import("@/Core/Models/nrg-dtos/ImportEngineeringSyncDataModel").ResultTypeExceptionDetails;
    } else {
      // Parse error response body to get Messages array
      try {
        const errorBody = await res.json();
        // If the error body has the expected structure, return it so the caller can handle Messages
        if (errorBody && (errorBody.Messages || errorBody.OutcomeType)) {
          return errorBody as import("@/Core/Models/nrg-dtos/ImportEngineeringSyncDataModel").ResultTypeExceptionDetails;
        }
        // Otherwise throw with parsed message
        throw new Error(errorBody?.message || res.statusText);
      } catch (parseErr) {
        // If JSON parsing fails, throw with statusText
        if (parseErr instanceof Error && parseErr.message !== res.statusText) {
          throw parseErr;
        }
        throw new Error(res.statusText);
      }
    }
  }

  async importEngineeringSyncDataRaw(json: string): Promise<any> {
    const url = "/api/engineeringsync/importjson";
    const res = await this.post(url, json);
    if (res.ok) {
      return await res.json();
    } else {
      let errorMsg = res.statusText;
      try {
        const errJson = await res.json();
        errorMsg = errJson?.message || errorMsg;
      } catch {
        // Ignore if parsing error body fails
      }
      throw new Error(errorMsg);
    }
  }

  async GetOperations(): Promise<OperationModelResultModel> {
    const res = await this.get("/api/operations");
    if (res.ok) {
      return (await res.json()) as OperationModelResultModel;
    } else {
      let errorMsg = res.statusText;
      try {
        const errJson = await res.json();
        errorMsg = errJson?.message || errorMsg;
      } catch {
        // Ignore if parsing error body fails
      }
      throw new Error(errorMsg);
    }
  }

  async GetProjectWorkOrders(
    projectNumber: string,
  ): Promise<ProjectWorkOrderResultModel> {
    const res = await this.get(`/api/projects/${projectNumber}/workorders`);
    if (res.ok) {
      return (await res.json()) as ProjectWorkOrderResultModel;
    } else {
      let errorMsg = res.statusText;
      try {
        const errJson = await res.json();
        errorMsg = errJson?.message || errorMsg;
      } catch {
        // Ignore if parsing error body fails
      }
      throw new Error(errorMsg);
    }
  }
}
