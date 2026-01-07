// src/hooks/usePost.js
import { useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/api";

export default function usePost(defaultUrl = "") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = async (body = {}, customUrl = null, axiosConfig = {}) => {
    try {
      setLoading(true);

      const url = String(customUrl || defaultUrl);
      const config = { ...axiosConfig };

      const res = await api.post(url, body, config);

      // --- التعديل يبدأ من هنا ---
      
      // 1. التحقق مما إذا كان الطلب استقبل ملف (Blob)
      const isBlob = config.responseType === 'blob' || res.data instanceof Blob;

      if (isBlob) {
        // إذا كان ملف، نعتبر العملية ناجحة فوراً ونرجع البيانات
        // يمكنك إظهار رسالة نجاح هنا إذا أردت، أو تركها صامتة
        // toast.success("File generated successfully!"); 
        return res.data; 
      }

      // 2. إذا لم يكن ملفاً (JSON عادي)، نكمل المنطق القديم
      if (res.data?.success) {
        toast.success(res.data?.message || "Success!", {
          position: "top-right",
          autoClose: 3000,
        });
        return res.data; // إرجاع البيانات في حالة النجاح JSON
      } else {
        // حالة الفشل المنطقي من الباك إند (success: false)
        const msg = res.data?.error?.message || "Something went wrong!";
        toast.error(msg, {
          position: "top-right",
          autoClose: 3000,
        });
        // يمكنك هنا رمي خطأ أو إرجاع null حسب رغبتك في التعامل مع الكومبوننت
        return null; 
      }
      
      // --- نهاية التعديل ---

    } catch (err) {
      // التعامل مع أخطاء الشبكة (404, 500, etc.)
      // ملاحظة: إذا فشل تحميل الـ Blob، الاكسيوس سيرمي Error هنا غالباً إذا كان الـ Content-Type JSON
      
      let errorMsg = "Request failed";

      // محاولة استخراج رسالة الخطأ لو الرد كان JSON داخل الـ catch
      if (err.response?.data?.message) {
         errorMsg = err.response.data.message;
      } else if (err.response?.data?.error?.message) {
         errorMsg = err.response.data.error.message;
      } else if (err.message) {
         errorMsg = err.message;
      }

      // حالة خاصة: أحياناً الخطأ يرجع كـ Blob إذا فشل تحميل ملف PDF
      if (err.response?.data instanceof Blob) {
         // نحتاج لقراءة الـ Blob لنعرف رسالة الخطأ (اختياري ومتقدم)
         errorMsg = "Failed to generate file";
      }

      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
}