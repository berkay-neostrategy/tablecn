"use client";

import type { TableMeta } from "@tanstack/react-table";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VisualizerState } from "@/types/data-grid";
import { VisualizerModal } from "./data-grid-visualizer";

interface DataGridVisualizerDialogProps<TData> {
  tableMeta: TableMeta<TData>;
  visualizerState: VisualizerState;
}

export function DataGridVisualizerDialog<TData>({
  tableMeta,
  visualizerState,
}: DataGridVisualizerDialogProps<TData>) {
  const onOpenChange = tableMeta?.onVisualizerOpenChange;

  return (
    <Dialog open={visualizerState.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualize Selection</DialogTitle>
        </DialogHeader>
        <VisualizerModal data={visualizerState.data} />
      </DialogContent>
    </Dialog>
  );
}
