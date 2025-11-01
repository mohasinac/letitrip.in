/**
 * Display Components Demo
 * Showcases all Phase 7.2 display components
 */

"use client";

import React from "react";
import {
  StatsCard,
  StatsCardGrid,
  EmptyState,
  EmptyStatePresets,
  DataCard,
  DataCardGroup,
} from "@/components/ui/display";
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Plus,
  Upload,
  Edit,
  Trash,
  Search,
  AlertTriangle,
  Lock,
  Rocket,
  Mail,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";

export default function DisplayComponentsDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageHeader
        title="Display Components Demo"
        description="Phase 7.2 - StatsCard, EmptyState, and DataCard"
      />

      {/* StatsCard Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">StatsCard Components</h2>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Basic Stats Grid</h3>
          <StatsCardGrid columns={4}>
            <StatsCard
              title="Total Revenue"
              value="$45,678"
              icon={<DollarSign />}
              trend={{ value: 12, direction: "up", label: "from last month" }}
              color="success"
            />
            <StatsCard
              title="Total Orders"
              value={1234}
              icon={<ShoppingCart />}
              trend={{ value: 8, direction: "up", label: "vs last week" }}
              color="primary"
            />
            <StatsCard
              title="Active Users"
              value={892}
              icon={<Users />}
              trend={{ value: 2, direction: "down", label: "this week" }}
              color="warning"
            />
            <StatsCard
              title="Products"
              value={156}
              icon={<Package />}
              trend={{ value: 0, direction: "neutral", label: "no change" }}
              color="info"
            />
          </StatsCardGrid>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading State</h3>
          <StatsCardGrid columns={3}>
            <StatsCard title="Loading..." value={0} loading={true} />
            <StatsCard title="Loading..." value={0} loading={true} />
            <StatsCard title="Loading..." value={0} loading={true} />
          </StatsCardGrid>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Clickable Cards</h3>
          <StatsCardGrid columns={2}>
            <StatsCard
              title="New Messages"
              value={42}
              icon={<Mail />}
              onClick={() => alert("Navigate to messages")}
              description="Click to view messages"
              color="primary"
            />
            <StatsCard
              title="Conversion Rate"
              value="3.24%"
              icon={<TrendingUp />}
              onClick={() => alert("View analytics")}
              trend={{ value: 0.5, direction: "up", label: "improved" }}
              color="success"
            />
          </StatsCardGrid>
        </div>
      </section>

      {/* EmptyState Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">EmptyState Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">No Data</h3>
            <EmptyState
              variant="no-data"
              icon={<Package />}
              title="No products yet"
              description="Start building your catalog"
              action={{
                label: "Add Product",
                onClick: () => alert("Add product"),
                icon: <Plus />,
              }}
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">No Results</h3>
            <EmptyState
              variant="no-results"
              icon={<Search />}
              title="No results found"
              description="Try adjusting your filters"
              action={{
                label: "Clear Filters",
                onClick: () => alert("Clear filters"),
              }}
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Error</h3>
            <EmptyState
              variant="error"
              icon={<AlertTriangle />}
              title="Something went wrong"
              description="We couldn't load the data"
              action={{
                label: "Try Again",
                onClick: () => alert("Retry"),
              }}
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">No Permission</h3>
            <EmptyState
              variant="no-permission"
              icon={<Lock />}
              title="Access Denied"
              description="You don't have permission to view this"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">With Two Actions</h3>
          <div className="border border-border rounded-lg p-4">
            <EmptyState
              icon={<Package />}
              title="No products"
              description="Get started by adding or importing products"
              action={{
                label: "Add Product",
                onClick: () => alert("Add product"),
                icon: <Plus />,
              }}
              secondaryAction={{
                label: "Import Products",
                onClick: () => alert("Import"),
                icon: <Upload />,
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Using Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4">
              <EmptyStatePresets.NoOrders />
            </div>
            <div className="border border-border rounded-lg p-4">
              <EmptyStatePresets.ComingSoon />
            </div>
            <div className="border border-border rounded-lg p-4">
              <EmptyStatePresets.NoSearchResults
                action={{
                  label: "Clear Search",
                  onClick: () => alert("Clear"),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DataCard Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">DataCard Components</h2>

        <DataCardGroup spacing="md">
          <DataCard
            title="Order Information"
            icon={<ShoppingCart />}
            subtitle="Order #12345"
            data={[
              { label: "Order ID", value: "ORD-12345", copy: true },
              { label: "Status", value: "Pending" },
              { label: "Total", value: "$299.99", highlight: true },
              { label: "Items", value: "3 items" },
              { label: "Created", value: "Nov 2, 2025" },
              { label: "Updated", value: "2 hours ago" },
            ]}
            columns={2}
            actions={[
              {
                label: "Edit",
                icon: <Edit />,
                onClick: () => alert("Edit order"),
                variant: "outline",
              },
              {
                label: "Delete",
                icon: <Trash />,
                onClick: () => alert("Delete order"),
                variant: "destructive",
              },
            ]}
          />

          <DataCard
            title="Customer Information"
            icon={<Users />}
            data={[
              { label: "Name", value: "John Doe" },
              { label: "Email", value: "john@example.com", copy: true },
              { label: "Phone", value: "+1 234 567 8900", copy: true },
              {
                label: "Profile",
                value: "View Profile",
                link: "/customers/1",
              },
            ]}
            columns={2}
          />

          <DataCard
            title="Shipping Address"
            icon={<MapPin />}
            data={[
              { label: "Street", value: "123 Main St" },
              { label: "City", value: "San Francisco" },
              { label: "State", value: "CA" },
              { label: "ZIP", value: "94102" },
              { label: "Country", value: "United States" },
            ]}
            columns={2}
          />

          <DataCard
            title="API Credentials"
            subtitle="Keep these secure"
            data={[
              {
                label: "API Key",
                value: "sk_live_abc123def456",
                copy: true,
              },
              {
                label: "Secret",
                value: "********",
                copy: true,
              },
            ]}
            columns={1}
            collapsible={true}
            defaultCollapsed={true}
          />
        </DataCardGroup>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Different Column Layouts</h3>
          <div className="grid grid-cols-1 gap-4">
            <DataCard
              title="1 Column Layout"
              data={[
                { label: "Field 1", value: "Value 1" },
                { label: "Field 2", value: "Value 2" },
                { label: "Field 3", value: "Value 3" },
              ]}
              columns={1}
            />

            <DataCard
              title="3 Column Layout"
              data={[
                { label: "Field 1", value: "Value 1" },
                { label: "Field 2", value: "Value 2" },
                { label: "Field 3", value: "Value 3" },
                { label: "Field 4", value: "Value 4" },
                { label: "Field 5", value: "Value 5" },
                { label: "Field 6", value: "Value 6" },
              ]}
              columns={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading State</h3>
          <DataCard
            title="Loading data..."
            data={[]}
            loading={true}
            columns={2}
          />
        </div>
      </section>
    </div>
  );
}
