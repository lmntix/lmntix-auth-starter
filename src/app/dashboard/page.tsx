"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Welcome to your dashboard, {user.email}!</p>
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
            <Button onClick={signOut}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
