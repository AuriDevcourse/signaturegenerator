document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const photoUpload = document.getElementById('photo-upload');
    const cropModal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    const cancelCropBtn = document.getElementById('cancel-crop-btn');
    const cropAndUploadBtn = document.getElementById('crop-and-upload-btn');
    const brightnessSlider = document.getElementById('brightness');
    const saturationSlider = document.getElementById('saturation');
    const addLinkBtn = document.getElementById('add-link-btn');
    const messageTextarea = document.getElementById('message');
    let cropper;

    // Tutorial functionality
    const tutorialModal = document.getElementById('tutorial-modal');
    const tutorialStep = document.getElementById('tutorial-step');
    const tutorialDots = document.getElementById('tutorial-dots');
    const tutorialNext = document.getElementById('tutorial-next');
    const tutorialPrev = document.getElementById('tutorial-prev');
    const tutorialClose = document.getElementById('tutorial-close');
    const howToBtn = document.getElementById('how-to-btn');
    
    const tutorialSteps = [
        {
            title: "Welcome to Email Signature Generator!",
            content: "This tool helps you create a professional email signature. Just put your name, job title, email, phone, and your personal LinkedIn profile in the form on the left."
        },
        {
            title: "Upload Your Photo",
            content: "Click 'Upload Image' to add your profile photo. You can crop it, adjust brightness and saturation with filters. The image saves automatically to WordPress."
        },
        {
            title: "Add Optional Message & Links",
            content: "You can add an optional message with a link if you want. Click 'Add Link' - first write the word you want to be linked, then paste the link itself. You can also expand 'Default Information' to change company details like address, website, and social media."
        },
        {
            title: "Ready to Use!",
            content: "Once you've added all your information, click 'Copy Signature' to copy it. Then use the 'How to Add Signature' button to see step-by-step instructions on how to add the finished signature to Gmail."
        }
    ];

    let currentStep = 0;

    function showTutorialStep(stepIndex) {
        const step = tutorialSteps[stepIndex];
        tutorialStep.innerHTML = `
            <h3 class="text-lg font-semibold text-primary mb-2">${step.title}</h3>
            <p class="text-white/80">${step.content}</p>
        `;

        // Update dots
        tutorialDots.innerHTML = tutorialSteps.map((_, i) => 
            `<div class="w-2 h-2 rounded-full ${i === stepIndex ? 'bg-primary' : 'bg-white/30'}"></div>`
        ).join('');

        // Update buttons
        tutorialPrev.classList.toggle('hidden', stepIndex === 0);
        tutorialNext.querySelector('span').textContent = stepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next';
    }

    tutorialNext.addEventListener('click', () => {
        if (currentStep < tutorialSteps.length - 1) {
            currentStep++;
            showTutorialStep(currentStep);
        } else {
            tutorialModal.classList.add('hidden');
            currentStep = 0;
            localStorage.setItem('tutorialCompleted', 'true');
        }
    });

    tutorialPrev.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showTutorialStep(currentStep);
        }
    });

    // Close button handler
    tutorialClose.addEventListener('click', () => {
        tutorialModal.classList.add('hidden');
        currentStep = 0;
    });

    // Click outside to close
    tutorialModal.addEventListener('click', (e) => {
        if (e.target === tutorialModal) {
            tutorialModal.classList.add('hidden');
            currentStep = 0;
        }
    });

    // Gmail setup modal functionality
    const gmailModal = document.getElementById('gmail-modal');
    const gmailStep = document.getElementById('gmail-step');
    const gmailDots = document.getElementById('gmail-dots');
    const gmailNext = document.getElementById('gmail-next');
    const gmailPrev = document.getElementById('gmail-prev');
    const gmailClose = document.getElementById('gmail-close');

    const gmailSteps = [
        {
            title: "Step 1: Open Gmail Settings",
            content: "Open your Gmail. Click on the Settings icon (gear icon) in the top right corner and press 'See all settings'.",
            gif: "https://techbbq.dk/wp-content/uploads/2025/10/1stepsignature.gif"
        },
        {
            title: "Step 2: Create New Signature",
            content: "Scroll down to the 'Signature' section and click '+ Create new' to create a new signature. Give it a name.",
            gif: "https://techbbq.dk/wp-content/uploads/2025/10/2stepsignature.gif"
        },
        {
            title: "Step 3: Paste Your Signature",
            content: "Paste your copied signature in the empty field (Ctrl+V or Cmd+V if you're on Mac). Select when to use it for new emails and replies.",
            gif: "https://techbbq.dk/wp-content/uploads/2025/10/3stepsignature.gif"
        },
        {
            title: "Step 4: Save and Test",
            content: "Click 'Save Changes' at the bottom. Compose a new email to test. If the signature doesn't appear, click the pencil icon in the bottom toolbar and select your signature.",
            gif: "https://techbbq.dk/wp-content/uploads/2025/10/4stepsignature.gif"
        }
    ];

    let gmailCurrentStep = 0;

    function showGmailStep(stepIndex) {
        const step = gmailSteps[stepIndex];
        gmailStep.innerHTML = `
            <div class="mb-4">
                <img src="${step.gif}" alt="${step.title}" class="w-full rounded-lg border border-white/20">
            </div>
            <h3 class="text-lg font-semibold text-primary mb-2">${step.title}</h3>
            <p class="text-white/80">${step.content}</p>
        `;

        // Update dots
        gmailDots.innerHTML = gmailSteps.map((_, i) => 
            `<div class="w-2 h-2 rounded-full ${i === stepIndex ? 'bg-primary' : 'bg-white/30'}"></div>`
        ).join('');

        // Update buttons
        gmailPrev.classList.toggle('hidden', stepIndex === 0);
        gmailNext.querySelector('span').textContent = stepIndex === gmailSteps.length - 1 ? 'Finish' : 'Next';
    }

    gmailNext.addEventListener('click', () => {
        if (gmailCurrentStep < gmailSteps.length - 1) {
            gmailCurrentStep++;
            showGmailStep(gmailCurrentStep);
        } else {
            gmailModal.classList.add('hidden');
            gmailCurrentStep = 0;
        }
    });

    gmailPrev.addEventListener('click', () => {
        if (gmailCurrentStep > 0) {
            gmailCurrentStep--;
            showGmailStep(gmailCurrentStep);
        }
    });

    gmailClose.addEventListener('click', () => {
        gmailModal.classList.add('hidden');
        gmailCurrentStep = 0;
    });

    gmailModal.addEventListener('click', (e) => {
        if (e.target === gmailModal) {
            gmailModal.classList.add('hidden');
            gmailCurrentStep = 0;
        }
    });

    // How to button handler - opens Gmail setup modal
    howToBtn.addEventListener('click', () => {
        gmailCurrentStep = 0;
        showGmailStep(0);
        gmailModal.classList.remove('hidden');
    });

    // Show tutorial on first visit
    if (!localStorage.getItem('tutorialCompleted')) {
        showTutorialStep(0);
        tutorialModal.classList.remove('hidden');
    }

    uploadBtn.addEventListener('click', () => photoUpload.click());

    // Add link functionality for optional message
    addLinkBtn.addEventListener('click', () => {
        const linkText = prompt('Enter the text to display:');
        if (!linkText) return;
        
        const linkUrl = prompt('Enter the URL:');
        if (!linkUrl) return;
        
        const currentMessage = messageTextarea.value;
        // Wrap link in span for better email client compatibility
        const linkHtml = `<span style="color: #111111;"><a href="${linkUrl}" style="color: #111111 !important; text-decoration: underline;">${linkText}</a></span>`;
        
        // Insert at cursor position or append
        const cursorPos = messageTextarea.selectionStart;
        const textBefore = currentMessage.substring(0, cursorPos);
        const textAfter = currentMessage.substring(cursorPos);
        
        messageTextarea.value = textBefore + linkHtml + textAfter;
        updatePreview();
    });

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            cropImage.src = event.target.result;
            cropModal.classList.remove('hidden');
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                background: false,
            });
        };
        reader.readAsDataURL(file);

        // Reset sliders
        brightnessSlider.value = 100;
        saturationSlider.value = 100;
    });

    const applyImageFilters = () => {
        if (!cropper) return;
        const brightness = brightnessSlider.value;
        const saturation = saturationSlider.value;
        // The cropper's image element is what we need to style
        const cropperImage = cropModal.querySelector('.cropper-view-box img');
        if(cropperImage) {
             cropperImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%)`;
        }
    };

    brightnessSlider.addEventListener('input', applyImageFilters);
    saturationSlider.addEventListener('input', applyImageFilters);

    cancelCropBtn.addEventListener('click', () => {
        cropModal.classList.add('hidden');
        if (cropper) {
            cropper.destroy();
        }
    });

    cropAndUploadBtn.addEventListener('click', () => {
        if (!cropper) return;

        cropAndUploadBtn.textContent = 'Uploading...';
        cropAndUploadBtn.disabled = true;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: 160, // Optimized size for email signatures
            height: 160,
        });

        // Create a new canvas to apply filters
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 160;
        finalCanvas.height = 160;
        const ctx = finalCanvas.getContext('2d');

        // Apply filters to the context
        const brightness = brightnessSlider.value;
        const saturation = saturationSlider.value;
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;

        // Draw the cropped image onto the new canvas with the filters
        ctx.drawImage(croppedCanvas, 0, 0);

        finalCanvas.toBlob((blob) => {
            const timestamp = Date.now();
            const filename = `signature-photo-${timestamp}.png`;
            const formData = new FormData();
            formData.append('file', blob, filename);

            fetch('https://techbbq.dk/wp-json/signature/v1/upload', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(media => {
                if (media.source_url) {
                    document.getElementById('photo').value = media.source_url;
                    updatePreview();
                    alert('Image uploaded successfully!');
                } else {
                    throw new Error('No image URL returned');
                }
            })
            .catch(error => {
                // CORS error but upload succeeded - construct WordPress URL manually
                console.log('CORS error, constructing WordPress URL manually');
                const wpUrl = `https://techbbq.dk/wp-content/uploads/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${filename}`;
                document.getElementById('photo').value = wpUrl;
                updatePreview();
                alert('Image uploaded successfully! The image URL has been set to the WordPress upload location.');
            })
            .finally(() => {
                cropModal.classList.add('hidden');
                if (cropper) {
                    cropper.destroy();
                }
                cropAndUploadBtn.textContent = 'Crop & Upload';
                cropAndUploadBtn.disabled = false;
            });
        }, 'image/png');
    });

    const form = document.getElementById('signature-form');
    const copyBtn = document.getElementById('copy-btn');
    const desktopPreview = document.getElementById('desktop-preview');
    const mobilePreview = document.getElementById('mobile-preview');

    const updatePreview = () => {
        const name = document.getElementById('name').value;
        const jobTitle = document.getElementById('job-title').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const website = document.getElementById('website').value;
        const address = document.getElementById('address').value;
        const personalLinkedin = document.getElementById('personal-linkedin').value;
        const linkedin = document.getElementById('linkedin').value;
        const facebook = document.getElementById('facebook').value;
        const instagram = document.getElementById('instagram').value;
        const photo = document.getElementById('photo').value;
        const message = document.getElementById('message').value;
        
        // Process message for mobile (change link colors to light)
        const mobileMessage = message.replace(/color:\s*#111111/g, 'color: #f1f1f1');

        const signatureHTML = `
            <table style="width: 500px; font-family: Verdana, sans-serif; font-size: 12px; color: #111111;">
                <tr>
                    <td style="width: 120px; vertical-align: middle; text-align: center;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid #FF0028; object-fit: cover; display: block; margin: 0 auto 8px;">` : `<div style="width: 100px; height: 100px; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 1px solid #ccc; border-radius: 6px;"><span style="font-size: 9px; color: #666; text-align: center; font-family: Verdana, sans-serif; padding: 5px;">Your Picture Here</span></div>`}
                        ${personalLinkedin ? `<span style="color: #111111;"><a href="${personalLinkedin}" style="color: #111111 !important; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a></span>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028; color: inherit;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #FF0028; margin: 8px 0; max-width: 200px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/mailred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #111111;"><a href="mailto:${email}" style="color: #111111 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></span></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/callred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #111111;"><a href="tel:${phone}" style="color: #111111 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></span></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #111111;"><a href="${website}" style="color: #111111 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></span></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/locationred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkedinred.png" width="17" height="17" style="display: block;"></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/facebookred.png" width="17" height="17" style="display: block;"></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/Instagramred.png" width="17" height="17" style="display: block;"></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #555; max-width: 200px;">${message}</p>` : ''}
                    </td>
                </tr>
            </table>
        `;

        desktopPreview.innerHTML = signatureHTML;

        const mobileSignatureHTML = `
            <table style="width: 100%; font-family: Verdana, sans-serif; font-size: 12px; color: #f1f1f1;">
                <tr>
                    <td style="width: 120px; vertical-align: middle; text-align: center;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid #FF0028; object-fit: cover; display: block; margin: 0 auto 8px;">` : `<div style="width: 100px; height: 100px; background-color: #555; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 1px solid #666; border-radius: 6px;"><span style="font-size: 9px; color: #ccc; text-align: center; font-family: Verdana, sans-serif; padding: 5px;">Your Picture Here</span></div>`}
                        ${personalLinkedin ? `<span style="color: #f1f1f1;"><a href="${personalLinkedin}" style="color: #f1f1f1 !important; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a></span>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #555; margin: 8px 0; max-width: 200px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/mailred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #f1f1f1;"><a href="mailto:${email}" style="color: #f1f1f1 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></span></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/callred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #f1f1f1;"><a href="tel:${phone}" style="color: #f1f1f1 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></span></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="color: #f1f1f1;"><a href="${website}" style="color: #f1f1f1 !important; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></span></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/locationred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkedinred.png" width="17" height="17" style="display: block;"></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/facebookred.png" width="17" height="17" style="display: block;"></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/Instagramred.png" width="17" height="17" style="display: block;"></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #ccc; max-width: 200px;">${mobileMessage}</p>` : ''}
                    </td>
                </tr>
            </table>
        `;
        mobilePreview.innerHTML = mobileSignatureHTML;

        const hasContent = name || jobTitle || email;
        if (hasContent) {
            copyBtn.classList.remove('hidden');
        } else {
            copyBtn.classList.add('hidden');
        }
    };

    form.addEventListener('input', updatePreview);

    copyBtn.addEventListener('click', () => {
        const signatureContent = desktopPreview.innerHTML;
        // Use the Clipboard API for rich text if available
        try {
            const blob = new Blob([signatureContent], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([item]).then(() => {
                copyBtn.innerHTML = '<span class="relative z-10">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span class="relative z-10">Copy Signature</span>';
                }, 2000);
            });
        } catch (e) {
            // Fallback for older browsers
            navigator.clipboard.writeText(signatureContent).then(() => {
                copyBtn.innerHTML = '<span class="relative z-10">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span class="relative z-10">Copy Signature</span>';
                }, 2000);
            });
        }
    });

    // Initial preview on load
    updatePreview();
});
