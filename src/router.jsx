// src/router/index.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/Pages/Dashboard";
import LoginPage from "@/components/Login";
import NotFoundPage from "@/Pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅
import { AppModules, ModuleActions } from "@/config/modules";
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
import TransferDetails from "./Pages/Transfer/TransferDetails";
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
import ReturnPurchase from "./Pages/ReturnPurchase/ReturnPurchase";
import ReturnPurchaseAdd from "./Pages/ReturnPurchase/ReturnPurchaseAdd";
import CashierShift from "./Pages/CashierShift/CashierShift";
import CashierShiftDetails from "./Pages/CashierShift/CashierShiftDetails";
import PermissionAdd from "./Pages/Permission/PermissionAdd";
import TransferWarehouse from "./Pages/WareHouse/TransferWarehouse";
import OrdersReports from "./Pages/OrdersReports/OrdersReports";
import ProductReports from "./Pages/ProductReports/ProductReports";
import FinancialReports from "./Pages/FinancialReports/FinancialReports";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Main Pages محمية */}
      <Route
        path="/"
        element={
          <ProtectedRoute module={AppModules.HOME} action={ModuleActions.VIEW}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ Product (Nested Routes محمية) */}
      <Route path="product">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.PRODUCT} action={ModuleActions.VIEW}>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.PRODUCT} action={ModuleActions.ADD}>
              <ProductAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.PRODUCT} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.BRAND} action={ModuleActions.VIEW}>
              <Brand />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.BRAND} action={ModuleActions.ADD}>
              <BrandAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.BRAND} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.CATEGORY} action={ModuleActions.VIEW}>
              <Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CATEGORY} action={ModuleActions.ADD}>
              <CategoryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CATEGORY} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.VARIATION} action={ModuleActions.VIEW}>
              <Attribute />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.VARIATION} action={ModuleActions.ADD}>
              <AttributeAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.VARIATION} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.ADMIN} action={ModuleActions.VIEW}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.ADMIN} action={ModuleActions.ADD}>
              <AdminAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.ADMIN} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.CITY} action={ModuleActions.VIEW}>
              <City />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CITY} action={ModuleActions.ADD}>
              <CityAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CITY} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.COUNTRY} action={ModuleActions.VIEW}>
              <Country />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.COUNTRY} action={ModuleActions.ADD}>
              <CountryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.COUNTRY} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.VIEW}>
              <WareHouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.ADD}>
              <WareHouseAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.EDIT}>
              <WareHouseEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="transfer/:id"
          element={
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.VIEW}>
              <TransferWarehouse />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Accounting (Nested Routes محمية) */}
      <Route path="accounting">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.FINANCIAL_ACCOUNT} action={ModuleActions.VIEW}>
              <Accounting />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.FINANCIAL_ACCOUNT} action={ModuleActions.ADD}>
              <AccountingAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.FINANCIAL_ACCOUNT} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.SUPPLIER} action={ModuleActions.VIEW}>
              <Supplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.SUPPLIER} action={ModuleActions.ADD}>
              <SupplierAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.SUPPLIER} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.PAYMENT_METHOD} action={ModuleActions.VIEW}>
              <PaymentMethod />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.PAYMENT_METHOD} action={ModuleActions.ADD}>
              <PaymentMethodAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.PAYMENT_METHOD} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.UNITS} action={ModuleActions.VIEW}>
              <Unit />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.UNITS} action={ModuleActions.ADD}>
              <UnitAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.UNITS} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.EXPENSE_CATEGORY} action={ModuleActions.VIEW}>
              <ExpensesCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.EXPENSE_CATEGORY} action={ModuleActions.ADD}>
              <ExpensesCategoryAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.EXPENSE_CATEGORY} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.TAXES} action={ModuleActions.VIEW}>
              <Taxes />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.TAXES} action={ModuleActions.ADD}>
              <TaxesAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.TAXES} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.PERMISSION} action={ModuleActions.VIEW}>
              <Permission />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.PERMISSION} action={ModuleActions.ADD}>
              <PermissionAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.PERMISSION} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.TRANSFER} action={ModuleActions.VIEW}>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.TRANSFER} action={ModuleActions.ADD}>
              <TransferAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="details/:id"
          element={
            <ProtectedRoute module={AppModules.TRANSFER} action={ModuleActions.VIEW}>
              <TransferDetails />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Revenue */}
      <Route path="revenue">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.REVENUE} action={ModuleActions.VIEW}>
              <Revenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.REVENUE} action={ModuleActions.ADD}>
              <RevenueAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.REVENUE} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.EXPENSE_ADMIN} action={ModuleActions.VIEW}>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.EXPENSE_ADMIN} action={ModuleActions.ADD}>
              <ExpensesAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.EXPENSE_ADMIN} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.POPUP} action={ModuleActions.VIEW}>
              <Popup />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.POPUP} action={ModuleActions.ADD}>
              <PopupAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.POPUP} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.PANDEL} action={ModuleActions.VIEW}>
              <Pandel />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.PANDEL} action={ModuleActions.ADD}>
              <PandelAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.PANDEL} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.CUSTOMER} action={ModuleActions.VIEW}>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CUSTOMER} action={ModuleActions.ADD}>
              <CustomerAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CUSTOMER} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.CUSTOMER_GROUP} action={ModuleActions.VIEW}>
              <CustomerGroup />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CUSTOMER_GROUP} action={ModuleActions.ADD}>
              <CustomerGroupAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CUSTOMER_GROUP} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.VIEW}>
              <ProductWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.WAREHOUSE} action={ModuleActions.ADD}>
              <ProductWarehouseAdd />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* Barcode */}
      <Route
        path="barcode"
        element={
          <ProtectedRoute module={AppModules.PRODUCT} action={ModuleActions.VIEW}>
            <Barcode />
          </ProtectedRoute>
        }
      />
      {/* Cashier */}
      <Route path="cashier">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.CASHIER} action={ModuleActions.VIEW}>
              <Cashier />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CASHIER} action={ModuleActions.ADD}>
              <CashierAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CASHIER} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.DISCOUNT} action={ModuleActions.VIEW}>
              <Discount />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.DISCOUNT} action={ModuleActions.ADD}>
              <DiscountAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.DISCOUNT} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.CURRENCY} action={ModuleActions.VIEW}>
              <Currency />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.CURRENCY} action={ModuleActions.ADD}>
              <CurrencyAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.CURRENCY} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.ZONE} action={ModuleActions.VIEW}>
              <Zone />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.ZONE} action={ModuleActions.ADD}>
              <ZoneAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.ZONE} action={ModuleActions.EDIT}>
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
            <ProtectedRoute module={AppModules.POINT} action={ModuleActions.VIEW}>
              <Point />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.POINT} action={ModuleActions.ADD}>
              <PointAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.POINT} action={ModuleActions.EDIT}>
              <PointEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ RedeemPoint (Nested Routes محمية) */}
      {/* ✅ RedeemPoint (Nested Routes محمية) */}
      <Route path="redeem-point">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.REDEEM_POINTS} action={ModuleActions.VIEW}>
              <RedeemPoint />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.REDEEM_POINTS} action={ModuleActions.ADD}>
              <RedeemPointAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.REDEEM_POINTS} action={ModuleActions.EDIT}>
              <RedeemPointEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Coupon (Nested Routes محمية) */}
      {/* ✅ Coupon (Nested Routes محمية) */}
      <Route path="coupon">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.COUPON} action={ModuleActions.VIEW}>
              <Coupon />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.COUPON} action={ModuleActions.ADD}>
              <CouponAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.COUPON} action={ModuleActions.EDIT}>
              <CouponEdit />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Purchase (Nested Routes محمية) */}
      {/* ✅ Purchase (Nested Routes محمية) */}
      <Route path="purchase">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.PURCHASE} action={ModuleActions.VIEW}>
              <Purchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute module={AppModules.PURCHASE} action={ModuleActions.ADD}>
              <PurchaseAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute module={AppModules.PURCHASE} action={ModuleActions.EDIT}>
              <PurchaseEdit />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="payments">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.PAYMENT} action={ModuleActions.VIEW}>
              <Payments />
            </ProtectedRoute>
          }
        />
      </Route>
      {/* ✅ Purchase (Nested Routes محمية) */}
      <Route path="purchase-return">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.PURCHASE_RETURN} action={ModuleActions.VIEW}>
              <ReturnPurchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="add/:id"
          element={
            <ProtectedRoute module={AppModules.PURCHASE_RETURN} action={ModuleActions.ADD}>
              <ReturnPurchaseAdd />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route path="cashier-shift">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.CASHIER_SHIFT_REPORT} action={ModuleActions.VIEW}>
              <CashierShift />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id"
          element={
            <ProtectedRoute module={AppModules.CASHIER_SHIFT_REPORT} action={ModuleActions.VIEW}>
              <CashierShiftDetails />
            </ProtectedRoute>
          }
        />
      </Route>


      <Route path="orders-reports">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.ORDERS_REPORT} action={ModuleActions.VIEW}>
              <OrdersReports />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="product-reports">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.PRODUCT_REPORT} action={ModuleActions.VIEW}>
              <ProductReports />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="financial-reports">
        <Route
          index
          element={
            <ProtectedRoute module={AppModules.FINANCIAL_REPORT} action={ModuleActions.VIEW}>
              <FinancialReports />
            </ProtectedRoute>
          }
        />
      </Route>


      {/* ❌ 404 - Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
