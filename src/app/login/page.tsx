"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="Kezpo Logo"
            className="h-16 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <h1 className="text-2xl font-bold text-gray-900">Kezpo Invoice</h1>
          <p className="text-sm text-gray-500">Invoice & Quote Management</p>
        </div>

        {/* Sign In */}
        <button
          onClick={() => signIn(process.env.NEXT_PUBLIC_AZURE_CONFIGURED === "true" ? "microsoft-entra-id" : "dev-login", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-[#2AABE2] hover:bg-[#1a8fc5] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <svg viewBox="0 0 21 21" className="h-5 w-5 fill-current">
            <rect x="1" y="1" width="9" height="9" />
            <rect x="11" y="1" width="9" height="9" />
            <rect x="1" y="11" width="9" height="9" />
            <rect x="11" y="11" width="9" height="9" />
          </svg>
          Sign in with Microsoft
        </button>

        <p className="text-xs text-gray-400 text-center">
          Access is restricted to authorized Kezpo team members.
        </p>
      </div>
    </div>
  );
}
