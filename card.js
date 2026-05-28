document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('cardContainer');
  const visitingCard = document.getElementById('visitingCard');
  const flipBtn = document.getElementById('flipBtn');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const shareBtn = document.getElementById('shareBtn');
  const printBtn = document.getElementById('printBtn');
  
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  let toastTimeout;

  // Function to show custom toast message safely (avoids innerHTML)
  const showToast = (message) => {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('active');
    toast.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
      toast.setAttribute('aria-hidden', 'true');
    }, 3000);
  };

  // 1. Flip Card Interaction
  const toggleFlip = () => {
    if (visitingCard) {
      visitingCard.classList.toggle('flipped');
      const isFlipped = visitingCard.classList.contains('flipped');
      visitingCard.setAttribute('aria-label', `Highway Bites Business Card. Currently showing the ${isFlipped ? 'back' : 'front'} side. Click to flip.`);
    }
  };

  if (cardContainer) {
    cardContainer.addEventListener('click', toggleFlip);
  }

  if (flipBtn) {
    flipBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid double flip from container click trigger
      toggleFlip();
    });
  }

  // 2. Interactive 3D tilt effect on desktop mouse move
  if (cardContainer) {
    cardContainer.addEventListener('mousemove', (e) => {
      // Don't tilt if user is printing or card element is null
      if (!visitingCard) return;

      const rect = cardContainer.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Calculate mouse coordinates relative to card center (-0.5 to 0.5)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPercent = (mouseX / width) - 0.5;
      const yPercent = (mouseY / height) - 0.5;

      // Calculate 3D rotations (limit rotation to 15 degrees max)
      const maxTilt = 15;
      const rotateX = -yPercent * maxTilt;
      const rotateY = xPercent * maxTilt;

      // Apply transformations to container
      cardContainer.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      // Dynamic holographic reflection effect based on tilt coordinates
      const reflections = document.querySelectorAll('.card-reflection');
      reflections.forEach(reflection => {
        reflection.style.background = `linear-gradient(${135 + (xPercent * 30)}deg, rgba(255, 255, 255, ${0.15 - (yPercent * 0.08)}) 0%, rgba(255, 255, 255, 0) 55%, rgba(255, 255, 255, ${0.05 + (yPercent * 0.04)}) 100%)`;
      });
    });

    cardContainer.addEventListener('mouseleave', () => {
      // Reset smoothly
      cardContainer.style.transition = 'transform var(--transition-normal) ease';
      cardContainer.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      
      const reflections = document.querySelectorAll('.card-reflection');
      reflections.forEach(reflection => {
        reflection.style.background = '';
      });
    });

    cardContainer.addEventListener('mouseenter', () => {
      // Remove transitions during active movement for responsiveness
      cardContainer.style.transition = 'none';
    });
  }

  // 3. Save Contact (vCard generation)
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Define contact information conforming to vCard 3.0 specification
      const vcardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Bites;Highway;;;',
        'FN:Highway Bites',
        'ORG:Highway Bites',
        'TITLE:Premium Handcrafted Roadside Comfort Eats',
        'TEL;TYPE=CELL,VOICE;VALUE=uri:tel:+919115752574',
        'ADR;TYPE=WORK,PREF:;;Phagwara Bypass, Purhiran;Chandigarh Road;;;India',
        'URL:https://maps.app.goo.gl/JyqP1ExWnHn282v38',
        'NOTE:Taste That Stops Traffic. Steamed & Kurkure Momos, Chicken Kababs, and golden fries prepared with signature Punjabi spices. Open daily except Tuesday (Evening to Night).',
        'X-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/highway_bites_hsp',
        'END:VCARD'
      ];

      const vcardContent = vcardLines.join('\r\n');
      
      try {
        const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, 'Highway_Bites.vcf');
        } else {
          const downloadUrl = URL.createObjectURL(blob);
          link.setAttribute('href', downloadUrl);
          link.setAttribute('download', 'Highway_Bites.vcf');
          
          document.body.appendChild(link);
          link.click();
          
          // Clean up DOM and revoke Blob URL
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
        }
        
        showToast('Contact file downloaded!');
      } catch (err) {
        console.error('Error generating vCard:', err);
        showToast('Could not download contact.');
      }
    });
  }

  // 4. Share Card Action
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const shareData = {
        title: 'Highway Bites - Digital Visiting Card',
        text: 'Save the contact info and locations of Highway Bites on Chandigarh Road!',
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData)
          .then(() => showToast('Shared successfully!'))
          .catch((err) => {
            // Log and show fallback if share was cancelled or failed
            console.log('Share prompt dismissed/failed:', err);
          });
      } else {
        // Fallback: Copy URL to clipboard
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            showToast('Link copied to clipboard!');
          })
          .catch((err) => {
            console.error('Clipboard copy failed:', err);
            showToast('Could not copy link.');
          });
      }
    });
  }

  // 5. Print Card Action
  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.print();
    });
  }
});
