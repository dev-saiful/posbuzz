import { useState, useEffect } from "react";
import { Table, Modal, Tag, Button, Typography, Space, Card, List } from "antd";
import type { TableProps } from "antd";
import {
  EyeOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useSales } from "../hooks/useSales";

const { Text, Title } = Typography;

// Types
interface SaleItem {
  id: string;
  quantity: number;
  price: string | number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Sale {
  id: string;
  totalAmount: string | number;
  createdAt: string;
  items: SaleItem[];
}

// Hook to detect mobile screen
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function SalesHistory() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { data, isLoading } = useSales(page, pageSize);
  const isMobile = useIsMobile();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalItems = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const columns: TableProps<Sale>["columns"] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      responsive: ["md"],
      render: (id: string) => (
        <Text code style={{ fontSize: 12 }}>
          {id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
      render: (date: string) => (
        <span style={{ whiteSpace: "nowrap" }}>{formatDateTime(date)}</span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      width: 280,
      responsive: ["lg"],
      render: (items: SaleItem[]) => (
        <Space size={[0, 4]} wrap>
          {items.slice(0, 3).map((item) => (
            <Tag key={item.id} color="blue">
              {item.product.name} ×{item.quantity}
            </Tag>
          ))}
          {items.length > 3 && (
            <Tag color="default">+{items.length - 3} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Qty",
      key: "quantity",
      width: 70,
      align: "center",
      render: (_, record) => (
        <Tag icon={<ShoppingOutlined />}>{getTotalItems(record.items)}</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      align: "right",
      sorter: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
      render: (amount: string | number) => (
        <Text strong style={{ color: "#52c41a", fontSize: 15 }}>
          ${Number(amount).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 70,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSelectedSale(record)}
          size={isMobile ? "small" : "middle"}
        >
          {!isMobile && "View"}
        </Button>
      ),
    },
  ];

  // Detail modal columns - responsive for mobile
  const detailColumns: TableProps<SaleItem>["columns"] = [
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "name",
      ellipsis: true,
    },
    {
      title: "SKU",
      dataIndex: ["product", "sku"],
      key: "sku",
      responsive: ["sm"],
      render: (sku: string) => <Text type="secondary">{sku}</Text>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 50,
      align: "center",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 80,
      align: "right",
      responsive: ["sm"],
      render: (price: string | number) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 90,
      align: "right",
      render: (_, record) => (
        <Text strong>
          ${(Number(record.price) * record.quantity).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">
            {data?.meta.total || 0} transactions recorded
          </p>
        </div>
      </div>

      {/* Sales Table or Mobile Cards */}
      {isMobile ? (
        <List
          loading={isLoading}
          dataSource={data?.data}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0" }}>
                <ShoppingOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <div>
                  <Text type="secondary">No sales yet</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Complete your first sale to see it here
                  </Text>
                </div>
              </div>
            ),
          }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta.total || 0,
            size: "small",
            showSizeChanger: false,
            onChange: (newPage) => setPage(newPage),
          }}
          renderItem={(sale: Sale) => (
            <Card
              size="small"
              style={{ marginBottom: 12 }}
              hoverable
              onClick={() => setSelectedSale(sale)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <CalendarOutlined style={{ color: "#8c8c8c" }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {formatDateTime(sale.createdAt)}
                    </Text>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Tag icon={<ShoppingOutlined />}>
                      {getTotalItems(sale.items)} items
                    </Tag>
                    <Text code style={{ fontSize: 11 }}>
                      #{sale.id.slice(0, 8).toUpperCase()}
                    </Text>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 18, fontWeight: 600, color: "#52c41a" }}
                  >
                    <DollarOutlined style={{ marginRight: 2 }} />
                    {Number(sale.totalAmount).toFixed(2)}
                  </div>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    style={{ padding: 0, height: "auto", marginTop: 4 }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          )}
        />
      ) : (
        <Table<Sale>
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 600 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `${total} sales`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0" }}>
                <ShoppingOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <div>
                  <Text type="secondary">No sales yet</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Complete your first sale to see it here
                  </Text>
                </div>
              </div>
            ),
          }}
          style={{ background: "#fff", borderRadius: 8 }}
        />
      )}

      {/* Sale Details Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Sale Receipt</span>
            {selectedSale && (
              <Text code style={{ marginLeft: 8 }}>
                #{selectedSale.id.slice(0, 8).toUpperCase()}
              </Text>
            )}
          </Space>
        }
        open={!!selectedSale}
        onCancel={() => setSelectedSale(null)}
        footer={
          <Button type="primary" onClick={() => setSelectedSale(null)} block>
            Close
          </Button>
        }
        centered
        width={isMobile ? "95%" : 600}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        {selectedSale && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                {formatDateTime(selectedSale.createdAt)}
              </Text>
            </div>

            {isMobile ? (
              // Mobile-friendly list view
              <div>
                {selectedSale.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        ${Number(item.price).toFixed(2)} × {item.quantity}
                      </Text>
                    </div>
                    <Text strong style={{ fontSize: 15 }}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0 8px",
                    marginTop: 8,
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    Total
                  </Title>
                  <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                    ${Number(selectedSale.totalAmount).toFixed(2)}
                  </Title>
                </div>
              </div>
            ) : (
              <Table<SaleItem>
                columns={detailColumns}
                dataSource={selectedSale.items}
                rowKey="id"
                pagination={false}
                size="small"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Title level={5} style={{ margin: 0 }}>
                          Total
                        </Title>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Title
                          level={5}
                          style={{ margin: 0, color: "#52c41a" }}
                        >
                          ${Number(selectedSale.totalAmount).toFixed(2)}
                        </Title>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
