"use client"

import { Bell, Inbox } from "lucide-react"
import { Pagination } from "@/components/leads/reusable"
import { useGetNotifications, useMarkNotificationRead } from "@/lib/tanstack/useNotifications"
import { NotificationListItem } from "@/services/notification/schema"
import Link from "next/link"
import { useState } from "react"
import { Button } from "./ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"


export function NotificationBell() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading, isError } = useGetNotifications({ page, pageSize })
  const notifications = data?.notifications ?? []
  const markRead = useMarkNotificationRead()
  const unreadCount = data?.unreadCount ?? 0

  const total = data?.pagination.total ?? 0
  const pageCount = data?.pagination.pages ?? 0
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = total === 0 ? 0 : Math.min(page * pageSize, total)
  const hasAny = total > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-xl ring-slate-200"
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Loading…
          </div>
        ) : null}

        {isError ? (
          <div className="px-4 py-8 text-center text-sm text-destructive">
            Could not load notifications.
          </div>
        ) : null}

        {!isLoading && !isError && total === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200">
              <Inbox className="size-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        ) : null}

        {!isLoading && !isError && hasAny ? (
          <>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No notifications on this page.
                </p>
              ) : (
                notifications.map((notification: NotificationListItem) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.leadId
                        ? `/leads/${notification.leadId}`
                        : "#"
                    }
                    onClick={() => {
                      if (notification.readState === "UNREAD") {
                        markRead.mutate(notification.id)
                      }
                    }}
                    className="block border-b border-slate-100 px-4 py-3 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {notification.body}
                    </p>
                  </Link>
                ))
              )}
            </div>

            <Pagination
              startItem={startItem}
              endItem={endItem}
              total={total}
              page={page}
              pageCount={pageCount}
              isLoading={isLoading}
              setPage={setPage}
              itemLabel="notifications"
              inSmallSpace
            />
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}