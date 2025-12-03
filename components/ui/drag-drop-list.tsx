"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface DragHandleProps {
  "data-drag-handle": boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SortableItemProps<T> {
  item: T;
  index: number;
  dragHandleProps: DragHandleProps;
  isDragging: boolean;
}

export interface DragDropListProps<T> {
  items: T[];
  keyField: keyof T;
  onReorder: (items: T[]) => void;
  renderItem: (props: SortableItemProps<T>) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// DragHandle Component
// ============================================================================

export function DragHandle({
  className,
  ...props
}: DragHandleProps & { className?: string }) {
  return (
    <div
      {...props}
      className={cn(
        "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

// ============================================================================
// SortableItem Component
// ============================================================================

interface SortableItemWrapperProps<T> {
  id: string;
  item: T;
  index: number;
  renderItem: (props: SortableItemProps<T>) => React.ReactNode;
  disabled?: boolean;
}

function SortableItemWrapper<T>({
  id,
  item,
  index,
  renderItem,
  disabled,
}: SortableItemWrapperProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const dragHandleProps: DragHandleProps = {
    "data-drag-handle": true,
    ...attributes,
    ...listeners,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem({ item, index, dragHandleProps, isDragging })}
    </div>
  );
}

// ============================================================================
// DragDropList Component
// ============================================================================

export function DragDropList<T extends object>({
  items,
  keyField,
  onReorder,
  renderItem,
  disabled = false,
  className,
}: DragDropListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getItemId = (item: T): string => {
    const value = item[keyField];
    return String(value);
  };

  const itemIds = items.map(getItemId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableItemWrapper
              key={getItemId(item)}
              id={getItemId(item)}
              item={item}
              index={index}
              renderItem={renderItem}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ============================================================================
// Utility: Update display_order values
// ============================================================================

export function updateDisplayOrder<T extends { display_order?: number }>(
  items: T[]
): T[] {
  return items.map((item, index) => ({
    ...item,
    display_order: index + 1,
  }));
}
