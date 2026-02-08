import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGet from '@/hooks/useGet';
import usePost from '@/hooks/usePost';
import { useTranslation } from 'react-i18next';
import { Warehouse, Package, ArrowRight, Trash2, Plus, Send, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

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

  const [selectedProducts, setSelectedProducts] = useState([]);

  // Fetch products when "from warehouse" is selected using useGet hook
  const productUrl = formData.fromWarehouseId
    ? `/api/admin/product_warehouse/${formData.fromWarehouseId}`
    : null;

  const { data: productsData, loading: loadingProducts } = useGet(productUrl);

  // Clear selected products when warehouse changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, products: [] }));
    setSelectedProducts([]);
  }, [formData.fromWarehouseId]);

  // Toggle individual product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === productsData?.products?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsData?.products?.map(p => p._id) || []);
    }
  };

  // Add selected products to transfer list
  const addSelectedProducts = () => {
    if (!productsData?.products) return;

    const productsToAdd = productsData.products.filter(p =>
      selectedProducts.includes(p._id) &&
      !formData.products.find(fp => fp.productId === p._id)
    );

    if (productsToAdd.length === 0) {
      toast.warning(t('All selected products are already added'));
      return;
    }

    const newProducts = productsToAdd.map(product => ({
      productId: product._id,
      name: product.name,
      availableQuantity: product.quantity || 0,
      quantity: 1
    }));

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, ...newProducts]
    }));

    setSelectedProducts([]);
    toast.success(t(`${productsToAdd.length} product(s) added`));
  };

  const addProduct = (product) => {
    // Check if product already added
    if (formData.products.find(p => p.productId === product._id)) {
      toast.warning(t('Product already added'));
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: product._id,
        name: product.name,
        availableQuantity: product.quantity || 0,
        quantity: 1
      }]
    }));
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
            <select
              className="w-full border rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.fromWarehouseId}
              onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
            >
              <option value="">{t('Select Source Warehouse')}</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>
                  {w.name} ({t('Stock')}: {w.stock_Quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Warehouse size={16} className="text-green-600" />
              {t('To Warehouse')}
            </label>
            <select
              className="w-full border rounded-xl p-3 bg-white focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.toWarehouseId}
              onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
            >
              <option value="">{t('Select Destination Warehouse')}</option>
              {warehouses
                .filter(w => w._id !== formData.fromWarehouseId)
                .map(w => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({t('Stock')}: {w.stock_Quantity})
                  </option>
                ))}
            </select>
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
        {/* Available Products */}
        {formData.fromWarehouseId && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Package size={16} className="text-purple-600" />
                {t('Available Products in Source Warehouse')}
              </label>
              {selectedProducts.length > 0 && (
                <button
                  onClick={addSelectedProducts}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  {t('Add Selected')} ({selectedProducts.length})
                </button>
              )}
            </div>

            {loadingProducts ? (
              <div className="text-center py-8 text-gray-500">
                {t('Loading products...')}
              </div>
            ) : !productsData?.products || productsData.products.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                {t('No products available in this warehouse')}
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          checked={selectedProducts.length === productsData.products.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left">{t('Product Name')}</th>
                      <th className="p-4 text-center">{t('Available Quantity')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsData.products.map(product => (
                      <tr
                        key={product._id}
                        className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedProducts.includes(product._id) ? 'bg-teal-50' : ''
                          }`}
                        onClick={() => toggleProductSelection(product._id)}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-4 font-bold text-gray-700">{product.name}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-teal-50 text-teal-700 px-3 py-1 rounded-lg font-bold">
                            {product.quantity || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
