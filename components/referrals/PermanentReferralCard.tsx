/**
 * PERMANENT REFERRAL CARD COMPONENT
 *
 * Multi-use referral link generator that NEVER expires.
 * Tracks ALL users who click and complete signup through the link.
 *
 * Features:
 * - Never expires (permanent links)
 * - Unlimited users OR custom max_claims limit
 * - Full analytics: clicks, claims, completion rate
 * - Password protection (optional)
 * - Custom image and message
 * - Complete user history tracking
 * - Can pause/resume instead of delete
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 *
 * @component
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Infinity,
  Copy,
  Check,
  Sparkles,
  Lock,
  Users,
  Award,
  ExternalLink,
  RefreshCw,
  Loader2,
  Star,
  Link as LinkIcon,
  ImagePlus,
  Eye,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
  History,
  MessageSquare,
  Pause,
  Play,
  Calendar,
  TrendingUp,
  UserCheck,
  Activity,
  Wallet,
  BarChart3,
} from 'lucide-react';

interface PermanentReferralCardProps {
  referralCode: string;
  walletAddress?: string;
}

interface PermanentInviteData {
  code: string;
  password?: string;
  customMessage?: string;
  customTitle?: string;
  image?: string;
  maxClaims?: number;
  createdAt: string;
}

// Interface for stored permanent invites from database
interface StoredPermanentInvite {
  inviteCode: string;
  customMessage: string | null;
  customTitle: string | null;
  imageUrl: string | null;
  hasPassword: boolean;
  status: 'active' | 'paused' | 'disabled';
  neverExpires: boolean;
  expiresAt: string | null;
  maxClaims: number | null;
  totalClicks: number;
  totalClaims: number;
  totalCompleted: number;
  conversionRate: number;
  createdAt: string;
  lastClaimedAt: string | null;
}

interface ClaimHistoryEntry {
  wallet: string;
  claimedAt: string;
  completedAt: string | null;
  bonusClaimed: boolean;
  bonusAmount: number;
}

export function PermanentReferralCard({ referralCode, walletAddress }: PermanentReferralCardProps) {
  const t = useTranslations('referrals.permanent');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maxClaims, setMaxClaims] = useState<string>(''); // Empty = unlimited
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // State for permanent invites history
  const [permanentInvites, setPermanentInvites] = useState<StoredPermanentInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<string | null>(null);
  const [claimHistory, setClaimHistory] = useState<Record<string, ClaimHistoryEntry[]>>({});
  const [loadingClaimHistory, setLoadingClaimHistory] = useState<string | null>(null);
  const [pausingInviteCode, setPausingInviteCode] = useState<string | null>(null);

  const defaultMessage = 'Te invito a unirte a CryptoGift DAO, una comunidad descentralizada donde puedes contribuir y ganar recompensas. Este enlace nunca expira!';
  const defaultTitle = 'Invitacion Permanente a CryptoGift DAO';

  // Load permanent invites on mount and when wallet changes
  useEffect(() => {
    const fetchPermanentInvites = async () => {
      if (!walletAddress) return;

      setIsLoadingInvites(true);
      try {
        const response = await fetch(`/api/referrals/permanent-invite/user?wallet=${walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.invites) {
            setPermanentInvites(data.invites);
            console.log(`📋 Loaded ${data.invites.length} permanent invites`);
          }
        }
      } catch (error) {
        console.error('Error fetching permanent invites:', error);
      } finally {
        setIsLoadingInvites(false);
      }
    };

    fetchPermanentInvites();
  }, [walletAddress]);

  // Load claim history for a specific invite
  const loadClaimHistory = useCallback(async (inviteCode: string) => {
    setLoadingClaimHistory(inviteCode);
    try {
      const response = await fetch(`/api/referrals/permanent-invite/history?code=${inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.claims) {
          setClaimHistory(prev => ({ ...prev, [inviteCode]: data.claims }));
        }
      }
    } catch (error) {
      console.error('Error loading claim history:', error);
    } finally {
      setLoadingClaimHistory(null);
    }
  }, []);

  // Toggle invite status (pause/resume)
  const handleToggleInviteStatus = useCallback(async (inviteCode: string, currentStatus: string) => {
    if (!walletAddress) return;

    const action = currentStatus === 'active' ? 'pause' : 'resume';
    const newStatus = action === 'pause' ? 'paused' : 'active';
    setPausingInviteCode(inviteCode);

    try {
      const response = await fetch('/api/referrals/permanent-invite/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, wallet: walletAddress, action }),
      });

      if (response.ok) {
        // Update local state
        setPermanentInvites(prev =>
          prev.map(invite =>
            invite.inviteCode === inviteCode
              ? { ...invite, status: newStatus as 'active' | 'paused' | 'disabled' }
              : invite
          )
        );
        console.log(`🔄 ${newStatus === 'active' ? 'Resumed' : 'Paused'} invite ${inviteCode}`);
      }
    } catch (error) {
      console.error('Error toggling invite status:', error);
    } finally {
      setPausingInviteCode(null);
    }
  }, [walletAddress]);

  // Delete a permanent invite permanently
  const handleDeleteInvite = useCallback(async (inviteCode: string) => {
    if (!walletAddress) return;

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este enlace permanente?\n\n' +
      'Esta acción NO se puede deshacer. Se eliminarán todos los datos asociados:\n' +
      '- El enlace dejará de funcionar\n' +
      '- Se perderá el historial de usuarios\n' +
      '- Se eliminarán las estadísticas\n\n' +
      'Si solo quieres pausar el enlace temporalmente, usa el botón "Pausar" en su lugar.'
    );

    if (!confirmed) return;

    setPausingInviteCode(inviteCode);

    try {
      const response = await fetch('/api/referrals/permanent-invite/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, wallet: walletAddress }),
      });

      if (response.ok) {
        // Remove from local state
        setPermanentInvites(prev => prev.filter(invite => invite.inviteCode !== inviteCode));
        // Clear claim history for this invite
        setClaimHistory(prev => {
          const newHistory = { ...prev };
          delete newHistory[inviteCode];
          return newHistory;
        });
        console.log(`🗑️ Deleted permanent invite ${inviteCode}`);
      } else {
        const data = await response.json();
        alert(`Error al eliminar: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      alert('Error al eliminar el enlace. Por favor intenta de nuevo.');
    } finally {
      setPausingInviteCode(null);
    }
  }, [walletAddress]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', text: 'Activo', icon: <Activity className="h-3 w-3" /> };
      case 'paused':
        return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', text: 'Pausado', icon: <Pause className="h-3 w-3" /> };
      case 'disabled':
        return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', text: 'Deshabilitado', icon: <X className="h-3 w-3" /> };
      default:
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', text: 'Desconocido', icon: null };
    }
  };

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

  const generatePermanentLink = useCallback(async () => {
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

      // Generate unique code for this permanent invite
      const uniqueCode = `PI-${referralCode}-${Date.now().toString(36).toUpperCase()}`;

      const inviteData: PermanentInviteData = {
        code: uniqueCode,
        password: password || undefined,
        customMessage: customMessage || defaultMessage,
        customTitle: customTitle || defaultTitle,
        image: imageUrl,
        maxClaims: maxClaims ? parseInt(maxClaims) : undefined,
        createdAt: new Date().toISOString(),
      };

      // Call API to create permanent invite
      const response = await fetch('/api/referrals/permanent-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inviteData,
          referrerWallet: walletAddress,
          referrerCode: referralCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create permanent invite');
      }

      const data = await response.json();

      // Build the permanent invite URL
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://cryptogift-dao.com';

      const permanentLink = `${baseUrl}/permanent-invite/${data.inviteCode}`;
      setGeneratedLink(permanentLink);

      // Store password to show it visibly after generation
      if (password) {
        setGeneratedPassword(password);
      }

      // Add the new invite to the beginning of permanentInvites list
      const newInvite: StoredPermanentInvite = {
        inviteCode: data.inviteCode,
        customMessage: customMessage || defaultMessage,
        customTitle: customTitle || defaultTitle,
        imageUrl: imageUrl || null,
        hasPassword: !!password,
        status: 'active',
        neverExpires: true,
        expiresAt: null,
        maxClaims: maxClaims ? parseInt(maxClaims) : null,
        totalClicks: 0,
        totalClaims: 0,
        totalCompleted: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
        lastClaimedAt: null,
      };
      setPermanentInvites(prev => [newInvite, ...prev]);

      setShowForm(false);
    } catch (error) {
      console.error('Error generating permanent link:', error);
      alert('Error al generar enlace permanente. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
      setIsUploadingImage(false);
    }
  }, [referralCode, password, customMessage, customTitle, defaultMessage, defaultTitle, walletAddress, imageFile, maxClaims]);

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
    setCustomTitle('');
    setCustomImage(null);
    setImageFile(null);
    setMaxClaims('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card className="glass-panel border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
              <Infinity className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <span>Enlace Permanente de Referido</span>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">
                  <Infinity className="h-3 w-3 mr-1" />
                  Nunca Expira
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enlaces multi-uso que rastrean todos los usuarios que ingresan
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Crea enlaces permanentes que <strong>nunca expiran</strong> y permiten <strong>multiples usuarios</strong>.
          Rastrea clicks, conversiones y ve el historial completo de todos los que se unieron a traves de tu enlace.
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <Infinity className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Nunca Expira
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <Users className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Usuarios Ilimitados
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/40">
            <BarChart3 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Analytics Completo
              </p>
            </div>
          </div>
        </div>

        {showForm ? (
          /* Form to generate link */
          <div className="space-y-4 pt-2">
            {/* Custom Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Titulo Personalizado (opcional)
              </label>
              <Input
                type="text"
                placeholder="Invitacion Permanente a CryptoGift DAO"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="bg-white/70 dark:bg-slate-800/50"
                maxLength={100}
              />
            </div>

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
                Contrasena (opcional)
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Deja vacio si no requiere contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 dark:bg-slate-800/50 pr-10 font-mono"
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                  Protege tu enlace con una contrasena (visible para compartir)
                </p>
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Visible
                </span>
              </div>
            </div>

            {/* Max Claims Limit */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                Limite de Usuarios (opcional)
              </label>
              <Input
                type="number"
                placeholder="Deja vacio para usuarios ilimitados"
                value={maxClaims}
                onChange={(e) => setMaxClaims(e.target.value)}
                className="bg-white/70 dark:bg-slate-800/50"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Establece un limite maximo de usuarios que pueden reclamar este enlace (vacio = ilimitado)
              </p>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Mensaje Personalizado (opcional)
              </label>
              <Textarea
                placeholder="Te invito a unirte a CryptoGift DAO..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="bg-white/70 dark:bg-slate-800/50 min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Personaliza el mensaje de bienvenida
                </p>
                <span className="text-xs text-gray-400">
                  {customMessage.length}/500
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generatePermanentLink}
              disabled={isGenerating || isUploadingImage}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploadingImage ? 'Subiendo imagen...' : 'Generando...'}
                </>
              ) : (
                <>
                  <Infinity className="h-4 w-4 mr-2" />
                  Generar Enlace Permanente
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
                  ✅ Enlace Permanente Creado
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
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* PASSWORD DISPLAY - Visible for sharing with invitee */}
            {generatedPassword && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Contrasena para Compartir
                  </span>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-white/70 dark:bg-slate-800/50 p-3 rounded-lg text-purple-800 dark:text-purple-200 font-mono font-bold border border-purple-200 dark:border-purple-800 tracking-wide">
                    {generatedPassword}
                  </code>
                  <Button
                    onClick={handleCopyPassword}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 border-purple-300 dark:border-purple-700"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="h-4 w-4 text-purple-500 mr-1" />
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

                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                  Comparte esta contrasena con las personas que invites. La necesitaran para acceder.
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
                Crear Otro Enlace
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

        {/* PERMANENT INVITES HISTORY PANEL */}
        {permanentInvites.length > 0 && (
          <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
            {/* Collapsible Header */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Tus Enlaces Permanentes
                </span>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs">
                  {permanentInvites.length}
                </Badge>
              </div>
              {showHistory ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* History List */}
            {showHistory && (
              <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                {isLoadingInvites ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                  </div>
                ) : (
                  permanentInvites.map((invite) => {
                    const statusBadge = getStatusBadge(invite.status);
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const inviteUrl = `${baseUrl}/permanent-invite/${invite.inviteCode}`;
                    const isExpanded = selectedInvite === invite.inviteCode;
                    const claims = claimHistory[invite.inviteCode] || [];

                    return (
                      <div
                        key={invite.inviteCode}
                        className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 space-y-3"
                      >
                        {/* Header with status and date */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusBadge.color} text-xs flex items-center gap-1`}>
                              {statusBadge.icon}
                              {statusBadge.text}
                            </Badge>
                            {invite.hasPassword && (
                              <Lock className="h-3 w-3 text-purple-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Infinity className="h-3 w-3 mr-1" />
                              Permanente
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(invite.createdAt)}
                          </div>
                        </div>

                        {/* Analytics Stats */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Clicks</div>
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{invite.totalClicks}</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                            <div className="text-xs text-green-600 dark:text-green-400 mb-1">Reclamados</div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">{invite.totalClaims}</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Completados</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{invite.totalCompleted}</div>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                            <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">Conversion</div>
                            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{invite.conversionRate.toFixed(0)}%</div>
                          </div>
                        </div>

                        {/* Invite Code */}
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300 truncate">
                            {inviteUrl}
                          </code>
                          <Button
                            onClick={async () => {
                              await navigator.clipboard.writeText(inviteUrl);
                            }}
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => window.open(inviteUrl, '_blank')}
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 pt-2">
                          {/* View History Button */}
                          <Button
                            onClick={() => {
                              if (isExpanded) {
                                setSelectedInvite(null);
                              } else {
                                setSelectedInvite(invite.inviteCode);
                                if (!claims.length) {
                                  loadClaimHistory(invite.inviteCode);
                                }
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            {isExpanded ? 'Ocultar Historial' : `Ver ${invite.totalClaims} Usuarios`}
                          </Button>

                          {/* Pause/Resume Button */}
                          <Button
                            onClick={() => handleToggleInviteStatus(invite.inviteCode, invite.status)}
                            variant="outline"
                            size="sm"
                            disabled={pausingInviteCode === invite.inviteCode}
                            className="text-xs"
                          >
                            {pausingInviteCode === invite.inviteCode ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : invite.status === 'active' ? (
                              <>
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Reanudar
                              </>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            onClick={() => handleDeleteInvite(invite.inviteCode)}
                            variant="outline"
                            size="sm"
                            disabled={pausingInviteCode === invite.inviteCode}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            {pausingInviteCode === invite.inviteCode ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Eliminar
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Claim History Display */}
                        {isExpanded && (
                          <div className="mt-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Usuarios que Ingresaron ({claims.length})
                            </h4>
                            {loadingClaimHistory === invite.inviteCode ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                              </div>
                            ) : claims.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {claims.map((claim, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <Wallet className="h-3 w-3 text-gray-400" />
                                      <code className="text-gray-700 dark:text-gray-300">
                                        {claim.wallet.slice(0, 6)}...{claim.wallet.slice(-4)}
                                      </code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {claim.completedAt ? (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs">
                                          ✅ Completado
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 text-xs">
                                          ⏳ Pendiente
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                                Aun no hay usuarios que hayan ingresado
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
