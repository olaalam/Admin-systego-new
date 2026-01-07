import React, { useState, useEffect } from 'react';
import { Search, Trash2, Plus, Scan, X, Upload } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';

const ProductSelector = ({ 
  products = [], 
  selectedProducts = [], 
  onProductsChange,
  label = "Select Products",
  showQuantity = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Filter products based on search
  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) || 
      product.ar_name?.toLowerCase().includes(search)
    );
  });

  // Camera setup
  useEffect(() => {
    let scanner = null;
    if (showCamera) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      });

      scanner.render((decodedText) => {
        handleBarcodeScanned(decodedText);
        setShowCamera(false);
        scanner.clear();
      }, (error) => { /* Ignore constant scanning errors */ });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [showCamera]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("reader");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleBarcodeScanned(decodedText);
      setShowCamera(false);
    } catch (err) {
      toast.error("No barcode found in the selected image.", err);
    }
  };

  // Add product by search/click
  const addProduct = (product) => {
    const exists = selectedProducts.find(p => p._id === product._id || p.productId === product._id);
    
    if (!exists) {
      const newProduct = showQuantity 
        ? { productId: product._id, quantity: 1, name: product.name, image: product.image }
        : product._id;
      
      onProductsChange([...selectedProducts, newProduct]);
    }
    setSearchTerm('');
  };

  // Add product by barcode
  const handleBarcodeScanned = (scannedCode) => {
    if (!scannedCode) return;
    
    for (const product of products) {
      const priceMatch = product.prices?.find(p => p.code === scannedCode);
      if (priceMatch) {
        addProduct(product);
        toast.success(`Added: ${product.name}`);
        return;
      }
    }
    toast.error(`Product with code "${scannedCode}" not found.`);
  };

  // Update quantity (if enabled)
  const updateQuantity = (productId, val) => {
    const quantity = parseInt(val) || 1;
    onProductsChange(selectedProducts.map(p => 
      (p.productId === productId) ? { ...p, quantity } : p
    ));
  };

  // Remove product
  const removeProduct = (productId) => {
    onProductsChange(selectedProducts.filter(p => {
      if (showQuantity) return p.productId !== productId;
      return p !== productId;
    }));
  };

  // Get product details for display
  const getProductDetails = (item) => {
    if (showQuantity) return item;
    return products.find(p => p._id === item);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      
      {/* Search & Scan Section */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-purple-500 transition-all overflow-hidden">
            <div className="p-3 bg-gray-50 border-r">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product by name..."
              className="flex-1 p-3 outline-none bg-transparent"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchTerm && filteredProducts.length > 0 && (
            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
              {filteredProducts.map(product => (
                <div key={product._id} className="p-3 hover:bg-purple-50 border-b last:border-0 transition-colors">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.categoryId?.[0]?.name} • {product.price} EGP
                      </div>
                    </div>
                    <button 
                      onClick={() => addProduct(product)}
                      className="text-xs bg-secondary hover:bg-purple-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="bg-secondary hover:bg-purple-700 text-white px-6 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Scan className="w-5 h-5" /> Scan
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
            <button 
              type="button"
              onClick={() => setShowCamera(false)} 
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold bg-red-500/20 px-4 py-2 rounded-full hover:bg-red-500 transition-all"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Scan Product Barcode</h2>
            <div id="reader" className="overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed border-gray-300"></div>
            <div className="mt-6 border-t pt-6">
              <p className="text-center text-sm font-semibold text-gray-500 mb-3">OR UPLOAD BARCODE IMAGE</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Selected Products List */}
      {selectedProducts.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-bold text-gray-700">
              Selected Products ({selectedProducts.length})
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {selectedProducts.map((item, idx) => {
              const product = getProductDetails(item);
              if (!product) return null;
              
              const productId = showQuantity ? item.productId : item;

              return (
                <div key={productId || idx} className="p-3 hover:bg-gray-50 flex items-center gap-3">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded border-2 border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.categoryId?.[0]?.name} • {product.price} EGP
                    </div>
                  </div>
                  
                  {showQuantity && (
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => updateQuantity(productId, e.target.value)}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center font-bold"
                    />
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeProduct(productId)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;