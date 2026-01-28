import { useState } from "react";
import { message, Spin } from "antd";
import { useProducts, type Product } from "../hooks/useProducts";
import { useCreateSale } from "../hooks/useSales";

interface CartItem extends Product {
  quantity: number;
}

// SVG Icons
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MinusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EmptyCartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="cart-empty-icon"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data, isLoading } = useProducts(1, 100);
  const createSale = useCreateSale();

  const addToCart = (product: Product) => {
    if (product.stockQuantity === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          message.warning("Maximum stock reached");
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }
    try {
      await createSale.mutateAsync(
        cart.map(({ id, quantity }) => ({ productId: id, quantity })),
      );
      message.success("Sale completed successfully!");
      setCart([]);
      setIsCartOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Checkout failed");
    }
  };

  const getStockClass = (qty: number) => {
    if (qty === 0) return "out";
    if (qty < 5) return "low";
    return "";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Point of Sale</h1>
          <p className="page-subtitle">Select products to add to cart</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="pos-container">
        {/* Products Grid */}
        <div>
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <div className="pos-products">
              {data?.data.map((product: Product) => (
                <div
                  key={product.id}
                  className={`pos-product-card ${product.stockQuantity === 0 ? "out-of-stock" : ""}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="pos-product-name">{product.name}</div>
                  <div className="pos-product-price">
                    ${Number(product.price).toFixed(2)}
                  </div>
                  <div
                    className={`pos-product-stock ${getStockClass(product.stockQuantity)}`}
                  >
                    {product.stockQuantity === 0
                      ? "Out of stock"
                      : `${product.stockQuantity} in stock`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Panel - Desktop */}
        <div className={`cart-panel ${isCartOpen ? "open" : ""}`}>
          <div className="cart-header">
            <div className="cart-title">
              <CartIcon />
              Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </div>
            <button className="cart-close" onClick={() => setIsCartOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <EmptyCartIcon />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <MinusIcon />
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.quantity}
                      min={1}
                      max={item.stockQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const clampedVal = Math.max(
                            1,
                            Math.min(val, item.stockQuantity),
                          );
                          updateQuantity(item.id, clampedVal);
                        }
                      }}
                      onBlur={(e) => {
                        if (
                          e.target.value === "" ||
                          parseInt(e.target.value, 10) < 1
                        ) {
                          updateQuantity(item.id, 1);
                        }
                      }}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                    >
                      <PlusIcon />
                    </button>
                    <button
                      className="qty-btn danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-value">${total.toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={createSale.isPending}
              >
                {createSale.isPending ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart FAB */}
      {itemCount > 0 && (
        <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
          <CartIcon />
          <span className="cart-fab-badge">{itemCount}</span>
        </button>
      )}

      {/* Backdrop for mobile cart */}
      {isCartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
            display: "none",
          }}
          className="cart-backdrop"
          onClick={() => setIsCartOpen(false)}
        />
      )}
      <style>{`
        @media (max-width: 1024px) {
          .cart-backdrop { display: block !important; }
        }
      `}</style>
    </div>
  );
}
