"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AccountDeletionProps {
  onDeleteAccount: () => Promise<void>;
}

export default function AccountDeletion({
  onDeleteAccount,
}: AccountDeletionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setLoading(true);
      await onDeleteAccount();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Account
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Account
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-2">
              Warning: This action cannot be undone!
            </p>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>Your profile and personal information</li>
              <li>Order history and saved addresses</li>
              <li>Wishlists and cart items</li>
              <li>Reviews and ratings</li>
              <li>All associated data</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="DELETE"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== "DELETE"}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
