import React, { useState } from "react";
import {
    ArrowLeft,
    ShoppingCart,
    DollarSign,
    CreditCard,
    Package,
    Calendar,
    User,
    Phone,
    Mail,
    MapPin,
    FileText
} from "lucide-react";

// --- Mock Data (Simulating API Response) ---
const supplierData = {
    id: "SUP-001",
    name: "Global Tech Supplies",
    initials: "GTS",
    stats: {
        totalPurchases: "$245,800",
        totalPaid: "$180,000",
        outstanding: "$65,800",
        totalOrders: 42,
        lastPurchase: "2026-03-08"
    },
    info: {
        contactPerson: "John Smith",
        phone: "+1 (555) 123-4567",
        email: "contact@globaltechsupplies.com",
        address: "123 Industrial Ave"
    },
    notes: [
        "Delivery takes 2 days",
        "Minimum order 5000 EGP",
        "Offers bulk discounts for orders over 10000 EGP",
        "Reliable quality control",
        "Accepts returns within 14 days"
    ],
    purchases: [
        { poNumber: "PO-2145", date: "2026-03-08", itemsCount: 150, totalAmount: "$12,500", receivedQty: "150/150", status: "Received" },
        { poNumber: "PO-2132", date: "2026-03-01", itemsCount: 200, totalAmount: "$18,750", receivedQty: "120/200", status: "Partial" },
        { poNumber: "PO-2118", date: "2026-02-25", itemsCount: 100, totalAmount: "$8,900", receivedQty: "0/100", status: "Pending" },
        { poNumber: "PO-2095", date: "2026-02-18", itemsCount: 180, totalAmount: "$15,200", receivedQty: "180/180", status: "Received" },
    ],
    products: [
        { name: "Wireless Mouse", code: "PRD-001", category: "Electronics", price: "$25.00", lastPurchase: "2026-03-08" },
        { name: "USB-C Cable", code: "PRD-002", category: "Electronics", price: "$12.50", lastPurchase: "2026-03-08" },
        { name: "Laptop Stand", code: "PRD-003", category: "Accessories", price: "$45.00", lastPurchase: "2026-03-01" },
        { name: "HDMI Cable", code: "PRD-004", category: "Electronics", price: "$18.00", lastPurchase: "2026-02-25" },
    ],
    payments: [
        { id: "PAY-3421", date: "2026-03-08", amount: "$12,500", method: "Transfer", ref: "BANK-789456", notes: "Payment for PO-2145" },
        { id: "PAY-3398", date: "2026-03-01", amount: "$10,000", method: "Transfer", ref: "BANK-778899", notes: "Partial payment for PO-2132" },
        { id: "PAY-3365", date: "2026-02-18", amount: "$15,200", method: "Card", ref: "TXN-445566", notes: "Full payment for PO-2095" },
        { id: "PAY-3342", date: "2026-02-10", amount: "$22,400", method: "Transfer", ref: "BANK-667788", notes: "Payment for PO-2076" },
    ],
    returns: [
        { returnNo: "RET-SUP-012", poNumber: "PO-2095", date: "2026-02-22", items: "20 units - Defective items", refund: "$500", status: "Completed" },
        { returnNo: "RET-SUP-008", poNumber: "PO-2076", date: "2026-02-15", items: "5 units - Wrong specification", refund: "$225", status: "Approved" },
    ]
};

const SupplierDetailsPage = () => {
    const [activeTab, setActiveTab] = useState("Info");
    const tabs = ["Info", "Financial", "Purchases", "Payments", "Products", "Returns"];

    // --- Helper Components for Badges ---
    const StatusBadge = ({ status }) => {
        const styles = {
            Received: "bg-green-100 text-green-700",
            Completed: "bg-green-100 text-green-700",
            Partial: "bg-yellow-100 text-yellow-700",
            Pending: "bg-blue-100 text-blue-700",
            Approved: "bg-blue-100 text-blue-700",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
                {status}
            </span>
        );
    };

    const CategoryBadge = ({ category }) => (
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
            {category}
        </span>
    );

    const MethodBadge = ({ method }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${method === 'Transfer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {method}
        </span>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Back Button */}
            <div>
                <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">
                    <ArrowLeft size={16} className="mr-2" /> Back to Suppliers
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                        {supplierData.initials}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{supplierData.name}</h1>
                        <p className="text-sm text-gray-500">{supplierData.id}</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Card 1 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
                        <p className="text-xl font-bold text-gray-900">{supplierData.stats.totalPurchases}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-500"><ShoppingCart size={20} /></div>
                </div>
                {/* Card 2 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                        <p className="text-xl font-bold text-gray-900">{supplierData.stats.totalPaid}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-500"><DollarSign size={20} /></div>
                </div>
                {/* Card 3 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Outstanding Payables</p>
                        <p className="text-xl font-bold text-red-500">{supplierData.stats.outstanding}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-500"><CreditCard size={20} /></div>
                </div>
                {/* Card 4 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                        <p className="text-xl font-bold text-gray-900">{supplierData.stats.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full text-purple-500"><Package size={20} /></div>
                </div>
                {/* Card 5 */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Last Purchase</p>
                        <p className="text-xl font-bold text-gray-900">{supplierData.stats.lastPurchase}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-full text-orange-500"><Calendar size={20} /></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-50 p-1 rounded-full inline-flex space-x-1 w-full overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content Container */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

                {/* INFO TAB */}
                {activeTab === "Info" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <User className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Supplier Name</p>
                                        <p className="font-medium text-gray-900">{supplierData.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <User className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Contact Person</p>
                                        <p className="font-medium text-gray-900">{supplierData.info.contactPerson}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{supplierData.info.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{supplierData.info.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">{supplierData.info.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Notes</h3>
                            <div className="space-y-3">
                                {supplierData.notes.map((note, idx) => (
                                    <div key={idx} className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg flex items-center gap-3">
                                        <FileText className="text-yellow-600" size={18} />
                                        <span className="text-sm text-gray-800">{note}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* PURCHASES TAB */}
                {activeTab === "Purchases" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Purchase Orders</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">PO Number</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Items Count</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Total Amount</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Received Quantity</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplierData.purchases.map((po, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{po.poNumber}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{po.date}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{po.itemsCount}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{po.totalAmount}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{po.receivedQty}</td>
                                            <td className="py-4 px-4 text-sm"><StatusBadge status={po.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === "Products" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Products Supplied</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Product Name</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Code</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Category</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Purchase Price</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Last Purchase Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplierData.products.map((prod, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{prod.name}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{prod.code}</td>
                                            <td className="py-4 px-4 text-sm"><CategoryBadge category={prod.category} /></td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{prod.price}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{prod.lastPurchase}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === "Payments" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Payments to Supplier</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Payment ID</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Payment Method</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Reference Number</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplierData.payments.map((pay, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{pay.id}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{pay.date}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{pay.amount}</td>
                                            <td className="py-4 px-4 text-sm"><MethodBadge method={pay.method} /></td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{pay.ref}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{pay.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* RETURNS TAB */}
                {activeTab === "Returns" && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Returns to Supplier</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Return Number</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">PO Number</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Items Returned</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Refund Amount</th>
                                        <th className="pb-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplierData.returns.map((ret, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{ret.returnNo}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{ret.poNumber}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{ret.date}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{ret.items}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{ret.refund}</td>
                                            <td className="py-4 px-4 text-sm"><StatusBadge status={ret.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SupplierDetailsPage;