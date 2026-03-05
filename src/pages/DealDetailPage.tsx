import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore, useDealStore, useUIStore } from '@/store';
import { api } from '@/services/api';
// import EmptyDeals from '../images/EmptyDeals.png'; // adjust path if needed
interface UploadedFile {
  id: string;
  name: string;
}

// Figma-exact History icon for timer notice
const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_history)">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.00008 0.666992C12.0501 0.667036 15.3334 3.95028 15.3334 8.00033C15.3334 12.0504 12.0501 15.3336 8.00008 15.3337C3.95004 15.3336 0.66677 12.0504 0.666748 8.00033C0.66677 3.95028 3.95004 0.667036 8.00008 0.666992ZM7.75659 4.33952C7.38842 4.33952 7.08995 4.63801 7.08993 5.00619V8.31022C7.08993 8.66236 7.27516 8.98851 7.57756 9.16895L10.1322 10.693C10.4484 10.8816 10.8577 10.7781 11.0463 10.4619C11.2348 10.1457 11.1313 9.73647 10.8152 9.54785L8.42326 8.12077V5.00619C8.42324 4.63804 8.12473 4.33956 7.75659 4.33952Z" fill="rgba(255,255,255,0.64)" />
    </g>
    <defs>
      <clipPath id="clip0_history">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Figma-exact Arrow Down icon for expansion
const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_arrow)">
      <path d="M15.7609 5.57332C16.1024 5.19453 16.078 4.63581 15.6879 4.28257C15.2974 3.92937 14.6798 3.9076 14.2608 4.21661L14.1796 4.28257L9.1926 8.90574L9.00959 9.10462C8.80186 9.10462 8.59095 9.10462 8.00183 9.10462C7.41286 9.10478 7.2018 9.10462 7.2018 9.10462L6.93244 8.90574L1.82081 4.28257C1.40425 3.90581 0.729004 3.90582 0.31243 4.28257C-0.104143 4.65933 -0.104143 5.27005 0.31243 5.64681L6.8689 11.5768L6.99078 11.6757C7.57731 12.108 8.42321 12.1082 9.00959 11.6757L9.13147 11.5768L15.6879 5.64681L15.7609 5.57332Z" fill="#8F8C9C" />
    </g>
    <defs>
      <clipPath id="clip0_arrow">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);


// Send icon for message button
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M14.5034 1.16206C15.7217 0.897247 16.7886 2.0504 16.429 3.25899L12.8489 15.3147C12.4399 16.6906 10.5961 16.9341 9.85109 15.7006L7.27077 11.4248L11.5657 7.10054C11.8576 6.80664 11.8559 6.33115 11.562 6.03926C11.2681 5.74789 10.7932 5.74928 10.5015 6.04292L6.21535 10.3576L1.91384 7.71065C0.693273 6.95923 0.936089 5.10522 2.31813 4.70259L14.3855 1.19209L14.5034 1.16206Z" fill="#C2FF0A" />
  </svg>
);

// Figma-exact Loader icon (yellow sun-like spinner)
const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="figma-deal-stage-icon figma-deal-stage-icon--loader">
    <path d="M9.99992 14.5057C10.486 14.5057 10.8803 14.8993 10.8805 15.3854V18.2858C10.8805 18.772 10.4862 19.1663 9.99992 19.1663C9.51368 19.1663 9.11938 18.772 9.11938 18.2858V15.3854C9.11957 14.8993 9.51379 14.5057 9.99992 14.5057Z" fill="#FFD552" />
    <path d="M5.56877 13.1857C5.91256 12.8419 6.47006 12.842 6.81388 13.1857C7.1577 13.5295 7.1577 14.087 6.81388 14.4308L4.7631 16.4816C4.41928 16.8254 3.8618 16.8254 3.51799 16.4816C3.17427 16.1378 3.17422 15.5803 3.51799 15.2365L5.56877 13.1857Z" fill="#FFD552" />
    <path d="M13.186 13.1857C13.5298 12.8419 14.0873 12.8419 14.4311 13.1857L16.4819 15.2365C16.8256 15.5803 16.8256 16.1378 16.4819 16.4816C16.1381 16.8254 15.5806 16.8253 15.2367 16.4816L13.186 14.4308C12.8421 14.087 12.8421 13.5295 13.186 13.1857Z" fill="#FFD552" />
    <path d="M4.61418 9.11914C5.10026 9.11932 5.49389 9.51355 5.4939 9.99967C5.4939 10.4858 5.10027 10.88 4.61418 10.8802H1.71379C1.22755 10.8802 0.833252 10.4859 0.833252 9.99967C0.833262 9.51344 1.22755 9.11914 1.71379 9.11914H4.61418Z" fill="#FFD552" />
    <path d="M18.2861 9.11914C18.7723 9.11914 19.1666 9.51344 19.1666 9.99967C19.1666 10.4859 18.7723 10.8802 18.2861 10.8802H15.3857C14.8996 10.88 14.5059 10.4858 14.5059 9.99967C14.506 9.51355 14.8996 9.11932 15.3857 9.11914H18.2861Z" fill="#FFD552" />
    <path d="M3.51799 3.51774C3.8618 3.17393 4.41928 3.17395 4.7631 3.51774L6.81388 5.56852C7.1577 5.91235 7.1577 6.46982 6.81388 6.81364C6.47006 7.15738 5.91256 7.15743 5.56877 6.81364L3.51799 4.76286C3.17422 4.41906 3.17425 3.86156 3.51799 3.51774Z" fill="#FFD552" />
    <path d="M15.2367 3.51774C15.5806 3.17403 16.1381 3.17396 16.4819 3.51774C16.8256 3.86153 16.8256 4.41903 16.4819 4.76286L14.4311 6.81364C14.0872 7.15746 13.5298 7.15746 13.186 6.81364C12.8421 6.46982 12.8421 5.91235 13.186 5.56852L15.2367 3.51774Z" fill="#FFD552" />
    <path d="M9.99992 0.833008C10.4862 0.833008 10.8805 1.2273 10.8805 1.71354V4.61393C10.8803 5.10002 10.4861 5.49365 9.99992 5.49365C9.51379 5.49365 9.11956 5.10002 9.11938 4.61393V1.71354C9.11938 1.2273 9.51368 0.833008 9.99992 0.833008Z" fill="#FFD552" />
  </svg>
);

