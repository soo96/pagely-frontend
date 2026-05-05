import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './auth/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { FailPage } from './pages/Fail';
import { WidgetCheckoutPage } from './pages/widget/WidgetCheckout';
import { WidgetCheckoutWindowPage } from './pages/widget/WidgetCheckoutWindow';
import { WidgetSuccessPage } from './pages/widget/WidgetSuccess';
import { CreateOrderPage } from './pages/order/CreateOrderPage';
import { OrderListPage } from './pages/order/OrderListPage';
import { OrderDetailPage } from './pages/order/OrderDetailPage';
import { MarketPage } from './pages/market/MarketPage';
import { SalePostDetailPage } from './pages/market/SalePostDetailPage';
import { CreateSalePostPage } from './pages/market/CreateSalePostPage';

function Private({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: <Private><MarketPage /></Private>,
  },
  {
    path: 'sale-posts/new',
    element: <Private><CreateSalePostPage /></Private>,
  },
  {
    path: 'sale-posts/:salePostId',
    element: <Private><SalePostDetailPage /></Private>,
  },
  {
    path: 'widget',
    children: [
      {
        path: 'checkout',
        element: <Private><WidgetCheckoutPage /></Private>,
      },
      {
        path: 'checkout-window',
        element: <Private><WidgetCheckoutWindowPage /></Private>,
      },
      {
        path: 'success',
        element: <Private><WidgetSuccessPage /></Private>,
      },
    ],
  },
  {
    path: 'orders',
    children: [
      {
        index: true,
        element: <Private><OrderListPage /></Private>,
      },
      {
        path: 'new',
        element: <Private><CreateOrderPage /></Private>,
      },
      {
        path: ':orderId',
        element: <Private><OrderDetailPage /></Private>,
      },
    ],
  },
  {
    path: 'fail',
    element: <FailPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
