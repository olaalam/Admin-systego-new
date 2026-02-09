import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGet from '@/hooks/useGet';
import usePost from '@/hooks/usePost';
import { useTranslation } from 'react-i18next';
import { Warehouse, Package, ArrowRight, Trash2, Plus, Send, ArrowLeft, FileText, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ComboboxMultiSelect } from '@/components/ui/combobox-multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransferAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { postData, loading } = usePost('/api/admin/transfer');
  const { data: warehousesData } = useGet('/api/admin/warehouse');

  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: '',
    products: []
  });

  // Fetch products when "from warehouse" is selected using useGet hook
  const productUrl = formData.fromWarehouseId
    ? `/api/admin/product_warehouse/${formData.fromWarehouseId}`
    : null;

  const { data: productsData, loading: loadingProducts } = useGet(productUrl);

  // Clear selected products when warehouse changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, products: [] }));
  }, [formData.fromWarehouseId]);

  // Handle product selection from combobox (Reactive)
  const handleProductSelectionChange = (newSelectedIds) => {
    const currentProducts = formData.products;
    const currentIds = currentProducts.map(p => p.productId);

    // Identify products to add
    const idsToAdd = newSelectedIds.filter(id => !currentIds.includes(id));

    // Identify products to remove
    const idsToRemove = currentIds.filter(id => !newSelectedIds.includes(id));

    let updatedProducts = [...currentProducts];

    // Add new products
    if (idsToAdd.length > 0) {
      const productsToAdd = (productsData?.products || [])
        .filter(p => idsToAdd.includes(p._id))
        .map(product => ({
          productId: product._id,
          name: product.name,
          availableQuantity: product.quantity || 0,
          quantity: 1
        }));
      updatedProducts = [...updatedProducts, ...productsToAdd];
    }

    // Remove products
    if (idsToRemove.length > 0) {
      updatedProducts = updatedProducts.filter(p => !idsToRemove.includes(p.productId));
    }

    setFormData(prev => ({ ...prev, products: updatedProducts }));
  };


  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const updateProductQuantity = (index, quantity) => {
    const product = formData.products[index];
    const numQuantity = Number(quantity);

    if (numQuantity > product.availableQuantity) {
      toast.error(t('Quantity exceeds available stock'));
      return;
    }

    if (numQuantity < 0) {
      toast.error(t('Quantity cannot be negative'));
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p, i) =>
        i === index ? { ...p, quantity: numQuantity } : p
      )
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fromWarehouseId) {
      toast.error(t('Please select source warehouse'));
      return;
    }

    if (!formData.toWarehouseId) {
      toast.error(t('Please select destination warehouse'));
      return;
    }

    if (formData.fromWarehouseId === formData.toWarehouseId) {
      toast.error(t('Source and destination warehouses must be different'));
      return;
    }

    if (!formData.reason || formData.reason.trim() === '') {
      toast.error(t('Please provide a reason for the transfer'));
      return;
    }

    if (formData.products.length === 0) {
      toast.error(t('Please add at least one product'));
      return;
    }

    // Check for invalid quantities
    const invalidProduct = formData.products.find(p => p.quantity <= 0 || p.quantity > p.availableQuantity);
    if (invalidProduct) {
      toast.error(t('Please check product quantities'));
      return;
    }

    // Prepare payload
    const payload = {
      fromWarehouseId: formData.fromWarehouseId,
      toWarehouseId: formData.toWarehouseId,
      reason: formData.reason,
      products: formData.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity
      }))
    };

    try {
      const response = await postData(payload, null);
      if (response) {
        toast.success(t('Transfer created successfully'));
        navigate('/transfer');
      }
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  const warehouses = warehousesData?.warehouses || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full bg-white rounded-2xl shadow-sm p-8 border">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-teal-100 p-3 rounded-xl">
            <ArrowLeft className="text-teal-600" size={28} />
          </div>
          <h1 className="text-3xl font-black text-gray-800">{t('Create Warehouse Transfer')}</h1>
        </div>

        {/* Warehouse Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Warehouse size={16} className="text-blue-600" />
              {t('From Warehouse')}
            </label>
            <Select
              value={formData.fromWarehouseId}
              onValueChange={(value) => setFormData({ ...formData, fromWarehouseId: value })}
            >
              <SelectTrigger className="w-full h-12 rounded-xl focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder={t('Select Source Warehouse')} />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(w => (
                  <SelectItem key={w._id} value={w._id}>
                    {w.name} ({t('Stock')}: {w.stock_Quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Warehouse size={16} className="text-green-600" />
              {t('To Warehouse')}
            </label>
            <Select
              value={formData.toWarehouseId}
              onValueChange={(value) => setFormData({ ...formData, toWarehouseId: value })}
            >
              <SelectTrigger className="w-full h-12 rounded-xl focus:ring-2 focus:ring-green-500">
                <SelectValue placeholder={t('Select Destination Warehouse')} />
              </SelectTrigger>
              <SelectContent>
                {warehouses
                  .filter(w => w._id !== formData.fromWarehouseId)
                  .map(w => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.name} ({t('Stock')}: {w.stock_Quantity})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transfer Reason */}
        <div className="mb-8">
          <label className="text-sm font-bold flex items-center gap-2 mb-2">
            <FileText size={16} className="text-orange-600" />
            {t('Transfer Reason')} <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            rows="3"
            placeholder={t('Enter reason for this transfer...')}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>
        {/* Available Products - Combobox Selection */}
        {formData.fromWarehouseId && (
          <div className="mb-8 p-6 bg-purple-50/30 rounded-2xl border border-purple-100/50 outline outline-1 outline-purple-100/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <label className="text-sm font-bold flex items-center gap-2">
                <Package size={20} className="text-purple-600" />
                <span className="text-lg text-purple-900">{t('Select Products to Transfer')}</span>
              </label>
            </div>

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-10 text-purple-400 bg-white/50 rounded-xl border border-purple-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                {t('Loading products...')}
              </div>
            ) : !productsData?.products || productsData.products.length === 0 ? (
              <div className="text-center py-10 text-purple-400 bg-white/50 rounded-xl border-2 border-dashed border-purple-100">
                {t('No products available in this warehouse')}
              </div>
            ) : (
              <div className="w-full">
                <ComboboxMultiSelect
                  options={productsData.products.map(p => ({
                    label: `${p.name} (${t('Stock')}: ${p.quantity || 0})${(p.quantity || 0) === 0 ? ` - ${t('Out of Stock')}` : ''}`,
                    value: p._id,
                    disabled: (p.quantity || 0) === 0
                  }))}
                  selected={formData.products.map(p => p.productId)}
                  onChange={handleProductSelectionChange}
                  placeholder={t('Search and select products...')}
                />
                <p className="mt-2 text-xs text-purple-500 flex items-center gap-1">
                  <Search size={12} />
                  {t('Quick search by product name')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selected Products Table */}
        {formData.products.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Send size={20} className="text-orange-600" />
              {t('Products to Transfer')}
            </h3>
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-4 text-left">{t('Product Name')}</th>
                    <th className="p-4 text-center">{t('Available Quantity')}</th>
                    <th className="p-4 text-center">{t('Transfer Quantity')}</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.products.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-700">{product.name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-lg font-bold">
                          {product.availableQuantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="1"
                          max={product.availableQuantity}
                          className="w-full border rounded-xl p-2 text-center font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                          value={product.quantity}
                          onChange={(e) => updateProductQuantity(index, e.target.value)}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => removeProduct(index)}
                          className="text-red-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || formData.products.length === 0}
          className="w-full mt-8 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-teal-100/50 flex items-center justify-center gap-3"
        >
          {loading ? (
            t('Processing...')
          ) : (
            <>
              <Send size={24} />
              {t('Create Transfer')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
