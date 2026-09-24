"use client";

import { AppNotification } from "@/types";
import { Bell, X } from "lucide-react";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
}

/**
 * Notification dropdown. There is no notifications backend yet, so the
 * portal currently always passes an empty list and this shows an empty state.
 */
const NotificationPanel = ({ notifications, onClose }: NotificationPanelProps) => {
  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 z-50 mt-4 w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] sm:w-96"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-black tracking-tight text-slate-900">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
              <Bell className="h-7 w-7 text-slate-400" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Updates about your classes and payments will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li key={notification.id} className="px-6 py-4">
                <p className="font-bold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-500">{notification.timestamp}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
