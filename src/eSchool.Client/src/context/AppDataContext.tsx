import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_CONTACTS,
  INITIAL_INVOICES,
  INITIAL_KANBAN_TASKS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TICKETS,
} from '@/data/mockStoreData';
import type {
  ContactRecord,
  InvoiceRecord,
  KanbanColumnId,
  KanbanTask,
  TicketRecord,
  TicketStatus,
} from '@/types';

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  tone: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  unread: boolean;
}

interface MessageItem {
  id: string;
  sender: string;
  preview: string;
  time: string;
  initials: string;
  unread: boolean;
}

interface AppDataContextValue {
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, 'id'>) => InvoiceRecord;
  updateInvoice: (invoice: InvoiceRecord) => void;
  deleteInvoice: (id: number) => void;

  contacts: ContactRecord[];
  addContact: (contact: Omit<ContactRecord, 'id'>) => ContactRecord;
  updateContact: (contact: ContactRecord) => void;
  deleteContact: (id: string) => void;
  toggleContactStar: (id: string) => void;

  tasks: KanbanTask[];
  addTask: (task: Omit<KanbanTask, 'id'>) => void;
  moveTask: (id: string, column: KanbanColumnId) => void;
  deleteTask: (id: string) => void;

  tickets: TicketRecord[];
  addTicket: (ticket: Omit<TicketRecord, 'id' | 'updatedAt' | 'messages'>, body: string) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addTicketReply: (id: string, sender: string, body: string) => void;

  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  messages: MessageItem[];
  markAllMessagesRead: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [contacts, setContacts] = useState<ContactRecord[]>(INITIAL_CONTACTS);
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [tickets, setTickets] = useState<TicketRecord[]>(INITIAL_TICKETS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);

  const addInvoice = (invoice: Omit<InvoiceRecord, 'id'>) => {
    const nextId = invoices.reduce((max, item) => Math.max(max, item.id), 100) + 1;
    const created: InvoiceRecord = { ...invoice, id: nextId };
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const updateInvoice = (updated: InvoiceRecord) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  const deleteInvoice = (id: number) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const addContact = (contact: Omit<ContactRecord, 'id'>) => {
    const created: ContactRecord = {
      ...contact,
      id: `cnt-${Date.now().toString(36)}`,
    };
    setContacts((prev) => [created, ...prev]);
    return created;
  };

  const updateContact = (updated: ContactRecord) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleContactStar = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  const addTask = (task: Omit<KanbanTask, 'id'>) => {
    const created: KanbanTask = {
      ...task,
      id: `tsk-${Date.now().toString(36)}`,
    };
    setTasks((prev) => [created, ...prev]);
  };

  const moveTask = (id: string, column: KanbanColumnId) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTicket = (
    ticket: Omit<TicketRecord, 'id' | 'updatedAt' | 'messages'>,
    body: string
  ) => {
    const nextNum = 410 + tickets.length;
    const created: TicketRecord = {
      ...ticket,
      id: `TKT-${nextNum}`,
      updatedAt: 'Just now',
      messages: [{ sender: ticket.requester, time: 'Just now', body }],
    };
    setTickets((prev) => [created, ...prev]);
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: 'Just now' } : t))
    );
  };

  const addTicketReply = (id: string, sender: string, body: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              updatedAt: 'Just now',
              messages: [...t.messages, { sender, time: 'Just now', body }],
            }
          : t
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAllMessagesRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  return (
    <AppDataContext.Provider
      value={{
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        toggleContactStar,
        tasks,
        addTask,
        moveTask,
        deleteTask,
        tickets,
        addTicket,
        updateTicketStatus,
        addTicketReply,
        notifications,
        markAllNotificationsRead,
        messages,
        markAllMessagesRead,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
