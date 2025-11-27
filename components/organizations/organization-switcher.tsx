'use client'

/**
 * Organization Switcher Component
 * Allows users to switch between their organizations
 */

import { logger } from '@/lib/logging';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface OrganizationSwitcherProps {
  currentOrgId?: string
  onOrganizationChange?: (orgId: string) => void
}

export function OrganizationSwitcher({
  currentOrgId,
  onOrganizationChange,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (currentOrgId && organizations.length > 0) {
      const org = organizations.find((o) => o.id === currentOrgId)
      if (org) setSelectedOrg(org)
    } else if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0])
    }
  }, [currentOrgId, organizations])

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations')
      if (!res.ok) throw new Error('Failed to fetch organizations')
      const data = await res.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      logger.error('Error fetching organizations:', error as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org)
    setOpen(false)

    if (onOrganizationChange) {
      onOrganizationChange(org.id)
    } else {
      router.push(`/dashboard/organizations/${org.id}`)
    }
  }

  const handleCreateOrganization = () => {
    setOpen(false)
    router.push('/dashboard/organizations/new')
  }

  if (loading) {
    return (
      <Button variant="outline" className="w-[240px] justify-between" disabled>
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Loading...
        </span>
      </Button>
    )
  }

  if (organizations.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-[240px] justify-between"
        onClick={handleCreateOrganization}
      >
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            {selectedOrg?.name || 'Select organization'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organizations found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelectOrganization(org)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOrg?.id === org.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{org.name}</div>
                    <div className="text-xs text-muted-foreground">{org.role}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateOrganization}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
