import BuyerOrderList from './OrderList';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and track your orders with interactive timeline visualization</p>
        </div>
        <BuyerOrderList />
      </div>
    </main>
  );
}
