import React from 'react';
import { X, PhoneCall, MessageCircle, Video, Copy, Check, ExternalLink } from 'lucide-react';
import { getCallLinks } from '../services/phoneService';

export const CallModal = ({ isOpen, onClose, contact }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !contact || !contact.phone) return null;

  const links = getCallLinks(contact.phone);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(links.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content call-modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PhoneCall className="modal-icon text-success" />
            <h2>Call Confirmation & App Launcher</h2>
          </div>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="call-target-card">
            <span className="avatar-circle-lg">
              {(contact.firstName[0] || 'U').toUpperCase()}
            </span>
            <h3>{contact.firstName} {contact.lastName}</h3>
            <p className="phone-display-large">📞 {links.formatted}</p>
          </div>

          <p className="call-confirm-prompt">
            Choose which calling app you would like to use:
          </p>

          <div className="app-launcher-grid">
            {/* Default Dialer */}
            <a 
              href={links.telUri} 
              className="app-launch-card card-tel"
              onClick={onClose}
            >
              <PhoneCall size={24} className="app-icon" />
              <div>
                <strong>Default Phone / Mobile Dialer</strong>
                <p>Standard device call app</p>
              </div>
              <ExternalLink size={16} className="ext-icon" />
            </a>

            {/* WhatsApp */}
            <a 
              href={links.whatsAppUri} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="app-launch-card card-whatsapp"
              onClick={onClose}
            >
              <MessageCircle size={24} className="app-icon" />
              <div>
                <strong>WhatsApp Call / Chat</strong>
                <p>Launch WhatsApp with {links.formatted}</p>
              </div>
              <ExternalLink size={16} className="ext-icon" />
            </a>

            {/* Skype */}
            <a 
              href={links.skypeUri} 
              className="app-launch-card card-skype"
              onClick={onClose}
            >
              <Video size={24} className="app-icon" />
              <div>
                <strong>Skype Call</strong>
                <p>Call via Skype</p>
              </div>
              <ExternalLink size={16} className="ext-icon" />
            </a>

            {/* FaceTime Audio */}
            <a 
              href={links.facetimeUri} 
              className="app-launch-card card-facetime"
              onClick={onClose}
            >
              <PhoneCall size={24} className="app-icon" />
              <div>
                <strong>FaceTime Audio</strong>
                <p>Apple FaceTime Voice Call</p>
              </div>
              <ExternalLink size={16} className="ext-icon" />
            </a>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCopyPhone}>
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span>{copied ? 'Copied Number!' : 'Copy Clean Number'}</span>
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
