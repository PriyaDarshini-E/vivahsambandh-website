/**
 * @file src/components/ui/form-select.tsx
 * Brand-themed form dropdown.
 *
 * Short lists render a real native <select>, so the browser owns the popup
 * (reliable positioning, mobile pickers and built-in type-ahead). Long lists
 * get a lightweight search panel anchored to the field, because a native
 * select cannot show a search box. No third-party select primitive is used.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from 'cn'
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react'

export interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  id: string
  value: string
  onValueChange: (value: string, eventDetails?: unknown) => void
  options: FormSelectOption[]
  placeholder?: string
  error?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  disabledText?: string
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

interface PopupPosition {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
}

const fieldClasses = (error: boolean) =>
  cn(
    'h-11 w-full rounded-full border py-2 pr-9 pl-4 text-base font-medium transition duration-200 outline-none focus-visible:ring-2 md:text-sm',
    error
      ? 'border-maroon-500 bg-maroon-50/30 text-navy-900 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
      : 'border-cream-300 bg-cream-50/70 text-navy-900 hover:border-gold-500/60 hover:bg-white focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
  )

export function FormSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error = false,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  disabledText,
  searchable = false,
  searchPlaceholder = 'Search...',
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: FormSelectProps) {
  const isDisabled = disabled || loading
  const needsSearch = searchable && options.length > 5 && !isDisabled

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const [position, setPosition] = useState<PopupPosition>({
    left: 0,
    width: 240,
    maxHeight: 280,
  })

  const placeholderText = loading
    ? loadingText
    : !value && disabledText && options.length === 0
      ? disabledText
      : placeholder

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value],
  )

  const filtered = useMemo(() => {
    if (!needsSearch) return options
    const query = searchTerm.trim().toLowerCase()
    if (!query) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    )
  }, [needsSearch, options, searchTerm])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const reposition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const viewportPadding = 8
    const gap = 6
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding
    const spaceAbove = rect.top - gap - viewportPadding
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow
    const width = Math.min(
      Math.max(rect.width, 240),
      window.innerWidth - viewportPadding * 2,
    )
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    )

    setPosition({
      left,
      width,
      maxHeight: Math.max(160, Math.min(300, openUp ? spaceAbove : spaceBelow)),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    })
  }, [])

  const close = useCallback((refocus = false) => {
    setOpen(false)
    setSearchTerm('')
    setHighlighted(0)
    if (refocus) triggerRef.current?.focus()
  }, [])

  const openPopup = useCallback(() => {
    if (isDisabled) return
    setSearchTerm('')
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }, [isDisabled, options, value])

  const selectOption = useCallback(
    (option: FormSelectOption) => {
      onValueChange(option.value)
      close(true)
    },
    [close, onValueChange],
  )

  useEffect(() => {
    if (!open) return
    reposition()
    const handleViewportChange = () => reposition()
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, reposition])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => searchRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) {
        return
      }
      close()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [close, open])

  useEffect(() => {
    setHighlighted(0)
  }, [searchTerm])

  useEffect(() => {
    if (!open) return
    const option = listRef.current?.children[highlighted] as HTMLElement | undefined
    option?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((index) => (filtered.length ? (index + 1) % filtered.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => (filtered.length ? (index - 1 + filtered.length) % filtered.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[highlighted]
      if (option) selectOption(option)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    }
  }

  if (!needsSearch) {
    return (
      <div className="relative w-full">
        <select
          id={id}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={isDisabled}
          aria-invalid={ariaInvalid ?? error}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'cursor-pointer appearance-none disabled:cursor-not-allowed disabled:opacity-60',
            fieldClasses(error),
            !value && 'text-ink-400',
            className,
          )}
        >
          <option value="" disabled>
            {placeholderText}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-ink-400"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
        )}
      </div>
    )
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-invalid={ariaInvalid ?? error}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        onClick={() => (open ? close() : openPopup())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (open) {
              searchRef.current?.focus()
            } else {
              openPopup()
            }
          }
        }}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60',
          fieldClasses(error),
          open && 'border-gold-500 bg-white ring-2 ring-gold-500/20',
          className,
        )}
      >
        <span
          className={cn(
            'flex-1 truncate',
            selectedLabel ? 'font-medium text-navy-900' : 'font-normal text-ink-400',
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={popupRef}
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-xl"
          style={{
            left: position.left,
            width: position.width,
            maxHeight: position.maxHeight,
            top: position.top,
            bottom: position.bottom,
          }}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-cream-200 bg-cream-50/70 px-3 py-2.5">
            <Search className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={`${id}-listbox`}
              aria-activedescendant={
                filtered[highlighted] ? `${id}-option-${filtered[highlighted].value}` : undefined
              }
              role="combobox"
              aria-expanded
              autoComplete="off"
              className="w-full bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:font-normal placeholder:text-ink-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="cursor-pointer rounded-full p-0.5 text-ink-400 transition hover:bg-cream-200/70 hover:text-navy-900"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={placeholder}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-ink-500">
                {searchTerm.trim() ? `No match for "${searchTerm.trim()}"` : 'No options available'}
              </li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlighted
                return (
                  <li
                    key={option.value}
                    id={`${id}-option-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => selectOption(option)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      isHighlighted ? 'bg-gold-50 text-navy-900' : 'text-navy-900 hover:bg-cream-100',
                      isSelected && 'font-semibold',
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="size-4 shrink-0 text-gold-700" aria-hidden="true" />
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </>
  )
}
