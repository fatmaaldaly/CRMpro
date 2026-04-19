import { useReassignLeads } from "@/lib/tanstack/useLeads"
import { useState } from "react";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "../ui/dialog";


type ReassignLeadsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadIds: string[];
  onSuccess: () => void;
};


export function ReassignLeadsDialog({  
  open,
  onOpenChange,
  selectedLeadIds,
  onSuccess,
}: ReassignLeadsDialogProps){

  const reassignLeads = useReassignLeads();
  
  function resetForm(){

  }

    
    
  return(
    <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>

    );
}