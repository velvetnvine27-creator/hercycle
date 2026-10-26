import React from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Sparkles,
  Calendar,
  HeartHandshake,
  Pill,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { InAppNotification, notificationService } from '../../services/notificationService';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'period':
        return <Calendar className="w-4 h-4 text-cherry-600" />;
      case 'ovulation':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'hygiene':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-burgundy-800" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cherry-600" />
          <span>Reminders & Notifications</span>
        </div>
      }
      subtitle="In-app alerts and body reminders"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-rosepink-100">
          <span className="text-gray-500">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="text-cherry-600 hover:text-burgundy-900 font-semibold"
            >
              Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="text-gray-400 hover:text-rose-600"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications list */}
        {notifications.length > 0 ? (
          <div className="space-y-2.5 modal-body-height-reminder overflow-y-auto modal-scroll">
            {notifications.map(n => {
              const dateObj = new Date(n.timestamp);
              const timeDisplay = isNaN(dateObj.getTime())
                ? ''
                : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    n.read
                      ? 'bg-blush-50/40 border-rosepink-100 opacity-75'
                      : 'bg-white border-cherry-300 shadow-xs'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-rosepink-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-burgundy-900 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {timeDisplay}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-rosepink-300" />
            <p className="text-xs">No active notifications</p>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              Period prediction notices, daily logging alerts, and product change timers will appear here.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
