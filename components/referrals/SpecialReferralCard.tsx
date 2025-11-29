/**
 * SPECIAL REFERRAL CARD COMPONENT
 *
 * Premium referral link generator with educational requirement (DAO Masterclass).
 * Allows users to create special invite links that require recipients to complete
 * the DAO Masterclass before joining the DAO.
 *
 * Features:
 * - Custom image upload for invite card
 * - Visible password display (not hidden)
 * - Custom message for invitees
 * - Password protection with visible display
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 *
 * @component
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  GraduationCap,
  Copy,
  Check,
  Sparkles,
  Lock,
  Users,
  Award,
  ExternalLink,
  RefreshCw,
  Loader2,
  BookOpen,
  Star,
  Link as LinkIcon,
  ImagePlus,
  Eye,
  X,
  Upload,
} from 'lucide-react';

interface SpecialReferralCardProps {
  referralCode: string;
  walletAddress?: string;
}

interface SpecialInviteData {
  code: string;
  password?: string;
  customMessage?: string;
  image?: string;
  createdAt: string;
}

export function SpecialReferralCard({ referralCode, walletAddress }: SpecialReferralCardProps) {
  const t = useTranslations('referrals.special');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const defaultMessage = t('form.messageDefault');

  // Handle image file selection
  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen valida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove selected image
  const handleRemoveImage = useCallback(() => {
    setCustomImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Upload image to server
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const generateSpecialLink = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Upload image if selected
      let imageUrl: string | undefined;
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadedUrl = await uploadImage(imageFile);
        setIsUploadingImage(false);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Generate unique code for this special invite
      const uniqueCode = `${referralCode}-${Date.now().toString(36)}`;

      const inviteData: SpecialInviteData = {
        code: uniqueCode,
        password: password || undefined,
        customMessage: customMessage || defaultMessage,
        image: imageUrl,
        createdAt: new Date().toISOString(),
      };

      // Call API to create special invite
      const response = await fetch('/api/referrals/special-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inviteData,
          referrerWallet: walletAddress,
          referrerCode: referralCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create special invite');
      }

      const data = await response.json();

      // Build the special invite URL
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://cryptogift-dao.com';

      const specialLink = `${baseUrl}/special-invite/${data.inviteCode}`;
      setGeneratedLink(specialLink);

      // Store password to show it visibly after generation
      if (password) {
        setGeneratedPassword(password);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error generating special link:', error);
      // Fallback: generate link client-side
      const fallbackCode = `${referralCode}-${Date.now().toString(36)}`;
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://cryptogift-dao.com';

      // Encode parameters in URL
      const params = new URLSearchParams({
        ref: referralCode,
        ...(password && { p: btoa(password) }),
        ...(customMessage && { msg: encodeURIComponent(customMessage) }),
      });

      setGeneratedLink(`${baseUrl}/special-invite/${fallbackCode}?${params.toString()}`);

      // Store password to show it visibly after generation
      if (password) {
        setGeneratedPassword(password);
      }

      setShowForm(false);
    } finally {
      setIsGenerating(false);
      setIsUploadingImage(false);
    }
  }, [referralCode, password, customMessage, defaultMessage, walletAddress, imageFile]);

  const handleCopy = useCallback(async () => {
    if (!generatedLink) return;

    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  const handleCopyPassword = useCallback(async () => {
    if (!generatedPassword) return;

    await navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }, [generatedPassword]);

  const handleCreateAnother = useCallback(() => {
    setGeneratedLink(null);
    setGeneratedPassword(null);
    setShowForm(true);
    setPassword('');
    setCustomMessage('');
    setCustomImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card className="glass-panel border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <span>{t('title')}</span>
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {t('badge')}
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {t('subtitle')}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t('description')}
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <BookOpen className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('benefits.education')}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <Users className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('benefits.quality')}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <Award className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('benefits.rewards')}
              </p>
            </div>
          </div>
        </div>

        {showForm ? (
          /* Form to generate link */
          <div className="space-y-4 pt-2">
            {/* Custom Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <ImagePlus className="h-4 w-4 mr-2 text-purple-500" />
                Imagen Personalizada (opcional)
              </label>

              {customImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-700">
                  <Image
                    src={customImage}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Haz click para subir una imagen
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG o GIF (max 5MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Password - VISIBLE (not hidden) */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Lock className="h-4 w-4 mr-2 text-gray-500" />
                {t('form.password')}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('form.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 dark:bg-slate-800/50 pr-10 font-mono"
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                  {t('form.passwordHelp')}
                </p>
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Visible
                </span>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                {t('form.message')}
              </label>
              <Textarea
                placeholder={t('form.messagePlaceholder')}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-white/70 dark:bg-slate-800/50 min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('form.messageHelp')}
                </p>
                <span className="text-xs text-gray-400">
                  {customMessage.length}/500
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateSpecialLink}
              disabled={isGenerating || isUploadingImage}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploadingImage ? 'Subiendo imagen...' : t('generating')}
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {t('generate')}
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Generated Link Display */
          <div className="space-y-4 pt-2">
            {/* Success Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('linkReady')}
                </span>
              </div>

              {/* Link with Copy Button */}
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-white/70 dark:bg-slate-800/50 p-3 rounded-lg text-gray-700 dark:text-gray-300 truncate border border-green-200 dark:border-green-800">
                  {generatedLink}
                </code>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 border-green-300 dark:border-green-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      {t('copyLink')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* PASSWORD DISPLAY - Visible for sharing with invitee */}
            {generatedPassword && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Contrasena para Compartir
                  </span>
                  <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-white/70 dark:bg-slate-800/50 p-3 rounded-lg text-amber-800 dark:text-amber-200 font-mono font-bold border border-amber-200 dark:border-amber-800 tracking-wide">
                    {generatedPassword}
                  </code>
                  <Button
                    onClick={handleCopyPassword}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 border-amber-300 dark:border-amber-700"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="h-4 w-4 text-amber-500 mr-1" />
                        Copiada
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Comparte esta contrasena con la persona que invitas. La necesitara para acceder.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleCreateAnother}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('createAnother')}
              </Button>
              <Button
                onClick={() => generatedLink && window.open(generatedLink, '_blank')}
                variant="ghost"
                className="flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
