import { createRouter, createWebHistory } from "vue-router";
import { useAppState } from "@/Core/States/app-state";
import LoginAndSelect from "@/App/Views/Home/LoginAndSelect.vue";
import DataBackup from "@/App/Views/Home/DataBackup.vue";
import TenantAuthMainView from "@/App/Views/Features/TenantUpdater/TenantAuthView.vue";
import TenantUpdateMainView from "@/App/Views/Features/TenantUpdater/TenantUpdaterView.vue";


const routes = [
  {
    path: "/",
    name: "longin-and-select",
    component: LoginAndSelect,
  },
  {
    path: "/data-backup",
    name: "data-backup",
    component: DataBackup,
  },
  {
    path: "/tenant-auth",
    name: "tenant-auth-main",
    component: TenantAuthMainView,
  },
  {
    path: "/tenant-update",
    name: "tenant-update-main",
    component: TenantUpdateMainView,
  }
];

export const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const app$ = useAppState();
  app$.showLoading();

  // Allow help pages and home page to load without redirect
  if (
    to.name === "longin-and-select" ||
    (to.name && typeof to.name === "string" && to.name.startsWith("help-"))
  ) {
    next();
  } else {
    // For other routes on fresh page load, redirect to home
    if (from.name === null || from.name === undefined) {
      next({ name: "longin-and-select" });
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  const app$ = useAppState();
  // Small delay to bridge the gap between navigation end and component mount
  setTimeout(() => {
    app$.hideLoading();
  }, 50);
});
