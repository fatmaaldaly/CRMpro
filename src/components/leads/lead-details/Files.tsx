import { useAttachments, useUploadAttachment } from "@/lib/tanstack/useAttachments";
import {Paperclip} from "lucide-react";
import { useRef, useState} from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/services/attachments/schema";
import {formatFileSize} from "@/services/attachments/helpers";


// reuired input: leadId
export default function Files({ leadId }: { leadId: string }) {
    
    // hooks
    const {data, isLoading, isError} = useAttachments(leadId);
    const uploadFile = useUploadAttachment(leadId);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);


    // 4 UI states 
    // loading: attachments are being fetched, show loading... 
    // error: api failed, show error message
    // empty: data.length === 0, show icon, "No files attached yet" message, and upload button 
    // data exists: show the list of attached files

  const uploadSelectedFile = (file: File) => {
    // Validate type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Unsupported file type");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 10MB");
      return;
    }

    uploadFile.mutate(file, {
      onSuccess: () => {
        toast.success("File uploaded successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };


  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadSelectedFile(file);

    // reset input so same file can be uploaded again
    e.target.value = "";
  };


  // Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    uploadSelectedFile(file);
  };


    // 1. Loading
    if (isLoading) {
      return <div className="p-4 text-sm text-muted-foreground">Loading files...</div>;
    }

    // 2. Error
    if (isError) {
      return <div className="p-4 text-sm text-red-500">Failed to load files</div>;
    }

    // 3. Empty
    if (!data || data.length === 0) {
      return (
        <div className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
          />

          <div className="rounded-xl p-6 border-2 border-dashed border-slate-300 text-center">
            <div className="flex flex-col items-center gap-3 py-10">
              <Paperclip className="size-6 text-slate-400" />
              <p className="text-sm text-muted-foreground">No files yet</p>
              <button
                className="text-sm font-medium underline"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload file
              </button>
            </div>
          </div>
        </div>
      );
    }

  // 4. Data exists
  return (
    
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleUpload}
      />

      {/* 1. Upload container */}
      <div onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl p-6 border-2 border-dashed transition text-center
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400"
          }`}>

        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Paperclip className="size-6 text-slate-400" />

          <button
            className="text-sm font-bold"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending}
          >
            {uploadFile.isPending ? "Uploading..." : "Drop files here or click to upload"}
          </button>
        </div>
      </div>
    
      {/* 2. File table */}
      <div className="space-y-4">
          <div className="rounded-xl overflow-hidden">
          <table className="w-full text-sm rounded">
          
          {/* Table Header */}
          <thead className="bg-gray-100 text-left">
          <tr>
              <th className="py-3 px-4 font-bold w-xl">File name</th>
              <th className="py-3 px-4 font-bold">Size</th>
              <th className="py-3 px-4 font-bold">Uploaded by</th>
              <th className="py-3 px-4 font-bold">Date</th>
              <th className="py-3 px-4 font-bold">Actions</th>
          </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y">
          {data.map((attachment) => (
              <tr key={attachment.id} className="hover:bg-muted/50 transition">
              
              {/* Name */}
              <td className="py-3 px-4 font-medium">
                  {attachment.fileName}
              </td>

              {/* Size */}
              <td className="py-3 px-4 text-muted-foreground">
                  {formatFileSize(attachment.sizeBytes)}
              </td>

              {/* Uploaded by */}
              <td className="py-3 px-4 text-muted-foreground">
                  {attachment.uploadedBy.name}
              </td>

              {/* Date */}
              <td className="py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(attachment.createdAt), {
                  addSuffix: true,
                  })}
              </td>

              {/* Actions */}
              <td className="py-3 px-4">
                  <button
                  className="text-sm text-blue-400"
                  onClick={() => window.open(attachment.downloadUrl, "_blank")}
                  >
                  Download
                  </button>
              </td>
              </tr>
          ))}
          </tbody>
      </table>
      </div>
    </div>
  </div>
  );


}