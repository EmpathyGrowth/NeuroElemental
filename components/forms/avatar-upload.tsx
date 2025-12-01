'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { uploadFile, deleteFile, extractPathFromUrl, formatFileSize } from '@/lib/storage';
import { Camera, Loader2, Trash2, Upload, AlertCircle, ZoomIn, RotateCw } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userId: string;
  fullName?: string | null;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;

/**
 * Creates a cropped image from a source image and crop area
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas size to match the bounding box
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas context to center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  // Get image data from rotated canvas
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste cropped image
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Return as blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Creates an HTMLImageElement from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export function AvatarUpload({
  currentAvatarUrl,
  userId,
  fullName,
  onUploadComplete,
  onError,
  size = 'lg',
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Track the URL that was last uploaded so we know when the parent has saved it
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Clear preview only when currentAvatarUrl matches what we uploaded (confirming save success)
  useEffect(() => {
    // Only clear preview if the currentAvatarUrl is the same as what we uploaded
    // This ensures we don't clear the preview until the parent has actually saved
    if (uploadedUrl && currentAvatarUrl === uploadedUrl && previewUrl) {
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setUploadedUrl(null);
    }
  }, [currentAvatarUrl, uploadedUrl, previewUrl]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMsg = 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const errorMsg = `Image must be smaller than ${MAX_SIZE_MB}MB. Your file: ${formatFileSize(file.size)}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Store original file and open crop dialog
    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setOriginalFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCropDialogOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setImageToCrop(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels || !originalFile) return;

    setCropDialogOpen(false);
    setUploading(true);

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels, rotation);

      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }

      // Create a new file from the cropped blob
      const croppedFile = new File(
        [croppedBlob],
        originalFile.name.replace(/\.[^.]+$/, '.jpg'),
        { type: 'image/jpeg' }
      );

      // Create preview from cropped blob
      const croppedPreviewUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(croppedPreviewUrl);

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const pathInfo = extractPathFromUrl(currentAvatarUrl);
        if (pathInfo && pathInfo.bucket === 'avatars') {
          await deleteFile('avatars', pathInfo.path);
        }
      }

      // Upload cropped avatar using client-side storage
      const result = await uploadFile(croppedFile, {
        bucket: 'avatars',
        folder: userId,
        allowedTypes: ALLOWED_TYPES,
        maxSize: MAX_SIZE_MB,
      });

      if ('error' in result) {
        setError(result.error);
        onError?.(result.error);
        setPreviewUrl(null);
      } else {
        // Track the URL we uploaded so we know when parent confirms save
        setUploadedUrl(result.url);
        // Keep the preview URL showing until parent updates currentAvatarUrl
        // This prevents flicker while waiting for save
        onUploadComplete(result.url);
        setError(null);
        // Note: Don't clear previewUrl here - it will be cleared when currentAvatarUrl changes
      }
    } catch (_err) {
      const errorMsg = 'Failed to upload avatar. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      setImageToCrop(null);
      setOriginalFile(null);
      setCroppedAreaPixels(null);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl || currentAvatarUrl.trim() === '') return;

    setDeleting(true);
    setError(null);

    try {
      const pathInfo = extractPathFromUrl(currentAvatarUrl);
      if (pathInfo && pathInfo.bucket === 'avatars') {
        const result = await deleteFile('avatars', pathInfo.path);
        if (result.success) {
          setPreviewUrl(null);
          onUploadComplete(''); // Pass empty string to clear avatar_url in database
        } else {
          setError(result.error || 'Failed to delete avatar');
          onError?.(result.error || 'Failed to delete avatar');
        }
      } else {
        // Just clear the URL if we can't parse it
        setPreviewUrl(null);
        onUploadComplete(''); // Pass empty string to clear avatar_url in database
      }
    } catch (_err) {
      const errorMsg = 'Failed to delete avatar. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  // Treat empty strings as no avatar - only show image if URL is not empty
  const displayUrl = previewUrl || (currentAvatarUrl && currentAvatarUrl.trim() !== '' ? currentAvatarUrl : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className={sizeMap[size]}>
            <AvatarImage src={displayUrl || undefined} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer ${sizeMap[size]}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className={`${iconSizeMap[size]} text-white animate-spin`} />
            ) : (
              <Camera className={`${iconSizeMap[size]} text-white`} />
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || deleting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || deleting}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>

          {displayUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={uploading || deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {deleting ? 'Removing...' : 'Remove Photo'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Accepted formats: JPEG, PNG, GIF, WebP. Max size: {MAX_SIZE_MB}MB
      </p>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crop Your Photo</DialogTitle>
            <DialogDescription>
              Drag to reposition. Use the slider to zoom in or out.
            </DialogDescription>
          </DialogHeader>

          <div className="relative w-full h-[300px] bg-muted rounded-lg overflow-hidden">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                minZoom={0.1}
                maxZoom={3}
                objectFit="contain"
                restrictPosition={false}
                zoomSpeed={0.1}
              />
            )}
          </div>

          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-4">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                min={0.1}
                max={3}
                step={0.05}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotation Control */}
            <div className="flex items-center gap-4">
              <RotateCw className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => setRotation(value[0])}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">{rotation}°</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm}>
              Apply & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
