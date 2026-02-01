// src/router/index.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/Pages/Dashboard";
import LoginPage from "@/components/Login";
import NotFoundPage from "@/Pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅
import Brand from "./Pages/Brand/Brand";
import BrandAdd from "./Pages/Brand/BrandAdd";
import BrandEdit from "./Pages/Brand/BrandEdit";
import Category from "./Pages/Category/Category";
import CategoryAdd from "./Pages/Category/CategoryAdd";
import CategoryEdit from "./Pages/Category/CategoryEdit";
import Product from "./Pages/Product/Product";
import ProductAdd from "./Pages/Product/ProductAdd";
import ProductEdit from "./Pages/Product/ProductEdit";
import Attribute from "./Pages/Attribute/Attribute";
import AttributeAdd from "./Pages/Attribute/AttributeAdd";
import AttributeEdit from "./Pages/Attribute/AttributeEdit";
import Barcode from "./Pages/Barcode/Barcode";
import Admin from "./Pages/Admin/Admin";
import AdminAdd from "./Pages/Admin/AdminAdd";
import AdminEdit from "./Pages/Admin/AdminEdit";
import City from "./Pages/City/City";
import CityAdd from "./Pages/City/CityAdd";
import CityEdit from "./Pages/City/CityEdit";
import Country from "./Pages/Country/Country";
import CountryAdd from "./Pages/Country/CountryAdd";
import CountryEdit from "./Pages/Country/CountryEdit";
import WareHouse from "./Pages/WareHouse/WareHouse";
import WareHouseAdd from "./Pages/WareHouse/WareHouseAdd";
import WareHouseEdit from "./Pages/WareHouse/WareHouseEdit";
import Accounting from "./Pages/Accounting/Accounting";
import AccountingAdd from "./Pages/Accounting/AccountingAdd";
import AccountingEdit from "./Pages/Accounting/AccountingEdit";
import Supplier from "./Pages/Supplier/Supplier";
import SupplierAdd from "./Pages/Supplier/SupplierAdd";
import SupplierEdit from "./Pages/Supplier/SupplierEdit";
import PaymentMethod from "./Pages/PaymentMethod/PaymentMethod";
import PaymentMethodAdd from "./Pages/PaymentMethod/PaymentMethodAdd";
import PaymentMethodEdit from "./Pages/PaymentMethod/PaymentMethodEdit";
import Unit from "./Pages/Unit/Unit";
import UnitAdd from "./Pages/Unit/UnitAdd";
import UnitEdit from "./Pages/Unit/UnitEdit";
import ExpensesCategory from "./Pages/ExpensesCategory/ExpensesCategory";
import ExpensesCategoryAdd from "./Pages/ExpensesCategory/ExpensesCategoryAdd";
import ExpensesCategoryEdit from "./Pages/ExpensesCategory/ExpensesCategoryEdit";
import Taxes from "./Pages/Taxes/Taxes";
import TaxesAdd from "./Pages/Taxes/TaxesAdd";
import TaxesEdit from "./Pages/Taxes/TaxesEdit";
import PermissionEdit from "./Pages/Permission/PermissionEdit";
import Permission from "./Pages/Permission/Permission";
import Transfer from "./Pages/Transfer/Transfer";
import TransferAdd from "./Pages/Transfer/TransferAdd";
import TransferEdit from "./Pages/Transfer/TransferEdit";
import Revenue from "./Pages/Revenue/Revenue";
import RevenueAdd from "./Pages/Revenue/RevenueAdd";
import RevenueEdit from "./Pages/Revenue/RevenueEdit";
import Expenses from "./Pages/Expenses/Expenses";
import ExpensesAdd from "./Pages/Expenses/ExpensesAdd";
import ExpensesEdit from "./Pages/Expenses/ExpensesEdit";
import Popup from "./Pages/Popup/Popup";
import PopupAdd from "./Pages/Popup/PopupAdd";
import PopupEdit from "./Pages/Popup/PopupEdit";
import Pandel from "./Pages/Pandels/Pandel";
import PandelAdd from "./Pages/Pandels/PandelAdd";
import PandelEdit from "./Pages/Pandels/PandelEdit";
import Customer from "./Pages/Customer/Customer";
import CustomerAdd from "./Pages/Customer/CustomerAdd";
import CustomerEdit from "./Pages/Customer/CustomerEdit";
import ProductWarehouse from "./Pages/ProductWarehouse/ProductWarehouse";
import ProductWarehouseAdd from "./Pages/ProductWarehouse/ProductWarehouseAdd";
import Cashier from "./Pages/Cashier/Cashier";
import CashierAdd from "./Pages/Cashier/CashierAdd";
import CashierEdit from "./Pages/Cashier/CashierEdit";
import CustomerGroupAdd from "./Pages/CustomerGroup/CustomerGroupAdd";
import CustomerGroupEdit from "./Pages/CustomerGroup/CustomerGroupEdit";
import CustomerGroup from "./Pages/CustomerGroup/CustomerGroup";
import Discount from "./Pages/Discount/Discount";
import DiscountAdd from "./Pages/Discount/DiscountAdd";
import DiscountEdit from "./Pages/Discount/DiscountEdit";
import Currency from "./Pages/Currency/Currency";
import CurrencyAdd from "./Pages/Currency/CurrencyAdd";
import CurrencyEdit from "./Pages/Currency/CurrencyEdit";
import Zone from "./Pages/Zone/Zone";
import ZoneAdd from "./Pages/Zone/ZoneAdd";
import ZoneEdit from "./Pages/Zone/ZoneEdit";
import Point from "./Pages/Point/Point";
import PointAdd from "./Pages/Point/PointAdd";
import PointEdit from "./Pages/Point/PointEdit";
import RedeemPoint from "./Pages/RedeemPoint/RedeemPoint";
import RedeemPointAdd from "./Pages/RedeemPoint/RedeemPointAdd";
import RedeemPointEdit from "./Pages/RedeemPoint/RedeemPointEdit";
import Coupon from "./Pages/Coupon/Coupon";
import CouponAdd from "./Pages/Coupon/CouponAdd";
import CouponEdit from "./Pages/Coupon/CouponEdit";
import Purchase from "./Pages/Purchase/Purchase";
import PurchaseAdd from "./Pages/Purchase/PurchaseAdd";
import PurchaseEdit from "./Pages/Purchase/PurchaseEdit";
import Payments from "./Pages/Payments/Payments";
import CashierShift from "./Pages/CashierShift/CashierShift";
import CashierShiftDetails from "./Pages/CashierShift/CashierShiftDetails";
export default function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Main Pages محمية */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ Product (Nested Routes محمية) */}
      <Route path="product">
        <Route
          index
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ProductAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ProductEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Brand (Nested Routes محمية) */}
      <Route path="brand">
        <Route
          index
          element={
            <ProtectedRoute>
              <Brand />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <BrandAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <BrandEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Category (Nested Routes محمية) */}
      <Route path="category">
        <Route
          index
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CategoryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CategoryEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Attribute (Nested Routes محمية) */}
      <Route path="attribute">
        <Route
          index
          element={
            <ProtectedRoute>
              <Attribute />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <AttributeAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <AttributeEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Admin (Nested Routes محمية) */}
      <Route path="admin">
        <Route
          index
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <AdminAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <AdminEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ City (Nested Routes محمية) */}
      <Route path="city">
        <Route
          index
          element={
            <ProtectedRoute>
              <City />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CityAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CityEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Country (Nested Routes محمية) */}
      <Route path="country">
        <Route
          index
          element={
            <ProtectedRoute>
              <Country />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CountryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CountryEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ WareHouse (Nested Routes محمية) */}
      <Route path="warehouse">
        <Route
          index
          element={
            <ProtectedRoute>
              <WareHouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <WareHouseAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <WareHouseEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Accounting (Nested Routes محمية) */}
      <Route path="accounting">
        <Route
          index
          element={
            <ProtectedRoute>
              <Accounting />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <AccountingAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <AccountingEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Supplier (Nested Routes محمية) */}
      <Route path="supplier">
        <Route
          index
          element={
            <ProtectedRoute>
              <Supplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <SupplierAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <SupplierEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ PaymentMethod (Nested Routes محمية) */}
      <Route path="payment_method">
        <Route
          index
          element={
            <ProtectedRoute>
              <PaymentMethod />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <PaymentMethodAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PaymentMethodEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Unit */}
      <Route path="unit">
        <Route
          index
          element={
            <ProtectedRoute>
              <Unit />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <UnitAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <UnitEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Expenses-Category (Nested Routes محمية) */}
      <Route path="expense-category">
        <Route
          index
          element={
            <ProtectedRoute>
              <ExpensesCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ExpensesCategoryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ExpensesCategoryEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Taxes (Nested Routes محمية) */}
      <Route path="taxes">
        <Route
          index
          element={
            <ProtectedRoute>
              <Taxes />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <TaxesAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <TaxesEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ permission (Nested Routes محمية) */}
      <Route path="permission">
        <Route
          index
          element={
            <ProtectedRoute>
              <Permission />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PermissionEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Transfer */}
      <Route path="transfer">
        <Route
          index
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <TransferAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <TransferEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Revenue */}
      <Route path="revenue">
        <Route
          index
          element={
            <ProtectedRoute>
              <Revenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <RevenueAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <RevenueEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Expenses (Nested Routes محمية) */}
      <Route path="expense">
        <Route
          index
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ExpensesAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ExpensesEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Popup (Nested Routes محمية) */}
      <Route path="popup">
        <Route
          index
          element={
            <ProtectedRoute>
              <Popup />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <PopupAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PopupEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Pandel (Nested Routes محمية) */}
      <Route path="pandel">
        <Route
          index
          element={
            <ProtectedRoute>
              <Pandel />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <PandelAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PandelEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Customer (Nested Routes محمية) */}
      <Route path="customer">
        <Route
          index
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CustomerAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CustomerEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ CustomerGroup (Nested Routes محمية) */}
      <Route path="customer-group">
        <Route
          index
          element={
            <ProtectedRoute>
              <CustomerGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CustomerGroupAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CustomerGroupEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ ProductWarehouse (Nested Routes محمية) */}
      <Route path="product-warehouse">
        <Route
          path=":id"
          element={
            <ProtectedRoute>
              <ProductWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ProductWarehouseAdd />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Barcode */}
      <Route
        path="barcode"
        element={
          <ProtectedRoute>
            <Barcode />
          </ProtectedRoute>
        }
      />
      {/* Cashier */}
      <Route path="cashier">
        <Route
          index
          element={
            <ProtectedRoute>
              <Cashier />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CashierAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CashierEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Discount (Nested Routes محمية) */}
      <Route path="discount">
        <Route
          index
          element={
            <ProtectedRoute>
              <Discount />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <DiscountAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <DiscountEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Currency (Nested Routes محمية) */}
      <Route path="currency">
        <Route
          index
          element={
            <ProtectedRoute>
              <Currency />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CurrencyAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CurrencyEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Zone (Nested Routes محمية) */}
      <Route path="zone">
        <Route
          index
          element={
            <ProtectedRoute>
              <Zone />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ZoneAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ZoneEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ point (Nested Routes محمية) */}
      <Route path="point">
        <Route
          index
          element={
            <ProtectedRoute>
              <Point />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <PointAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PointEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ RedeemPoint (Nested Routes محمية) */}
      <Route path="redeem-point">
        <Route
          index
          element={
            <ProtectedRoute>
              <RedeemPoint />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <RedeemPointAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <RedeemPointEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Coupon (Nested Routes محمية) */}
      <Route path="coupon">
        <Route
          index
          element={
            <ProtectedRoute>
              <Coupon />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <CouponAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <CouponEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Purchase (Nested Routes محمية) */}
      <Route path="purchase">
        <Route
          index
          element={
            <ProtectedRoute>
              <Purchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <PurchaseAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <PurchaseEdit />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="payments">
        <Route
          index
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="cashier-shift">
        <Route
          index
          element={
            <ProtectedRoute>
              <CashierShift />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id"
          element={
            <ProtectedRoute>
              <CashierShiftDetails />
            </ProtectedRoute>
          }
        />
      </Route>


      {/* ❌ 404 - Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
