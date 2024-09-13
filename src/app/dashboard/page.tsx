import { getAuthenticatedUser } from "@/app/db-access/auth";
import UserInfo from "./UserInfo";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <UserInfo user={user} />
      </div>
    </div>
  );
}
