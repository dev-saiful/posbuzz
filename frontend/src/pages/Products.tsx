import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Spin,
  Pagination,
} from "antd";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
} from "../hooks/useProducts";

// SVG Icons
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

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

export function Products() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useProducts(page, 10);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    if (product) {
      form.setFieldsValue({
        ...product,
        price: Number(product.price),
        stockQuantity: Number(product.stockQuantity),
      });
    } else {
      form.setFieldsValue({ name: "", sku: "", price: 0, stockQuantity: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, ...values });
        message.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        message.success("Product created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success("Product deleted successfully");
      setDeleteConfirm(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Delete failed");
    }
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { class: "out-of-stock", label: "Out of stock" };
    if (qty < 10) return { class: "low-stock", label: `${qty} in stock` };
    return { class: "in-stock", label: `${qty} in stock` };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {data?.meta.total || 0} products in inventory
          </p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <PlusIcon />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="products-grid">
            {data?.data.map((product: Product) => {
              const stockStatus = getStockStatus(product.stockQuantity);
              return (
                <div key={product.id} className="product-list-card">
                  <div className="product-list-info">
                    <div className="product-list-name">{product.name}</div>
                    <div className="product-list-sku">{product.sku}</div>
                    <div className="product-list-meta">
                      <span className="product-list-price">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span
                        className={`product-list-stock ${stockStatus.class}`}
                      >
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>
                  <div className="product-list-actions">
                    <button
                      className="action-btn"
                      onClick={() => openModal(product)}
                      title="Edit product"
                    >
                      <EditIcon />
                    </button>
                    {deleteConfirm === product.id ? (
                      <button
                        className="action-btn danger"
                        onClick={() => handleDelete(product.id)}
                        title="Confirm delete"
                        style={{ background: "rgba(239, 68, 68, 0.1)" }}
                      >
                        <TrashIcon />
                      </button>
                    ) : (
                      <button
                        className="action-btn danger"
                        onClick={() => setDeleteConfirm(product.id)}
                        title="Delete product"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination
                current={page}
                total={data.meta.total}
                pageSize={10}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={(total) => `${total} products`}
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        okText={editingProduct ? "Save Changes" : "Create Product"}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          className="modal-form"
          style={{ marginTop: 16 }}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="e.g., Wireless Mouse" />
          </Form.Item>
          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input placeholder="e.g., PROD-001" />
          </Form.Item>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[
                { required: true, message: "Required" },
                { type: "number", min: 0, message: "Must be 0 or greater" },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: "100%" }}
                placeholder="0.00"
              />
            </Form.Item>
            <Form.Item
              name="stockQuantity"
              label="Stock Quantity"
              rules={[
                { required: true, message: "Required" },
                { type: "number", min: 0, message: "Must be 0 or greater" },
              ]}
            >
              <InputNumber
                min={0}
                precision={0}
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
