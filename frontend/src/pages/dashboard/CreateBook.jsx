import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Upload,
  ArrowLeft,
  DollarSign,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { booksApi } from '../../api/booksApi';
import { categoriesApi } from '../../api/categoriesApi';
import { useToast } from '../../context/ToastContext';

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New', desc: 'Unused, pristine condition' },
  { value: 'LIKE_NEW', label: 'Like New', desc: 'Minor or no visible wear, no markings' },
  { value: 'GOOD', label: 'Good', desc: 'Some highlighting or cover wear, all pages intact' },
  { value: 'FAIR', label: 'Fair', desc: 'Noticeable wear, intact binding and readable' },
];

const CreateBook = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [price, setPrice] = useState('');
  const [edition, setEdition] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [description, setDescription] = useState('');

  // Image Upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoriesApi.getAll();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].category_id.toString());
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        showError('Could not load book categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, [showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!categoryId) {
      setErrorMsg('Please select a book category');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Book title is required');
      return;
    }

    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMsg('Please enter a valid price');
      return;
    }

    try {
      setSubmitting(true);

      const bookPayload = {
        category_id: parseInt(categoryId, 10),
        title: title.trim(),
        author: author.trim() || undefined,
        description: description.trim() || undefined,
        condition,
        price: Number(price),
        edition: edition.trim() || undefined,
        publication_year: publicationYear ? parseInt(publicationYear, 10) : undefined,
      };

      const res = await booksApi.create(bookPayload);
      const createdBook = res.book;

      // If an image was selected, upload it
      if (imageFile && createdBook?.book_id) {
        try {
          await booksApi.uploadImage(createdBook.book_id, imageFile);
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
          showError('Book created, but image failed to upload. You can re-upload in My Books.');
        }
      }

      showSuccess('Book listed successfully! It has been submitted for admin review.');
      navigate('/dashboard/my-books');
    } catch (err) {
      console.error('Create book error:', err);
      setErrorMsg(err.message || 'Failed to create listing');
      showError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Post a Textbook for Sale
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the book details. Once approved by campus admins, it will appear on the public marketplace.
          </p>
        </div>

        <Link
          to="/dashboard/my-books"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Listings</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Book Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Book Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Algorithms (CLRS)"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Author(s)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Edition
                </label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="e.g. 4th Edition, Global Edition"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Publication Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(e.target.value)}
                  placeholder="e.g. 2022"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Condition */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Pricing & Condition</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Selling Price ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative max-w-xs">
                <span className="text-slate-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25.00"
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Physical Condition <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONDITIONS.map((cond) => (
                  <label
                    key={cond.value}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      condition === cond.value
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.value}
                      checked={condition === cond.value}
                      onChange={(e) => setCondition(e.target.value)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{cond.label}</span>
                      <span className="text-[11px] text-slate-500">{cond.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description / Notes for Buyer
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention highlights, missing pages, CD/access code presence, or convenient meetup spots on campus..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Photo Upload */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-600" />
              <span>Book Cover Photo (Optional)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: JPG, PNG, WEBP (Max 5MB). You can add more photos later.
                </p>
              </div>

              {imagePreview && (
                <div className="w-24 h-32 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/dashboard/my-books"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Listing...' : 'Submit Book for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;
