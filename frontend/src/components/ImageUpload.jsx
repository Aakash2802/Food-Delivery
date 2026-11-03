import { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadAPI } from '../services/api';

/**
 * Picks an image file, uploads it to POST /api/uploads and hands back its URL.
 * value: current image URL ('' when none) · onChange(url)
 */
const ImageUpload = ({ value, onChange, label = 'Image', hint = 'PNG, JPG or WebP up to 5 MB', className = '' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadAPI.image(file);
      onChange(res.data.url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      )}

      {value ? (
        <div>
          <div className="relative inline-block">
            <img
              src={value}
              alt=""
              className="h-32 w-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center space-x-1 disabled:opacity-60"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading…' : 'Replace image'}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors disabled:opacity-60"
        >
          {uploading
            ? <Loader className="w-8 h-8 text-gray-400 animate-spin mb-2" />
            : <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {uploading ? 'Uploading…' : 'Click to upload an image'}
          </span>
          <span className="text-xs text-gray-400 mt-1">{hint}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
};

export default ImageUpload;
