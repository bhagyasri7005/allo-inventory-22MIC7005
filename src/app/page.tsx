"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/ProductCard";

interface InventoryItem {
  id: string;
  totalStock: number;
  reservedStock: number;
  product: {
    id: string;
    name: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
}

export default function HomePage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await axios.get("/api/inventory");
        setInventory(response.data.data || []);
        if (response.data.message) {
          setWarning(response.data.message);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  if (loading) {
    return <div className="p-10">Loading inventory...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Inventory</h1>

        {warning ? (
          <div className="mb-6 rounded-xl bg-yellow-100 px-5 py-4 text-yellow-900">
            {warning}
          </div>
        ) : null}

        {inventory.length === 0 ? (
          <div className="rounded-xl bg-white p-8 shadow-md">
            No inventory items available.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {inventory.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
