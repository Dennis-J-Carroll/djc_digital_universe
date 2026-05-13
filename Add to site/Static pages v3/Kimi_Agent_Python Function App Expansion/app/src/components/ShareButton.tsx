import { useState } from 'react';
import { Share2, Check, Twitter, Facebook, Link2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
}

export default function ShareButton({ title, description, url }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = `${title} - ${description}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };
  
  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-xl hover:bg-gray-50 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>
      
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border-3 border-black rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <p className="font-display font-bold text-sm">Share this function</p>
            </div>
            
            <button
              onClick={handleTwitter}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1DA1F2] hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
              Share on Twitter
            </button>
            
            <button
              onClick={handleFacebook}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#4267B2] hover:text-white transition-colors"
            >
              <Facebook className="w-5 h-5" />
              Share on Facebook
            </button>
            
            <button
              onClick={handleCopy}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#E94E77] hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