// Figma-exact Tick icon (green checkmark in circle)
const TickIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="figma-deal-stage-icon figma-deal-stage-icon--tick">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.99992 0.833008C15.0625 0.833008 19.1666 4.93706 19.1666 9.99967C19.1666 15.0623 15.0625 19.1663 9.99992 19.1663C4.93731 19.1663 0.833252 15.0623 0.833252 9.99967C0.833252 4.93706 4.93731 0.833008 9.99992 0.833008ZM14.0364 6.9292C13.7038 6.57892 13.1646 6.579 12.832 6.9292L8.81014 11.1667L7.1687 9.43408C6.83605 9.08495 6.29725 9.08332 5.96346 9.43246C5.63083 9.78278 5.63114 10.3513 5.96265 10.7028L8.20711 13.0702C8.36606 13.2387 8.58339 13.333 8.80933 13.333C9.03504 13.3329 9.25154 13.2385 9.41154 13.0702L14.0364 8.19792C14.369 7.84765 14.3689 7.27954 14.0364 6.9292Z" fill="#C2FF0A" />
  </svg>
);

// Figma-exact Info icon for fee explanations
const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <g clipPath="url(#clip0_info)">
      <path d="M6 5.3125C6.31066 5.3125 6.5625 5.56434 6.5625 5.875V8.25C6.5625 8.56066 6.31066 8.8125 6 8.8125C5.68934 8.8125 5.4375 8.56066 5.4375 8.25V5.875C5.4375 5.56434 5.68934 5.3125 6 5.3125Z" fill="rgba(255,255,255,0.64)" />
      <path d="M6 3.1875C6.31066 3.1875 6.5625 3.43934 6.5625 3.75V4.125C6.5625 4.43566 6.31066 4.6875 6 4.6875C5.68934 4.6875 5.4375 4.43566 5.4375 4.125V3.75C5.4375 3.43934 5.68934 3.1875 6 3.1875Z" fill="rgba(255,255,255,0.64)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M6 0.5C9.03757 0.5 11.5 2.96243 11.5 6C11.5 9.03757 9.03757 11.5 6 11.5C2.96243 11.5 0.5 9.03757 0.5 6C0.5 2.96243 2.96243 0.5 6 0.5ZM6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5Z" fill="rgba(255,255,255,0.64)" />
    </g>
    <defs>
      <clipPath id="clip0_info">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>
);


