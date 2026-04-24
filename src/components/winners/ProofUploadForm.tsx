import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Upload, CheckCircle, Image as ImageIcon, X } from "lucide-react"

interface ProofUploadFormProps {
  winnerId: string
  onSuccess?: () => void
}

export function ProofUploadForm({ winnerId, onSuccess }: ProofUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: 'POST',
        body: formData
      })

      const json = await res.json()

      if (res.ok) {
        toast.success("Proof uploaded successfully")
        setUploadedUrl(json.proof_url)
        onSuccess?.()
      } else {
        toast.error(json.error || "Upload failed")
      }
    } catch (err) {
      toast.error("An error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  if (uploadedUrl) {
    return (
      <div className="space-y-4 p-4 border-2 border-green-100 bg-green-50 rounded-lg text-center">
        <div className="flex justify-center">
          <CheckCircle className="text-green-600" size={48} />
        </div>
        <div>
          <h3 className="font-bold text-green-900">Proof Submitted</h3>
          <p className="text-sm text-green-700">Your evidence has been uploaded and is pending verification by our team.</p>
        </div>
        <div className="relative aspect-video rounded-md overflow-hidden border border-green-200">
          <Image 
            src={uploadedUrl} 
            alt="Uploaded Proof" 
            fill
            className="object-cover"
            unoptimized={!uploadedUrl.includes('supabase.co')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
          preview ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-400'
        }`}
      >
        {!preview ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-slate-100 p-4 rounded-full">
                <Upload size={32} className="text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (Max 5MB)</p>
            </div>
            <Input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              id="proof-upload"
            />
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
            >
              Select Image
            </Button>
          </div>
        ) : (
          <div className="relative space-y-4">
            <button 
              onClick={clearFile}
              className="absolute -top-6 -right-6 bg-white rounded-full p-1 shadow-md border hover:bg-slate-50"
            >
              <X size={16} />
            </button>
            <div className="relative aspect-video rounded-md overflow-hidden border bg-black">
              <Image 
                src={preview} 
                alt="Preview" 
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-xs text-muted-foreground truncate">{file?.name}</p>
          </div>
        )}
      </div>

      <Button 
        className="w-full" 
        disabled={!file || uploading} 
        onClick={handleUpload}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={16} />
            Uploading Proof...
          </>
        ) : (
          "Submit Proof of Win"
        )}
      </Button>
    </div>
  )
}
