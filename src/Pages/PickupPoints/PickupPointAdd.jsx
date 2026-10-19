import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import Loader from "@/components/Loader";
import PickupPointForm from "./PickupPointForm";

const num = (v) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

const PickupPointAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState("branch"); // "branch" | "new"
  const [creatingId, setCreatingId] = useState(null);

  const { postData, loading } = usePost("/api/admin/pickup-point/");
  const { data: branchesData, loading: branchesLoading } = useGet(
    "/api/admin/warehouse",
  );
  const branches = branchesData?.warehouses || [];

  const handleSubmitNew = async (data) => {
    try {
      const payload = {
        branch_id: data.branch_id || null,
        name: data.name,
        ar_name: data.ar_name,
        phone: data.phone,
        address: data.address,
        ar_address: data.ar_address,
        lat: num(data.lat),
        lng: num(data.lng),
        is_active: !!data.is_active,
      };

      await postData(payload);
      navigate("/pickup-point");
    } catch (err) {
      // usePost already surfaces the error toast.
      console.error("Create pickup point failed:", err);
    }
  };

  const handleAddFromBranch = async (branch) => {
    try {
      setCreatingId(branch._id);
      // The backend copies the branch details onto the new pickup point.
      await postData({ branch_id: branch._id });
      navigate("/pickup-point");
    } catch (err) {
      console.error("Create pickup point from branch failed:", err);
    } finally {
      setCreatingId(null);
    }
  };

  const tabClass = (name) =>
    `px-5 py-2 rounded-lg text-sm font-medium transition ${
      tab === name
        ? "bg-primary text-white shadow"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2 mb-5">
        <button
          type="button"
          className={tabClass("branch")}
          onClick={() => setTab("branch")}
        >
          {t("From my branches")}
        </button>
        <button
          type="button"
          className={tabClass("new")}
          onClick={() => setTab("new")}
        >
          {t("New pickup point")}
        </button>
      </div>

      {tab === "branch" ? (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            {t("Pick a branch to use as a pickup point")}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            {t(
              "The branch details will be copied to the pickup point and stay linked to it.",
            )}
          </p>

          {branchesLoading ? (
            <Loader />
          ) : branches.length === 0 ? (
            <div className="text-gray-500 py-8 text-center">
              {t("No branches found")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div
                  key={branch._id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-800">
                    {branch.name}
                  </h3>
                  {branch.ar_name && (
                    <p className="text-sm text-gray-500">{branch.ar_name}</p>
                  )}
                  {branch.address && (
                    <p className="text-sm text-gray-600">{branch.address}</p>
                  )}
                  {branch.phone && (
                    <p className="text-sm text-gray-600" dir="ltr">
                      {branch.phone}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={creatingId === branch._id}
                    onClick={() => handleAddFromBranch(branch)}
                    className="mt-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60"
                  >
                    {creatingId === branch._id
                      ? t("Adding...")
                      : t("Add as pickup point")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <PickupPointForm
          title={t("Add Pickup Point")}
          description={t(
            "Create a new pickup point and set its location on the map.",
          )}
          initialData={{ is_active: true }}
          onSubmit={handleSubmitNew}
          onCancel={() => navigate("/pickup-point")}
          loading={loading}
          showBranchSelect={false}
        />
      )}
    </div>
  );
};

export default PickupPointAdd;
