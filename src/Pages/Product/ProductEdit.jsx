import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";
import Loader from "@/components/Loader";
import ProductForm from "./ProductForm";
import { useTranslation } from "react-i18next";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t ,i18n } = useTranslation();

  // ✅ جلب المنتج
  const { data, loading, error } = useGet(`/api/admin/product/${id}`);

  // ✅ استخدام usePut بالـ URL الافتراضي
  const { putData, loading: updating } = usePut(`/api/admin/product/${id}`);

  // ✅ عند التحديث
  const handleUpdate = async (updatedData) => {
    try {
      // لو فيه صور: await putData(updatedData, null, true);
      await putData(updatedData);
      toast.success(t("Productupdatedsuccessfully"));
      navigate("/product");
    } catch {
      toast.error(t("Failed to update product"));
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <ProductForm
      mode="edit"
      initialData={data?.product}
      onSubmit={handleUpdate}
      loading={updating}
    />
  );
};

export default ProductEdit;
