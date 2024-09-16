"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/SubmitButton";

export default function SignOut() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSignOut = async () => {
      await signOut();
      setIsLoading(false);
    };
    performSignOut();
  }, [signOut]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card>
        <CardContent className="p-6">
          <SubmitButton isLoading={isLoading} disabled>
            Signing out...
          </SubmitButton>
        </CardContent>
      </Card>
    </div>
  );
}
