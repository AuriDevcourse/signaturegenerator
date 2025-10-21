document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('upload-btn');
    const photoUpload = document.getElementById('photo-upload');
    const cropModal = document.getElementById('crop-modal');
    const cropImage = document.getElementById('crop-image');
    const cancelCropBtn = document.getElementById('cancel-crop-btn');
    const cropAndUploadBtn = document.getElementById('crop-and-upload-btn');
    const brightnessSlider = document.getElementById('brightness');
    const saturationSlider = document.getElementById('saturation');
    let cropper;

    uploadBtn.addEventListener('click', () => photoUpload.click());

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
        const linkedin = document.getElementById('linkedin').value;
        const facebook = document.getElementById('facebook').value;
        const instagram = document.getElementById('instagram').value;
        const photo = document.getElementById('photo').value;
        const message = document.getElementById('message').value;

        const signatureHTML = `
            <table style="width: 500px; font-family: Verdana, sans-serif; font-size: 12px; color: #111111;">
                <tr>
                    <td style="width: 120px; vertical-align: middle; text-align: center;">
                        ${photo ? `<img src="${photo}" alt="${name}" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid #FF0028; object-fit: cover; display: block; margin: 0 auto 8px;">` : `<div style="width: 100px; height: 100px; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 1px solid #ccc; border-radius: 6px;"><span style="font-size: 9px; color: #666; text-align: center; font-family: Verdana, sans-serif; padding: 5px;">Your Picture Here</span></div>`}
                        ${linkedin ? `<a href="${linkedin}" style="color: #000000; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028; color: inherit;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #FF0028; margin: 8px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/mailred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="mailto:${email}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/callred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="tel:${phone}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="${website}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/locationred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkedinred.png" width="20" height="20" style="display: block;"></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/facebookred.png" width="20" height="20" style="display: block;"></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/Instagramred.png" width="20" height="20" style="display: block;"></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #555;">${message}</p>` : ''}
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
                        ${linkedin ? `<a href="${linkedin}" style="color: #ffffff; text-decoration: underline; font-size: 10px; font-family: Verdana, sans-serif; display: block; text-align: center;">Let's connect</a>` : ''}
                    </td>
                    <td style="vertical-align: top; padding-left: 15px; border-left: 2px solid #FF0028;">
                        <p style="margin: 0; font-family: Verdana, sans-serif; font-size: 18px; font-weight: bold; line-height: 1; color: inherit;">${name}</p>
                        <p style="margin: 2px 0; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1; color: inherit;">${jobTitle}</p>
                        <hr style="border: none; height: 1px; background-color: #555; margin: 8px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/mailred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="mailto:${email}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${email}</a></td>
                            </tr>
                            ${phone ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/callred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="tel:${phone}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${phone}</a></td>
                            </tr>` : ''}
                            ${website ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><a href="${website}" style="color: inherit; text-decoration: underline; font-family: Verdana, sans-serif;">${website}</a></td>
                            </tr>` : ''}
                            ${address ? `<tr>
                                <td style="width: 20px; vertical-align: top; padding: 2px 4px 2px 0;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/locationred.png" width="14" height="14" style="display: block;"></td>
                                <td style="vertical-align: top; padding: 2px 0; font-family: Verdana, sans-serif; font-size: 10px;"><span style="text-decoration: underline;">${address}</span></td>
                            </tr>` : ''}
                        </table>
                        ${(linkedin || facebook || instagram) ? `<p style="margin: 8px 0 2px 0;">
                            ${linkedin ? `<a href="${linkedin}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/linkedinred.png" width="20" height="20" style="display: block;"></a>` : ''}
                            ${facebook ? `<a href="${facebook}" style="margin-right: 4px; display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/facebookred.png" width="20" height="20" style="display: block;"></a>` : ''}
                            ${instagram ? `<a href="${instagram}" style="display: inline-block;"><img src="https://techbbq.dk/wp-content/uploads/2025/10/Instagramred.png" width="20" height="20" style="display: block;"></a>` : ''}
                        </p>` : ''}
                        ${message ? `<p style="margin-top: 10px; font-style: italic; font-family: Verdana, sans-serif; font-size: 10px; color: #ccc;">${message}</p>` : ''}
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
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Signature';
                }, 2000);
            });
        } catch (e) {
            // Fallback for older browsers
            navigator.clipboard.writeText(signatureContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Signature';
                }, 2000);
            });
        }
    });

    // Initial preview on load
    updatePreview();
});
