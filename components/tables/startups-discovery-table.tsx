"use client"

import { useState, useEffect } from "react"
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
import { ArrowUpDown, MoreHorizontal, ExternalLink, Heart, Users } from "lucide-react"
import { getCompanies, expressInterest, removeInterest } from "@/app/actions/companies"

interface Company {
  id: string
  name: string
  description: string
  industry: string
  stage: string
  funding_amount?: number
  employee_count?: number
  location: string
  founded_year?: number
  momentum_score: number
  website_url?: string
  tags: string[]
  interest_count: number
  user_interested: boolean
  scout_submissions: Array<{
    scout_name: string
    quality?: number
    notes?: string
  }>
}

interface StartupsDiscoveryTableProps {
  filter: "all" | "interested" | "trending"
  userId: string
}

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

export function StartupsDiscoveryTable({ filter, userId }: StartupsDiscoveryTableProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const handleInterestToggle = async (companyId: string, currentlyInterested: boolean) => {
    try {
      if (currentlyInterested) {
        await removeInterest(companyId)
      } else {
        await expressInterest(companyId)
      }

      // Update local state
      setCompanies(
        companies.map((company) =>
          company.id === companyId
            ? {
                ...company,
                user_interested: !currentlyInterested,
                interest_count: currentlyInterested ? company.interest_count - 1 : company.interest_count + 1,
              }
            : company,
        ),
      )
    } catch (error) {
      console.error("Failed to toggle interest:", error)
    }
  }

  const columns: ColumnDef<Company>[] = [
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
        const company = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{company.name}</div>
            <div className="text-sm text-muted-foreground line-clamp-2">{company.description}</div>
            <div className="text-xs text-muted-foreground">{company.industry}</div>
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
      accessorKey: "funding_amount",
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
        const amount = row.getValue("funding_amount") as number
        return amount ? <span className="font-medium">{formatCurrency(amount / 100)}</span> : "—"
      },
    },
    {
      accessorKey: "momentum_score",
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
        const score = row.getValue("momentum_score") as number
        return (
          <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"} className="font-medium">
            {score}
          </Badge>
        )
      },
    },
    {
      accessorKey: "interest_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Interest
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("interest_count") as number
        return (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{count}</span>
          </div>
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
        const company = row.original

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant={company.user_interested ? "default" : "outline"}
              size="sm"
              onClick={() => handleInterestToggle(company.id, company.user_interested)}
            >
              {company.user_interested ? (
                <>
                  <Heart className="h-4 w-4 mr-1 fill-current" />
                  Interested
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-1" />
                  Express Interest
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {company.website_url && (
                  <DropdownMenuItem asChild>
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Scout Notes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: companies,
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

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await getCompanies(filter, userId)
        setCompanies(data)
      } catch (error) {
        console.error("Failed to load companies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [filter, userId])

  if (loading) {
    return <div className="text-center py-8">Loading companies...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search companies..."
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