export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentDeal, fetchDeal, isLoading, error } = useDealStore();
  const { addToast } = useUIStore();

  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeRefundAddress, setDisputeRefundAddress] = useState('');
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllStages, setShowAllStages] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Seller flow states
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [showAcceptedScreen, setShowAcceptedScreen] = useState(false);
  const [showDeclinedScreen, setShowDeclinedScreen] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState('');
  const [declineMessage, setDeclineMessage] = useState('');
  const [termsExpanded, setTermsExpanded] = useState(false);

  // Dispute notification modal states
  const [showDisputeOpenModal, setShowDisputeOpenModal] = useState(false);
  const [disputeDetailsExpanded, setDisputeDetailsExpanded] = useState(false);

  // Buyer sending invite state
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeal(id);
    }
  }, [id, fetchDeal]);

  // Auto-show new deal modal for sellers on created deals
  useEffect(() => {
    if (currentDeal && user) {
      const isSeller = user.id === currentDeal.sellerId;
      const isNewDeal = currentDeal.status === 'created';
      if (isSeller && isNewDeal) {
        setShowNewDealModal(true);
      }
    }
  }, [currentDeal, user]);

  // Auto-show "Dispute is open" modal for counterparty when dispute is opened
  useEffect(() => {
    if (currentDeal && user && currentDeal.status === 'disputed') {
      // Check if user has already seen this dispute notification
      const seenKey = `dispute_seen_${currentDeal.id}`;
      const hasSeenDispute = localStorage.getItem(seenKey);

      // Show modal if not seen yet and user is not the one who opened the dispute
      // (disputeOpenedBy would be set on the deal, for now show to both parties)
      if (!hasSeenDispute) {
        setShowDisputeOpenModal(true);
      }
    }
  }, [currentDeal, user]);

  const getStatusLabel = (status: string, userIsBuyer?: boolean): string => {
    // For buyer viewing a created deal, show "Pending seller acceptance"
    if (status === 'created' && userIsBuyer) {
      return 'Pending seller acceptance';
    }
    const labels: Record<string, string> = {
      created: 'New',
      awaiting_deposit: 'Accepted',
      funded: 'Funded',
      in_progress: 'In Progress',
      delivered: 'Delivered',
      completed: 'Complete',
      disputed: 'In Dispute',
      cancelled: 'Canceled',
      refunded: 'Refunded',
      expired: 'Expired',
      locked_for_payout: 'Processing',
    };
    return labels[status] || status;
  };

  // const getStatusClass = (status: string, userIsBuyer?: boolean): string => {
  //   // For buyer viewing a created deal, use pending-acceptance style
  //   if (status === 'created' && userIsBuyer) {
  //     return 'pending-acceptance';
  //   }
  //   const classes: Record<string, string> = {
  //     created: 'new',
  //     awaiting_deposit: 'accepted',
  //     funded: 'funded',
  //     in_progress: 'in-progress',
  //     delivered: 'delivered',
  //     completed: 'complete',
  //     disputed: 'dispute',
  //     cancelled: 'canceled',
  //     refunded: 'canceled',
  //     expired: 'canceled',
  //     locked_for_payout: 'funded',
  //   };
  //   return classes[status] || 'new';
  // };

  const getDealStages = (status: string, _createdAt?: string, fundedAt?: string, deliveredAt?: string, completedAt?: string, userIsBuyer?: boolean) => {
    // Format time as HH:MM
    const formatTime = (date?: string) => {
      if (!date) return undefined;
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Different labels based on user role and status - matching Figma exactly
    const getWaitingLabel = () => {
      if (status === 'awaiting_deposit') {
        return 'Waiting for buyer funding';
      }
      if (status === 'funded') {
        return userIsBuyer ? 'Waiting for seller to start work' : 'Waiting for you to mark as in progress';
      }
      if (status === 'in_progress') {
        return userIsBuyer ? 'Seller is working on the deal' : 'Deal in progress';
      }
      if (status === 'delivered') {
        return userIsBuyer ? 'Waiting for your confirmation' : 'Waiting for buyer confirmation';
      }
      if (status === 'disputed') {
        return 'Waiting for dispute resolution';
      }
      return '';
    };

    const stages = [];

    // Show waiting state at top for active deals
    if (['awaiting_deposit', 'funded', 'in_progress', 'delivered', 'disputed'].includes(status)) {
      stages.push({
        label: getWaitingLabel(),
        completed: false,
        active: true,
        waiting: true
      });
    }

    // Completed stages
    if (status === 'completed') {
      stages.push({
        label: 'Funds sent to seller',
        time: formatTime(completedAt),
        completed: true,
        active: false
      });
    }
    if (['delivered', 'completed'].includes(status)) {
      stages.push({
        label: userIsBuyer ? 'Seller completed the deal' : 'You completed the deal',
        time: formatTime(deliveredAt),
        completed: true,
        active: false
      });
    }
    if (['in_progress', 'delivered', 'completed'].includes(status)) {
      stages.push({
        label: userIsBuyer ? 'Seller started the deal' : 'You started the deal',
        time: formatTime(deliveredAt),
        completed: true,
        active: false
      });
    }
    if (['funded', 'in_progress', 'delivered', 'completed'].includes(status)) {
      stages.push({
        label: userIsBuyer ? 'You funded the deal' : 'Buyer funded the deal',
        time: formatTime(fundedAt),
        completed: true,
        active: false
      });
    }
    if (['awaiting_deposit', 'funded', 'in_progress', 'delivered', 'completed'].includes(status)) {
      stages.push({
        label: userIsBuyer ? 'Seller accepted the deal' : 'You accepted the deal',
        time: formatTime(fundedAt),
        completed: true,
        active: false
      });
    }

    // Cancelled stages
    if (status === 'cancelled') {
      stages.push({
        label: 'Buyer canceled the deal',
        completed: false,
        active: false,
        cancelled: true
      });
      stages.push({
        label: userIsBuyer ? 'You funded the deal' : 'Buyer funded the deal',
        time: formatTime(fundedAt),
        completed: true,
        active: false
      });
    }

    // Refunded stages
    if (status === 'refunded') {
      stages.push({
        label: 'Payment refunded',
        time: formatTime(completedAt),
        completed: true,
        active: false
      });
      stages.push({
        label: userIsBuyer ? 'You funded the deal' : 'Buyer funded the deal',
        time: formatTime(fundedAt),
        completed: true,
        active: false
      });
    }

    return stages;
  };

  // Handlers
  const handleAcceptDeal = async () => {
    if (!currentDeal) return;
    setActionLoading(true);
    try {
      await api.acceptDeal(currentDeal.id);
      setShowNewDealModal(false);
      setShowAcceptedScreen(true);
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to accept deal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDeal = async () => {
    if (!currentDeal) return;
    setActionLoading(true);
    try {
      await api.rejectDeal(currentDeal.id, declineMessage);
      setShowNewDealModal(false);
      setShowDeclinedScreen(true);
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to reject deal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendAcceptMessage = async () => {
    if (!currentDeal || !acceptMessage.trim()) return;
    try {
      await api.sendMessage(currentDeal.id, acceptMessage);
      addToast('Message sent!', 'success');
      setAcceptMessage('');
    } catch (err) {
      addToast((err as Error).message || 'Failed to send message', 'error');
    }
  };

  const handleSendDeclineMessage = async () => {
    if (!currentDeal || !declineMessage.trim()) return;
    try {
      await api.sendMessage(currentDeal.id, declineMessage);
      addToast('Message sent!', 'success');
      setDeclineMessage('');
    } catch (err) {
      addToast((err as Error).message || 'Failed to send message', 'error');
    }
  };

  const handleMarkInProgress = async () => {
    if (!currentDeal) return;
    setActionLoading(true);
    try {
      await api.markInProgress(currentDeal.id);
      addToast('Deal marked as in progress!', 'success');
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to update deal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!currentDeal) return;
    setActionLoading(true);
    try {
      await api.markDelivered(currentDeal.id);
      addToast('Deal marked as delivered!', 'success');
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to mark as delivered', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!currentDeal || !confirmRelease) return;
    setActionLoading(true);
    try {
      await api.confirmReceipt(currentDeal.id);
      addToast('Funds released!', 'success');
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to confirm receipt', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDeal) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      addToast('File type not allowed. Use images or PDF.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('File too large. Maximum size is 10MB.', 'error');
      return;
    }

    setUploadingFile(true);
    setShowFileOptions(false);

    try {
      const result = await api.uploadDisputeFile(currentDeal.id, file);
      setUploadedFiles(prev => [...prev, { id: result.id, name: file.name }]);
      addToast('File uploaded', 'success');
    } catch (err) {
      addToast((err as Error).message || 'Failed to upload file', 'error');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDispute = async () => {
    if (!currentDeal) return;
    if (disputeReason.length < 10) {
      addToast('Please provide a reason for the dispute', 'error');
      return;
    }
    const isBuyerRole = user?.id === currentDeal.buyerId;
    if (isBuyerRole && !disputeRefundAddress) {
      addToast('Please enter your refund address', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const fileIds = uploadedFiles.map(f => f.id);
      await api.disputeDeal(
        currentDeal.id,
        disputeReason,
        isBuyerRole ? disputeRefundAddress : undefined,
        fileIds.length > 0 ? fileIds : undefined
      );
      addToast('Dispute opened', 'success');
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeRefundAddress('');
      setUploadedFiles([]);
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to open dispute', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openChat = () => {
    if (currentDeal) {
      navigate(`/deals/${currentDeal.id}/chat`);
    }
  };

  const handleCancelDeal = async () => {
    if (!currentDeal) return;
    setShowMenu(false);
    setActionLoading(true);
    try {
      await api.cancelDeal(currentDeal.id);
      addToast('Deal cancelled', 'success');
      fetchDeal(currentDeal.id);
    } catch (err) {
      addToast((err as Error).message || 'Failed to cancel deal', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHideDeal = () => {
    if (!currentDeal) return;
    setShowMenu(false);
    const hiddenDeals = JSON.parse(localStorage.getItem('hiddenDeals') || '[]');
    if (!hiddenDeals.includes(currentDeal.id)) {
      hiddenDeals.push(currentDeal.id);
      localStorage.setItem('hiddenDeals', JSON.stringify(hiddenDeals));
    }
    addToast('Deal hidden from list', 'success');
    navigate('/deals');
  };

  const handleCopyDealId = () => {
    if (!currentDeal) return;
    setShowMenu(false);
    navigator.clipboard.writeText(currentDeal.id).then(() => {
      addToast('Deal ID copied', 'success');
    }).catch(() => {
      addToast('Failed to copy', 'error');
    });
  };

  // Handler for sending invite again to seller
  const handleSendInviteAgain = async () => {
    if (!currentDeal) return;
    setSendingInvite(true);
    try {
      await api.sendInviteReminder(currentDeal.id);
      addToast('Invite reminder sent!', 'success');
    } catch (err) {
      addToast((err as Error).message || 'Failed to send reminder', 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="figma-seller-page">
        <div className="figma-seller-loading">
          <div className="figma-seller-spinner" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentDeal) {
    return (
      <div className="figma-seller-page">
        <div className="figma-seller-header">
          <button className="figma-seller-back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
            </svg>
          </button>
          <h1 className="figma-seller-title">Deal Not Found</h1>
          <div style={{ width: 24 }} />
        </div>
        <div className="figma-seller-error">
          <p>{error || "This deal doesn't exist"}</p>
          <button className="figma-seller-btn-primary" onClick={() => navigate('/deals')}>
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  const deal = currentDeal;
  const userId = user?.id;
  const isBuyer = userId != null && deal.buyerId === userId;
  const isSeller = userId != null && deal.sellerId === userId;
  const isParty = isBuyer || isSeller;
  const counterparty = isBuyer ? deal.sellerUsername : deal.buyerUsername;
  const counterpartyRole = isBuyer ? 'Seller' : 'Buyer';
  const displayCurrency = deal.currency.toLowerCase().includes('usdt') ? 'USDT' : deal.currency.toUpperCase();

  // Actions based on role and status
  const canMarkInProgress = isSeller && deal.status === 'funded';
  const canMarkDelivered = isSeller && deal.status === 'in_progress';
  const canConfirmReceipt = isBuyer && deal.status === 'delivered';
  // const canDispute = isParty && ['funded', 'in_progress', 'delivered'].includes(deal.status);
  const canCancel = isParty && ['created', 'awaiting_deposit'].includes(deal.status);
  const canHide = ['expired', 'cancelled', 'completed', 'refunded'].includes(deal.status);

  const stages = getDealStages(deal.status, deal.createdAt, deal.fundedAt, deal.deliveredAt, deal.completedAt, isBuyer);
  const visibleStages = showAllStages ? stages : stages.slice(0, 3);

  // Deal Accepted Success Screen - Figma exact
  if (showAcceptedScreen) {
    return (
      <div className="figma-seller-page figma-seller-result-page">
        <div>
          {/* Success icon with card background */}
          <img src="/app/images/deal_done.png" alt="dealaccepted" className='deal-accepted-img' />
          <h2 className="figma-seller-result-title figma-deal-acceptance">Deal is accepted</h2>

          {/* Deal card with amount, username, description */}
          <div className="figma-seller-result-card">
            <div className="figma-seller-result-amount">{parseFloat(deal.amount).toLocaleString()} {displayCurrency}</div>
            <div className="figma-seller-result-divider" />
            <div className="figma-seller-result-info">
              <span className="figma-seller-result-username">@{deal.buyerUsername || 'buyer'}</span>
              <span className="figma-seller-result-desc">{deal.description || 'No description'}</span>
            </div>
          </div>

        </div>
        {/* Bottom section with message input and buttons */}
        <div className="figma-seller-result-bottom">
          {/* Message input */}
          <div className="figma-seller-result-input-wrapper">

            <textarea
              className="figma-seller-result-input"
              placeholder="Enter message here"
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
            />
          </div>

          {/* Send message button */}
          <button
            className="figma-seller-btn-send-message"
            onClick={handleSendAcceptMessage}
            disabled={!acceptMessage.trim()}
          >
            <SendIcon />
            <span>Send message</span>
          </button>

          {/* Done button */}
          <button
            className="figma-seller-btn-primary figma-seller-btn-primary--full"
            onClick={() => setShowAcceptedScreen(false)}
          >
            Done
          </button>
        </div>

        {/* Home indicator */}
        <div className="figma-home-indicator">
          <div className="figma-home-indicator-bar-specific" />
        </div>

      </div>
    );
  }

  // Deal Declined Screen - Figma exact
  if (showDeclinedScreen) {
    return (
      <div className="figma-seller-page figma-seller-result-page">
        <div>
          {/* Success icon with card background */}
          <img src="/app/images/deal_reject.png" alt="dealaccepted" className='deal-accepted-img' />
          <h2 className="figma-seller-result-title figma-deal-acceptance">Deal is declined</h2>

          {/* Deal card with amount, username, description */}
          <div className="figma-seller-result-card">
            <div className="figma-seller-result-amount">{parseFloat(deal.amount).toLocaleString()} {displayCurrency}</div>
            <div className="figma-seller-result-divider" />
            <div className="figma-seller-result-info">
              <span className="figma-seller-result-username">@{deal.buyerUsername || 'buyer'}</span>
              <span className="figma-seller-result-desc">{deal.description || 'No description'}</span>
            </div>
          </div>

        </div>
        {/* Bottom section with message input and buttons */}
        <div className="figma-seller-result-bottom">
          {/* Message input */}
          <div className="figma-seller-result-input-wrapper">

            <textarea
              className="figma-seller-result-input"
              placeholder="Enter message here"
              value={acceptMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
            />
          </div>

          {/* Send message button */}
          <button
            className="figma-seller-btn-send-message"
           onClick={handleSendDeclineMessage}
            disabled={!declineMessage.trim()}
          >
            <SendIcon />
            <span>Send message</span>
          </button>

          {/* Done button */}
          <button
            className="figma-seller-btn-primary figma-seller-btn-primary--full"
             onClick={() => navigate('/deals')}
          >
            Ok
          </button>
        </div>

        {/* Home indicator */}
        <div className="figma-home-indicator">
          <div className="figma-home-indicator-bar-specific" />
        </div>

      </div>
    );
  }
  const footerMessage = (
    (deal.status === 'awaiting_deposit' && isSeller && 'When the buyer funds the deal, you can start work') ||
    (deal.status === 'awaiting_deposit' && isBuyer && 'Fund the deal to secure it in escrow') ||
    (deal.status === 'funded' && isSeller && 'Waiting for you to mark as in progress') ||
    (deal.status === 'funded' && isBuyer && 'Waiting for seller to start work') ||
    (deal.status === 'in_progress' && isSeller && 'Mark as delivered when you complete the work') ||
    (deal.status === 'in_progress' && isBuyer && 'Seller is working on the deal') ||
    (deal.status === 'delivered' && isSeller && 'When the buyer confirms delivery, funds are released') ||
    (deal.status === 'delivered' && isBuyer && 'Confirm receipt to release funds to the seller')
  );
  // Main Deal Detail Page
  return (
    <div className="figma-seller-page">
      {/* Header */}
      <div className="figma-seller-header">
        <button className="figma-seller-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.66135 4.72394C10.054 4.40371 10.6331 4.42659 10.9992 4.7923C11.3653 5.1584 11.3879 5.73742 11.0676 6.13019L10.9992 6.20636L6.20529 11.0003H20.0022C20.5545 11.0003 21.0022 11.448 21.0022 12.0003C21.002 12.5524 20.5543 13.0003 20.0022 13.0003H6.20725L10.9992 17.7923C11.3898 18.1828 11.3897 18.8158 10.9992 19.2064C10.6087 19.5969 9.9757 19.5969 9.58518 19.2064L3.43869 13.0599L3.33615 12.9456C2.88807 12.3958 2.88782 11.6028 3.33615 11.053L3.43869 10.9388L9.58518 4.7923L9.66135 4.72394Z" fill="white" />
          </svg>
        </button>
        <h1 className="figma-seller-title">Deal overview</h1>
        <div className="figma-seller-header-actions">
          <div className="figma-seller-menu-container">
            <button className="figma-seller-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="figma-seller-menu-backdrop" onClick={() => setShowMenu(false)} />
                <div className="figma-seller-menu-dropdown">
                  {/* {canDispute && ( */}
                  <button
                    className="figma-seller-menu-item dispute"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDisputeModal(true);
                    }}
                  >
                    Open dispute
                  </button>
                  {/* )} */}

                  <button
                    className="figma-seller-menu-item chat"
                    onClick={() => {
                      setShowMenu(false);
                      openChat();
                    }}
                  >
                    <SendIcon />
                    Chat
                  </button>

                  <button className="figma-seller-menu-item" onClick={handleCopyDealId}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy Deal ID
                  </button>

                  {canCancel && (
                    <button className="figma-seller-menu-item danger" onClick={handleCancelDeal} disabled={actionLoading}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      Cancel Deal
                    </button>
                  )}

                  {canHide && (
                    <button className="figma-seller-menu-item" onClick={handleHideDeal}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                      Hide from List
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Counterparty Card */}
      <div className="figma-seller-counterparty">
        <div className="figma-seller-counterparty-info">
          <div className="figma-seller-avatar">
            {counterparty?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <div className="figma-seller-counterparty-text">
            <span className="figma-seller-counterparty-role">{counterpartyRole}</span>
            <span className="figma-seller-counterparty-name">@{counterparty || 'Unknown'}</span>
          </div>
        </div>
        <button className="figma-seller-chat-btn" onClick={openChat}>
          <SendIcon />
          Chat
        </button>
      </div>

      {/* Deal Info Card */}
      <div className="figma-seller-card">
        {/* Header */}
        <div className="figma-seller-card-header">
          <div>
            <span className="figma-seller-deal-number">Deal #{deal.dealNumber}</span>
            <div className="figma-seller-amount">
              {parseFloat(deal.amount).toLocaleString()} {displayCurrency}
            </div>
          </div>
          <span className={`figma-deal-card-badge figma-deal-card-badge--${deal.status}`}>
            {getStatusLabel(deal.status, isBuyer)}
          </span>
        </div>

        {/* Description */}
        <div className="figma-seller-section">
          <span className="figma-seller-label">Description</span>
          <p className="figma-seller-text">{deal.description || 'No description provided'}</p>
        </div>

        {/* Deal details expandable */}
        {!showTerms && (
          <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(true)}>
            <span className='deal-detail-text'>Deal details</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14.0304 6.96967C14.305 7.24426 14.322 7.67851 14.0817 7.97309L14.0304 8.03022L9.53045 12.5302C9.23756 12.8231 8.7628 12.8231 8.4699 12.5302L3.9699 8.03022C3.67701 7.73732 3.67701 7.26256 3.9699 6.96967C4.2628 6.67678 4.73756 6.67678 5.03045 6.96967L9.00018 10.9394L12.9699 6.96967L13.027 6.9184C13.3216 6.67814 13.7559 6.69508 14.0304 6.96967Z" fill="white" fillOpacity="0.64" />
            </svg>
          </button>
        )}
        {showTerms && (
          <div className="figma-seller-details-expanded">
            {deal.terms && (
              <div className="figma-seller-section">
                <span className="figma-seller-label">Terms</span>
                <p className="figma-seller-text">{deal.terms}</p>
              </div>
            )}
            <div className="figma-seller-fees">
              {/* For buyer pending acceptance, show full fee breakdown */}
              {isBuyer && deal.status === 'created' && (
                <>
                  <div className="figma-create-deal-summary-row">
                    <span className="figma-create-deal-summary-label">Seller receives</span>
                    <span className="figma-create-deal-summary-value">
                      {parseFloat(deal.amount).toFixed(2)} {displayCurrency}
                    </span>
                  </div>
                  <div className="figma-create-deal-fee-row deal-row">
                    <span className="figma-create-deal-fee-label with-icon">
                      <span className="underline-deal-text">
                        Escrow fee 5%
                      </span>
                      <InfoIcon />
                    </span>
                    <span className="figma-create-deal-summary-value">
                      {(parseFloat(deal.amount) * 0.05).toFixed(2)} {displayCurrency}
                    </span>
                  </div>
                  <div className="figma-create-deal-fee-row network-space">
                    <span className="figma-create-deal-fee-label with-icon">
                      <span className="underline-deal-text"> Network fee (est.)</span>
                      <InfoIcon />
                    </span>
                    <span className="figma-create-deal-summary-value">
                      ~3.50 {displayCurrency}
                    </span>
                  </div>
                  <div className="figma-create-deal-summary-divider" />

                  <div className="figma-create-deal-fee-row main">
                    <span className="figma-create-deal-fee-label">Total</span>
                    <span className="figma-create-deal-summary-value">
                      {parseFloat(deal.totalAmount || deal.amount).toFixed(2)} {displayCurrency}
                    </span>
                  </div>
                  <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(false)}>
                    <span className='deal-detail-text'>Hide</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3.96955 11.0303C3.69496 10.7557 3.67802 10.3215 3.91828 10.0269L3.96955 9.96978L8.46955 5.46978C8.76244 5.17689 9.2372 5.17689 9.5301 5.46978L14.0301 9.96978C14.323 10.2627 14.323 10.7374 14.0301 11.0303C13.7372 11.3232 13.2624 11.3232 12.9696 11.0303L8.99982 7.0606L5.0301 11.0303L4.97297 11.0816C4.67839 11.3219 4.24414 11.3049 3.96955 11.0303Z" fill="white" fillOpacity="0.64" />
                    </svg>
                  </button>
                </>
              )}
              {/* Standard fee display for other states */}
              {!(isBuyer && deal.status === 'created') && (
                <>
                  <div className="figma-seller-fee-row">
                    <span className="figma-create-deal-fee-label with-icon underline-deal-text">{isSeller ? 'You receive' : 'Amount'}</span>
                    <span className="figma-create-deal-summary-value">{parseFloat(deal.amount).toFixed(2)} {displayCurrency}</span>
                  </div>
                  <div className="figma-create-deal-fee-row deal-row">
                    <span className="figma-create-deal-fee-label with-icon">
                      <span className="underline-deal-text">
                        Escrow fee
                      </span>
                      <InfoIcon />
                    </span>
                    <span className="figma-create-deal-summary-value">
                      {parseFloat(deal.feeAmount || '0').toFixed(2)}
                    </span>
                  </div>
                  <div className="figma-create-deal-summary-divider" />

                  <div className="figma-create-deal-fee-row main">
                    <span className="figma-create-deal-fee-label">Total</span>
                    <span className="figma-create-deal-summary-value">
                      {parseFloat(deal.totalAmount || deal.amount).toFixed(2)} {displayCurrency}
                    </span>
                  </div>
                  <button className="figma-seller-expand-btn left-aligned" onClick={() => setShowTerms(false)}>
                    <span className='deal-detail-text'>Hide</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3.96955 11.0303C3.69496 10.7557 3.67802 10.3215 3.91828 10.0269L3.96955 9.96978L8.46955 5.46978C8.76244 5.17689 9.2372 5.17689 9.5301 5.46978L14.0301 9.96978C14.323 10.2627 14.323 10.7374 14.0301 11.0303C13.7372 11.3232 13.2624 11.3232 12.9696 11.0303L8.99982 7.0606L5.0301 11.0303L4.97297 11.0816C4.67839 11.3219 4.24414 11.3049 3.96955 11.0303Z" fill="white" fillOpacity="0.64" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deal Stages Card - Figma exact */}
      <div className="figma-seller-stages-card">
        <span className="figma-seller-stages-title">Deal stages</span>

        <div className="figma-seller-stages-list">
          {visibleStages.map((stage, index) => (
            <div key={index} className="figma-seller-stage">
              <div className="figma-seller-stage-indicator">
                <div className={`figma-seller-stage-dot ${stage.completed ? 'completed' : (stage as any).waiting ? 'waiting' : (stage as any).cancelled ? 'cancelled' : stage.active ? 'active' : ''}`}>
                  {stage.completed ? (
                    <TickIcon />
                  ) : (stage as any).waiting ? (
                    <LoaderIcon />
                  ) : null}
                </div>
                <div className={`figma-seller-stage-line ${stage.completed ? 'completed' : ''}`} />
              </div>
              <div className="figma-seller-stage-content">
                <div className="figma-seller-stage-text">
                  <span className={`figma-seller-stage-label ${stage.completed ? 'completed' : (stage as any).waiting ? 'waiting' : (stage as any).cancelled ? 'cancelled' : stage.active ? 'active' : ''}`}>
                    {stage.label}
                  </span>
                  {stage.time && <span className="figma-seller-stage-time">{stage.time}</span>}
                </div>
                {stage.completed && (
                  <svg className="figma-seller-stage-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {stages.length > 3 && (
          <button className={`figma-seller-stages-toggle ${showAllStages ? 'expanded' : ''}`} onClick={() => setShowAllStages(!showAllStages)}>
            <span>{showAllStages ? 'Hide' : 'View all stages'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Action buttons based on status */}
      <div className="figma-seller-actions">
        {/* Seller: Mark as in progress */}
        {canMarkInProgress && (
          <div className='figma-deals-footer'>
            <button
              className="figma-seller-btn-primary"
              onClick={handleMarkInProgress}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Mark as in progress'}
            </button>
            <div className="figma-home-indicator">
              <div className="figma-home-indicator-bar-specific" />
            </div>
          </div>
        )}

        {/* Seller: Mark as delivered */}
        {canMarkDelivered && (
          <div className='figma-deals-footer'>
            <button
              className="figma-seller-btn-primary"
              onClick={handleMarkDelivered}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Mark as delivered'}
            </button>
            <div className="figma-home-indicator">
              <div className="figma-home-indicator-bar-specific" />
            </div>
          </div>
        )}

        {/* Buyer: Confirm Receipt */}
        {canConfirmReceipt && (
          <>
            <div className='figma-deals-footer'>
              <label className="figma-seller-checkbox">
                <input
                  type="checkbox"
                  checked={confirmRelease}
                  onChange={(e) => setConfirmRelease(e.target.checked)}
                />
                <span className="figma-seller-checkbox-box">
                  {confirmRelease && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="figma-seller-checkbox-text">
                  I confirm that I have received the item and agree to release the funds
                </span>
              </label>
              <button
                className="figma-seller-btn-primary"
                onClick={handleConfirmReceipt}
                disabled={!confirmRelease || actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm and notify seller'}
              </button>
              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          </>
        )}

        {/* View dispute button */}
        {(deal.status === 'disputed' || deal.status === 'refunded') && (
          <div className='figma-deals-footer'>
            <button className="figma-seller-btn-primary" onClick={openChat}>
              View dispute
            </button>
            <div className="figma-home-indicator">
              <div className="figma-home-indicator-bar-specific" />
            </div>
          </div>
        )}

        {/* Completed status */}
        {deal.status === 'completed' && (
          <div className='figma-deals-footer'>
            <div className="figma-seller-success-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span>Deal Completed Successfully</span>
            </div>
            <div className="figma-home-indicator">
              <div className="figma-home-indicator-bar-specific" />
            </div>
          </div>
        )}
      </div>

      {/* Buyer waiting for seller - Bottom invite panel */}
      {isBuyer && deal.status === 'created' && (
        <div className="figma-buyer-waiting-panel">
          <p className="figma-create-deal-invite-text-deal-view">
            The invitation to @{deal.sellerUsername || 'seller'} has been sent. Seller needs to launch bot to accept the deal.
          </p>
          <button
            className="figma-create-deal-btn"
            onClick={handleSendInviteAgain}
            disabled={sendingInvite}
          >
            {sendingInvite ? 'Sending...' : 'Send invite again'}
          </button>
        </div>
      )}

      {/* 1. Calculate if there is any message to show */}


      {/* 2. Only render the container if footerMessage has a value */}
      {footerMessage && (
        <div className="figma-deals-footer">
          <div className='footer_deals_content'>
            {footerMessage}
          </div>
          <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div style={{ height: 100 }} />

      {/* New Deal Notification Modal (Seller) - Figma exact */}
      {showNewDealModal && isSeller && deal.status === 'created' && (
        <div className="figma-seller-modal-overlay" onClick={() => setShowNewDealModal(false)}>
          <div className="figma-seller-modal figma-seller-modal--new-deal" onClick={(e) => e.stopPropagation()}>
            {/* Header with title and deal number */}
            <div className="figma-seller-modal-header-block">
              <h2 className="figma-seller-modal-title">New deal, confirm terms</h2>
              <p className="figma-seller-modal-deal-number">Deal #{deal.dealNumber}</p>
            </div>

            {/* Buyer info card with Chat button */}
            <div className="figma-seller-modal-buyer-card">
              <div className="figma-seller-modal-buyer-info">
                <div className="figma-seller-avatar figma-seller-avatar--lg">
                  {deal.buyerUsername?.charAt(0)?.toUpperCase() || 'B'}
                </div>
                <div className="figma-seller-modal-buyer-text">
                  <span className="figma-seller-counterparty-role">Buyer</span>
                  <span className="figma-seller-modal-buyer-name">@{deal.buyerUsername || 'buyer'}</span>
                </div>
              </div>
              <button className="figma-seller-chat-btn" onClick={openChat}>
                <SendIcon />
                Chat
              </button>
            </div>
            {/* Deal details card */}
            <div className="figma-seller-modal-details-card">
              {/* Receive amount row */}
              <div className="figma-seller-modal-receive-row">
                <span className="figma-seller-modal-receive-label">Receive</span>
                <span className="figma-seller-modal-receive-amount">{parseFloat(deal.amount).toLocaleString()} {displayCurrency}</span>
              </div>

              <div className="figma-seller-modal-divider" />

              <div className="figma-seller-section">
                <span className="figma-seller-label">Description</span>
                <p className="figma-seller-text">{deal.description || 'No description provided'}</p>
              </div>

              {deal.terms && (
                <>
                  <div className="figma-seller-modal-divider" />

                  <div className="figma-seller-modal-section">
                    <div className="figma-seller-modal-header-row">
                      <span className="figma-seller-modal-section-label">Terms</span>

                      {/* Expand button placed next to label or below depending on your design */}

                    </div>

                    <p className={`figma-seller-modal-section-text ${!termsExpanded ? 'line-clamp-2' : ''}`}>
                      {deal.terms}
                    </p>
                    <button
                      className={`figma-seller-modal-expand-btn ${termsExpanded ? 'expanded' : ''}`}
                      onClick={() => setTermsExpanded(!termsExpanded)}
                    >
                      <ArrowDownIcon />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Timer notice */}
            <div className="figma-seller-modal-timer-notice">
              <HistoryIcon />
              <span>Buyer will pay within 72 hours</span>
            </div>

            {/* Action buttons */}
            <div className="figma-seller-modal-actions">
              <button
                className="figma-seller-btn-primary figma-seller-btn-primary--full"
                onClick={handleAcceptDeal}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                className="figma-seller-btn-text"
                onClick={handleRejectDeal}
                disabled={actionLoading}
              >
                Reject
              </button>
              <div className="figma-home-indicator">
                <div className="figma-home-indicator-bar-specific" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="figma-seller-modal-overlay" onClick={() => setShowDisputeModal(false)}>
          <div className="figma-seller-modal dispute-modal" onClick={(e) => e.stopPropagation()}>
            <div className="figma-seller-modal-handle" />
            <h2 className="figma-seller-modal-title">Open Dispute</h2>

            {/* Refund Address (for buyers only) */}
            {isBuyer && (
              <div className="dispute-field">
                <label className="dispute-label">
                  Please enter your refund crypto address USDT in TRC-20
                </label>
                <input
                  type="text"
                  className="dispute-input"
                  placeholder="TUM0V0GBus9uL8hjNjJfx..."
                  value={disputeRefundAddress}
                  onChange={(e) => setDisputeRefundAddress(e.target.value)}
                />
              </div>
            )}

            {/* Reason */}
            <div className="dispute-field">
              <label className="dispute-label">
                Please provide a reason for the {isBuyer ? 'refund request' : 'dispute'}
              </label>
              <textarea
                className="dispute-textarea"
                placeholder={isBuyer ? "Seller never delivered the files" : "Describe the issue..."}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={3}
              />
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="dispute-uploaded-files">
                <label className="dispute-label">Attached files</label>
                {uploadedFiles.map(file => (
                  <div key={file.id} className="dispute-uploaded-file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <span className="dispute-uploaded-filename">{file.name}</span>
                    <button
                      className="dispute-remove-file"
                      onClick={() => removeUploadedFile(file.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add file button */}
            <div className="dispute-add-file-row">
              <button
                className="dispute-add-file-btn"
                onClick={() => setShowFileOptions(!showFileOptions)}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <>
                    <div className="dispute-upload-spinner" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                    Add evidence file
                  </>
                )}
              </button>
            </div>

            {/* File options popup */}
            {showFileOptions && (
              <div className="dispute-file-options">
                <p className="dispute-file-title">Add file</p>
                <button
                  className="dispute-file-option"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M12 18v-6M9 15h6" />
                  </svg>
                  Choose file
                </button>
                <button
                  className="dispute-file-option"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                      fileInputRef.current.removeAttribute('capture');
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Take a picture
                </button>
                <button
                  className="dispute-file-option"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Choose from gallery
                </button>
              </div>
            )}

            <div className="figma-seller-modal-actions">
              <button
                className="figma-chat-file-sheet-cancel"
                onClick={() => {
                  setShowDisputeModal(false);
                  setShowFileOptions(false);
                  setUploadedFiles([]);
                  setDisputeReason('');
                  setDisputeRefundAddress('');
                }}
              >
                Cancel
              </button>
              <button
                className="figma-seller-btn-primary"
                onClick={handleDispute}
                disabled={(isBuyer && !disputeRefundAddress) || disputeReason.length < 10 || actionLoading || uploadingFile}
              >
                {actionLoading ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <div className="figma-home-indicator">
            <div className="figma-home-indicator-bar-specific" />
          </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute is Open Modal (notification for counterparty) */}
      {showDisputeOpenModal && (
        <div className="figma-seller-modal-overlay">
          <div className="figma-seller-modal dispute-open-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="dispute-open-title">Dispute is open</h2>
            <p className="dispute-open-subtitle">
              Please join the chat to clarify the details and help resolve the dispute.
            </p>

            {/* Deal Summary Card */}
            <div className="dispute-open-card">
              <div className="dispute-open-card-header">
                <span className="dispute-open-deal-number">Deal #{deal.dealNumber}</span>
              </div>
              <div className="dispute-open-amount">{parseFloat(deal.amount).toLocaleString()} {displayCurrency}</div>

              <div className="dispute-open-divider" />

              <div className="dispute-open-section">
                <span className="dispute-open-label">Description</span>
                <p className="dispute-open-text">{deal.description || 'No description'}</p>
              </div>

              {disputeDetailsExpanded && (
                <>
                  {deal.terms && (
                    <>
                      <div className="dispute-open-divider" />
                      <div className="dispute-open-section">
                        <span className="dispute-open-label">Terms</span>
                        <p className="dispute-open-text">{deal.terms}</p>
                      </div>
                    </>
                  )}

                  <div className="dispute-open-divider" />

                  <div className="dispute-open-row">
                    <span className="figma-create-deal-summary-label">Seller receives</span>
                    <span className="dispute-open-value">{parseFloat(deal.amount).toLocaleString()} {displayCurrency}</span>
                  </div>
                  <div className="dispute-open-row">
                    <span className="dispute-open-label with-icon">
                      <span className="underline-deal-text"> Network fee (est.)</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 12" fill="none">
                        <g clipPath="url(#clip0_2_22822)">
                          <path d="M6 5.3125C6.31066 5.3125 6.5625 5.56434 6.5625 5.875V8.25C6.5625 8.56066 6.31066 8.8125 6 8.8125C5.68934 8.8125 5.4375 8.56066 5.4375 8.25V5.875C5.4375 5.56434 5.68934 5.3125 6 5.3125Z" fill="white" fillOpacity="0.64" />
                          <path d="M6 3.1875C6.31066 3.1875 6.5625 3.43934 6.5625 3.75V4.125C6.5625 4.43566 6.31066 4.6875 6 4.6875C5.68934 4.6875 5.4375 4.43566 5.4375 4.125V3.75C5.4375 3.43934 5.68934 3.1875 6 3.1875Z" fill="white" fillOpacity="0.64" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M6 0.5C9.03757 0.5 11.5 2.96243 11.5 6C11.5 9.03757 9.03757 11.5 6 11.5C2.96243 11.5 0.5 9.03757 0.5 6C0.5 2.96243 2.96243 0.5 6 0.5ZM6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5Z" fill="white" fillOpacity="0.64" />
                        </g>
                        <defs>
                          <clipPath id="clip0_2_22822">
                            <rect width="12" height="12" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <span className="dispute-open-value">~1.00 {displayCurrency}</span>
                  </div>
                  <div className="dispute-open-row">
                    <span className="dispute-open-label with-icon">
                      <span className="underline-deal-text">Escrow fee 5%</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 12 12" fill="none">
                        <g clipPath="url(#clip0_2_22822)">
                          <path d="M6 5.3125C6.31066 5.3125 6.5625 5.56434 6.5625 5.875V8.25C6.5625 8.56066 6.31066 8.8125 6 8.8125C5.68934 8.8125 5.4375 8.56066 5.4375 8.25V5.875C5.4375 5.56434 5.68934 5.3125 6 5.3125Z" fill="white" fillOpacity="0.64" />
                          <path d="M6 3.1875C6.31066 3.1875 6.5625 3.43934 6.5625 3.75V4.125C6.5625 4.43566 6.31066 4.6875 6 4.6875C5.68934 4.6875 5.4375 4.43566 5.4375 4.125V3.75C5.4375 3.43934 5.68934 3.1875 6 3.1875Z" fill="white" fillOpacity="0.64" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M6 0.5C9.03757 0.5 11.5 2.96243 11.5 6C11.5 9.03757 9.03757 11.5 6 11.5C2.96243 11.5 0.5 9.03757 0.5 6C0.5 2.96243 2.96243 0.5 6 0.5ZM6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5Z" fill="white" fillOpacity="0.64" />
                        </g>
                        <defs>
                          <clipPath id="clip0_2_22822">
                            <rect width="12" height="12" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <span className="dispute-open-value">{deal.feeAmount || (parseFloat(deal.amount) * 0.05).toFixed(2)} {displayCurrency}</span>
                  </div>
                  <div className="figma-create-deal-summary-divider" />

                  <div className="dispute-open-row">
                    <span className="dispute-open-label">Total</span>
                    <span className="dispute-open-value highlight">{deal.totalAmount || (parseFloat(deal.amount) * 1.05 + 1).toFixed(2)} {displayCurrency}</span>
                  </div>
                </>
              )}

              <button
                className="dispute-open-expand"
                onClick={() => setDisputeDetailsExpanded(!disputeDetailsExpanded)}
              >
                {disputeDetailsExpanded ? 'Hide' : 'Deal details'}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ transform: disputeDetailsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="dispute-open-actions">
              <button
                className="dispute-open-btn-red"
                onClick={() => {
                  // Mark as seen and open chat
                  localStorage.setItem(`dispute_seen_${deal.id}`, 'true');
                  setShowDisputeOpenModal(false);
                  navigate(`/deals/${deal.id}/chat`);
                }}
              >
                Open chat
              </button>
              {!disputeDetailsExpanded && (
                <button
                  className="figma-chat-file-sheet-cancel "
                  onClick={() => {
                    // Mark as seen and close
                    localStorage.setItem(`dispute_seen_${deal.id}`, 'true');
                    setShowDisputeOpenModal(false);
                  }}
                >
                  Skip
                </button>
              )}
            </div>
            <div className="figma-home-indicator">
              <div className="figma-home-indicator-bar-specific" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
