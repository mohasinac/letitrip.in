"use client";

import {
  Copy,
  Key,
  Shield,
  UserCog,
  Headphones,
  Store,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CredentialsData, UserCredential } from "./types";

interface CredentialCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  users: UserCredential[];
}

function CredentialCard({
  title,
  icon: Icon,
  iconColor,
  users,
}: CredentialCardProps) {
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied: ${email}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </div>
      <div className="space-y-2">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-2"
          >
            <div className="truncate flex-1">
              <span className="text-gray-600 dark:text-gray-400">
                {user.name}
              </span>
              <br />
              <span className="font-mono text-gray-800 dark:text-gray-200">
                {user.email}
              </span>
            </div>
            <button
              onClick={() => copyEmail(user.email)}
              className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Copy email"
            >
              <Copy className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DemoCredentialsProps {
  credentials: CredentialsData;
}

export function DemoCredentials({ credentials }: DemoCredentialsProps) {
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
          Test User Credentials
        </h3>
      </div>
      <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
        All demo users use the password:{" "}
        <code className="bg-purple-100 dark:bg-purple-800 px-2 py-0.5 rounded font-mono">
          Demo@123
        </code>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CredentialCard
          title="Admin Accounts"
          icon={Shield}
          iconColor="text-red-500"
          users={credentials.admins}
        />
        <CredentialCard
          title="Moderators"
          icon={UserCog}
          iconColor="text-orange-500"
          users={credentials.moderators}
        />
        <CredentialCard
          title="Support Staff"
          icon={Headphones}
          iconColor="text-blue-500"
          users={credentials.support}
        />
        <CredentialCard
          title="Sellers (sample)"
          icon={Store}
          iconColor="text-green-500"
          users={credentials.sellers.slice(0, 5)}
        />
        <CredentialCard
          title="Buyers (sample)"
          icon={Users}
          iconColor="text-purple-500"
          users={credentials.buyers.slice(0, 5)}
        />
      </div>
    </div>
  );
}
