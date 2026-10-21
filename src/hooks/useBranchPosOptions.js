import useGet from "@/hooks/useGet";

/**
 * خيارات فلاتر التقارير: الفروع (Warehouses) + نقاط البيع (Cashiers)
 * endpoint خفيف مخصص للـ dropdowns.
 */
export default function useBranchPosOptions() {
  const { data, loading } = useGet("/api/admin/report-filters");

  return {
    warehouses: data?.warehouses || [],
    cashiers: data?.cashiers || [],
    loading,
  };
}
