import { Contact } from '../data-access/online-data.service';

export interface NavigationUpdate {
  newActiveIndex: number;
  newSelection: Set<number>;
  newAnchorIndex: number | null;
}

/**
 * A utility class to manage keyboard navigation and selection state for a list of items.
 */
export class KeyboardNavigationManager {
  private data: Readonly<Contact[]> = [];
  private activeIndex: number | null = null;
  private selection: Readonly<Set<number>> = new Set();
  private anchorIndex: number | null = null;

  /**
   * Updates the internal state of the manager.
   * @param data The current array of data items.
   * @param activeIndex The currently focused item's index.
   * @param selection The current set of selected item IDs.
   * @param anchorIndex The index used for starting range selections.
   */
  updateState(
    data: Readonly<Contact[]>,
    activeIndex: number | null,
    selection: Readonly<Set<number>>,
    anchorIndex: number | null
  ): void {
    this.data = data;
    this.activeIndex = activeIndex;
    this.selection = selection;
    this.anchorIndex = anchorIndex;
  }

  /**
   * Processes a keyboard event and returns the new state if navigation or selection occurs.
   * @param event The KeyboardEvent from the component.
   * @returns A NavigationUpdate object with the new state, or null if the key is not handled.
   */
  handleKeydown(event: KeyboardEvent): NavigationUpdate | null {
    if (this.data.length === 0) return null;

    if (event.ctrlKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      return this.handleSelectAll();
    }
    
    const isNavKey = ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key);
    const isSelectKey = [' ', 'Enter'].includes(event.key);

    if (!isNavKey && !isSelectKey) return null;
    
    event.preventDefault();

    if (isSelectKey) {
      return this.handleToggleSelection(event.shiftKey);
    }
    
    if (isNavKey) {
      return this.handleNavigation(event.key as 'ArrowUp' | 'ArrowDown' | 'Home' | 'End', event.shiftKey);
    }

    return null;
  }

  private handleSelectAll(): NavigationUpdate {
    const newActiveIndex = this.activeIndex ?? 0;
    const newAnchorIndex = this.anchorIndex ?? newActiveIndex;
    
    return {
      newActiveIndex,
      newSelection: new Set(this.data.map(item => item.organization_id)),
      newAnchorIndex,
    };
  }

  private handleToggleSelection(isShiftKey: boolean): NavigationUpdate | null {
    if (this.activeIndex === null && !isShiftKey) return null; // Cannot toggle if nothing is active

    if (isShiftKey) {
        // This handles "Shift + Space" for range selection.
        const active = this.activeIndex ?? 0;
        const anchor = this.anchorIndex ?? active;
        const start = Math.min(anchor, active);
        const end = Math.max(anchor, active);

        const newSelection = new Set(this.selection);
        for (let i = start; i <= end; i++) {
            newSelection.add(this.data[i].organization_id);
        }
        return {
            newActiveIndex: active,
            newSelection,
            newAnchorIndex: anchor,
        };

    } else {
        // This handles "Enter" or "Space" for single-item toggle.
        // activeIndex is guaranteed to be non-null here by the check at the top.
        const active = this.activeIndex!;
        const newSelection = new Set(this.selection);
        const id = this.data[active].organization_id;
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        return {
            newActiveIndex: active,
            newSelection,
            newAnchorIndex: active, // The toggled item becomes the new anchor
        };
    }
  }

  private handleNavigation(key: 'ArrowUp' | 'ArrowDown' | 'Home' | 'End', isShiftKey: boolean): NavigationUpdate {
      const currentIndex = this.activeIndex ?? -1;
      let nextIndex = currentIndex;

      switch (key) {
        case 'ArrowUp': 
          nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1; 
          break;
        case 'ArrowDown': 
          nextIndex = currentIndex < 0 ? 0 : Math.min(this.data.length - 1, currentIndex + 1); 
          break;
        case 'Home': 
          nextIndex = 0; 
          break;
        case 'End': 
          nextIndex = this.data.length - 1; 
          break;
      }
      
      let newSelection = new Set(this.selection);
      let newAnchorIndex = this.anchorIndex;

      if (isShiftKey) {
          // A standard shift-select replaces the selection with the new range.
          const anchor = this.anchorIndex ?? this.activeIndex ?? 0;
          const start = Math.min(anchor, nextIndex);
          const end = Math.max(anchor, nextIndex);
          
          const rangedSelection = new Set<number>();
          for(let i = start; i <= end; i++) {
              rangedSelection.add(this.data[i].organization_id);
          }
          newSelection = rangedSelection;
          // The anchor does not move during a range selection.
      } else {
          // Simple navigation without shift; the new anchor is the destination.
          newAnchorIndex = nextIndex;
      }

      return {
          newActiveIndex: nextIndex,
          newSelection,
          newAnchorIndex
      };
  }
}
