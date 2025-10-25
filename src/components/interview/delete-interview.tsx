"use client"

import { Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react";
import { DeleteInterviewModal } from "./delete-interview-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteInterview(interview: {_id:string}){
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const handleDelete = async () => {

        setIsDeleting(true);

        try {
          const response = await fetch(`/api/interview/${interview._id}/delete`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Interview deleted successfully");
            router.push('/history');
          } else {
            const error = await response.json();
            toast.error(error.error || "Failed to delete interview");
          }
        } catch (error) {
          console.error("Error deleting interview:", error);
          toast.error("An error occurred while deleting the interview");
        } finally {
          setIsDeleting(false);
        }
    };
    return(
        <>
        <Button
           variant="ghost"
           size="sm"
           className="gap-2 mt-2 hover:bg-gray-200 dark:hover:bg-gray-300"
           onClick={()=>setShowDeleteModal(true)}
           disabled={isDeleting}
         >
          <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
        </Button>
        <DeleteInterviewModal 
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            onConfirm={handleDelete}
        />
        </>
    )
}