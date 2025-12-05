"use client";

import { useAuth } from "@/components/auth/auth-provider";

export default function DebugAuthPage() {
  const { user, profile, loading, isAuthenticated } = useAuth();

  return (
    <div className="p-8 font-mono text-sm max-w-2xl mx-auto break-all">
      <h1 className="text-xl font-bold mb-4">Auth Debugger</h1>
      <div className="space-y-2">
        <div><span className="font-bold">Loading:</span> {String(loading)}</div>
        <div><span className="font-bold">Is Authenticated:</span> {String(isAuthenticated)}</div>
        <div><span className="font-bold">User Email:</span> {user?.email || 'null'}</div>
        <div><span className="font-bold">User ID:</span> {user?.id || 'null'}</div>
        <div><span className="font-bold">Profile Role:</span> {profile?.role || 'null'}</div>
      </div>
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Full User Object:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
