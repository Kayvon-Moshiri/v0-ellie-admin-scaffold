"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Mail, MessageSquare, UserPlus } from "lucide-react"

interface Person {
  id: string
  name: string
  email: string
  role: string
  company: string
  location: string
  activityScore: number
  connections: number
  lastActive: string
  membershipTier: "free" | "premium" | "member"
  avatar?: string
}

const mockPeople: Person[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@neuralflow.ai",
    role: "Founder & CEO",
    company: "NeuralFlow AI",
    location: "San Francisco, CA",
    activityScore: 95,
    connections: 24,
    lastActive: "2 hours ago",
    membershipTier: "member",
    avatar: "/professional-woman.png",
  },
  {
    id: "2",
    name: "Alex Kim",
    email: "alex@financeflow.com",
    role: "CTO",
    company: "FinanceFlow",
    location: "New York, NY",
    activityScore: 87,
    connections: 18,
    lastActive: "1 day ago",
    membershipTier: "premium",
    avatar: "/man-tech.png",
  },
  {
    id: "3",
    name: "Jordan Smith",
    email: "jordan@vc.com",
    role: "Partner",
    company: "Venture Capital",
    location: "Palo Alto, CA",
    activityScore: 92,
    connections: 31,
    lastActive: "3 hours ago",
    membershipTier: "member",
    avatar: "/person-business.jpg",
  },
  {
    id: "4",
    name: "Maria Rodriguez",
    email: "maria@greentech.com",
    role: "CEO",
    company: "GreenTech Solutions",
    location: "Austin, TX",
    activityScore: 78,
    connections: 15,
    lastActive: "5 hours ago",
    membershipTier: "premium",
    avatar: "/woman-ceo.png",
  },
  {
    id: "5",
    name: "David Park",
    email: "david@startup.com",
    role: "Product Manager",
    company: "TechStartup Inc",
    location: "Seattle, WA",
    activityScore: 65,
    connections: 12,
    lastActive: "2 days ago",
    membershipTier: "free",
  },
]

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const person = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
            <AvatarFallback>
              {person.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{person.name}</div>
            <div className="text-sm text-muted-foreground">{person.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role & Company",
    cell: ({ row }) => {
      const person = row.original
      return (
        <div>
          <div className="font-medium">{person.role}</div>
          <div className="text-sm text-muted-foreground">{person.company}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "activityScore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Activity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue("activityScore") as number
      return (
        <Badge variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "outline"} className="font-medium">
          {score}
        </Badge>
      )
    },
  },
  {
    accessorKey: "connections",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Connections
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "membershipTier",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.getValue("membershipTier") as string
      return (
        <Badge
          variant={tier === "member" ? "default" : tier === "premium" ? "secondary" : "outline"}
          className="capitalize"
        >
          {tier}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ row }) => {
      return <span className="text-sm text-muted-foreground">{row.getValue("lastActive")}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const person = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="mr-2 h-4 w-4" />
              Request Introduction
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PeopleTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: mockPeople,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search members..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border border-border/50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
