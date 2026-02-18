import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGet from '@/hooks/useGet';
import Loader from '@/components/Loader';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Warehouse, Package, Info, ShieldCheck, Tag, XCircle, CheckCircle2 } from 'lucide-react';
import usePut from '@/hooks/usePut';
import { toast } from 'react-toastify';

const TransferDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';
    const [activeTab, setActiveTab] = useState('all');
    const [statusReason, setStatusReason] = useState('');
    const [productDecisions, setProductDecisions] = useState({});

    // جلب مخزن المستخدم الحالي
    const currentWarehouseId = localStorage.getItem('currentWarehouseId');

    const { data, loading, error, refetch } = useGet(`/api/admin/transfer/${id}`);
    const { putData, loading: updating } = usePut();
    const transfer = data?.transfer;

    // تحديد هل المستخدم هو المرسل أم لا
    const isSender = transfer?.fromWarehouseId?._id === currentWarehouseId;

    useEffect(() => {
        if (data?.transfer?.products) {
            const initialDecisions = {};
            data.transfer.products.forEach(p => {
                initialDecisions[p.productId?._id] = 'approved';
            });
            setProductDecisions(initialDecisions);
        }
    }, [data]);

    if (loading) return <Loader />;

    if (error || !transfer) {
        return (
            <div className="p-6 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 inline-block max-w-md">
                    <Info className="mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold mb-2">{t('Error Loading Transfer')}</h2>
                    <p className="mb-6">{error || t('Transfer not found')}</p>
                    <button onClick={() => navigate('/transfer')} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors">
                        {t('Back to List')}
                    </button>
                </div>
            </div>
        );
    }

    const renderStatus = (status) => {
        let bgColor = "bg-gray-100 text-gray-800";
        if (status === "done" || status === "received") bgColor = "bg-green-100 text-green-800 border-green-200";
        else if (status === "pending" || status === "partially_received") bgColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
        else if (status === "rejected") bgColor = "bg-red-100 text-red-800 border-red-200";

        return (
            <span className={`px-4 py-1.5 rounded-full text-sm font-black border uppercase tracking-wider ${bgColor}`}>
                {t(status)}
            </span>
        );
    };

    const handleStatusUpdate = async (forceStatus = null) => {
        if (!transfer) return;

        let approved_products = [];
        let rejected_products = [];
        let finalStatus = 'received';

        if (forceStatus === 'rejected') {
            finalStatus = 'rejected';
            rejected_products = transfer.products.map(p => ({
                productId: p.productId?._id,
                quantity: p.quantity
            }));
        } else {
            approved_products = transfer.products
                .filter(p => productDecisions[p.productId?._id] === 'approved')
                .map(p => ({
                    productId: p.productId?._id,
                    quantity: p.quantity
                }));

            rejected_products = transfer.products
                .filter(p => productDecisions[p.productId?._id] === 'rejected')
                .map(p => ({
                    productId: p.productId?._id,
                    quantity: p.quantity
                }));

            if (approved_products.length === 0) {
                finalStatus = 'rejected';
            }
        }

        const payload = {
            warehouseId: transfer.toWarehouseId?._id,
            status: finalStatus,
            reason: statusReason,
            approved_products,
            rejected_products
        };

        try {
            await putData(payload, `/api/admin/transfer/${id}`);
            toast.success(t(finalStatus === 'rejected' ? 'Transfer rejected' : 'Transfer processed successfully'));
            refetch();
            setStatusReason('');
        } catch (err) {
            console.error("Status update error:", err);
            toast.error(t('Failed to update transfer status'));
        }
    };

    const toggleProductDecision = (productId, decision) => {
        setProductDecisions(prev => ({
            ...prev,
            [productId]: decision
        }));
    };

    const tabs = [
        { id: 'all', label: t('Requested'), icon: <Package size={18} />, count: transfer.products?.length || 0, color: 'purple' },
        { id: 'approved', label: t('Approved'), icon: <CheckCircle2 size={18} />, count: transfer.approved_products?.length || 0, color: 'green' },
        { id: 'rejected', label: t('Rejected'), icon: <XCircle size={18} />, count: transfer.rejected_products?.length || 0, color: 'red' },
    ];

    const getActiveProducts = () => {
        if (activeTab === 'approved') return transfer.approved_products || [];
        if (activeTab === 'rejected') return transfer.rejected_products || [];
        return transfer.products || [];
    };

    const products = getActiveProducts();

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="w-full">
                {/* Header Section (Unchanged) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/transfer')} className="p-3 bg-white hover:bg-gray-100 rounded-xl border transition-all text-gray-600">
                            <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                                {t('Transfer Details')}
                                <span className="text-teal-600">#{transfer.reference}</span>
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {new Date(transfer.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    <div>{renderStatus(transfer.status)}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Warehouse Route Card (Unchanged) */}
                        <div className="bg-white rounded-3xl shadow-sm border p-8">
                            <div className="flex items-center justify-between relative">
                                <div className="flex-1 text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Warehouse className="text-blue-600" size={32} />
                                    </div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t('Source')}</h3>
                                    <p className="text-xl font-black text-gray-800">{transfer.fromWarehouseId?.name}</p>
                                </div>
                                <div className="px-4 z-10">
                                    <div className="bg-gray-100 p-2 rounded-full border-4 border-white shadow-sm">
                                        <ArrowLeft size={24} className={`text-gray-400 ${isRTL ? "" : "rotate-180"}`} />
                                    </div>
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Warehouse className="text-green-600" size={32} />
                                    </div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t('Destination')}</h3>
                                    <p className="text-xl font-black text-gray-800">{transfer.toWarehouseId?.name}</p>
                                </div>
                                <div className="absolute top-8 left-1/4 right-1/4 h-0.5 bg-dashed bg-gray-100 -z-0"></div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                            <div className="p-2 bg-gray-50/50 border-b">
                                <div className="flex gap-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id
                                                ? `bg-white text-${tab.color}-600 shadow-md ring-1 ring-gray-100`
                                                : "text-gray-400 hover:text-gray-600"
                                                }`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs ${activeTab === tab.id ? `bg-${tab.color}-100` : "bg-gray-100"}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto min-h-[300px]">
                                {products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <Package size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">{t('No products in this category')}</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="p-5 text-left font-bold">{t('Product Name')}</th>
                                                <th className="p-5 text-center font-bold">{t('Quantity')}</th>

                                                {/* التغيير الأول: لو أنا المرسل، أظهر الحالة "Status" بدلاً من القرارات "Decision" */}
                                                {(activeTab === 'all' && transfer.status === 'pending' && !isSender) ? (
                                                    <th className="p-5 text-center font-bold">{t('Decision')}</th>
                                                ) : (
                                                    <th className="p-5 text-center font-bold">{t('Status')}</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.map((item, idx) => (
                                                <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${activeTab === 'all' && transfer.status === 'pending'
                                                    ? productDecisions[item.productId?._id] === 'approved'
                                                        ? 'bg-green-50/30'
                                                        : 'bg-red-50/30'
                                                    : ''
                                                    }`}>
                                                    <td className="p-5">
                                                        <div className="font-black text-gray-800">{item.productId?.name}</div>
                                                        <div className="text-xs text-gray-400 mt-1">ID: {item.productId?._id}</div>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="inline-block px-4 py-1.5 rounded-xl font-black text-lg bg-teal-50 text-teal-700">
                                                            {item.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {/* التغيير الثاني: إظهار الأزرار فقط لو أنا لست المرسل */}
                                                        {activeTab === 'all' && transfer.status === 'pending' && !isSender ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => toggleProductDecision(item.productId?._id, 'approved')}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${productDecisions[item.productId?._id] === 'approved'
                                                                        ? 'bg-teal-600 text-white shadow-md'
                                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    <CheckCircle2 size={16} />
                                                                    {t('Receive')}
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleProductDecision(item.productId?._id, 'rejected')}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${productDecisions[item.productId?._id] === 'rejected'
                                                                        ? 'bg-red-600 text-white shadow-md'
                                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    <XCircle size={16} />
                                                                    {t('Reject')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            // العرض الافتراضي للحالة (سواء للمرسل أو للأرشيف)
                                                            <span className={`flex items-center justify-center gap-1 font-bold ${activeTab === 'rejected' ? 'text-red-600' :
                                                                activeTab === 'approved' ? 'text-green-600' : 'text-purple-600'
                                                                }`}>
                                                                {activeTab === 'rejected' ? <XCircle size={16} /> :
                                                                    activeTab === 'approved' ? <ShieldCheck size={16} /> : <Package size={16} />}
                                                                {/* للمرسل، نعرض حالة المنتج العامة */}
                                                                {tabs.find(t => t.id === activeTab).label}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border p-6">
                            <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-orange-500" />
                                {t('Additional Information')}
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100">
                                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                        <Tag size={12} />
                                        {t('Transfer Reason')}
                                    </h3>
                                    <p className="text-gray-800 font-bold leading-relaxed whitespace-pre-wrap">
                                        {transfer.reason || t('No reason provided')}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('Reference ID')}</span>
                                        <span className="text-gray-800 font-black tracking-widest">{transfer.reference}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('Status')}</span>
                                        <span className="font-black text-xs uppercase">{t(transfer.status)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('Date')}</span>
                                        <span className="text-gray-800 font-bold">
                                            {new Date(transfer.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Card: التغيير الجوهري هنا */}
                        {/* يظهر فقط إذا كانت الحالة Pending وكمان أنا لست المرسل */}
                        {transfer.status === 'pending' && !isSender && (
                            <div className="bg-white rounded-3xl shadow-sm border p-6">
                                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-teal-600" />
                                    {t('Process Transfer')}
                                </h2>

                                <div className="space-y-2 mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Tag size={12} />
                                        {t('Note / Reason')}
                                    </label>
                                    <textarea
                                        value={statusReason}
                                        onChange={(e) => setStatusReason(e.target.value)}
                                        placeholder={t('Add a note to this action...')}
                                        className="w-full border rounded-2xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-24 bg-gray-50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate('received')}
                                        disabled={updating}
                                        className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-2xl font-black shadow-lg shadow-teal-100 transition-all disabled:opacity-50"
                                    >
                                        <CheckCircle2 size={18} />
                                        {t('Receive')}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updating}
                                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-2xl font-black border border-red-100 transition-all disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        {t('Reject')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferDetails;