"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AdminGuardProps {
  children: ReactNode;
  isAdmin: boolean;
}

export function AdminGuard({
  children,
  isAdmin,
}: AdminGuardProps): React.ReactElement {
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Access Denied
      </h2>
      <p className="text-gray-600 mb-6">
        You do not have permission to access this page.
      </p>
      <Link href="/dashboard" className="text-green-600 hover:text-green-700">
        Return to Dashboard →
      </Link>
    </Card>
  );
}
