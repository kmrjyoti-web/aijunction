export interface NavigationUpdate {
  newActiveIndex: number;
  newSelection: Set<any>;
  newAnchorIndex: number | null;
}

/**
 * A utility class to manage keyboard navigation and selection state for a list of items.
 * Generic T represents the type of data item.
 */
export class KeyboardNavigationManager<T = any> {
  private data: Readonly<T[]> = [];
  private activeIndex: number | null = null;
  private selection: Readonly<Set<any>> = new Set();
  private anchorIndex: number | null = null;
  private primaryKey: string = 'id';

  /**
   * Updates the internal state of the manager.
   * @param data The current array of data items.
   * @param activeIndex The currently focused item's index.
   * @param selection The current set of selected item IDs.
   * @param anchorIndex The index used for starting range selections.
   * @param primaryKey The key to access the unique ID of an item.
   */
  updateState(
    data: Readonly<T[]>,
    activeIndex: number | null,
    selection: Readonly<Set<any>>,
    anchorIndex: number | null,
    primaryKey: string = 'id'
  ): void {
    this.data = data;
    this.activeIndex = activeIndex;
    this.selection = selection;
    this.anchorIndex = anchorIndex;
    this.primaryKey = primaryKey;
  }

  /**
   * Processes a keyboard event and returns the new state if navigation or selection occurs.
   * @param event The KeyboardEvent from the component.
   * @returns A NavigationUpdate object with the new state, or null if the key is not handled.
   */
  handleKeydown(event: KeyboardEvent): NavigationUpdate | null {
    if (this.data.length === 0) return null;

    const lowerKey = event.key.toLowerCase();
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;

    // Control + A: Select All
    if (isCtrlOrMeta && lowerKey === 'a') {
      event.preventDefault();
      return this.handleSelectAll();
    }

    // Control + Shift + Home: Select from focus to start
    if (isCtrlOrMeta && event.shiftKey && event.key === 'Home') {
      event.preventDefault();
      return this.handleRangeToBoundary('start');
    }

    // Control + Shift + End: Select from focus to end
    if (isCtrlOrMeta && event.shiftKey && event.key === 'End') {
      event.preventDefault();
      return this.handleRangeToBoundary('end');
    }

    const isNavKey = ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key);
    const isSelectKey = [' ', 'Enter'].includes(event.key);

    if (!isNavKey && !isSelectKey && !event.shiftKey) return null;

    if (isSelectKey && event.shiftKey) {
      event.preventDefault();
      return this.handleShiftSpace();
    }

    if (isSelectKey) {
      event.preventDefault();
      return this.handleToggleSelection(isCtrlOrMeta);
    }

    if (isNavKey) {
      event.preventDefault();
      return this.handleNavigation(event.key as 'ArrowUp' | 'ArrowDown' | 'Home' | 'End', event.shiftKey, isCtrlOrMeta);
    }

    return null;
  }

  private getItemId(index: number): any {
    if (index < 0 || index >= this.data.length) return null;
    return (this.data[index] as any)[this.primaryKey];
  }

  private handleSelectAll(): NavigationUpdate {
    const newActiveIndex = this.activeIndex ?? 0;
    const newAnchorIndex = this.anchorIndex ?? newActiveIndex;
    const newSelection = new Set<any>();
    this.data.forEach(item => newSelection.add((item as any)[this.primaryKey]));

    return {
      newActiveIndex,
      newSelection,
      newAnchorIndex,
    };
  }

  private handleRangeToBoundary(direction: 'start' | 'end'): NavigationUpdate {
    const active = this.activeIndex ?? 0;
    const target = direction === 'start' ? 0 : this.data.length - 1;
    const start = Math.min(active, target);
    const end = Math.max(active, target);

    const newSelection = new Set(this.selection);
    for (let i = start; i <= end; i++) {
      newSelection.add(this.getItemId(i));
    }

    return {
      newActiveIndex: target,
      newSelection,
      newAnchorIndex: active // Retain original anchor or update? Usually select to boundary implies range extension.
    };
  }

  private handleShiftSpace(): NavigationUpdate | null {
    // Selects the rows between the most recently selected row (anchor) and the focused row (active).
    if (this.activeIndex === null || this.anchorIndex === null) return null;

    const start = Math.min(this.anchorIndex, this.activeIndex);
    const end = Math.max(this.anchorIndex, this.activeIndex);
    const newSelection = new Set(this.selection);

    for (let i = start; i <= end; i++) {
      newSelection.add(this.getItemId(i));
    }

    return {
      newActiveIndex: this.activeIndex,
      newSelection,
      newAnchorIndex: this.anchorIndex
    };
  }

  private handleToggleSelection(isCtrlOrMeta: boolean): NavigationUpdate | null {
    if (this.activeIndex === null) return null;

    // Per requirement: Enter/Space toggles selection "depending on metaKeySelection".
    // If Ctrl is held, we toggle. If no modifier, we typically select ONLY this row (clearing others), 
    // BUT the requirement says "Toggles the selected state". 
    // Let's assume standard behavior: No Modifier = Toggle (or Select Single?), Ctrl = Toggle.
    // Given it's a web table, often Space = Select/Toggle.

    const active = this.activeIndex;
    const id = this.getItemId(active);
    const newSelection = new Set(isCtrlOrMeta ? this.selection : []); // If no ctrl, clear others? Request implies toggle.
    // Let's stick to: If Ctrl, toggle. If not, maybe just toggle the current one but keep others? 
    // Actually, "Toggle the selected state" implies it just flips the bit.
    // However, usually without Ctrl, selecting a row deselects others. 
    // Let's implement robust behavior:
    // If Ctrl: Toggle current, keep others.
    // If No Ctrl: Select current, clear others (Standard). 
    // BUT user text says: "Toggles the selected state... depending on metaKeySelection".
    // Let's assume metaKeySelection is effectively always enabled logic for this utility for now, or match standard.

    // Implementation: Toggle current ID in the set.
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }

    return {
      newActiveIndex: active,
      newSelection,
      newAnchorIndex: active,
    };
  }

  private handleNavigation(
    key: 'ArrowUp' | 'ArrowDown' | 'Home' | 'End',
    isShiftKey: boolean,
    isCtrlOrMeta: boolean
  ): NavigationUpdate {
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
    let newAnchorIndex = this.anchorIndex ?? currentIndex;

    if (isShiftKey) {
      // Range selection
      // If we haven't established an anchor, the current index is the anchor.
      const anchor = this.anchorIndex ?? currentIndex;

      if (!isCtrlOrMeta) {
        // Standard Shift+Arrow: Clear previous selection and select range from anchor to next.
        // Wait, user said "Moves focus... and toggles selection". 
        // Standard behavior is: Shift+Arrow extends selection from Anchor.
        newSelection.clear(); // Clear 'others' if we are doing a strict range from anchor.

        const start = Math.min(anchor, nextIndex);
        const end = Math.max(anchor, nextIndex);
        for (let i = start; i <= end; i++) {
          newSelection.add(this.getItemId(i));
        }
      }
      // If Ctrl+Shift+Arrow, we might want to Add range to existing selection? Standard is implicit.
    } else {
      // Simple navigation.
      // User: "Up arrow: Moves focus to previous row." (Does NOT say select).
      // User: "Enter/Space: Toggles selection".
      // So Arrow keys just move focus.
      newAnchorIndex = nextIndex;
      // We do NOT update selection on simple arrow navigation unless requested.
    }

    return {
      newActiveIndex: nextIndex,
      newSelection,
      newAnchorIndex
    };
  }
}
