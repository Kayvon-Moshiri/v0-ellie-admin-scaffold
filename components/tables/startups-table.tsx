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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Users, TrendingUp } from "lucide-react"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  fundingAmount: number
  employeeCount: number
  location: string
  foundedYear: number
  momentumScore: number
  website?: string
  tags: string[]
}

const mockStartups: Startup[] = [
  {
    id: "1",
    name: "NeuralFlow AI",
    industry: "Artificial Intelligence",
    stage: "Series A",
    fundingAmount: 5000000,
    employeeCount: 25,
    location: "San Francisco, CA",
    foundedYear: 2022,
    momentumScore: 85,
    website: "https://neuralflow.ai",
    tags: ["AI", "Enterprise", "Automation"],
  },
  {
    id: "2",
    name: "FinanceFlow",
    industry: "FinTech",
    stage: "Series B",
    fundingAmount: 15000000,
    employeeCount: 45,
    location: "New York, NY",
    foundedYear: 2021,
    momentumScore: 91,
    website: "https://financeflow.com",
    tags: ["FinTech", "Infrastructure", "API"],
  },
  {
    id: "3",
    name: "GreenTech Solutions",
    industry: "CleanTech",
    stage: "Seed",
    fundingAmount: 2000000,
    employeeCount: 12,
    location: "Austin, TX",
    foundedYear: 2023,
    momentumScore: 72,
    tags: ["CleanTech", "Sustainability", "IoT"],
  },
  {
    id: "4",
    name: "HealthTech Innovations",
    industry: "HealthTech",
    stage: "Pre-Seed",
    fundingAmount: 500000,
    employeeCount: 8,
    location: "Boston, MA",
    foundedYear: 2024,
    momentumScore: 68,
    tags: ["HealthTech", "AI", "Diagnostics"],
  },
  {
    id: "5",
    name: "SpaceVenture",
    industry: "Aerospace",
    stage: "Series A",
    fundingAmount: 8000000,
    employeeCount: 35,
    location: "Los Angeles, CA",
    foundedYear: 2020,
    momentumScore: 79,
    tags: ["Space", "Satellites", "Technology"],
  },
]

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

const getStageColor = (stage: string) => {
  switch (stage.toLowerCase()) {
    case "series-a":
    case "series-b":
    case "series-c":
      return "default"
    case "seed":
      return "secondary"
    case "pre-seed":
    case "idea":
      return "outline"
    default:
      return "secondary"
  }
}

const columns: ColumnDef<Startup>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const startup = row.original
      return (
        <div>
          <div className="font-medium">{startup.name}</div>
          <div className="text-sm text-muted-foreground">{startup.industry}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string
      return (
        <Badge variant={getStageColor(stage)} className="capitalize">
          {stage}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fundingAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Funding
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("fundingAmount") as number
      return <span className="font-medium">{formatCurrency(amount)}</span>
    },
  },
  {
    accessorKey: "employeeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Employees
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "momentumScore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Momentum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue("momentumScore") as number
      return (
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"} className="font-medium">
          {score}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const startup = row.original

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
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              View Team
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function StartupsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: mockStartups,
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
          placeholder="Search startups..."
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
