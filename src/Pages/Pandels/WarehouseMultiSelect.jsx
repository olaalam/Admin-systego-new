import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
const WarehouseMultiSelect = ({ label, value, options, onChange, t }) => {
    const [open, setOpen] = React.useState(false);
    const selectedValues = new Set(value);

    const handleSelect = (warehouseId) => {
        if (selectedValues.has(warehouseId)) {
            selectedValues.delete(warehouseId);
        } else {
            selectedValues.add(warehouseId);
        }
        onChange(Array.from(selectedValues));
    };

    const handleRemove = (warehouseId) => {
        selectedValues.delete(warehouseId);
        onChange(Array.from(selectedValues));
    };

    const selectedNames = options
        .filter(w => selectedValues.has(w._id))
        .map(w => w.name);

    return (
        <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto py-2 min-h-[44px]"
                    >
                        {selectedNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[95%]">
                                {selectedNames.map((name, index) => {
                                    const warehouse = options.find(w => w.name === name);
                                    return (
                                        <Badge key={index} variant="secondary" className="pl-2 pr-1 gap-1">
                                            {name}
                                            <X className="h-3 w-3 cursor-pointer text-gray-500 hover:text-red-500" onClick={(e) => {
                                                e.stopPropagation(); // منع فتح القائمة عند حذف شارة
                                                if (warehouse) handleRemove(warehouse._id);
                                            }} />
                                        </Badge>
                                    );
                                })}
                            </div>
                        ) : (
                            t("Select Warehouses...")
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t("Search Warehouses...")} />
                        <CommandEmpty>{t("No warehouses found.")}</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {options.map((warehouse) => (
                                <CommandItem
                                    key={warehouse._id}
                                    value={warehouse.name}
                                    onSelect={() => handleSelect(warehouse._id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValues.has(warehouse._id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {warehouse.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default WarehouseMultiSelect;
