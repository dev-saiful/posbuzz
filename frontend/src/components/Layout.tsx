import { Layout as AntLayout, Dropdown } from "antd";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Header, Content } = AntLayout;

// SVG Icons as components for better control
const POSIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ProductsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const BrandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "email",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 500, color: "#0f172a" }}>
            {user?.email?.split("@")[0]}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getUserInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <AntLayout className="app-layout">
      {/* Desktop Header */}
      <Header className="app-header">
        <Link
          to="/"
          className="header-brand"
          style={{ textDecoration: "none" }}
        >
          <div className="header-brand-icon">
            <BrandIcon />
          </div>
          <div className="header-brand-text">
            POS<span>Buzz</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            <POSIcon />
            <span>Point of Sale</span>
          </Link>
          <Link
            to="/products"
            className={`nav-item ${location.pathname === "/products" ? "active" : ""}`}
          >
            <ProductsIcon />
            <span>Products</span>
          </Link>
          <Link
            to="/sales"
            className={`nav-item ${location.pathname === "/sales" ? "active" : ""}`}
          >
            <HistoryIcon />
            <span>Sales History</span>
          </Link>
        </nav>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="header-user">
            <div className="header-avatar">{getUserInitial()}</div>
            <div className="header-user-info">
              <div className="header-user-name">
                {user?.email?.split("@")[0]}
              </div>
              <div className="header-user-email">{user?.email}</div>
            </div>
          </div>
        </Dropdown>
      </Header>

      {/* Main Content */}
      <Content className="app-content">
        <Outlet />
      </Content>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          <Link
            to="/"
            className={`mobile-nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            <POSIcon />
            <span>POS</span>
          </Link>
          <Link
            to="/products"
            className={`mobile-nav-item ${location.pathname === "/products" ? "active" : ""}`}
          >
            <ProductsIcon />
            <span>Products</span>
          </Link>
          <Link
            to="/sales"
            className={`mobile-nav-item ${location.pathname === "/sales" ? "active" : ""}`}
          >
            <HistoryIcon />
            <span>Sales</span>
          </Link>
          <button className="mobile-nav-item" onClick={handleLogout}>
            <LogoutOutlined style={{ fontSize: 22 }} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </AntLayout>
  );
}
